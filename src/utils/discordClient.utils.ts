import slashCommands from "@/commands/slash";
import { CLIENT_ID, GUILD_ID, BOT_TOKEN } from "@/config/config";
import { Client, GatewayIntentBits, Partials, REST, Routes } from "discord.js";
import handler from "../handlers";
import { ModmailClient } from "@/modmail";

export const discordRestAPI = new REST().setToken(BOT_TOKEN);

(async () => {
  try {
    console.log("Started refreshing application (/) commands.");
    let commands = [];
    if (process.env.ENV === "production") {
      commands = await discordRestAPI.put(Routes.applicationCommands(CLIENT_ID), {
        body: slashCommands.map((command) => command.data.toJSON()),
      }) as Array<any>;//fix types
    } else {
      commands = await discordRestAPI.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
        body: slashCommands.map((command) => command.data.toJSON()),
      }) as Array<any>;//fix types
    }
    commands.forEach(cmd => {
      const command = slashCommands.get(cmd.name);
      if (!command) return;//never happens
      command.id = cmd.id;
      slashCommands.set(cmd.name, command);
    })
    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();

const client = new Client({
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
});

handler(client);

export const mmclient = new ModmailClient();
export default client;
