import { defaultWarnConfig } from "@/config/warnConfig";
import {
  banService,
  roleModerationService,
  timeoutService,
  unbanService,
  warnConfigService,
  warnService,
} from "@/services";
import { CustomDiscordError } from "@/types/errors";
import type {
  IBan,
  IRoleModeration,
  ITimeout,
  IUnban,
  IWarn,
  WarnActions,
  WarnConfig,
} from "@/types/models";
import { BaseGuildTextChannel, Client, Guild, GuildMember, Role, User } from "discord.js";
import DiscordUtils from "@/action/discordUtils";
import ms from "ms";

class Moderation {

  client: Client;
  constructor(client: Client) {
    this.client = client;
  }

  private getModlogChannel(): BaseGuildTextChannel {
    const modlogChannel = this.client.channels.cache.get("1221913092674556048");
    if (!modlogChannel) {
      throw new CustomDiscordError("Modlog channel not found.");
    }
    return modlogChannel as BaseGuildTextChannel;
  }

  public async executeActions(
    actions: WarnActions,
    member: string | User | GuildMember,
    guild: string | Guild,
    actionBy: { username: string; userId: string }
  ) {
    const actionsPerformed = await Promise.all(
      actions.map(async (action) => {
        switch (action.type) {
          case "Ban":
            return this.ban({
              user: member,
              reason: action.reason,
              duration: ms(action.duration),
              actionBy,
              guild,
            });
          case "Timeout":
            return this.timeout({
              user: member,
              reason: action.reason,
              duration: ms(action.duration),
              actionBy,
              guild,
            });
          case "RoleModeration":
            return this.roleModeration({
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

    return actions.map((action, index) => ({
      actionType: action.type,
      action: actionsPerformed[index],
    }));
  }

  public async ban({
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
    const discordUtils = new DiscordUtils(this.client);
    const userToBan = await discordUtils.getUser(user);
    const durationInMs = duration ? ms(duration) : 0;

    const guildToBanFrom = discordUtils.getGuild(guild);
    const bannedUser = await discordUtils.getBan({
      guild: guildToBanFrom,
      user: userToBan,
    });

    if (bannedUser) {
      throw new CustomDiscordError("User is already banned.");
    }

    try {
      const member = await discordUtils.getMember(userToBan, guildToBanFrom);
      if (!member.bannable) {
        throw new CustomDiscordError("I don't have permission to ban this user.");
      }
    } catch (error) {
      console.error("Error checking bannability:", error);
    }

    discordUtils.notifyUser(userToBan, `You have been banned from ${guildToBanFrom.name}.\nReason: ${reason}`);

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

    await this.getModlogChannel().send({
      content: `Banned ${userToBan.username} <@${userToBan.id}>\nReason: ${reason}\nDuration: ${durationInMs ? `for ${ms(durationInMs, { long: true })}` : "Permanent"
        }`,
    });

    return await banService.create({
      guildId: guildToBanFrom.id,
      userId: userToBan.id,
      actionBy,
      reason,
      duration: durationInMs,
    });
  }

  public async unban({
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
    const discordUtils = new DiscordUtils(this.client);
    const userToUnban = await discordUtils.getUser(user);
    const guildToUnbanFrom = discordUtils.getGuild(guild);
    const bannedUser = await discordUtils.getBan({
      guild: guildToUnbanFrom,
      user: userToUnban,
    });

    if (!bannedUser) {
      throw new CustomDiscordError("User is not banned.");
    }

    await guildToUnbanFrom.members.unban(userToUnban, reason);

    await this.getModlogChannel().send({
      content: `Unbanned ${userToUnban.username} <@${userToUnban.id}>\nReason: ${reason}`,
    });

    const banRecord = await banService.getLatestBan({
      guildId: guildToUnbanFrom.id,
      userId: userToUnban.id,
    });

    return await unbanService.create({
      guildId: guildToUnbanFrom.id,
      userId: userToUnban.id,
      reason,
      actionBy,
      ban: banRecord,
    });
  }

  public async timeout({
    user,
    reason,
    duration,
    actionBy,
    guild,
  }: {
    user: string | User | GuildMember;
    reason: string;
    duration: string;
    actionBy: { username: string; userId: string };
    guild: string | Guild;
  }): Promise<ITimeout> {
    const discordUtils = new DiscordUtils(this.client);
    const member = await discordUtils.getMember(user, guild);

    if (member.isCommunicationDisabled()) {
      throw new CustomDiscordError("User is already timed out.");
    }

    const durationInMs = ms(duration);

    if (!member.manageable) {
      throw new CustomDiscordError("I don't have permission to timeout this user.");
    }

    await member.timeout(durationInMs, `Reason: ${reason}\nResponsible Moderator: ${actionBy.username}`);

    discordUtils.notifyUser(member, `You have been timed out from ${member.guild.name}.\nReason: ${reason}\nDuration: ${ms(durationInMs, { long: true })}`);

    await this.getModlogChannel().send({
      content: `TimedOut ${member.user.username} <@${member.id}>\nReason: ${reason}\nDuration: ${ms(
        durationInMs,
        { long: true }
      )}`,
    });

    return await timeoutService.create({
      guildId: member.guild.id,
      userId: member.id,
      actionBy,
      reason,
      duration: durationInMs,
    });
  }

  public async warn({
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
    const discordUtils = new DiscordUtils(this.client);
    const member = await discordUtils.getMember(user, guild);

    if (!member.manageable) {
      throw new CustomDiscordError("I don't have permission to warn this user.");
    }

    // Fetch the previous warns of the user
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
    const actions = await this.executeActions(
      warnConfig.actions,
      member,
      member.guild,
      actionBy
    );

    discordUtils.notifyUser(member, `You have been warned in ${member.guild.name}.\nReason: ${reason}`);

    await this.getModlogChannel().send({
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

  public async removeWarn({
    user,
    warn,
    guild,
    actionBy
  }: {
    user: string | User;
    warn: Partial<
      Pick<IWarn, "guildId" | "userId" | "actionBy" | "_id" | "reason">
    >;
    guild: string | Guild;
    actionBy: { username: string; userId: string };
  }): Promise<void> {
    const discordUtils = new DiscordUtils(this.client);
    const member = await discordUtils.getMember(user, guild);
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

    discordUtils.notifyUser(member, `Your warn has been removed in ${member.guild.name}.\nWarn details:\nReason: ${warn.reason}`);

    await this.getModlogChannel().send({
      content: `Warn Removed: ${member.id} - ${member.user.username} - <@${member.id}>\nWarn details:\nReason: ${warn.reason}\nAction By: ${warn.actionBy?.username} <@${warn.actionBy?.userId}>\nRemoved by: ${actionBy.username} <@${actionBy.userId}>`,
    });
  }

  public async roleModeration({
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
    const discordUtils = new DiscordUtils(this.client);
    const member = await discordUtils.getMember(user, guild);
    const durationInMs = ms(duration);
    const endsAt = new Date(Date.now() + durationInMs);
    const clientMember = await discordUtils.getMember(this.client.user || "", guild); //ehhh this client vaala thing needs to be fixed
    roles = await Promise.all(
      roles.map(async (role) => {
        const resolvedRole = discordUtils.getRole(role, guild);
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
        .join(", ")} roles in ${member.guild.name
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

  public async modlogs({
    user,
    type,
    guild,
  }: {
    user: string | User;
    type: string;
    guild: string | Guild;
  }) {
    const discordUtils = new DiscordUtils(this.client);
    const member = await discordUtils.getUser(user);
    const guildToFetchLogsFrom = discordUtils.getGuild(guild);

    if (type === "all") {
      const logTypes = Object.keys(logServices);
      const logs = await Promise.all(
        logTypes.map(async (logType) => {
          const serviceLogs = await this.getLogs(
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
      const logs = await this.getLogs(type, guildToFetchLogsFrom.id, member.id);
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

  public async getLogs(
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


}

export default Moderation;
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
