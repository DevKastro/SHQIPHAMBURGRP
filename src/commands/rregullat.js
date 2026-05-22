import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('rregullat')
        .setDescription('Shfaq rregullat zyrtare te Roleplay ne formen e nje paneli profesional'),
    async execute(interaction) {
        // Krijojme kutine Embed
        const rulesEmbed = new EmbedBuilder()
            .setColor('#7289da') // Ngjyra anesore e kutise (mund ta ndryshosh sipas qejfit)
            .setTitle('📜 RREGULLAT ZYRTARE TË ROLEPLAY (RP)')
            .setAuthor({ 
                name: 'Kastro', 
                iconURL: 'https://imgur.com' // Vendos linkun e logos tende nese deshiron
            })
            .setDescription(`
**1. 🚫 RDM (Random Deathmatch):** Ndalohet vrasja e lojtarëve pa arsye në lojë.
**2. 🚗 VDM (Vehicle Deathmatch):** Ndalohet përdorimi i makinave si armë për të shtypur lojtarët.
**3. 🧠 Metagaming:** Ndalohet përdorimi i informacioneve jashtë loje brenda në lojë.
**4. 💪 Powergaming:** Ndalohet kryerja e veprimeve jorealiste apo mbinatyrore.
**5. 🛑 Combat Logging:** Ndalohet dalja nga loja (Alt+F4) në mes të aksionit aktiv.
**6. 🎭 Vlerësoni Jetën (Value Your Life):** Binduni kur ju drejtohet arma, mos bëni si superhero.
            `)
            // KETU VENDOS LINKUN E FOTOS QE DESHIRON TE SHFAQET POSHTE TEKSTIT (FIKS SI NE FOTO)
            .setImage('https://cdn.discordapp.com/attachments/1505541133458083910/1507449358444921013/Screenshot_2026-05-22_201931.PNG?ex=6a11f11e&is=6a109f9e&hm=86959afc6f20baf2661ae64debf927d5f136610eb0c79252e5b811fe99f3a470&'); 

        // Boti i pergjigjet lojtarit duke derguar kutine e dizajnuar
        await interaction.reply({ embeds: [rulesEmbed] });
    },
};
