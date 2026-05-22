import { Events, ChannelType } from "discord.js";
import { logger, startupLog } from "../utils/logger.js";
import config from "../config/application.js";
import { reconcileReactionRoleMessages } from "../services/reactionRoleService.js";

export default {
  name: Events.ClientReady,
  once: true,

  async execute(client) {
    try {
      client.user.setPresence(config.bot.presence);

      startupLog(`Ready! Logged in as ${client.user.tag}`);
      startupLog(`Serving ${client.guilds.cache.size} guild(s)`);
      startupLog(`Loaded ${client.commands.size} commands`);

      const reconciliationSummary = await reconcileReactionRoleMessages(client);
      startupLog(
        `Reaction role reconciliation: scanned ${reconciliationSummary.scannedMessages}, removed ${reconciliationSummary.removedMessages}, errors ${reconciliationSummary.errors}`
      );

      // --- SISTEMI AUTOMATIK ÇDO 15 MINUTA KE KANALET E CAKTUARA (NË HESHTJE) ---
      startupLog("Sistemi i njoftimeve automatike çdo 15 minuta u aktivizua!");
      
      const kanaletELejuara = ["メdiskutime", "メscreenshot", "メcasino", "🔵┃18tg-chat"];

      if (global.njoftimInterval) clearInterval(global.njoftimInterval);

      // 900000 milisekonda = 15 minuta
      global.njoftimInterval = setInterval(async () => {
        const guilds = client.guilds.cache;

        for (const [guildId, guild] of guilds) {
          const channels = guild.channels.cache;

          for (const [channelId, channel] of channels) {
            if (channel.type === ChannelType.GuildText && kanaletELejuara.includes(channel.name)) {
              try {
                // Shtojmë "flags: [4096]" (Suppressed Notifications) që mesazhi të shkojë krejtësisht në heshtje [1]
                await channel.send({ 
                  content: '⚠️ **KUJDES:** MOS SHANI DHE LEXONI RREGULLAT! 📜',
                  flags: [4096] // Ky flag bën që mesazhi të shkojë pa njoftim (Silent Message) [1]
                });
              } catch (err) {
                logger.error(`Gabim gjatë dërgimit automatik në ${channel.name}:`, err);
              }
            }
          }
        }
      }, 1,800,000); 
      // -------------------------------------------------------------

    } catch (error) {
      logger.error("Error in ready event:", error);
    }
  },
};
