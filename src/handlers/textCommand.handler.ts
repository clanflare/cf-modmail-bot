import { Client, Collection, Message } from "discord.js";
import textCommands from "@/commands/text";
import { CustomDiscordError } from "@/types/errors";
import type { TextCommand, TextCommandMessage } from "@/types/commands";
import { defaultPrefix } from "@/config/config";

const textCommandNamesAndAliases = new Collection<string, TextCommand>();
textCommands.forEach((command) => {
  textCommandNamesAndAliases.set(command.name, command);
  command.aliases.forEach((alias) => {
    textCommandNamesAndAliases.set(alias, command);
  });
});

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
