import { banService, unbanService, timeoutService } from "@/services";
import { CustomDiscordError } from "@/types/errors";
import type { IBan, IUnban, ITimeout } from "@/types/models";
import {client} from "@/.";
import ms from "ms";
import { getBan, getMember, getGuild, getUser, getRole } from ".";
import { Guild, GuildMember, User, Role } from "discord.js";

export async function ban({
  user,
  reason,
  duration,
  actionBy,
  guild,
}: {
  user: string | User;
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

  // Check if the bot can ban the user and if the user is higher in the hierarchy
  if (!(await getMember(userToBan, guildToBanFrom)).bannable) {
    throw new CustomDiscordError("I don't have permission to ban this user.");
  }

  // Ban the user
  try {
    await guildToBanFrom.members.ban(userToBan, { reason });
  } catch (banError: any) {
    if (banError.code === 50013) {
      throw new CustomDiscordError("I don't have permission to ban this user.");
    }
    throw banError;
  }

  // ToDo: Has to be implemented with IMessage with customization options
  // Notify the guild about the ban
  await guildToBanFrom.systemChannel?.send({ // ? needs to be removed
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
};

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
  await guildToUnbanFrom.systemChannel?.send({
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
};

export async function timeout({
  user,
  reason,
  duration,
  actionBy = { username: client.user?.username || "system", userId: client.user?.id || "0"},// or should never ideally occur fix later if issues
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

  await member.timeout(durationInMs, reason);

  await member.send(
    `You have been timed out from ${
      member.guild.name
    }.\nReason: ${reason}\nDuration: ${ms(durationInMs, { long: true })}`
  );

  await member.guild.systemChannel?.send({
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
};

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
}): Promise<void> { //incomplete
  const member = await getUser(user);


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
}): Promise<void> {
  const member = await getMember(user, guild);
  const durationInMs = ms(duration);
  const endsAt = new Date(Date.now() + durationInMs);
  const clientMember = await getMember(client.user|| "",guild); //ehhh this client vaala thing needs to be fixed
  roles = await Promise.all(
    roles.map(async (role) => {
      const resolvedRole = await getRole(role, guild);
      if (resolvedRole.position >= clientMember.roles.highest.position) {
        throw new CustomDiscordError("I don't have permission to manage one or more of the specified roles.");
      }
      return resolvedRole;
    })
  );

  if (action === "grant") {
    await member.roles.add(roles, reason);
    if (durationInMs) {
      setTimeout(async () => {
        await member.roles.remove(roles, `Temporary role duration ended. Initial reason: ${reason}`);
        // Notify the user and guild if necessary
      }, durationInMs);
    }
  } else {
    await member.roles.remove(roles, reason);
  }

  await member.send(
    `You have been ${action}ed ${roles.map((role) => `${role}`).join(", ")} roles in ${member.guild.name}.\nReason: ${reason}\nDuration: ${ms(durationInMs, { long: true })}`
  );

}
//maybe rename guild to guild everywhere for consistency