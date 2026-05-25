import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("onduty")
    .setDescription("Shfaq kohen totale te qendrimit te stafit ne call"),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor("#00ffcc")
      .setTitle("📊 RAPORTI I KOHËS SË STAFF-IT NË CALL")
      .setTimestamp();

    let listaTekst = "";
    const kohaTani = Math.floor(Date.now() / 1000);

    // Krijojmë një listë me të gjithë përdoruesit që kanë qenë në detyrë
    const gjitheUserat = new Set([
      ...(global.staffBackupTime ? global.staffBackupTime.keys() : []),
      ...(global.staffDutyStart ? global.staffDutyStart.keys() : [])
    ]);

    for (const userId of gjitheUserat) {
      let sekondaTotale = global.staffBackupTime.get(userId) || 0;

      // Nëse lojtari është LIVE në kanal aktualisht, shtojmë edhe sekondat live tani
      if (global.staffDutyStart && global.staffDutyStart.has(userId)) {
        const kohaFillimit = global.staffDutyStart.get(userId);
        sekondaTotale += (kohaTani - kohaFillimit);
      }

      if (sekondaTotale > 0) {
        const sekonda = sekondaTotale % 60;
        const minuta = Math.floor((sekondaTotale / 60) % 60);
        const ore = Math.floor(sekondaTotale / 3600);

        listaTekst += `• <@${userId}>: **${ore} Orë, ${minuta} Minuta, ${sekonda} Sekonda**\n`;
      }
    }

    embed.setDescription(listaTekst || "ℹ️ Nuk ka asnje staf aktualisht ne kanal dhe asnje te dhene te mbledhur.");
    await interaction.reply({ embeds: [embed] });
  },
};
