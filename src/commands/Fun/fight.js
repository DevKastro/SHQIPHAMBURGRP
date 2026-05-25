import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("fight")
    .setDescription("Krijon një aksion RP dyluftimi me një lojtar tjetër")
    .addUserOption(option => 
      option.setName("lojtari")
        .setDescription("Zgjidh lojtarin që dëshiron të sfidosh")
        .setRequired(true)
    ),
  async execute(interaction) {
    const kundershtari = interaction.options.getUser("lojtari");
    
    if (kundershtari.id === interaction.user.id) {
      return await interaction.reply({ content: "❌ Nuk mund të dyluftosh me veten tënde!", ephemeral: true });
    }

    const fituesi = Math.random() > 0.5 ? interaction.user : kundershtari;

    await interaction.reply({ 
      content: `⚔️ **DYLUFTIM RP:** ${interaction.user} sfidoi në dyluftim ${kundershtari}!\n🏆 Pas një beteje të fortë, fituesi është: ${fituesi}! 🎉` 
    });
  },
};
