import { Client, GatewayIntentBits, Partials } from "discord.js";
import handler from "../handlers";
import { ModmailClient } from "@/modmail";
import slashCommands from "@/commands/slash";

export class CFClient {
  token: string;
  clientId: string;
  guildId: string;
  clientSecret: string;
  prefix: string;
  modmailClient: ModmailClient;
  client: Client;

  constructor(token: string, clientId: string, guildId: string, clientSecret: string, prefix: string) {

    this.token = token;
    this.clientId = clientId;
    this.guildId = guildId;
    this.clientSecret = clientSecret;
    this.prefix = prefix;
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessageTyping, //all intents
      ],
      partials: [Partials.Channel, Partials.Message], //all partial
    }
    );
    this.modmailClient = new ModmailClient(this.client);
  }

  async loadSlashCommands() {
    console.log("Started refreshing application (/) commands.");
    const commands = await this.client.application?.commands.set(slashCommands.map((command) => command.data.toJSON()));
    if (!commands) throw new Error("Failed to load commands");
    commands.forEach(cmd => {
      const command = slashCommands.get(cmd.name);
      if (!command) return;//never happens
      command.id = cmd.id;
      slashCommands.set(cmd.name, command);
    });
    console.log("Successfully reloaded application (/) commands.");
  }
  
  async login() {
    await this.client.login(this.token);
    await handler(this);
  }
}
