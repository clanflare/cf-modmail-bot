import type { Document, SchemaTimestampsConfig } from "mongoose";

export type Modmail = {
  guildId: string; // guild where the modmail was opened
  userId: string; // user who opened the modmail
  status: "open" | "resolved" | "closed"; // status of the modmail
  channelId: string; // guild channel Id for modmail (if open)
  threadId: string; // for storing archived chat
};

export interface IModmail extends Document, SchemaTimestampsConfig, Modmail {}
