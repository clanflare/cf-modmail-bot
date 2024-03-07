import { CustomDiscordError } from "@/types/errors";
import client from "@/utils/discordClient.utils";
import { Guild, User } from "discord.js";

export const getUser = async (user: string | User) => {
  // if user is type of user return user
  if (user instanceof User) return user;

  // if user is type of string return user
  if (typeof user === "string") {
    try {
      const fetchedUser = await client.users.fetch(user);
      return fetchedUser;
    } catch (error) {
      console.error(`Failed to fetch user: ${error}`);
      throw new CustomDiscordError(`Failed to fetch user: ${error}`);
    }
  }
};

export const getServer = (server: string | Guild) => {
  // if server is type of guild return server
  if (server instanceof Guild) return server;

  // if server is type of string return server
  if (typeof server === "string") {
    try {
      const fetchedServer = client.guilds.cache.get(server);
      return fetchedServer;
    } catch (error) {
      console.error(`Failed to fetch server: ${error}`);
      throw new CustomDiscordError(`Failed to fetch server: ${error}`);
    }
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
