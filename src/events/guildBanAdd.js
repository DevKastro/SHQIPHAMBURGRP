import { Events, EmbedBuilder, AuditLogEvent } from 'discord.js';

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
  name: Events.GuildBanAdd,
  once: false,

  async execute(ban) {
    try {
      if (ban.guild.id !== TARGET_GUILD_ID) return;

      let stafiAksionit = "Nuk u gjet (Mod Manual/Bot)";
      let arsyejaAksionit = ban.reason || "Nuk është shkruar arsye";

      try {
        const auditLogs = await ban.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.MemberBanAdd });
        const banLog = auditLogs.entries.first();
        if (banLog && banLog.target.id === ban.user.id) {
          stafiAksionit = `${banLog.executor} (\`${banLog.executor.id}\`)`;
        }
      } catch (e) {}

      const embed = new EmbedBuilder()
        .setColor("#7209b7") // Ngjyra Vjollcë për Ban
        .setTitle("🔨 Përdorues i Banuar (BAN)")
        .addFields(
          { name: "👤 I Ndëshkuari:", value: `${ban.user} (\`${ban.user.id}\`)`, inline: true },
          { name: "👮 Stafi:", value: stafiAksionit, inline: true },
          { name: "⏰ Koha:", value: `\`${marrKohenLog()}\``, inline: false },
          { name: "📝 Arsyeja:", value: arsyejaAksionit, inline: false }
        )
        .setTimestamp();

      const channel = ban.guild.channels.cache.get(LOG_CHANNEL_ID);
      if (channel) await channel.send({ embeds: [embed] }).catch(() => null);
    } catch (error) {}
  }
};
