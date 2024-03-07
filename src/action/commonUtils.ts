import { CustomDiscordError } from "@/types/errors";
import client from "@/utils/discordClient.utils";
import { Guild, User, GuildMember } from "discord.js";

export const getUser = async (user: string | User | GuildMember) => {
  // if user is type of user return user
  if (user instanceof User) return user;
  if (user instanceof GuildMember) return user.user;
  try {
    const fetchedUser = await client.users.fetch(user);
    return fetchedUser;
  } catch (error) {
    console.error(`Failed to fetch user: ${error}`);
    throw new CustomDiscordError(`Failed to fetch user: ${error}`);
  }
};

export const getServer = (server: string | Guild) => {
  // if server is type of guild return server
  if (server instanceof Guild) return server;

  // if server is type of string return server
  try {
    const fetchedServer = client.guilds.cache.get(server);
    if (!fetchedServer) {
      throw new CustomDiscordError("Server not found in cache.");
    }
    return fetchedServer;
  } catch (error) {
    console.error(`Failed to fetch server: ${error}`);
    throw new CustomDiscordError(`Failed to fetch server: ${error}`);
  }
};

export const getBan = async ({
  server,
  user,
}: {
  server: Guild;
  user: User;
}) => {
  try {
    // Fetch the ban
    return await server.bans.fetch({ user, force: true });
  } catch (error) {
    console.error(`Failed to fetch ban: ${error}`);
  }
  return null;
};

export const getMember = async (
  member: string | User | GuildMember,
  server: string | Guild
) => {
  if (member instanceof GuildMember) return member;
  const guild = getServer(server);
  if (member instanceof User) {
    const fetchedMember = await guild.members.fetch(member);
    return fetchedMember;
  }
  try {
    const fetchedMember = await guild.members.fetch(member);
    return fetchedMember;
  } catch (error) {
    console.error(`Failed to fetch member: ${error}`);
    throw new CustomDiscordError(`Failed to fetch member: ${error}`);
  }
};
