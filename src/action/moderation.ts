import {client} from "@/.";
import {defaultWarnConfig} from "@/config/warnConfig";
import {
  banService,
  roleModerationService,
  timeoutService,
  unbanService,
  warnConfigService,
  warnService,
} from "@/services";
import {CustomDiscordError} from "@/types/errors";
import type {IBan, IRoleModeration, ITimeout, IUnban, IWarn, WarnActions, WarnConfig,} from "@/types/models";
import {BaseGuildTextChannel, Guild, GuildMember, Role, User,} from "discord.js";
import ms from "ms";
import {getBan, getGuild, getMember, getRole, getUser} from ".";

export function getModlogChannel() {
  const modlogChannel = client.channels.cache.get("1213364292426928178");
  return modlogChannel as BaseGuildTextChannel;
}

export async function executeActions(
  actions: WarnActions,
  member: string | User | GuildMember,
  guild: string | Guild,
  actionBy: { username: string; userId: string }
) {
  const actionsPerformed = await Promise.all(
    actions.map(async (action) => {
      switch (action.type) {
        case "ban":
          return ban({
            user: member,
            reason: action.reason,
            duration: ms(action.duration),
            actionBy,
            guild,
          });
        case "timeout":
          return timeout({
            user: member,
            reason: action.reason,
            duration: ms(action.duration),
            actionBy,
            guild,
          });
        case "roleModeration":
          return roleModeration({
            user: member,
            reason: action.reason,
            roles: action.roleIds,
            action: action.action,
            duration: ms(action.duration),
            actionBy,
            guild,
          });
      }
    })
  );
  return actions.map((action, index) => {
    return {
      actionType: action.type,
      action: actionsPerformed[index],
    };
  });
}

export async function ban({
  user,
  reason,
  duration,
  actionBy,
  guild,
}: {
  user: string | User | GuildMember;
  reason: string;
  duration?: string;
  actionBy: { username: string; userId: string };
  guild: string | Guild;
}): Promise<IBan> {
  // Fetch the user to ban
  const userToBan = await getUser(user);

  // Default duration to 0 if not provided
  const durationInMs = duration ? ms(duration) : 0;

  // Fetch the guild to ban the user from
  const guildToBanFrom = getGuild(guild);

  // Check if the user is banned
  const bannedUser = await getBan({ guild: guildToBanFrom, user: userToBan });
  if (bannedUser) {
    throw new CustomDiscordError("User is already banned.");
  }

  // ToDo: Reimplement this with a proper permission check
  // if user is not in server, it should ban
  // Check if the bot can ban the user and if the user is higher in the hierarchy
  try {
    if (!(await getMember(userToBan, guildToBanFrom)).bannable) {
      throw new CustomDiscordError("I don't have permission to ban this user.");
    }
  } catch (error) {
    console.log(error);
  }

  try {
    // ToDo: Has to be implemented with IMessage with customization options
    // Notify the user via DM before banning
    await userToBan.send(
      `You have been banned from ${guildToBanFrom.name}.\nReason: ${reason}`
    );
  } catch (dmError: any) {
    if (dmError.code === 50007) {
      console.log("Could not send DM to the user.");
    }
  }

  // Ban the user
  try {
    await guildToBanFrom.members.ban(userToBan, {
      reason: `Reason: ${reason}\nResponsible Moderator: ${actionBy.username}`,
    });
  } catch (banError: any) {
    if (banError.code === 50013) {
      throw new CustomDiscordError("I don't have permission to ban this user.");
    }
    throw banError;
  }

  // ToDo: Has to be implemented with IMessage with customization options
  // Notify the guild about the ban
  await getModlogChannel().send({
    // ? needs to be removed
    content: `Banned ${userToBan.username} <@${userToBan.id}>
    Reason: ${reason}
    Duration: ${
      durationInMs === 0
        ? "Permanent"
        : `for ${ms(durationInMs, { long: true })}`
    }`,
  });

  // Create a ban record
  return await banService.create({
    guildId: guildToBanFrom.id,
    userId: userToBan.id,
    actionBy,
    reason,
    duration: durationInMs,
  });
}

