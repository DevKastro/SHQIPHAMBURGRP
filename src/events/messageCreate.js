import { Events, PermissionFlagsBits } from "discord.js";
import { logger } from "../utils/logger.js";

// Lista e fjalëve të ndaluara nga fotoja jote (Wildcard mode)
const fjaleTeNdaluara = [
  "ti qi ropt", "ta qij nanen", "ta qij motren", "ti qi dekt",
  "o kar", "kar", "vrk", "mam qim", "dek qim", "qifje",
  "qi robt", "qi nanen", "qi motren", "qrobt", "qnane", "qmotr",
  "rrotkari", "rrotk", "karuc", "karuc i mutit", "mutac",
  "mutav", "bythqir", "pidhrob", "pidhsome"
];

export default {
  name: Events.MessageCreate,
  once: false,

  async execute(message) {
    try {
      // Shpërfillim mesazhet e botëve ose nëse mesazhi nuk është në server
      if (message.author.bot || !message.guild) return;

      // Shpërfillim stafin (Administratorët dhe Moderatorët nuk pësojnë timeout)
      if (message.member.permissions.has(PermissionFlagsBits.Administrator) || message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) return;

      // Kthejmë tekstin në shkronja të vogla për të kapur fjalën kudo në fjali
      const mesazhiUlet = message.content.toLowerCase();

      // Kontrollojmë nëse mesazhi përmban ndonjë nga fjalët e ndaluara
      const kaFjaleTeNdaluar = fjaleTeNdaluara.some(fjala => mesazhiUlet.includes(fjala));

      if (kaFjaleTeNdaluar) {
        // 1. Fshijmë mesazhin e pistë menjëherë
        await message.delete().catch(() => null);

        // 2. I japim Timeout (Mute) për 5 minuta
        const kohaTimeout = 5 * 60 * 1000; 
        await message.member.timeout(kohaTimeout, "Përdorim i fjalëve të ndaluara (AutoMod)").catch(err => {
            logger.error(`Nuk i dhashë dot timeout lojtarit ${message.author.tag}:`, err);
        });

        // 3. Dërgojmë një paralajmërim në kanal që zhduket pas 5 sekondave
        const paralajmerim = await message.channel.send(`⚠️ ${message.author}, u dënove me **5 minuta Timeout** sepse përdore fjalë të ndaluara!`);
        setTimeout(() => paralajmerim.delete().catch(() => null), 5000);
      }
    } catch (error) {
      logger.error("Gabim në eventin messageCreate (AutoMod):", error);
    }
  },
};
