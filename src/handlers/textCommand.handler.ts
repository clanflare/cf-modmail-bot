import { Client, Collection, Message, Routes } from "discord.js";
import textCommands from "@/commands/text";
import { CustomDiscordError } from "@/types/errors";
import type { TextCommand, TextCommandMessage } from "@/types/commands";
import {  clientId, defaultPrefix, guildId } from "@/config/config";
import { discordRestAPI } from "@/utils/discordClient.utils";
import slashCommands from "@/commands/slash"

const textCommandNamesAndAliases = new Collection<string, TextCommand>();
textCommands.forEach((command) => {
  textCommandNamesAndAliases.set(command.name, command);
  command.aliases.forEach((alias) => {
    textCommandNamesAndAliases.set(alias, command);
  });
});

async function permissionValidator(message:Message ,command:TextCommand){
  const slashCommandId = slashCommands.get(command.name)?.id;
  if(!slashCommandId) return;
  const permissions = await discordRestAPI.get(Routes.applicationCommandPermissions(clientId,message.guildId || guildId,slashCommandId));
  message.member?.permissions.has

}

export default async function (client: Client, message: Message) {
  try {
    if (message.author.bot) return;
    if (!message.content.startsWith(defaultPrefix)) return;
    //check if the message is a command
    const commandName = message.content
      .slice(defaultPrefix.length)
      .trim()
      .split(/ +/)
      .shift()
      ?.toLowerCase();
    if (!commandName) return;
    const command = textCommandNamesAndAliases.get(commandName);
    if (!command) return;
    const args = await command.argumentParser(message);
    await command.validator(message, args);
    // console.log(args[0]);
    await command.execute(message, args);
  } catch (err) {
    if (err instanceof CustomDiscordError && err.display) {
      message.reply(err.message);
      return;
    }
    console.error(err); //setup pino later
  }
}
