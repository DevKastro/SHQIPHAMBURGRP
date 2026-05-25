import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('server')
    .setDescription('Shfaq statusin e serverit'),

  async execute(interaction) {
    const kodi = '`zxxi9se1`';
    const linkSrv = 'https://roblox.com';
    const linkGrp = 'https://roblox.com';

    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('🟢 SERVERI ESHTE ON HAJDENI')
      .setDescription(
        `🔑 **KODI I SERVERIT:** ${kodi}\n\n` +
        `🎮 [Kliko Këtu Për Të Hyrë Në Server](${linkSrv})\n\n` +
        `👥 [Kliko Këtu Për Të Hyrë Në Grup](${linkGrp})`
      );

    await interaction.reply({ embeds: [embed] });
  }
};
