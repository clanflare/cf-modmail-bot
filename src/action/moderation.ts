import { banService, unbanService } from "@/services";
import { CustomDiscordError } from "@/types/errors";
import type { IBan, IUnban } from "@/types/models";
import client from "@/utils/discordClient.utils";
import ms from "ms";

export const ban = async ({
  user,
  reason,
  duration,
  actionBy,
  serverId,
}: {
  user: string;
  reason: string;
  duration?: string;
  actionBy: { username: string; userId: string };
  serverId: string;
}): Promise<IBan> => {
  // Fetch the user to ban
  const userToBan = await client.users.fetch(user);

  // Default duration to 0 if not provided
  const durationInMs = duration ? ms(duration) : 0;

  // Fetch the server
  const server = await client.guilds.fetch(serverId);

  // Check if the user is banned
  try {
    const bannedUser = await server.bans.fetch({ user: user, force: true });
    if (bannedUser) {
      throw new CustomDiscordError("User is already banned.", 400);
    }
  } catch (error: any) {
    if (error.message === "Unknown Ban") {
      // Do nothing
    } else {
      throw error;
    }
  }
  try {
    // ToDo: Has to be implemented with IMessage with customization options
    // Notify the user via DM before banning
    await userToBan.send(
      `You have been banned from ${server.name}.\nReason: ${reason}`,
    );
  } catch (dmError: any) {
    if (dmError.code === 50007) {
      console.log("User has DMs disabled.");
    }
  }

  // Ban the user
  await server.members.ban(userToBan, { reason });

  // ToDo: Has to be implemented with IMessage with customization options
  // Notify the server about the ban
  await server.systemChannel?.send({
    content: `Banned ${userToBan.username} <@${userToBan.id}>
    Reason: ${reason}
    Duration: ${durationInMs === 0 ? "Permanent" : `for ${ms(durationInMs, { long: true })}`}`,
  });

  // Create a ban record
  return await banService.create({
    serverId,
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
  serverId,
}: {
  user: string;
  reason: string;
  actionBy: { username: string; userId: string };
  serverId: string;
}): Promise<IUnban> => {
  // Fetch the user to unban
  const userToUnban = await client.users.fetch(user);

  // Fetch the server
  const server = await client.guilds.fetch(serverId);

  // Check if the user is banned
  try {
    const bannedUser = await server.bans.fetch({ user: user, force: true });
    if (!bannedUser) {
      throw new CustomDiscordError("User is not banned.", 400);
    }
  } catch (error: any) {
    if (error.message === "Unknown Ban") {
      throw new CustomDiscordError("User is not banned.", 400);
    } else {
      throw error;
    }
  }

  // Unban the user
  await server.members.unban(userToUnban, reason);

  // fetch last ban record of user.id
  const ban = await banService.getLatestBan({
    serverId,
    userId: userToUnban.id,
  });

  // ToDo: Has to be implemented with IMessage with customization options
  // Notify the server about the unban
  await server.systemChannel?.send({
    content: `Unbanned ${userToUnban.username} <@${userToUnban.id}>
  Reason: ${reason}`,
  });

  // Create an unban record
  return await unbanService.create({
    serverId,
    userId: userToUnban.id,
    reason,
    actionBy,
    ban,
  });
};
