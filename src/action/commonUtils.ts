import { CustomDiscordError } from "@/types/errors";
import type { MessageComponent } from "@/types/models";
import client from "@/utils/discordClient.utils";
import {
  Guild,
  User,
  GuildMember,
  Role,
  Message,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";

export async function getUser(user: string | User | GuildMember) {
  if (user instanceof User) return user;
  if (user instanceof GuildMember) return user.user;
  try {
    return await client.users.fetch(user);
  } catch (error) {
    console.error(`Failed to fetch user: ${error}`);
    throw new CustomDiscordError(`Failed to fetch user: ${error}`);
  }
}

export function messageStickerAndAttachmentParser(message: Message) {
  if (message.stickers.first()) {
    return {
      content: `${message.content}\nsticker: ${message.stickers.first()?.url}`,
    };
  } else {
    return { content: message.content, files: message.attachments?.toJSON() };
  }
}

export function messageComponentParser(messageComponent: MessageComponent, disableButton = false) {
  if (!messageComponent.buttons || messageComponent.buttons.length == 0) {
    return {
      content: messageComponent.message.content,
      embeds: messageComponent.message.embeds,
      files: [], // attachments to be implemented from messageComponent.message.attachments
      components: [],
    };
  }

  const parsedButtons = messageComponent?.buttons?.map((btn) => {
    return new ButtonBuilder()
      .setCustomId(btn.label)
      .setLabel(btn.label)
      .setDisabled(disableButton)
      .setStyle(btn.style || ButtonStyle.Primary);
  });

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(parsedButtons);

  return {
    content: messageComponent.message.content,
    embeds: messageComponent.message.embeds,
    files: [], // attachments to be implemented from messageComponent.message.attachments
    components: [row],
  };
}

export function getGuild(guild: string | Guild) {
  if (guild instanceof Guild) return guild;

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
}

export async function getBan({ guild, user }: { guild: Guild; user: User }) {
  try {
    return await guild.bans.fetch({ user, force: true });
  } catch (error) {
    console.error(`Failed to fetch ban: ${error}`);
  }
  return null;
}

export function getRole(role: string | Role, guild: string | Guild) {
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

export async function getMember(
  member: string | User | GuildMember,
  guild: string | Guild
) {
  if (member instanceof GuildMember) return member;
  const fetchedGuild = getGuild(guild);
  try {
    const fetchedMember: GuildMember = await fetchedGuild.members.fetch(member);
    return fetchedMember;
  } catch (error) {
    console.error(`Failed to fetch member: ${error}`);
    throw new CustomDiscordError(`Member not found in the guild.`);
  }
}
