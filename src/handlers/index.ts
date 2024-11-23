import { Client, Events } from "discord.js";
import dmMessage from "./dmMessage.handler";
import slashCommand from "./slashCommand.handler";
import textCommand from "./textCommand.handler";
import type { CFClient } from "@/utils/discordClient.utils";

export default async function (discordClient: CFClient) {
  const client = discordClient.client;
  client.once(Events.ClientReady, (readyClient: Client<true>) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
  });
  client.on(Events.InteractionCreate, (interaction) => {
    slashCommand(client, interaction);
  });
  client.on(Events.MessageCreate, (message) => {
    if (message.inGuild()) textCommand(client, message);
    else dmMessage(client, message, discordClient.modmailClient);
  });
}
