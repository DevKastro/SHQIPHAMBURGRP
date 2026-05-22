import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('rregullat-policia') // Kjo do te jete komanda /rregullat-policia ne Discord
        .setDescription('Shfaq rregullat zyrtare per Departamentin e Policisë (PD)'),
    async execute(interaction) {
        const policeEmbed = new EmbedBuilder()
            .setColor('#001eff') // Ngjyra Blu e Policisë
            .setTitle('👮 RREGULLORE ZYRTARE - DEPARTAMENTI I POLICISË')
            .setDescription(`
**1. 🛑 Korrupsioni:** Ndalohet rreptësisht korrupsioni (p.sh. shitja e armëve të policisë apo lirimi i shokëve pa arsye) pa leje nga Kryesia.
**2. 🔫 Përdorimi i Armëve (Force Multiplier):** Armët e zjarrit lejohen të përdoren VETËM nëse jeta juaj ose e qytetarëve është në rrezik direct, ose nëse pala tjetër hap zjarr e para.
**3. 🏎️ Ndjekjet me Makinë (Pit Maneuver):** Ndalohet kryerja e manovrave "PIT" apo përplasja e qëllimshme në shpejtësi të larta pa marrë urdhër nga oficeri më i lartë në detyrë.
**4. 📋 Komunikimi:** Çdo polic duhet të jetë aktiv në radion e lojës (p.sh. kanali i policisë) dhe të përdorë kodet përkatëse të komunikimit.
**5. 🎭 Respektimi i RP-së:** Policia duhet të jetë shembull në lojë. Ndalohet sjellja "Toxic" ose abuzimi me postin ndaj lojtarëve të tjerë.
**6. 🔍 Bastisjet & Kontrollet:** Çdo kontroll personi ose makine duhet të bëhet me arsye të plotë ligjore brenda lojës (jo pa shkak).
            `)
            // Këtu mund të vendosësh një link të një fotoje me makinë apo karakter policie nëse dëshiron
            .setImage('https://cdn.discordapp.com/attachments/1505541133458083910/1507447109249667133/1779018008984.png?ex=6a11ef05&is=6a109d85&hm=1fa33d8c7ae8b77addc627c7fb65b008ac8e5c821ea59efe61df94f117ee9d14&'); 

        await interaction.reply({ embeds: [policeEmbed] });
    },
};
