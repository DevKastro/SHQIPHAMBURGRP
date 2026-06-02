import { Events, EmbedBuilder, AuditLogEvent } from 'discord.js';
import { logEvent, EVENT_TYPES } from '../services/loggingService.js';
import { logger } from '../utils/logger.js';

const TARGET_GUILD_ID = "1375191211199168553";
const LOG_CHANNEL_ID = "1511444716925882539";

function marrKohenLog() {
  const tani = new Date();
  return tani.toLocaleString('sq-AL', { 
    timeZone: 'Europe/Tirane', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false 
  });
}

export default {
  name: Events.GuildMemberUpdate,
  once: false,

  async execute(oldMember, newMember) {
    try {
      if (!newMember.guild) return;

      // --- 1. LOGJIKA RE PËR TIMEOUT (MUTE) ---
      if (newMember.guild.id === TARGET_GUILD_ID) {
        const kohaTimeoutVjeter = oldMember.communicationDisabledUntilTimestamp;
        const kohaTimeoutRe = newMember.communicationDisabledUntilTimestamp;

        if (!kohaTimeoutVjeter && kohaTimeoutRe) {
          let stafiAksionit = "Nuk u gjet";
          let arsyejaAksionit = "Pa arsye";

          try {
            const auditLogs = await newMember.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.MemberUpdate });
            const updateLog = auditLogs.entries.first();
            if (updateLog && updateLog.target.id === newMember.id) {
              stafiAksionit = `${updateLog.executor} (\`${updateLog.executor.id}\`)`;
              arsyejaAksionit = updateLog.reason || "Pa arsye";
            }
          } catch (e) {}

          const embed = new EmbedBuilder()
            .setColor("#f72585")
            .setTitle("🔇 Përdorues i vendosur në Timeout (Mute)")
            .addFields(
              { name: "👤 I Ndëshkuari:", value: `${newMember.user} (\`${newMember.id}\`)`, inline: true },
              { name: "👮 Stafi:", value: stafiAksionit, inline: true },
              { name: "⏰ Koha:", value: `\`${marrKohenLog()}\``, inline: false },
              { name: "📝 Arsyeja:", value: arsyejaAksionit, inline: false }
            )
            .setTimestamp();

          const channel = newMember.guild.channels.cache.get(LOG_CHANNEL_ID);
          if (channel) await channel.send({ embeds: [embed] }).catch(() => null);
        }
      }
      // --- 2. LOGJIKA E VJETËR PËR NDRYSHIMIN E NICKNAME ---
      const fields = [];
      fields.push({
        name: '👤 Member',
        value: `${newMember.user.tag} (${newMember.user.id})`,
        inline: true
      });

      if (oldMember.nickname !== newMember.nickname) {
        fields.push({
          name: '🏷️ Old Nickname',
          value: oldMember.nickname || '*(no nickname)*',
          inline: true
        });

        fields.push({
          name: '🏷️ New Nickname',
          value: newMember.nickname || '*(no nickname)*',
          inline: true
        });

        await logEvent({
          client: newMember.client,
          guildId: newMember.guild.id,
          eventType: EVENT_TYPES.MEMBER_NAME_CHANGE,
          data: {
            description: `Member nickname changed: ${newMember.user.tag}`,
            userId: newMember.user.id,
            fields
          }
        });
        return;
      }

    } catch (error) {
      logger.error('Error in guildMemberUpdate event:', error);
    }
  }
};
