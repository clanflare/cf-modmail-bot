import commands from "@/commands";
import { clientId, guildId, token } from "@/config/config";
import { Client, GatewayIntentBits, Partials, REST, Routes } from "discord.js";
import handler from "../handlers";

const rest = new REST().setToken(token);

(async () => {
  try {
    console.log("Started refreshing application (/) commands.");
    if (process.env.ENV === "production") {
      await rest.put(Routes.applicationCommands(clientId), {
        body: commands.map((command) => command.data.toJSON()),
      });
    } else {
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
        body: commands.map((command) => command.data.toJSON()),
      });
    }
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
    GatewayIntentBits.GuildMessageTyping, //all intents
  ],
  partials: [Partials.Channel, Partials.Message], //all partial
});

handler(client);

export default client;
