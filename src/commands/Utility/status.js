import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
export default {
  data: new SlashCommandBuilder().setName('status').setDescription('Shfaq statusin e serverit'),
  async execute(interaction) {
    const embed = new EmbedBuilder().setColor('#00ff00').setTitle('🟢 SERVERI ESHTE ON HAJDENI').setDescription(`🔑 **KODI:** \`zxxi9se1\`\n\n🎮 [Kliko Këtu Për Të Hyrë Në Server](https://roblox.com)\n\n👥 [Kliko Këtu Për Të Hyrë Në Grup](https://roblox.com)`);
    await interaction.reply({ embeds: [embed] });
  }
};
