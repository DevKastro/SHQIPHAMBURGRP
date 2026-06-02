import { Events, EmbedBuilder } from 'discord.js';

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
  name: Events.MessageDelete,
  once: false,

  async execute(message) {
    try {
      if (!message.guild || message.guild.id !== TARGET_GUILD_ID || message.author?.bot) return;

      const embed = new EmbedBuilder()
        .setColor("#ff0000") // Ngjyra e Kuqe për fshirje
        .setTitle("🗑️ Mesazh i Fshirë")
        .addFields(
          { name: "👤 Autori:", value: `${message.author} (\`${message.author.id}\`)`, inline: true },
          { name: "📂 Kanali:", value: `${message.channel}`, inline: true },
          { name: "⏰ Koha:", value: `\`${marrKohenLog()}\``, inline: false },
          { name: "💬 Përmbajtja e Mesazhit:", value: message.content || "*[Pa tekst ose skedar]*", inline: false }
        )
        .setTimestamp();

      const channel = message.guild.channels.cache.get(LOG_CHANNEL_ID);
      if (channel) await channel.send({ embeds: [embed] }).catch(() => null);
    } catch (error) {
      // Injorojmë gabimet në heshtje që boti të mos bëjë crash
    }
  }
};
