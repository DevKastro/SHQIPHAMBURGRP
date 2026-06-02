import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("police")
    .setDescription("Komandat menaxhuese për Departamentin e Policisë")
    .addSubcommand(subcommand =>
      subcommand
        .setName("online")
        .setDescription("Shfaq kohën totale të qëndrimit të policëve në call")
    ),
  async execute(interaction) {
    // Kontrollojmë nëse lojtari ka zgjedhur nënkomandën 'online'
    if (interaction.options.getSubcommand() === "online") {
      const embed = new EmbedBuilder()
        .setColor("#0000ff") // Ngjyra Blu zyrtare e Policisë
        .setTitle("📊 RAPORTI I SAKTË I KOHËS SË POLICISË NË CALL")
        .setTimestamp();

      let listaTekst = "";
      const kohaTani = Math.floor(Date.now() / 1000);
      const dbQuery = interaction.client.db?.query || (interaction.client.db?.db ? (interaction.client.db.db.query ? interaction.client.db.db.query : null) : null);

      const dbData = new Map();

      // Marrim të dhënat e policisë nga databaza Postgres
      if (dbQuery) {
        await dbQuery(`CREATE TABLE IF NOT EXISTS police_duty (user_id TEXT PRIMARY KEY, total_time BIGINT)`).catch(() => null);
        const rezultati = await dbQuery(`SELECT * FROM police_duty`).catch(() => null);
        if (rezultati && rezultati.rows) {
          for (const row of rezultati.rows) {
            dbData.set(row.user_id, parseInt(row.total_time));
          }
        }
      }
      const gjitheUserat = new Set([
        ...dbData.keys(),
        ...(global.policeBackupTime ? global.policeBackupTime.keys() : []),
        ...(global.policeDutyStart ? global.policeDutyStart.keys() : [])
      ]);

      for (const userId of gjitheUserat) {
        let sekondaTotale = (dbData.get(userId) || 0) + (global.policeBackupTime?.get(userId) || 0);

        if (global.policeDutyStart && global.policeDutyStart.has(userId)) {
          const kohaFillimit = global.policeDutyStart.get(userId);
          sekondaTotale += (kohaTani - kohaFillimit);
        }

        if (sekondaTotale > 0) {
          const sekonda = sekondaTotale % 60;
          const minuta = Math.floor((sekondaTotale / 60) % 60);
          const ore = Math.floor(sekondaTotale / 3600);

          listaTekst += `• <@${userId}>: **${ore} Orë, ${minuta} Minuta, ${sekonda} Sekonda**\n`;
        }
      }

      embed.setDescription(listaTekst || "ℹ️ Nuk ka asnjë të dhënë të mbledhur për policinë në këtë moment.");
      await interaction.reply({ embeds: [embed] });
    }
  },
};