export async function unban({
  user,
  reason,
  actionBy,
  guild,
}: {
  user: string | User;
  reason: string;
  actionBy: { username: string; userId: string };
  guild: string | Guild;
}): Promise<IUnban> {
  // Fetch the user to unban
  const userToUnban = (await getUser(user)) as User;

  // Fetch the guild
  const guildToUnbanFrom = getGuild(guild) as Guild;

  // Check if the user is banned
  const bannedUser = await getBan({
    guild: guildToUnbanFrom,
    user: userToUnban,
  });
  if (!bannedUser) {
    throw new CustomDiscordError("User is not banned.");
  }

  // Unban the user
  await guildToUnbanFrom.members.unban(userToUnban, reason);

  // fetch last ban record of user.id
  const ban = await banService.getLatestBan({
    guildId: guildToUnbanFrom.id,
    userId: userToUnban.id,
    reason: bannedUser.reason || undefined,
  });

  // ToDo: Has to be implemented with IMessage with customization options
  // Notify the guild about the unban
  await getModlogChannel().send({
    content: `Unbanned ${userToUnban.username} <@${userToUnban.id}>
  Reason: ${reason}`,
  });

  // Create an unban record
  return await unbanService.create({
    guildId: guildToUnbanFrom.id,
    userId: userToUnban.id,
    reason,
    actionBy,
    ban,
  });
}

export async function timeout({
  user,
  reason,
  duration,
  actionBy = {
    username: client.user?.username || "system",
    userId: client.user?.id || "0",
  }, // or should never ideally occur fix later if issues
  guild,
}: {
  user: string | User | GuildMember;
  reason: string;
  duration: string;
  actionBy: { username: string; userId: string };
  guild: string | Guild;
}): Promise<ITimeout> {
  // Fetch the user to timeout
  const member = await getMember(user, guild);
  if (member.isCommunicationDisabled()) {
    throw new CustomDiscordError("User is already timed out.");
  }
  const durationInMs = ms(duration);

  if (!member.manageable) {
    throw new CustomDiscordError(
      "I don't have permission to timeout this user."
    );
  }

  await member.timeout(
    durationInMs,
    `Reason: ${reason}\nResponsible Moderator: ${actionBy.username}`
  );

  try {
    // ToDo: Has to be implemented with IMessage with customization options
    // Notify the user via DM before banning
    await member.send(
      `You have been timed out from ${
        member.guild.name
      }.\nReason: ${reason}\nDuration: ${ms(durationInMs, { long: true })}`
    );
  } catch (dmError: any) {
    if (dmError.code === 50007) {
      console.log("Could not send DM to the user.");
    }
  }

  await getModlogChannel().send({
    content: `TimedOut ${member.user.username} <@${member.id}>
  Reason: ${reason}
  Duration: ${ms(durationInMs, { long: true })}`,
  });

  return await timeoutService.create({
    guildId: member.guild.id,
    userId: member.id,
    actionBy,
    reason,
    duration: durationInMs,
  });
}

export async function warn({
  user,
  reason,
  actionBy,
  guild,
}: {
  user: string | User | GuildMember;
  reason: string;
  actionBy: { username: string; userId: string };
  guild: string | Guild;
}): Promise<IWarn> {
  // Fetch the user to warn
  const member = await getMember(user, guild);

  if (!member.manageable) {
    throw new CustomDiscordError("I don't have permission to warn this user.");
  }
  // Fetch the previous warn record of the user
  const previousWarns = await warnService.getWarns({
    guildId: member.guild.id,
    userId: member.id,
  });

  // Fetch the warn config of the guild
  let warnConfig: WarnConfig = await warnConfigService.getWarnConfig({
    guildId: member.guild.id,
    warnNumber: previousWarns.length + 1,
  });

  if (!warnConfig) {
    // If the warn config is not found, use the default warn config
    warnConfig = defaultWarnConfig[previousWarns.length + 1];
    if (!warnConfig) {
      warnConfig = defaultWarnConfig[0];
    }
  }

  // For each action in the warn config, perform the action
  const actions = await executeActions(
    warnConfig.actions,
    member,
    member.guild,
    actionBy
  );

  // Notify the user about the warn
  try {
    await member.send(
      `You have been warned in ${member.guild.name}.\nReason: ${reason}`
    );
  } catch (dmError: any) {
    if (dmError.code === 50007) {
      console.log("Could not send DM to the user.");
    }
  }

  await getModlogChannel().send({
    content: `Warned ${member.user.username} <@${member.id}>
  Reason: ${reason}`,
  });

  // Create a warn record
  return await warnService.create({
    guildId: member.guild.id,
    userId: member.id,
    reason,
    actionBy,
    actions,
  });
}

