import { banService, unbanService } from "@/services";
import { CustomDiscordError } from "@/types/errors";
import type { IBan, IUnban } from "@/types/models";
import client from "@/utils/discordClient.utils";
import ms from "ms";
import { getBan, getServer, getUser } from ".";
import { Guild, User } from "discord.js";

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
  const userToBan = (await getUser(user)) as User;

  // Default duration to 0 if not provided
  const durationInMs = duration ? ms(duration) : 0;

  // Fetch the server to ban the user from
  const serverToBanFrom = (await getServer(server)) as Guild;

  // Check if the user is banned
  const bannedUser = await getBan({ server: serverToBanFrom, user: userToBan });
  if (bannedUser) {
    throw new CustomDiscordError("User is already banned.");
  }
  try {
    // ToDo: Has to be implemented with IMessage with customization options
    // Notify the user via DM before banning
    await userToBan.send(
      `You have been banned from ${serverToBanFrom.name}.\nReason: ${reason}`,
    );
  } catch (dmError: any) {
    if (dmError.code === 50007) {
      console.log("Could not send DM to the user.");
    }
  }

  // Ban the user
  await serverToBanFrom.members.ban(userToBan, { reason });

  // ToDo: Has to be implemented with IMessage with customization options
  // Notify the server about the ban
  await serverToBanFrom.systemChannel?.send({
    content: `Banned ${userToBan.username} <@${userToBan.id}>
    Reason: ${reason}
    Duration: ${durationInMs === 0 ? "Permanent" : `for ${ms(durationInMs, { long: true })}`}`,
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
  const userToUnban = (await client.users.fetch(user)) as User;

  // Fetch the server
  const serverToUnbanFrom = (await getServer(server)) as Guild;

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
