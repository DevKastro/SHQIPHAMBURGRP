import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('server')
    .setDescription('Shfaq statusin zyrtar të serverit Shqiphamburg RP'),

  async execute(interaction) {
    const kodi = '`zxxi9se1`';
    const linkSrv = 'https://www.roblox.com/share?v=v2&code=5ihdm3h6l67ncz';
    const linkGrp = 'https://www.roblox.com/share/g/35906050';
    
    // ID e rolit të Qytetarëve për t'i bërë tag automatik
    const ID_ROL_QYTETARET = "1489919705983746189";

    const embed = new EmbedBuilder()
      .setColor('#008000') // Ngjyra e Kuqe zyrtare e Shqiphamburg RP
      .setTitle('🛡️ Shqiphamburg Roleplay')
      .setThumbnail(interaction.guild.iconURL({ dynamic: true })) // Logoja e vogël e serverit tënd lart djathtas
      .setDescription(
        `**Serveri ristartohet kur personave i bën llag. Gjithashtu ju njoftojmë se serveri do të rihapet nesër!**\n\n` +
        `**STATUS 🔌 Kodi i Qytetit**\n` +
        `🟢 Hapur  ${kodi}\n\n` +
        `🔗 **Linku i Qytetit 👥 Community i serverit**\n` +
        `[**Klikoni ketu per tu futur ne loje**](${linkSrv})\n\n` +
        `[**Klikoni ketu per tu futur ne community**](${linkGrp})\n\n` +
        `🦅 **Shqiphamburg Roleplay Official Links**`
      )
      // Fotoja jote zyrtare e Shqiphamburg RP
      .setImage('https://prodia.xyz') 
      .setTimestamp();

    // Boti dërgon njoftimin për Qytetarët edhet kutinë e dizajnuar së bashku
    await interaction.reply({ 
      content: `<@&${ID_ROL_QYTETARET}>`, 
      embeds: [embed] 
    });
  }
};
