import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('rregullat')
        .setDescription('Shfaq rregullat zyrtare te Roleplay ne formen e nje paneli profesional'),
    async execute(interaction) {
        // Krijojme kutine Embed
        const rulesEmbed = new EmbedBuilder()
            .setColor('#ff0000') // Ngjyra anesore e kutise (mund ta ndryshosh sipas qejfit)
            .setTitle('📜 RREGULLAT ZYRTARE TË ROLEPLAY (RP)')
            .setAuthor({ 
                name: 'Kastro', 
                iconURL: 'https://imgur.com' // Vendos linkun e logos tende nese deshiron
            })
            .setDescription(`

# 📜 RREGULLAT E ROLEPLAY NË EMERGENCY HAMBURG


# 1. ❌ RDM – Random Deathmatch

# Vrasje pa asnjë arsye RP, thjesht e sheh dikë dhe e vret.
➡️ (3 ditë ban)

# 2. ❌ VDM – Vehicle Deathmatch

# Shtypje lojtarësh me makinë pa roleplay ose për qejf.
➡️ (2 ditë ban)

# 3. ❌ Metagaming

# Përdor informacion nga jashtë loje (si Discord apo stream) për të përfituar në lojë.
➡️ (2 ditë ban)

# 4. ❌  Powergaming

# Veprime të pamundura si në film (shembull: arratisesh me duar të lidhura ose lufton 4 veta vetëm).
➡️ (1 ditë ban)

# 5. ❌  Fail RP

# Thyerje e logjikës RP – p.sh. vdes dhe flet, ose s'bën RP kur plagosesh.
➡️ (1 ditë ban)

# 6.  ❌ Fear RP

#  Nuk ndjen “frikë” kur kërcënohesh – p.sh. je nën armë dhe vrapon si hero.
➡️ (1 ditë ban)

# 7. ❌  Combat Logging

# Del nga serveri që të shpëtosh kur je arrestuar, plagosur apo në RP.
➡️ (3 ditë ban)

# 8. ❌ Trolling / No RP Intent

# Futesh në lojë vetëm për të prishur RP-në e të tjerëve ose nuk bën fare RP.
➡️ (3-7 ditë ban)

# 9. ❌ Cop Baiting

# Provokon kot policinë vetëm për aksion – pa asnjë arsye RP.
➡️ (1 ditë ban)

# 10. ❌ Fyerje / Racizëm / Ofendime OOC

# Flet jashtë RP duke ofenduar ose përdor fjalor të pistë / racist.
➡️ (3-7 ditë ban) ose (ban permanent)

# 11. ❌ Zbulim info jashtë RP

# Sheh dikë me armë dhe thua “ka armë” pa qenë në RP ose pa e parë në lojë.
➡️ (1 ditë ban)

# 12. Mosbindje ndaj Staff-it / Mashtim

# Gënjen ose nuk dëgjon adminët.
➡️ (2 ditë ban)

# 13. ❌ Bug Abuse / Exploits

# Përdor gabime të lojës për përfitim.
➡️ (ban 4)

# ⚠️   Kujdes

# Pas 2 paralajmërimeve, shkelja e tretë mer ban direkt.

# Nëse ke një arsye, shpjegoje me respekt te staff-i ose në Discord tickets.
            `)
            // KETU VENDOS LINKUN E FOTOS QE DESHIRON TE SHFAQET POSHTE TEKSTIT (FIKS SI NE FOTO)
            .setImage('https://cdn.discordapp.com/attachments/1505541133458083910/1507449358444921013/Screenshot_2026-05-22_201931.PNG?ex=6a11f11e&is=6a109f9e&hm=86959afc6f20baf2661ae64debf927d5f136610eb0c79252e5b811fe99f3a470&'); 

        // Boti i pergjigjet lojtarit duke derguar kutine e dizajnuar
        await interaction.reply({ embeds: [rulesEmbed] });
    },
};
