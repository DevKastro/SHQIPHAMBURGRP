import 'dotenv/config';
import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import { REST } from '@discordjs/rest';
import express from 'express';

import config from './config/application.js';
import { initializeDatabase } from './utils/database.js';
import { loadCommands } from './handlers/commandLoader.js';
import { logger, startupLog } from './utils/logger.js';

class TitanBot extends Client {
  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,                        
        GatewayIntentBits.GuildMembers,                 
        GatewayIntentBits.GuildMessages,                
        GatewayIntentBits.GuildMessageReactions,        
        GatewayIntentBits.MessageContent,               
        GatewayIntentBits.GuildVoiceStates,             
        GatewayIntentBits.GuildBans,                    
      ],
      partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction
      ]
    });

    this.config = config;
    this.commands = new Collection();
    this.events = new Collection();
    this.buttons = new Collection();
    this.selectMenus = new Collection();
    this.modals = new Collection();
    this.cooldowns = new Collection();
    this.db = null;
    this.rest = new REST({ version: '10' }).setToken(config.bot.token);
  }

  async start() {
    try {
      startupLog('Starting TitanBot...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      startupLog('Initializing database...');
      const dbInstance = await initializeDatabase();
      this.db = dbInstance.db;
      
      const dbStatus = this.db.getStatus();
      if (dbStatus.isDegraded) {
        logger.warn('⚠️ DATABASE RUNNING IN DEGRADED MODE');
      } else {
        startupLog(`✅ Database Status: ${dbStatus.connectionType} (fully operational)`);
      }
      
      startupLog('Starting web server...');
      this.startWebServer();
      
      startupLog('Loading commands...');
      await loadCommands(this);
      startupLog(`Commands loaded: ${this.commands.size}`);
      
      startupLog('Logging into Discord...');
      await this.login(this.config.bot.token);
      startupLog('Discord login successful');

      // Regjistrimi i komandave në serverat specifikë
      try {
        const serveratEmi = ["1505536422013304852", "1496144652938772500"];
        const commandsData = Array.from(this.commands.values()).map(cmd => cmd.data.toJSON());

        for (const guildId of serveratEmi) {
          await this.rest.put(
            `/applications/${this.user.id}/guilds/${guildId}/commands`,
            { body: commandsData }
          );
          startupLog(`[DETYRIM]: ✅ Komandat u regjistruan në serverin: ${guildId}`);
        }
      } catch (deployError) {
        startupLog(`❌ Gabim gjatë regjistrimit të komandave: ${deployError}`);
      }

      startupLog('ONLINE ✅ | Boti është gati.');
    } catch (error) {
      logger.error('Failed to start bot:', error);
      process.exit(1);
    }
  }

  startWebServer() {
    const app = express();
    const configuredPort = Number(this.config.api?.port || process.env.PORT || 3000);
    const host = process.env.WEB_HOST || '0.0.0.0';

    app.get('/', (req, res) => {
      res.status(200).json({ message: 'TitanBot System Online' });
    });

    const startServer = (port, attempt = 0) => {
      const server = app.listen(port, host, () => {
        this.webServer = server;
        startupLog(`✅ Web Server running on http://${host}:${port}`);
      });

      server.on('error', (error) => {
        if (error.code === 'EADDRINUSE' && attempt < 5) {
          startupLog(`Porta ${port} është e zënë. Po provohet porta ${port + 1}...`);
          startServer(port + 1, attempt + 1);
        } else {
          logger.error('Web server error:', error);
        }
      });
    };

    startServer(configuredPort);
  }
}

// KRIJIMI DHE NISJA E INSTANCËS SË BOTIT
const bot = new TitanBot();
bot.start();
