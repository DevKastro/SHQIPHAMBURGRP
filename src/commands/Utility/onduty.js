import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("onduty")
    .setDescription("Shfaq kohën totale të qëndrimit të stafit në call"),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor("#00ffcc")
      .setTitle("📊 RAPORTI I SAKTË I KOHËS SË STAFF-IT NË CALL")
      .setTimestamp();

    let listaTekst = "";
    const kohaTani = Math.floor(Date.now() / 1000);
    const dbQuery = interaction.client.db?.query || interaction.client.db?.db?.query;

    const dbData = new Map();

    if (dbQuery) {
      await dbQuery(`CREATE TABLE IF NOT EXISTS staff_duty (user_id TEXT PRIMARY KEY, total_time BIGINT)`).catch(() => null);
      const rezultati = await dbQuery(`SELECT * FROM staff_duty`).catch(() => null);
      if (rezultati && rezultati.rows) {
        for (const row of rezultati.rows) {
          dbData.set(row.user_id, parseInt(row.total_time));
        }
      }
    }

    const gjitheUserat = new Set([
      ...dbData.keys(),
      ...(global.staffBackupTime ? global.staffBackupTime.keys() : []),
      ...(global.staffDutyStart ? global.staffDutyStart.keys() : [])
    ]);

    for (const userId of gjitheUserat) {
      let sekondaTotale = (dbData.get(userId) || 0) + (global.staffBackupTime?.get(userId) || 0);

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

    embed.setDescription(listaTekst || "ℹ️ Nuk ka asnjë të dhënë të mbledhur për stafin në këtë moment.");
    await interaction.reply({ embeds: [embed] });
  },
};
