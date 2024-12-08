import { Client, Collection, GatewayIntentBits, Partials } from "discord.js";
import handler from "../handlers";
import { ModmailClient } from "@/modmail";
import createSlashCommands from "@/commands/slash";
import type { SlashCommand } from "@/types/commands";

export class CFClient {
  public client: Client;
  public modmailClient: ModmailClient;
  public slashCommands: Collection<string, SlashCommand>;

  private token: string;
  private clientId: string;
  private guildId: string;
  private clientSecret: string;
  private prefix: string;

  /**
   * Initializes a new instance of CFClient.
   * @param options - Configuration options for the client.
   */
  constructor(options: {
    token: string;
    clientId: string;
    guildId: string;
    clientSecret: string;
    prefix: string;
  }) {
    const { token, clientId, guildId, clientSecret, prefix } = options;

    this.token = token;
    this.clientId = clientId;
    this.guildId = guildId;
    this.clientSecret = clientSecret;
    this.prefix = prefix;

    // Initialize the Discord client with appropriate intents and partials
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessageTyping, //all intents
      ],
      partials: [
        Partials.Channel,
        Partials.Message,
        Partials.Reaction,
        Partials.User,
        Partials.GuildMember,
      ],
    });

    // Initialize ModmailClient with the Discord client
    this.modmailClient = new ModmailClient(this.client, this.guildId);

    // Initialize slash commands
    this.slashCommands = createSlashCommands();
  }

  /**
   * Logs the client into Discord and starts the event handler.
   */
  public async login(): Promise<void> {
    try {
      await this.client.login(this.token);
      console.log(`Logged in as ${this.client.user?.tag}`);
      // Load slash commands after the client is ready
      await this.loadSlashCommands();

      // Start handling events
      await handler(this);
    } catch (error) {
      console.error("Failed to login:", error);
    }
  }

  /**
   * Loads slash commands and registers them with Discord.
   */
  private async loadSlashCommands(): Promise<void> {
    try {
      const commandsData = this.slashCommands.map((command) =>
        command.data.toJSON()
      );

      const applicationCommands = await this.client.application?.commands.set(
        commandsData
      );

      if (!applicationCommands) {
        throw new Error("Failed to load commands");
      }

      // Map application commands by name for easier access
      const applicationCommandsMap = new Map(
        applicationCommands.map((cmd) => [cmd.name, cmd])
      );

      // Update the command IDs in this instance's slashCommands
      this.slashCommands.forEach((command) => {
        const applicationCommand = applicationCommandsMap.get(
          command.data.name
        );
        if (applicationCommand) {
          command.id = applicationCommand.id;
        }
      });

      console.log("Successfully reloaded application (/) commands.");
    } catch (error) {
      console.error("Error loading slash commands:", error);
    }
  }
}
