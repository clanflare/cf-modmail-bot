import type { Document, SchemaTimestampsConfig } from "mongoose";
import type { DiscordEmbed } from ".";

export type DiscordMessage = {
  discordMessageId: string; // Discord Id of the message
  content: string; // 2000 character limit
  attachments?: string[]; // Array of URLs, validate URLs
  sticker?: string;
  embeds?: DiscordEmbed[]; // Maximum of 10 embeds
  authorId: string; // ID of the author (User ID in string format)
  channelId: string; // ID of the channel where the message is sent
  guildId?: string; // Optional ID of the guild (for guild messages)
  reactions?: { [emoji: string]: number }; // Reaction counts per emoji
  isPinned?: boolean; // Indicates whether the message is pinned
  isEdited?: boolean; // Indicates whether the message has been edited
  replyToMessageId?: string; // ID of the message being replied to
};

export interface IDiscordMessage
  extends Document,
  SchemaTimestampsConfig,
  DiscordMessage { }
