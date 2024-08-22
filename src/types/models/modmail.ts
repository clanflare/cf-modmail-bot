import type { Document, SchemaTimestampsConfig } from "mongoose";

export type Modmail = {
  guildId: string; // guild where the modmail was opened
  userId: string; // user who opened the modmail
  status: "open" | "resolved" | "closed"; // status of the modmail
  modmailChannelId: string; // modmail channel Id for modmail (if open)
  userChannelId: string; // user channel Id for modmail (if open)
  interactiveMessageId: string;
};

export interface IModmail extends Document, SchemaTimestampsConfig, Modmail {}
