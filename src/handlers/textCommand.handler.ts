import {
  type ApplicationCommandPermissions,
  Client,
  Collection,
  DiscordAPIError,
  Message,
  PermissionsBitField,
} from "discord.js";
import textCommands from "@/commands/text";
import { CustomDiscordError } from "@/types/errors";
import type { TextCommand } from "@/types/commands";
import { DEFAULT_PREFIX } from "@/config/config";
import { cfClients } from "..";

const textCommandNamesAndAliases = new Collection<string, TextCommand>();
textCommands.forEach((command) => {
  textCommandNamesAndAliases.set(command.name, command);
  command.aliases.forEach((alias) => {
    textCommandNamesAndAliases.set(alias, command);
  });
});

async function permissionValidator(
  message: Message<true>,
  command: TextCommand
) {
  const clientId = message.client.application?.id;
  if (!clientId)
    throw new CustomDiscordError("Client application ID not found.");

  const cfClient = cfClients.get(clientId);
  if (!cfClient)
    throw new CustomDiscordError("CFClient not found for the given client ID.");

  const slashCommand = cfClient.slashCommands.get(command.name);
  if (!slashCommand?.id)
    throw new CustomDiscordError(
      `Command "${command.name}" is invalid or does not have a valid ID.`
    );

  const member = await message.guild.members.fetch(message.author.id);
  if (!member) throw new CustomDiscordError("Member not found.");

  // Administrator bypass (uncomment if needed)
  if (member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

  const guildId = message.guild.id;
  const everyoneId = guildId; // @everyone role ID
  const allChannelsId = (BigInt(guildId) - BigInt(1)).toString(); // "All Channels" ID

  let commandPermissions: ApplicationCommandPermissions[] = [];
  try {
    commandPermissions = await message.guild.commands.permissions.fetch({
      command: slashCommand.id,
    });
  } catch (error) {
    if (!(error instanceof DiscordAPIError && error.code === 10066)) {
      throw new CustomDiscordError(
        "Failed to fetch command-specific permissions."
      );
    }
    throw new CustomDiscordError(
      "Command permissions are not set up for this command."
    );
  }

  // Create a map of permissions
  const permissionMap: Record<string, boolean> = {};
  for (const perm of commandPermissions) {
    permissionMap[perm.id] = perm.permission;
  }

  const checkPermission = (id: string): boolean | undefined =>
    permissionMap[id];

  // Check permissions in order of priority
  if (checkPermission(message.channel.id) ?? checkPermission(allChannelsId)) {
    if (checkPermission(message.author.id)) return; // User-specific
    for (const roleId of member.roles.cache.keys()) {
      if (roleId !== everyoneId && checkPermission(roleId)) {
        return; // Role-specific (excluding @everyone for now)
      }
    }
    if (checkPermission(everyoneId)) return; // @everyone role
  }

  // Default to denying if no permissions are explicitly granted
  throw new CustomDiscordError(
    "You do not have permission to use this command."
  );
}

export default async function (_client: Client, message: Message<true>) {
  try {
    if (message.author.bot) return;
    if (!message.content.startsWith(DEFAULT_PREFIX)) return;
    //check if the message is a command
    const commandName = message.content
      .slice(DEFAULT_PREFIX.length)
      .trim()
      .split(/ +/)
      .shift()
      ?.toLowerCase();
    if (!commandName) return;
    const command = textCommandNamesAndAliases.get(commandName);
    if (!command) return;
    await permissionValidator(message, command);
    const args = await command.argumentParser(message);
    await command.validator(message, args);
    await command.execute(message, args);
  } catch (err) {
    if (err instanceof CustomDiscordError && err.display) {
      return await message.reply(err.message);
    }
    console.error(err); //setup pino later
  }
}
