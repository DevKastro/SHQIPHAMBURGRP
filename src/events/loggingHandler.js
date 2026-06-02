import { Events, EmbedBuilder, AuditLogEvent } from "discord.js";
import { logger } from "../utils/logger.js";

// Konfigurimet kryesore të ID-ve të kërkuara
const TARGET_GUILD_ID = "1375191211199168553";
const LOG_CHANNEL_ID = "1511444716925882539";

// Funksion ndihmës për të marrë kohën aktuale të formatuar bukur
function marrKohenFormatuar() {
  const tani = new Date();
  const opsionet = { 
    timeZone: 'Europe/Tirane', 
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false 
  };
  return tani.toLocaleString('sq-AL', opsionet);
}

// Funksion ndihmës për të gjetur kanalin e log-eve dhe për të dërguar Embed-in
async function dergoLog(client, embed) {
  try {
    const guild = client.guilds.cache.get(TARGET_GUILD_ID);
    if (!guild) return;
    const channel = guild.channels.cache.get(LOG_CHANNEL_ID);
    if (channel) {
      await channel.send({ embeds: [embed] });
    }
  } catch (err) {
    logger.error("Gabim gjatë dërgimit të log-eve:", err);
  }
}

export default [
  // 1. EVENTI PËR MESAZHET E FSHIRA
  {
    name: Events.MessageDelete,
    async execute(message, client) {
      if (!message.guild || message.guild.id !== TARGET_GUILD_ID || message.author?.bot) return;

      const embed = new EmbedBuilder()
        .setColor("#ff0000") // Ngjyra e Kuqe për fshirje
        .setTitle("🗑️ Mesazh i Fshirë")
        .addFields(
          { name: "👤 Autori:", value: `${message.author} (\`${message.author.id}\`)`, inline: true },
          { name: "📂 Kanali:", value: `${message.channel}`, inline: true },
          { name: "⏰ Koha:", value: `\`${marrKohenFormatuar()}\``, inline: false },
          { name: "💬 Përmbajtja e Mesazhit:", value: message.content || "*[Pa tekst ose skedar]*", inline: false }
        )
        .setTimestamp();

      await dergoLog(client, embed);
    }
  },

  // 2. EVENTI PËR MESAZHET E EDITUARA
  {
    name: Events.MessageUpdate,
    async execute(oldMessage, newMessage, client) {
      if (!newMessage.guild || newMessage.guild.id !== TARGET_GUILD_ID || newMessage.author?.bot) return;
      if (oldMessage.content === newMessage.content) return; // Injoro nëse ndryshoi diçka tjetër (p.sh. link embed)

      const embed = new EmbedBuilder()
        .setColor("#ffaa00") // Ngjyra Portokalli për editim
        .setTitle("✏️ Mesazh i Edituar")
        .addFields(
          { name: "👤 Autori:", value: `${newMessage.author} (\`${newMessage.author.id}\`)`, inline: true },
          { name: "📂 Kanali:", value: `${newMessage.channel}`, inline: true },
          { name: "⏰ Koha:", value: `\`${marrKohenFormatuar()}\``, inline: false },
          { name: "📜 Para Editimit (Vjetër):", value: oldMessage.content || "*[Pa tekst]*", inline: false },
          { name: "📝 Pas Editimit (Re):", value: newMessage.content || "*[Pa tekst]*", inline: false }
        )
        .setTimestamp();

      await dergoLog(client, embed);
    }
  },
  // 3. EVENTI PËR KANALET E ZËRIT (HYRJE/DALJE/LËVIZJE)
  {
    name: Events.VoiceStateUpdate,
    async execute(oldState, newState, client) {
      if (newState.guild.id !== TARGET_GUILD_ID || newState.member.user.bot) return;

      const embed = new EmbedBuilder().setTimestamp();
      const userTekst = `${newState.member.user} (\`${newState.member.id}\`)`;
      const koha = `\`${marrKohenFormatuar()}\``;

      // Lojtari futet në një kanal zëri nga gjendja offline
      if (!oldState.channelId && newState.channelId) {
        embed.setColor("#00ff00") // E gjelbër për hyrje
          .setTitle("🔊 Hyrje në Kanal Zëri")
          .addFields(
            { name: "👤 Lojtari:", value: userTekst, inline: true },
            { name: "📞 Kanal i Ri:", value: `${newState.channel}`, inline: true },
            { name: "⏰ Koha:", value: koha, inline: false }
          );
        await dergoLog(client, embed);
      }
      // Lojtari del plotësisht nga kanalet e zërit
      else if (oldState.channelId && !newState.channelId) {
        embed.setColor("#ff0000") // E kuqe për dalje
          .setTitle("🔇 Dalje nga Kanal Zëri")
          .addFields(
            { name: "👤 Lojtari:", value: userTekst, inline: true },
            { name: "📞 Kanali i Vjetër:", value: `${oldState.channel}`, inline: true },
            { name: "⏰ Koha:", value: koha, inline: false }
          );
        await dergoLog(client, embed);
      }
      // Lojtari lëviz nga një kanal zëri në një tjetër
      else if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
        embed.setColor("#00aaff") // Blu e çelur për lëvizje
          .setTitle("🔀 Lëvizje në Kanal Zëri")
          .addFields(
            { name: "👤 Lojtari:", value: userTekst, inline: false },
            { name: "📞 Prej Kanalit:", value: `${oldState.channel}`, inline: true },
            { name: "📞 Tek Kanali:", value: `${newState.channel}`, inline: true },
            { name: "⏰ Koha:", value: koha, inline: false }
          );
        await dergoLog(client, embed);
      }
    }
  },

  // 4. EVENTI PËR ANËTARËT QË BANOHEN (BAN)
  {
    name: Events.GuildBanAdd,
    async execute(ban, client) {
      if (ban.guild.id !== TARGET_GUILD_ID) return;

      let stafiAksionit = "Nuk u gjet (Mod Manual/Bot)";
      let arsyejaAksionit = ban.reason || "Nuk është shkruar arsye";

      // Kërkojmë te Audit Logs për të gjetur stafin që bëri BAN
      try {
        const auditLogs = await ban.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.MemberBanAdd });
        const banLog = auditLogs.entries.first();
        if (banLog && banLog.target.id === ban.user.id) {
          stafiAksionit = `${banLog.executor} (\`${banLog.executor.id}\`)`;
        }
      } catch (e) {}

      const embed = new EmbedBuilder()
        .setColor("#7209b7") // Ngjyra Vjollcë e errët për Ban
        .setTitle("🔨 Përdorues i Banuar (BAN)")
        .addFields(
          { name: "👤 I Ndëshkuari:", value: `${ban.user} (\`${ban.user.id}\`)`, inline: true },
          { name: "👮 Stafi:", value: stafiAksionit, inline: true },
          { name: "⏰ Koha:", value: `\`${marrKohenFormatuar()}\``, inline: false },
          { name: "📝 Arsyeja:", value: arsyejaAksionit, inline: false }
        )
        .setTimestamp();

      await dergoLog(client, embed);
    }
  },

  // 5. EVENTI PËR ANËTARËT QË NDRYSHOJNË (KICK / TIMEOUT DETECT)
  {
    name: Events.GuildMemberUpdate,
    async execute(oldMember, newMember, client) {
      if (newMember.guild.id !== TARGET_GUILD_ID) return;

      const embed = new EmbedBuilder().setTimestamp();
      const koha = `\`${marrKohenFormatuar()}\``;

      // KONTROLLI PËR TIMEOUT (Ndryshimi i kohës së bllokimit)
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

        embed.setColor("#f72585") // Ngjyra Rozë e ndezur për Timeout
          .setTitle("🔇 Përdorues i vendosur në Timeout (Mute)")
          .addFields(
            { name: "👤 I Ndëshkuari:", value: `${newMember.user} (\`${newMember.id}\`)`, inline: true },
            { name: "👮 Stafi:", value: stafiAksionit, inline: true },
            { name: "⏰ Koha:", value: koha, inline: false },
            { name: "📝 Arsyeja:", value: arsyejaAksionit, inline: false }
          );
        await dergoLog(client, embed);
      }
    }
  },

  // 6. EVENTI PËR KICK (Kërkohet nga largimi i anëtarit)
  {
    name: Events.GuildMemberRemove,
    async execute(member, client) {
      if (member.guild.id !== TARGET_GUILD_ID) return;

      // Kontrollojmë nëse largimi erdhi nga një KICK manual i stafit
      try {
        const auditLogs = await member.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.MemberKick });
        const kickLog = auditLogs.entries.first();
        
        // Nëse logu i fundit i Kick përputhet me sekondat e tanishme dhe lojtarin e duhur
        if (kickLog && kickLog.target.id === member.id && (Date.now() - kickLog.createdAt.getTime() < 10000)) {
          const embed = new EmbedBuilder()
            .setColor("#f48c06") // Ngjyra Portokalli e ndezur për Kick
            .setTitle("👢 Përdorues i Larguar me Shkelm (KICK)")
            .addFields(
              { name: "👤 I Ndëshkuari:", value: `${member.user} (\`${member.id}\`)`, inline: true },
              { name: "👮 Stafi:", value: `${kickLog.executor} (\`${kickLog.executor.id}\`)`, inline: true },
              { name: "⏰ Koha:", value: `\`${marrKohenFormatuar()}\``, inline: false },
              { name: "📝 Arsyeja:", value: kickLog.reason || "Nuk është shkruar arsye", inline: false }
            )
            .setTimestamp();

          await dergoLog(client, embed);
        }
      } catch (e) {}
    }
  }
];