export async function removeWarn({
  user,
  warn,
  guild,
  actionBy,
}: {
  user: string | User;
  warn: Partial<
    Pick<IWarn, "guildId" | "userId" | "actionBy" | "_id" | "reason">
  >;
  guild: string | Guild;
  actionBy: { username: string; userId: string };
}): Promise<void> {
  const member = await getMember(user, guild);
  warn = (
    await warnService.getWarns({
      guildId: member.guild.id,
      userId: member.id,
    })
  )[0];
  if (!warn) {
    throw new CustomDiscordError("Warn not found.");
  }
  const removedWarn = await warnService.deleteWarn({
    guildId: member.guild.id,
    userId: member.id,
    warnId: warn._id as string,
  });
  if (!removedWarn) {
    throw new CustomDiscordError("Warn not found.");
  }

  try {
    // ToDo: Has to be implemented with IMessage with customization options
    // Notify the user via DM before banning
    await member.send(
      `Your warn has been removed in ${member.guild.name}.\nWarn details:\nReason: ${warn.reason}`
    );
  } catch (dmError: any) {
    if (dmError.code === 50007) {
      console.log("Could not send DM to the user.");
    }
  }
  await getModlogChannel().send({
    content: `Warn Removed: ${member.id} - ${member.user.username} - <@${member.id}>\nWarn details:\nReason: ${warn.reason}\nAction By: ${warn.actionBy?.username} <@${warn.actionBy?.userId}>\nRemoved by: ${actionBy.username} <@${actionBy.userId}>`,
  });
}

export async function roleModeration({
  user,
  reason,
  roles,
  action,
  duration,
  actionBy,
  guild,
}: {
  user: string | User | GuildMember;
  reason: string;
  duration: string;
  roles: string[] | Role[];
  action: "revoke" | "grant";
  actionBy: { username: string; userId: string };
  guild: string | Guild;
}): Promise<IRoleModeration> {
  const member = await getMember(user, guild);
  const durationInMs = ms(duration);
  const endsAt = new Date(Date.now() + durationInMs);
  const clientMember = await getMember(client.user || "", guild); //ehhh this client vaala thing needs to be fixed
  roles = await Promise.all(
    roles.map(async (role) => {
      const resolvedRole = getRole(role, guild);
      if (resolvedRole.position >= clientMember.roles.highest.position) {
        throw new CustomDiscordError(
          "I don't have permission to manage one or more of the specified roles."
        );
      }
      return resolvedRole;
    })
  );

  if (action === "grant") {
    await member.roles.add(roles, reason);
    if (durationInMs) {
      setTimeout(async () => {
        await member.roles.remove(
          roles,
          `Temporary role duration ended. Initial reason: ${reason}`
        );
        // Notify the user and guild if necessary
      }, durationInMs);
    }
  } else {
    await member.roles.remove(roles, reason);
  }

  await member.send(
    `You have been ${action}ed ${roles
      .map((role) => `${role}`)
      .join(", ")} roles in ${
      member.guild.name
    }.\nReason: ${reason}\nDuration: ${ms(durationInMs, { long: true })}`
  );

  return await roleModerationService.create({
    guildId: member.guild.id,
    userId: member.id,
    reason,
    duration: durationInMs,
    actionBy,
    roleIds: roles.map((role) => role.id),
    action,
  });
}

// Define a union type for all log types
type LogType = IWarn | ITimeout | IBan | IUnban;

// Define a mapping type for service functions
type LogServiceFunction = (opts: {
  guildId: string;
  userId: string;
}) => Promise<LogType[]>;

// Map log types to their respective service functions
const logServices: Record<string, LogServiceFunction> = {
  warn: warnService.getWarns,
  timeout: timeoutService.getTimeouts,
  ban: banService.getBans,
  unban: unbanService.getUnbans,
};

export async function modlogs({
  user,
  type,
  guild,
}: {
  user: string | User;
  type: string;
  guild: string | Guild;
}) {
  const member = await getUser(user);
  const guildToFetchLogsFrom = getGuild(guild);

  if (type === "all") {
    const logTypes = Object.keys(logServices);
    const logs = await Promise.all(
      logTypes.map(async (logType) => {
        const serviceLogs = await getLogs(
          logType,
          guildToFetchLogsFrom.id,
          member.id
        );
        return serviceLogs.map((log) => ({
          type: logType,
          reason: log.reason,
          createdAt: log.createdAt,
          actionBy: log.actionBy,
        }));
      })
    );
    return logs.flat().sort((a, b) => {
      const timeA = Number(a.createdAt) ?? 0;
      const timeB = Number(b.createdAt) ?? 0;
      return timeB - timeA;
    });
  } else if (type in logServices) {
    const logs = await getLogs(type, guildToFetchLogsFrom.id, member.id);
    return logs.map((log) => ({
      type,
      reason: log.reason,
      createdAt: log.createdAt,
      actionBy: log.actionBy,
    }));
  } else {
    throw new Error("Invalid type.");
  }
}

async function getLogs(
  logType: string,
  guildId: string,
  userId: string
): Promise<LogType[]> {
  const serviceFunction = logServices[logType];
  if (!serviceFunction) {
    throw new Error("Invalid log type.");
  }
  return await serviceFunction({ guildId, userId });
}
