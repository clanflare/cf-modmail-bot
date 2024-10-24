import {Client, Events} from "discord.js";
import dmMessage from "./dmMessage.handler";
import slashCommand from "./slashCommand.handler";
import textCommand from "./textCommand.handler";

export default async function (client: Client) {
  client.once(Events.ClientReady, (readyClient: Client<true>) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
  });
  client.on(Events.InteractionCreate, (interaction) => {
    slashCommand(client, interaction);
  });
  client.on(Events.MessageCreate, (message) => {
    if(message.inGuild()) textCommand(client, message);
    else dmMessage(client, message);
  });
}
