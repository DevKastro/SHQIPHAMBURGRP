import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("onduty")
    .setDescription("Shfaq sa kohë ka qëndruar stafi në kanalin e zërit"),
  async execute(interaction) {
    // Kontrollojmë nëse ka të dhëna në kujtesë
    if (!global.staffTotalTime || global.staffTotalTime.size === 0) {
      return await interaction.reply({ content: "❌ Nuk ka ende të dhëna për stafin në detyrë.", ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor("#00ffcc")
      .setTitle("📊 RAPORTI I KOHËS SË STAFF-IT NË CALL")
      .setTimestamp();

    let listaTekst = "";

    for (const [userId, kohaTotaleMS] of global.staffTotalTime.entries()) {
      let kohaAktualeMS = kohaTotaleMS;
      
      // Nëse janë ende brenda në call në këtë sekondë, shtojmë edhe kohën aktuale
      if (global.staffDutyStart && global.staffDutyStart.has(userId)) {
        kohaAktualeMS += (Date.now() - global.staffDutyStart.get(userId));
      }

      const sekonda = Math.floor((kohaAktualeMS / 1000) % 60);
      const minuta = Math.floor((kohaAktualeMS / (1000 * 60)) % 60);
      const orë = Math.floor((kohaAktualeMS / (1000 * 60 * 60)));

      listaTekst += `• <@${userId}>: **${orë} Orë, ${minuta} Minuta, ${sekonda} Sekonda**\n`;
    }

    embed.setDescription(listaTekst || "Asnjë staf nuk ka hyrë ende.");
    await interaction.reply({ embeds: [embed] });
  },
};

