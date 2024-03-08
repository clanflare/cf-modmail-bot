import { CustomDiscordError } from "@/types/errors";
import client from "@/utils/discordClient.utils";
import { Guild, User, GuildMember, Role } from "discord.js";

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

export const getGuild = (guild: string | Guild) => {
  // if guild is type of Guild return guild
  if (guild instanceof Guild) return guild;

  // if guild is type of string return guild
  try {
    const fetchedGuild = client.guilds.cache.get(guild);
    if (!fetchedGuild) {
      throw new CustomDiscordError("Guild not found in cache.");
    }
    return fetchedGuild;
  } catch (error) {
    console.error(`Failed to fetch guild: ${error}`);
    throw new CustomDiscordError(`Failed to fetch guild: ${error}`);
  }
};

export const getBan = async ({
  guild,
  user,
}: {
  guild: Guild;
  user: User;
}) => {
  try {
    // Fetch the ban
    return await guild.bans.fetch({ user, force: true });
  } catch (error) {
    console.error(`Failed to fetch ban: ${error}`);
  }
  return null;
};

export const getRole =  (
  role: string | Role,
  guild: string | Guild
) => {
  const fetchedGuild = getGuild(guild);
  if (role instanceof Role) return role;
  try {
    const fetchedRole = fetchedGuild.roles.cache.get(role);
    if (!fetchedRole) {
      throw new CustomDiscordError("Role not found in cache.");
    }
    return fetchedRole;
  } catch (error) {
    console.error(`Failed to fetch role: ${error}`);
    throw new CustomDiscordError(`Failed to fetch role: ${error}`);
  }
}

export const getMember = async (
  member: string | User | GuildMember,
  guild: string | Guild
) => {
  if (member instanceof GuildMember) return member;
  const fetchedGuild = getGuild(guild);
  if (member instanceof User) {
    const fetchedMember = await fetchedGuild.members.fetch(member);
    return fetchedMember;
  }
  try {
    const fetchedMember = await fetchedGuild.members.fetch(member);
    return fetchedMember;
  } catch (error) {
    console.error(`Failed to fetch member: ${error}`);
    throw new CustomDiscordError(`Failed to fetch member: ${error}`);
  }
};
