import { banService, unbanService, timeoutService } from "@/services";
import { CustomDiscordError } from "@/types/errors";
import type { IBan, IUnban, ITimeout } from "@/types/models";
import client from "@/utils/discordClient.utils";
import ms from "ms";
import { getBan, getMember, getServer, getUser, getRole } from ".";
import { Guild, GuildMember, User, Role } from "discord.js";

export const ban = async ({
  user,
  reason,
  duration,
  actionBy,
  server,
}: {
  user: string | User;
  reason: string;
  duration?: string;
  actionBy: { username: string; userId: string };
  server: string | Guild;
}): Promise<IBan> => {
  // Fetch the user to ban
  const userToBan = await getUser(user);

  // Default duration to 0 if not provided
  const durationInMs = duration ? ms(duration) : 0;

  // Fetch the server to ban the user from
  const serverToBanFrom = getServer(server);

  // Check if the user is banned
  const bannedUser = await getBan({ server: serverToBanFrom, user: userToBan });
  if (bannedUser) {
    throw new CustomDiscordError("User is already banned.");
  }
  try {
    // ToDo: Has to be implemented with IMessage with customization options
    // Notify the user via DM before banning
    await userToBan.send(
      `You have been banned from ${serverToBanFrom.name}.\nReason: ${reason}`
    );
  } catch (dmError: any) {
    if (dmError.code === 50007) {
      console.log("Could not send DM to the user.");
    }
  }

  // Check if the bot can ban the user and if the user is higher in the hierarchy
  if (!serverToBanFrom.members.resolve(userToBan)?.bannable) {
    throw new CustomDiscordError("I don't have permission to ban this user.");
  }

  // Ban the user
  try {
    await serverToBanFrom.members.ban(userToBan, { reason });
  } catch (banError: any) {
    if (banError.code === 50013) {
      throw new CustomDiscordError("I don't have permission to ban this user.");
    }
    throw banError;
  }

  // ToDo: Has to be implemented with IMessage with customization options
  // Notify the server about the ban
  await serverToBanFrom.systemChannel?.send({
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
    serverId: serverToBanFrom.id,
    userId: userToBan.id,
    actionBy,
    reason,
    duration: durationInMs,
  });
};

export const unban = async ({
  user,
  reason,
  actionBy,
  server,
}: {
  user: string | User;
  reason: string;
  actionBy: { username: string; userId: string };
  server: string | Guild;
}): Promise<IUnban> => {
  // Fetch the user to unban
  const userToUnban = (await getUser(user)) as User;

  // Fetch the server
  const serverToUnbanFrom = getServer(server) as Guild;

  // Check if the user is banned
  const bannedUser = await getBan({
    server: serverToUnbanFrom,
    user: userToUnban,
  });
  if (!bannedUser) {
    throw new CustomDiscordError("User is not banned.");
  }

  // Unban the user
  await serverToUnbanFrom.members.unban(userToUnban, reason);

  // fetch last ban record of user.id
  const ban = await banService.getLatestBan({
    serverId: serverToUnbanFrom.id,
    userId: userToUnban.id,
    reason: bannedUser.reason || undefined,
  });

  // ToDo: Has to be implemented with IMessage with customization options
  // Notify the server about the unban
  await serverToUnbanFrom.systemChannel?.send({
    content: `Unbanned ${userToUnban.username} <@${userToUnban.id}>
  Reason: ${reason}`,
  });

  // Create an unban record
  return await unbanService.create({
    serverId: serverToUnbanFrom.id,
    userId: userToUnban.id,
    reason,
    actionBy,
    ban,
  });
};

export const timeout = async ({
  user,
  reason,
  duration,
  actionBy = { username: client.user?.username || "system", userId: client.user?.id || "0"},// or should never ideally occur fix later if issues
  server,
}: {
  user: string | User | GuildMember;
  reason: string;
  duration: string;
  actionBy: { username: string; userId: string };
  server: string | Guild;
}): Promise<ITimeout> => {
  // Fetch the user to timeout
  const member = await getMember(user, server);
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
    serverId: member.guild.id,
    userId: member.id,
    actionBy,
    reason,
    duration: durationInMs,
  });
};

export const warn = async ({
  user,
  reason,
  actionBy,
  server,
}: {
  user: string | User | GuildMember;
  reason: string;
  actionBy: { username: string; userId: string };
  server: string | Guild;
}): Promise<void> => { //incomplete
  const member = await getUser(user);


}

export const roleModeration = async ({
  user,
  reason,
  roles,
  action,
  duration,
  actionBy,
  server,
}: {
  user: string | User | GuildMember;
  reason: string;
  duration: string;
  roles: string[] | Role[];
  action: "revoke" | "grant";
  actionBy: { username: string; userId: string };
  server: string | Guild;
}): Promise<void> => {
  const member = await getMember(user, server);
  const durationInMs = ms(duration);
  const endsAt = new Date(Date.now() + durationInMs);
  const clientMember = await getMember(client.user|| "",server); //ehhh this client vaala thing needs to be fixed
  roles = await Promise.all(roles.map(async (role) => {
    role = getRole(role, server)
    if (role.position >= (clientMember.roles.highest.position)) {
      throw new CustomDiscordError(
        "I don't have permission to manage all the roles u mentioned."
      );
    }
    return role;
  }));

  if (action === "grant") {
    await member.roles.add(roles);
  } else {
    await member.roles.remove(roles);
  }



  await member.send(
    `You have been ${action}ed ${roles.map((role) => `${role}`).join(", ")} roles in ${member.guild.name}.\nReason: ${reason}\nDuration: ${ms(durationInMs, { long: true })}`
  );

}
//change all export to be function export rather than constant function export because of function hoisting which does not happen in cosnt export
//maybe rename server to guild everywhere for consistency