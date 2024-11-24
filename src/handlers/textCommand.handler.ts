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
  if (!clientId) {
    throw new CustomDiscordError("Client application ID not found.");
  }

  const cfClient = cfClients.get(clientId);
  if (!cfClient) {
    throw new CustomDiscordError("CFClient not found for the given client ID.");
  }

  const slashCommand = cfClient.slashCommands.get(command.name);
  if (!slashCommand) {
    throw new CustomDiscordError(`Command "${command.name}" not found.`);
  }

  const slashCommandId = slashCommand.id;
  if (!slashCommandId) {
    throw new CustomDiscordError(
      `Command "${command.name}" does not have a valid ID.`
    );
  }

  const member = await message.guild.members.fetch(message.author.id);
  if (!member) {
    throw new CustomDiscordError("Member not found.");
  }

  // Administrator bypass
  // if (member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

  const guildId = message.guild.id;
  const everyoneId = BigInt(guildId).toString(); // Everyone ID.
  const allChannelsId = (BigInt(guildId) - BigInt(1)).toString(); // All Channels ID.

  // Fetch global permissions
  let globalPermissions: ApplicationCommandPermissions[] = [];
  try {
    globalPermissions = await message.guild.commands.permissions.fetch({
      command: message.client.application.id, // Fetch guild-wide permissions
    });
  } catch (error) {
    if (error instanceof DiscordAPIError && error.code === 10066) {
      globalPermissions = [
        {
          id: allChannelsId,
          type: 3,
          permission: true,
        },
        {
          id: everyoneId,
          type: 1,
          permission: true,
        },
      ];
    } else {
      throw new CustomDiscordError("Failed to fetch global permissions.");
    }
  }

  // Fetch command-specific permissions
  let commandPermissions: ApplicationCommandPermissions[] = [];
  try {
    commandPermissions = await message.guild.commands.permissions.fetch({
      command: slashCommandId, // Fetch specific command permissions
    });
  } catch (error) {
    if (!(error instanceof DiscordAPIError) || error.code !== 10066) {
      throw new CustomDiscordError(
        "Failed to fetch command-specific permissions."
      );
    }
  }

  // Build permission map (global first, then command-specific overrides)
  const permissionMap: Record<string, ApplicationCommandPermissions> = {};
  globalPermissions.forEach((perm) => {
    permissionMap[perm.id] = perm;
  });

  commandPermissions.forEach((perm) => {
    permissionMap[perm.id] = perm;
  });

  // Track allows and denies.
  const denyList: string[] = [];
  const allowList: string[] = [];

  // Helper to check permission
  const checkPermission = (id: string): boolean | undefined =>
    permissionMap[id]?.permission;

  // 1. Check channel permissions (including "All Channels").
  const channelPermission =
    checkPermission(message.channel.id) ?? checkPermission(allChannelsId);

  channelPermission ? allowList.push("channel") : denyList.push("channel");

  // 2. Check user-specific permissions.
  const userPermission = permissionMap[message.author.id];
  if (userPermission?.type === 2) {
    userPermission.permission ? allowList.push("user") : denyList.push("user");
  }

  // 3. Check role permissions (including @everyone).
  const roleIds = [...member.roles.cache.keys()];
  for (const roleId of roleIds) {
    if (roleId === everyoneId) continue;
    const rolePermission = permissionMap[roleId];
    if (rolePermission?.type === 1) {
      rolePermission.permission
        ? allowList.push("role")
        : denyList.push("role");
    }
  }
  if (
    (!allowList.includes("role") ||
    !allowList.includes("user")) &&
    !permissionMap[everyoneId]?.permission
  ) {
    denyList.push("everyone");
  }
  console.log({ allowList, denyList });

  // Determine if the command is allowed or denied based on collected permissions.
  if (denyList.length > 0) {
    throw new CustomDiscordError(
      "You do not have permission to use this command."
    ); // Deny takes precedence.
  } else if (allowList.length > 0) {
    return; // Permission granted.
  }

  // Default behavior: Allow if no permissions are set, otherwise deny.
  if (commandPermissions.length === 0 && globalPermissions.length === 0) {
    return; // No permissions set, allow by default.
  } else {
    throw new CustomDiscordError(
      "You do not have permission to use this command.",
    );
  }
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
