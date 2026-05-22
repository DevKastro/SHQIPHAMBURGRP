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
            .setImage('https://cdn.discordapp.com/attachments/1330626767844540518/1504956513893093466/IMG_6063.png?ex=6a117139&is=6a101fb9&hm=9767756cc5eddaf34f63b2590d2aca94c4fbc7298dea718cf4d374cf10c11321&'); 

        // Boti i pergjigjet lojtarit duke derguar kutine e dizajnuar
        await interaction.reply({ embeds: [rulesEmbed] });
    },
};
