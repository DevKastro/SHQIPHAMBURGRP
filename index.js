import './src/app.js';

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rregullat') // Kjo bën që komanda në Discord të jetë /rregullat
        .setDescription('Shfaq rregullat zyrtare të Roleplay në server'),
    async execute(interaction) {
        const rulesMessage = `
**📜 RREGULLAT ZYRTARE TË ROLEPLAY (RP)**

1. 🚫 **RDM (Random Deathmatch):** Ndalohet reptësisht vrasja ose sulmi ndaj lojtarëve të tjerë pa pasur një arsye të fortë apo histori në lojë.
2. 🚗 **VDM (Vehicle Deathmatch):** Ndalohet përdorimi i automjeteve ose makinave si armë për të shtypur lojtarët.
3. 🧠 **Metagaming:** Ndalohet përdorimi i informacioneve që merrni jashtë loje (nga Discord, Live Streams, etj.) brenda në lojë.
4. 💪 **Powergaming:** Ndalohet kryerja e veprimeve mbinatyrore ose të detyrosh një situatë ku lojtari tjetër nuk ka asnjë mundësi reale të reagojë.
5. 🛑 **Combat Logging:** Ndalohet dalja nga loja (Alt+F4 / Disconnect) në mes të një aksioni aktiv ose gjatë ndjekjes nga policia.
6. 🎭 **Vlerësoni Jetën (Value Your Life):** Duhet të keni frikë për jetën tuaj në lojë. Nëse dikush ju drejton armën, binduni dhe mos bëni si superhero.
        `;

        await interaction.reply({ content: rulesMessage });
    },
};


