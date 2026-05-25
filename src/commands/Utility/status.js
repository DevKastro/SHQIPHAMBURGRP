import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('Shfaq statusin aktual të serverit të lojës në Roblox'),
    async execute(interaction) {
        const statusEmbed = new EmbedBuilder()
            .setColor('#00ff00') // Ngjyra e gjelbër (Online)
            .setTitle('🟢 STATUSI I SERVERIT ZYRTAR')
            .setThumbnail(interaction.guild.iconURL({ dynamic: true })) // Shfaq logon e serverit tuaj automatikisht
            .setDescription(`
✨ **SERVERI ESHTE ON HAJDENI**

🔑 **KODI I SERVERIT:** \`zxxi9se1\`

🎮 **LINKU I SERVERIT:** [Kliko Këtu Për Të Hyrë Në Server](https://www.roblox.com/share?v=v2&code=5ihdm3h6l67ncz)

👥 **GRUPI JON NE ROBLOX:** [Kliko Këtu Për Të Hyrë Në Grup](https://www.roblox.com/share/g/35906050)
            `)
            .setFooter({ text: `Kërkuar nga ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [statusEmbed] });
    },
};
