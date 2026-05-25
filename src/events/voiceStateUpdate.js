import { ChannelType, PermissionFlagsBits } from 'discord.js';
import {
    getJoinToCreateConfig, 
    registerTemporaryChannel, 
    unregisterTemporaryChannel,
    getTemporaryChannelInfo,
    formatChannelName
} from '../utils/database.js';
import { sanitizeInput } from '../utils/sanitization.js';
import { logger } from '../utils/logger.js';

const channelCreationCooldown = new Map();
const VOICE_CREATE_COOLDOWN_MS = 2000;
const DEFAULT_VOICE_BITRATE = 64000;
const MAX_VOICE_BITRATE = 384000;
const MIN_VOICE_BITRATE = 8000;
const MAX_CHANNEL_NAME_LENGTH = 100;
const FALLBACK_CHANNEL_NAME = 'Voice Room';
const MAX_TRACKED_COOLDOWNS = 10000;

// --- STRUKTURAT E MEMORIES PËR STAFF DUTY ---
if (!global.staffDutyStart) global.staffDutyStart = new Map();
if (!global.staffTotalTime) global.staffTotalTime = new Map();

export default {
    name: 'voiceStateUpdate',
    async execute(oldState, newState, client) {
        if (newState.member?.user?.bot) return;

        const guildId = newState.guild.id;
        const userId = newState.member.id;
        const cooldownKey = `${guildId}-${userId}`;
        cleanupCooldownEntries();

        // --- LOGJIKA AUTOMATIKE PËR STAFF DUTY (ID TË SHKRUARA DIREKT) ---
        try {
            const ID_KANALI_ZE_SPECIFIK = "1500903502501773373";
            const ID_ROL_STAFF = "1500883679046664273";

            // 1. Stafi futet në kanalin e caktuar të zërit
            if (newState.channelId === ID_KANALI_ZE_SPECIFIK && oldState.channelId !== ID_KANALI_ZE_SPECIFIK) {
                await newState.member.roles.add(ID_ROL_STAFF).catch(err => logger.error(`Gabim gjatë dhënies së rolit: ${err}`));
                global.staffDutyStart.set(userId, Date.now());
            }

            // 2. Stafi del nga kanali i caktuar i zërit
            if (oldState.channelId === ID_KANALI_ZE_SPECIFIK && newState.channelId !== ID_KANALI_ZE_SPECIFIK) {
                await newState.member.roles.remove(ID_ROL_STAFF).catch(err => logger.error(`Gabim gjatë heqjes së rolit: ${err}`));
                
                const kohaFillimit = global.staffDutyStart.get(userId);
                if (kohaFillimit) {
                    const kohaKaluar = Date.now() - kohaFillimit;
                    const kohaEVjetër = global.staffTotalTime.get(userId) || 0;
                    global.staffTotalTime.set(userId, kohaEVjetër + kohaKaluar);
                    global.staffDutyStart.delete(userId);
                }
            }
        } catch (staffError) {
            logger.error(`Gabim në llogaritjen e kohës së stafit:`, staffError);
        }
        // --------------------------------------------------------

        try {
            const config = await getJoinToCreateConfig(client, guildId);

            if (!config.enabled || config.triggerChannels.length === 0) {
                return;
            }

            if (!oldState.channel && newState.channel) {
                await handleVoiceJoin(client, newState, config);
            }

            if (oldState.channel && !newState.channel) {
                await handleVoiceLeave(client, oldState, config);
            }

            if (oldState.channel && newState.channel && oldState.channel.id !== newState.channel.id) {
                await handleVoiceMove(client, oldState, newState, config);
            }

        } catch (error) {
            logger.error(`Error in voiceStateUpdate for guild ${guildId}:`, error);
        }

        async function handleVoiceJoin(client, state, config) {
            const { channel, member } = state;

            if (!config.triggerChannels.includes(channel.id)) {
                return;
            }

            const now = Date.now();
            if (channelCreationCooldown.has(cooldownKey)) {
                const lastCreation = channelCreationCooldown.get(cooldownKey);
                if (now - lastCreation < VOICE_CREATE_COOLDOWN_MS) {
                    logger.warn(`User ${member.id} is on cooldown for channel creation`);
                    return;
                }
            }

            const existingTempChannel = Object.keys(config.temporaryChannels || {}).find(
                tempChannelId => {
                    const tempInfo = config.temporaryChannels[tempChannelId];
                    return tempInfo && tempInfo.ownerId === member.id;
                }
            );

            if (existingTempChannel) {
                const tempChannel = state.guild.channels.cache.get(existingTempChannel);
                if (tempChannel) {
                    try {
                        await member.voice.setChannel(tempChannel);
                        return;
                    } catch (error) {
                        logger.warn(`Failed to move user ${member.id} to existing channel ${existingTempChannel}:`, error);
                    }
                }
            }

            if (member.voice.channel?.id !== channel.id) {
                return;
            }

            channelCreationCooldown.set(cooldownKey, now);
            trimCooldownMapIfNeeded();

            await createTemporaryChannel(client, state, config);
        }

        async function handleVoiceLeave(client, state, config) {
            const { channel, member } = state;

            const tempChannelInfo = await getTemporaryChannelInfo(client, state.guild.id, channel.id);
            
            if (!tempChannelInfo) {
                return;
            }

            if (channel.members.size === 0) {
                await deleteTemporaryChannel(client, channel, state.guild.id);
            } else if (tempChannelInfo.ownerId === member.id) {
                const nextMember = channel.members.first();
                if (nextMember) {
                    await transferChannelOwnership(client, channel, state.guild.id, nextMember.id);
                }
            }
        }

        async function handleVoiceMove(client, oldState, newState, config) {
            if (oldState.channel) {
                const tempChannelInfo = await getTemporaryChannelInfo(client, oldState.guild.id, oldState.channel.id);
                
                if (tempChannelInfo) {
                    if (oldState.channel.members.size === 0) {
                        await deleteTemporaryChannel(client, oldState.channel, oldState.guild.id);
                    } else if (tempChannelInfo.ownerId === oldState.member.id) {
                        const nextMember = oldState.channel.members.first();
                        if (nextMember) {
                            await transferChannelOwnership(client, oldState.channel, oldState.guild.id, nextMember.id);
                        }
                    }
                }
            }

            if (config.triggerChannels.includes(newState.channel.id) && 
                !config.triggerChannels.includes(oldState.channel?.id)) {
                await handleVoiceJoin(client, newState, config);
            }
        }

        async function createTemporaryChannel(client, state, config) {
            const { channel: triggerChannel, member, guild } = state;

            try {
                const me = guild.members.me;
                if (!me) {
                    logger.warn(`Bot member cache unavailable while creating temporary channel in guild ${guild.id}`);
                    channelCreationCooldown.delete(cooldownKey);
                    return;
                }

                const triggerPermissions = triggerChannel.permissionsFor(me);
                if (!triggerPermissions?.has([PermissionFlagsBits.ManageChannels, PermissionFlagsBits.MoveMembers, PermissionFlagsBits.Connect])) {
                    logger.warn(`Missing required permissions for temporary channel creation in guild ${guild.id} (trigger channel ${triggerChannel.id})`);
                    channelCreationCooldown.delete(cooldownKey);
                    return;
                }

                const channelOptions = config.channelOptions?.[triggerChannel.id] || {};
                const nameTemplate = channelOptions.nameTemplate || config.channelNameTemplate || "{username}'s Room";
                
                let userLimit = channelOptions.userLimit ?? config.userLimit ?? 0;
                const bitrate = clampVoiceBitrate(channelOptions.bitrate ?? config.bitrate ?? DEFAULT_VOICE_BITRATE);

                userLimit = Math.max(0, Math.min(99, userLimit || 0));

                logger.info(`Creating temporary channel for user ${member.id} with user limit: ${userLimit}`);

                const channelName = sanitizeVoiceChannelName(formatChannelName(nameTemplate, {
                    username: member.user.username,
                    userTag: member.user.tag,
                    displayName: member.displayName,
                    guildName: guild.name,
                    channelName: triggerChannel.name
                }));

                if (!member.voice?.channel || member.voice.channel.id !== triggerChannel.id) {
                    logger.debug(`Member ${member.id} no longer in trigger channel ${triggerChannel.id}, aborting temporary channel creation`);
                    channelCreationCooldown.delete(cooldownKey);
                    return;
                }

                const tempChannel = await guild.channels.create({
                    name: channelName,
                    type: ChannelType.GuildVoice,
                    parent: triggerChannel.parentId,
                    userLimit: userLimit === 0 ? undefined : userLimit,
                    bitrate: bitrate,
                    permissionOverwrites: [
                        {
                            id: member.id,
                            allow: ['Connect', 'Speak', 'PrioritySpeaker', 'MoveMembers']
                        },
                        {
                            id: guild.id,
                            allow: ['Connect', 'Speak']
                        }
                    ]
