import { CustomDiscordError } from "@/types/errors";
import type { DMessage, MessageComponent } from "@/types/models";
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
  Embed,
} from "discord.js";

export const getUser = async (user: string | User | GuildMember) => {
  // if user is type of user return user
  if (user instanceof User) return user;
  if (user instanceof GuildMember) return user.user;
  try {
    return await client.users.fetch(user);
  } catch (error) {
    console.error(`Failed to fetch user: ${error}`);
    throw new CustomDiscordError(`Failed to fetch user: ${error}`);
  }
};

export function messageStickerAndAttachmentParser(message: Message) {
  // check partial message , fetch , deal with emotes , add an option to remove mentions etc
  if (message.stickers.first()) {
    return {
      content: `${message.content}\nsticker: ${message.stickers.first()?.url}`,
    };
  } else
    return { content: message.content, files: message.attachments?.toJSON() };
}

export function messageComponentParser(messageComponent: MessageComponent, disableButton = false) {

  if(!messageComponent.buttons || messageComponent.buttons.length==0)
    return{
      content: messageComponent.message.content,
      embeds: messageComponent.message.embeds,
      files:[], // attachments to be implemented from messageComponent.message.attachments
      components: [],
    }; 
  
  const parsedButtons = messageComponent?.buttons?.map(btn=>{
    return new ButtonBuilder()
    .setCustomId(btn.label)
    .setLabel(btn.label)
    .setDisabled(disableButton)
    .setStyle(btn.style || ButtonStyle.Primary);
  })

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(parsedButtons);

  return {
    content: messageComponent.message.content,
    embeds: messageComponent.message.embeds,
    files:[], // attachments to be implemented from messageComponent.message.attachments
    components: [row]
  }; 
}

export function dMessageToDiscordParser(dMessage:DMessage){
  if(dMessage.sticker){
    return {
      content: `${dMessage.content}\nsticker: ${dMessage.sticker}`,
    };
  }
  return {
    content: dMessage.content, 
    files: dMessage.attachments?.map(),
  }
}

export function discordToDEmbedParser(embed:Embed){
  return embed.title===null?({...embed,title:undefined}):{...embed,title:embed.title}
}

export function discordToDMessageParser(message:Message){
  const dMessage: DMessage = {
    discordMessageId:message.id,
    content:message.content,
    authorId:message.author.id,
    channelId:message.channelId,
    attachments:message.attachments.map(att=>att.url),
    sticker:message.stickers.first()?.url,
    embeds: message.embeds.map(e=>discordToDEmbedParser(e)),
    guildId: message.guild?.id,
    // reactions: message.reactions.cache.map(e=>e)
    isEdited: message.editedAt? true:false,
    isPinned: message.pinned,
    replyToMessageId: message.reference?.messageId //ToDo: reference message changes not made yet
  }

  return dMessage;
}
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

export const getBan = async ({ guild, user }: { guild: Guild; user: User }) => {
  try {
    // Fetch the ban
    return await guild.bans.fetch({ user, force: true });
  } catch (error) {
    console.error(`Failed to fetch ban: ${error}`);
  }
  return null;
};

export const getRole = (role: string | Role, guild: string | Guild) => {
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
};

export const getMember = async (
  member: string | User | GuildMember,
  guild: string | Guild
) => {
  if (member instanceof GuildMember) return member;
  const fetchedGuild = getGuild(guild);
  try {
    const fetchedMember: GuildMember = await fetchedGuild.members.fetch(member);
    return fetchedMember;
  } catch (error) {
    console.error(`Failed to fetch member: ${error}`);
    throw new CustomDiscordError(`Member not found in the guild.`);
  }
};
