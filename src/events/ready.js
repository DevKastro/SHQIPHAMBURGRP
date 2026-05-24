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

      // --- SISTEMI AUTOMATIK ÇDO 1 ORË KE KANALET E CAKTUARA (NË HESHTJE) ---
      startupLog("Sistemi i njoftimeve automatike çdo 1 orë u aktivizua!");
      
      const kanaletELejuara = ["メdiskutime", "メscreenshot", "メcasino", "🔵┃18tg-chat"];

      // Parandalon dërgimin e dyfishtë nëse boti rindizet shpejt
      if (global.njoftimInterval) clearInterval(global.njoftimInterval);

      // 3600000 milisekonda = saktësisht 1 orë
      global.njoftimInterval = setInterval(async () => {
        const guilds = client.guilds.cache;

        for (const [guildId, guild] of guilds) {
          const channels = guild.channels.cache;

          for (const [channelId, channel] of channels) {
            if (channel.type === ChannelType.GuildText && kanaletELejuara.includes(channel.name)) {
              try {
                // Dërgon mesazhin në heshtje që të mos bëjë njoftim (Silent Message)
                await channel.send({ 
                  content: '⚠️ **KUJDES:** MOS SHANI DHE LEXONI RREGULLAT! 📜',
                  flags: [4096] 
                });
              } catch (err) {
                logger.error(`Gabim gjatë dërgimit automatik në ${channel.name}:`, err);
              }
            }
          }
        }
      }, 3600000); 
      // -------------------------------------------------------------

    } catch (error) {
      logger.error("Error in ready event:", error);
    }
  },
};
