import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('aplikimet')
    .setDescription('Shfaq njoftimin dhe linkun e aplikimeve për Polici'),

  async execute(interaction) {
    const linkAplikimi = 'https://forms.gle'; 

    const embed = new EmbedBuilder()
      .setColor('#0000ff') // Ngjyra Blu e Policisë
      .setTitle('🚓 APLIKIMET E POLICISË - SHQIPHAMBURG RP')
      .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
      .setDescription(
        `🚨 **NJOFTIM NGA DREJTORIA E POLICISË** 🚨\n\n` +
        `***KTU MUNDENI ME APLIKU PER TU BE PJES E POLICIS TE SHQIPHAMBURG RP.***\n\n` +
        `** Aplikoni vetëm nëse jeni lojtar serioz dhe njihni kodet RP të Policisë **.\n\n` +
        `📋 **Si të aplikoni?**\n` +
        `** Klikoni mbi linkun e mëposhtëm me shkronja blu dhe plotësoni formularin me të dhënat tuaja të sakta **:\n\n` +
        `🔗 [** Kliko Këtu Për Të Apliku Për Polici **](${linkAplikimi})\n\n` +
        `ℹ️ * ** Shënim i rëndësishëm:* Nëse jeni pranuar, ju do të merrni linkun e sektorit të policisë direkt në DM (Mesazh Privat)**.`
      )
      // Këtu vendoset fotoja jote zyrtare e qytetit në fund të njoftimit
      .setImage('https://cdn.discordapp.com/attachments/1505541145311051817/1509262679062220810/1779018008984.png?ex=6a1889e7&is=6a173867&hm=9d06bfc8afd060ded438a7d333f9277d37e4bdbaf9dffd2b7465471670adfb5d&')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
