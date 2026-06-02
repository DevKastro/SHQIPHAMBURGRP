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
  name: Events.MessageUpdate,
  once: false,

  async execute(oldMessage, newMessage) {
    try {
      if (!newMessage.guild || newMessage.guild.id !== TARGET_GUILD_ID || newMessage.author?.bot) return;
      if (oldMessage.content === newMessage.content) return; 

      const embed = new EmbedBuilder()
        .setColor("#ffaa00") // Ngjyra Portokalli për editim
        .setTitle("✏️ Mesazh i Edituar")
        .addFields(
          { name: "👤 Autori:", value: `${newMessage.author} (\`${newMessage.author.id}\`)`, inline: true },
          { name: "📂 Kanali:", value: `${newMessage.channel}`, inline: true },
          { name: "⏰ Koha:", value: `\`${marrKohenLog()}\``, inline: false },
          { name: "📜 Para Editimit (Vjetër):", value: oldMessage.content || "*[Pa tekst]*", inline: false },
          { name: "📝 Pas Editimit (Re):", value: newMessage.content || "*[Pa tekst]*", inline: false }
        )
        .setTimestamp();

      const channel = newMessage.guild.channels.cache.get(LOG_CHANNEL_ID);
      if (channel) await channel.send({ embeds: [embed] }).catch(() => null);
    } catch (error) {
      // Injorojmë gabimet në heshtje
    }
  }
};
