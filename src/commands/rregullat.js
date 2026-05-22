import { SlashCommandBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('rregullat')
        .setDescription('Shfaq rregullat zyrtare te Roleplay ne server'),
    async execute(interaction) {
        const rulesMessage = `**📜 RREGULLAT ZYRTARE TË ROLEPLAY (RP)**

1. 🚫 **RDM (Random Deathmatch):** Ndalohet vrasja e lojtarëve pa arsye në lojë.
2. 🚗 **VDM (Vehicle Deathmatch):** Ndalohet përdorimi i makinave si armë për të shtypur lojtarët.
3. 🧠 **Metagaming:** Ndalohet përdorimi i informacioneve jashtë loje (Discord, Streams) brenda në lojë.
4. 💪 **Powergaming:** Ndalohet kryerja e veprimeve jorealiste (p.sh. të flasësh kur je pa ndjenja).
5. 🛑 **Combat Logging:** Ndalohet dalja nga loja (Alt+F4) në mes të aksionit apo ndjekjes nga policia.
6. 🎭 **Vlerësoni Jetën (Value Your Life):** Ndajeni mendjen, nëse ju drejtohet arma, duhet të bindeni!`;

        await interaction.reply({ content: rulesMessage });
    },
};
