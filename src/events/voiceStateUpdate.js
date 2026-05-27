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

if (!global.staffDutyStart) global.staffDutyStart = new Map();
if (!global.staffBackupTime) global.staffBackupTime = new Map();
if (!global.disconnectTimers) global.disconnectTimers = new Map();

const channelCreationCooldown = new Map();
const VOICE_CREATE_COOLDOWN_MS = 2000;
const DEFAULT_VOICE_BITRATE = 64000;
const MAX_VOICE_BITRATE = 384000;
const MIN_VOICE_BITRATE = 8000;
const MAX_CHANNEL_NAME_LENGTH = 100;
const FALLBACK_CHANNEL_NAME = 'Voice Room';
const MAX_TRACKED_COOLDOWNS = 10000;

export default {
    name: 'voiceStateUpdate',
    async execute(oldState, newState, client) {
        if (newState.member?.user?.bot) return;

        const guildId = newState.guild.id;
        const userId = newState.member.id;
        const cooldownKey = `${guildId}-${userId}`;
        cleanupCooldownEntries();

        // --- SISTEMI AUTOMATIK I STAFF DUTY + DISCONNECT 10 SEKRENDA ---
        try {
            const ID_KANALI_ZE_SPECIFIK = "1500903502501773373";
            const ID_ROL_STAFF_KRYESOR = "1435751640346132570";
            const ID_ROL_STAFF_DUTY = "1500883679046664273";

            const eshteStaf = newState.member?.roles.cache.has(ID_ROL_STAFF_KRYESOR) || oldState.member?.roles.cache.has(ID_ROL_STAFF_KRYESOR);

            if (eshteStaf) {
                if (newState.channelId === ID_KANALI_ZE_SPECIFIK && oldState.channelId !== ID_KANALI_ZE_SPECIFIK) {
                    await newState.member.roles.add(ID_ROL_STAFF_DUTY).catch(() => null);
                    global.staffDutyStart.set(userId, Math.floor(Date.now() / 1000));

                    if (global.disconnectTimers.has(userId)) clearTimeout(global.disconnectTimers.get(userId));

                    const timer = setTimeout(async () => {
                        try {
                            const memberAktual = newState.guild.members.cache.get(userId);
                            if (memberAktual && memberAktual.voice.channelId === ID_KANALI_ZE_SPECIFIK) {
                                await memberAktual.voice.setChannel(null).catch(() => null);
                            }
                        } catch (err) { }
                    }, 1200000);

                    global.disconnectTimers.set(userId, timer);
                }

                if (oldState.channelId === ID_KANALI_ZE_SPECIFIK && newState.channelId !== ID_KANALI_ZE_SPECIFIK) {
                    await newState.member.roles.remove(ID_ROL_STAFF_DUTY).catch(() => null);
                    
                    if (global.disconnectTimers.has(userId)) {
                        clearTimeout(global.disconnectTimers.get(userId));
                        global.disconnectTimers.delete(userId);
                    }

                    const kohaFillimit = global.staffDutyStart.get(userId);
                    if (kohaFillimit) {
                        const kohaTani = Math.floor(Date.now() / 1000);
                        const sekondatKaluar = kohaTani - kohaFillimit;

                        if (sekondatKaluar > 0) {
                            const dbQuery = client.db?.query || (client.db?.db ? (client.db.db.query ? client.db.db.query : null) : null);
                            if (dbQuery) {
                                await dbQuery(`CREATE TABLE IF NOT EXISTS staff_duty (user_id TEXT PRIMARY KEY, total_time BIGINT)`).catch(() => null);
                                await dbQuery(
                                    `INSERT INTO staff_duty (user_id, total_time) VALUES ($1, $2) 
                                     ON CONFLICT (user_id) DO UPDATE SET total_time = staff_duty.total_time + $2`,
                                    [userId, sekondatKaluar]
                                ).catch(() => null);
                            }
                            
                            const kohaAktuale = global.staffBackupTime.get(userId) || 0;
                            global.staffBackupTime.set(userId, kohaAktuale + sekondatKaluar);
                        }
                        global.staffDutyStart.delete(userId);
                    }
                }
            }
        } catch (staffError) { 
            logger.error(staffError); 
        }

        try {
            const config = await getJoinToCreateConfig(client, guildId);
            if (!config.enabled || config.triggerChannels.length === 0) return;
            
            if (!oldState.channel && newState.channel) await handleVoiceJoin(client, newState, config);
            if (oldState.channel && !newState.channel) await handleVoiceLeave(client, oldState, config);
            if (oldState.channel && newState.channel && oldState.channel.id !== newState.channel.id) await handleVoiceMove(client, oldState, newState, config);
        } catch (error) { 
            logger.error(error); 
        }
        async function handleVoiceJoin(client, state, config) {
            const { channel, member } = state;
            if (!config.triggerChannels.includes(channel.id)) return;

            const now = Date.now();
            if (channelCreationCooldown.has(cooldownKey)) {
                const lastCreation = channelCreationCooldown.get(cooldownKey);
                if (now - lastCreation < VOICE_CREATE_COOLDOWN_MS) return;
            }

            const existingTempChannel = Object.keys(config.temporaryChannels || {}).find(tempChannelId => {
                const tempInfo = config.temporaryChannels[tempChannelId];
                return tempInfo && tempInfo.ownerId === member.id;
            });

            if (existingTempChannel) {
                const tempChannel = state.guild.channels.cache.get(existingTempChannel);
                if (tempChannel) {
                    try {
                        await member.voice.setChannel(tempChannel);
                        return;
                    } catch (error) {
                        logger.warn(error);
                    }
                }
            }

            if (member.voice.channel?.id !== channel.id) return;
            channelCreationCooldown.set(cooldownKey, now);
            trimCooldownMapIfNeeded();
            await createTemporaryChannel(client, state, config);
        }

        async function handleVoiceLeave(client, state, config) {
            const { channel, member } = state;
            const tempChannelInfo = await getTemporaryChannelInfo(client, state.guild.id, channel.id);
            if (!tempChannelInfo) return;

            if (channel.members.size === 0) {
                await deleteTemporaryChannel(client, channel, state.guild.id);
            } else if (tempChannelInfo.ownerId === member.id) {
                const nextMember = channel.members.first();
                if (nextMember) await transferChannelOwnership(client, channel, state.guild.id, nextMember.id);
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
                        if (nextMember) await transferChannelOwnership(client, oldState.channel, oldState.guild.id, nextMember.id);
                    }
                }
            }
            if (config.triggerChannels.includes(newState.channel.id) && !config.triggerChannels.includes(oldState.channel?.id)) {
                await handleVoiceJoin(client, newState, config);
            }
        }

        async function createTemporaryChannel(client, state, config) {
            const { channel: triggerChannel, member, guild } = state;
            try {
                const me = guild.members.me;
                if (!me) return;

                const triggerPermissions = triggerChannel.permissionsFor(me);
                if (!triggerPermissions?.has([PermissionFlagsBits.ManageChannels, PermissionFlagsBits.MoveMembers, PermissionFlagsBits.Connect])) return;

                const channelOptions = config.channelOptions?.[triggerChannel.id] || {};
                const nameTemplate = channelOptions.nameTemplate || config.channelNameTemplate || "{username}'s Room";
                
                let userLimit = channelOptions.userLimit ?? config.userLimit ?? 0;
                const bitrate = clampVoiceBitrate(channelOptions.bitrate ?? config.bitrate ?? DEFAULT_VOICE_BITRATE);
                userLimit = Math.max(0, Math.min(99, userLimit || 0));

                const channelName = sanitizeVoiceChannelName(formatChannelName(nameTemplate, { 
                    username: member.user.username, 
                    userTag: member.user.tag, 
                    displayName: member.displayName, 
                    guildName: guild.name, 
                    channelName: triggerChannel.name 
                }));

                if (!member.voice?.channel || member.voice.channel.id !== triggerChannel.id) return;

                const tempChannel = await guild.channels.create({
                    name: channelName,
                    type: ChannelType.GuildVoice,
                    parent: triggerChannel.parentId,
                    userLimit: userLimit === 0 ? undefined : userLimit,
                    bitrate: bitrate,
                    permissionOverwrites: [
                        { id: member.id, allow: ['Connect', 'Speak', 'PrioritySpeaker', 'MoveMembers'] },
                        { id: guild.id, allow: ['Connect', 'Speak'] }
                    ]
                });

                await member.voice.setChannel(tempChannel);
                await registerTemporaryChannel(client, guild.id, tempChannel.id, member.id);
            } catch (error) {
                logger.error(error);
            }
        }

        async function deleteTemporaryChannel(client, channel, guildId) {
            try {
                await channel.delete();
                await unregisterTemporaryChannel(client, guildId, channel.id);
            } catch (error) {
                logger.error(error);
            }
        }

        async function transferChannelOwnership(client, channel, guildId, newOwnerId) {
            try {
                await channel.permissionOverwrites.set([
                    { id: newOwnerId, allow: ['Connect', 'Speak', 'PrioritySpeaker', 'MoveMembers'] },
                    { id: channel.guild.id, allow: ['Connect', 'Speak'] }
                ]);
                await registerTemporaryChannel(client, guildId, channel.id, newOwnerId);
            } catch (error) {
                logger.error(error);
            }
        }

        function clampVoiceBitrate(bitrate) {
            return Math.max(MIN_VOICE_BITRATE, Math.min(MAX_VOICE_BITRATE, bitrate));
        }

        function sanitizeVoiceChannelName(name) {
            if (!name) return FALLBACK_CHANNEL_NAME;
            const sanitized = sanitizeInput(name).trim();
            if (sanitized.length === 0) return FALLBACK_CHANNEL_NAME;
            return sanitized.substring(0, MAX_CHANNEL_NAME_LENGTH);
        }

        function cleanupCooldownEntries() {
            if (channelCreationCooldown.size > MAX_TRACKED_COOLDOWNS) {
                const now = Date.now();
                for (const [key, value] of channelCreationCooldown.entries()) {
                    if (now - value > VOICE_CREATE_COOLDOWN_MS) channelCreationCooldown.delete(key);
                }
            }
        }

        function trimCooldownMapIfNeeded() {
            if (channelCreationCooldown.size > MAX_TRACKED_COOLDOWNS) {
                const firstKey = channelCreationCooldown.keys().next().value;
                if (firstKey) channelCreationCooldown.delete(firstKey);
            }
        }
    }
};
