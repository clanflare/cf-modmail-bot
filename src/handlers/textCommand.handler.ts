import {Client, Collection, type GuildCacheMessage, Message, Routes} from "discord.js";
import textCommands from "@/commands/text";
import { CustomDiscordError } from "@/types/errors";
import type { TextCommand, TextCommandMessage } from "@/types/commands";
import {  DEFAULT_PREFIX } from "@/config/config";
import slashCommands from "@/commands/slash"

const textCommandNamesAndAliases = new Collection<string, TextCommand>();
textCommands.forEach((command) => {
  textCommandNamesAndAliases.set(command.name, command);
  command.aliases.forEach((alias) => {
    textCommandNamesAndAliases.set(alias, command);
  });
});

async function permissionValidator(message: Message<true>, command: TextCommand) {
  const slashCommandId = slashCommands.get(command.name)?.id;
  if (!slashCommandId) return; // Skip if no corresponding slash command.

  const member = await message.guild.members.fetch(message.author.id);
  if (!member) throw new CustomDiscordError("Member not found.");

  // Bypass permission check for administrators.
  // if (member.permissions.has("Administrator")) return;

  const guildId = message.guild.id;
  const everyoneId = guildId; // @everyone role ID.
  const allChannelsId = (BigInt(guildId) - BigInt(1)).toString(); // All Channels ID.

  // Fetch global and command-specific permissions.
  const globalPermissions = await message.guild.commands.permissions.fetch({
    command: message.client.application.id,
  });
  const commandPermissions = await message.guild.commands.permissions.fetch({
    command: slashCommandId,
  });

  // Build a permission map, giving priority to command-level permissions.
  const permissionMap: Record<string, { type: number; permission: boolean }> = {};

  // First, apply global permissions.
  globalPermissions.forEach((permission) => {
    permissionMap[permission.id] = { type: permission.type, permission: permission.permission };
  });

  // Then, override with command-specific permissions (if present).
  commandPermissions.forEach((permission) => {
    permissionMap[permission.id] = { type: permission.type, permission: permission.permission };
  });

  // Track allows and denies.
  const denyList: string[] = [];
  const allowList: string[] = [];

  // 1. Check channel permissions (including "All Channels").
  const channelIds = [message.channel.id, allChannelsId];
  for (const channelId of channelIds) {
    const channelPermission = permissionMap[channelId];
    if (channelPermission?.type === 3) {
      channelPermission.permission ? allowList.push("channel") : denyList.push("channel");
    }
  }

  // 2. Check user-specific permissions.
  const userPermission = permissionMap[message.author.id];
  if (userPermission?.type === 2) {
    userPermission.permission ? allowList.push("user") : denyList.push("user");
  }

  // 3. Check role permissions (including @everyone).
  const roleIds = [...member.roles.cache.keys(), everyoneId];
  for (const roleId of roleIds) {
    const rolePermission = permissionMap[roleId];
    if (rolePermission?.type === 1) {
      rolePermission.permission ? allowList.push("role") : denyList.push("role");
    }
  }

  console.log({denyList, allowList});

  // Determine if the command is allowed or denied based on collected permissions.
  if (denyList.length > 0) {
    throw new CustomDiscordError("You do not have permission to use this command."); // Deny takes precedence.
  } else if (allowList.length > 0) {
    return; // Permission granted.
  }

  // Default behavior: Allow if no permissions are set, otherwise deny.
  if (commandPermissions.length === 0 && globalPermissions.length === 0) {
    return; // No permissions set, allow by default.
  } else {
    throw new CustomDiscordError("You do not have permission to use this command.");
  }
}

export default async function (client: Client, message: Message<true>) {
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
    // console.log(args[0]);
    await command.execute(message, args);
  } catch (err) {
    if (err instanceof CustomDiscordError && err.display) {
      return await message.reply(err.message);
    }
    console.error(err); //setup pino later
  }
}
