import type { Document, SchemaTimestampsConfig } from "mongoose";
import type { IDMessage } from "./dMessage";

export type ModmailStatus = "open" | "resolved" | "closed" | "errored";

export type ModmailsMessage = {
  author: {
    discordUserId: string;
    discordUsername: string;
  },
  message: IDMessage;
}

export type Modmail = {
  guildId: string; // guild where the modmail was opened
  userId: string; // user who opened the modmail
  status: ModmailStatus // status of the modmail
  modmailChannelId: string; // modmail channel Id for modmail (if open)
  userChannelId: string; // user channel Id for modmail (if open)
  interactiveMessageId: string;
  messages?: ModmailsMessage[],
};

export interface IModmail extends Document, SchemaTimestampsConfig, Modmail {}
