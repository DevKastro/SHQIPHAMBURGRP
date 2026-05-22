import { Events, ChannelType, PermissionFlagsBits } from "discord.js";
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

      // --- SISTEMI AUTOMATIK ÇDO 5 MINUTA ---
      startupLog("Sistemi i njoftimeve automatike çdo 5 minuta u aktivizua!");
      
      setInterval(async () => {
        const guilds = client.guilds.cache;

        for (const [guildId, guild] of guilds) {
          const channels = guild.channels.cache;

          for (const [channelId, channel] of channels) {
            // Kontrollon nëse është kanal teksti publik ku boti ka leje të shkruajë
            if (
              channel.type === ChannelType.GuildText && 
              channel.viewable && 
              channel.permissionsFor(guild.members.me).has(PermissionFlagsBits.SendMessages)
            ) {
              try {
                await channel.send('⚠️ **KUJDES:** MOS SHANI DHE LEXONI RREGULLAT! 📜');
              } catch (err) {
                logger.error(`Gabim gjatë dërgimit automatik në ${channel.name}:`, err);
              }
            }
          }
        }
      }, 300000); // 300,000 milisekonda = 5 minuta
      // ----------------------------------------

    } catch (error) {
      logger.error("Error in ready event:", error);
    }
  },
};



