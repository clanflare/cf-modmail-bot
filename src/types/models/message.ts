import type { Document, SchemaTimestampsConfig } from "mongoose";
import type { Embed } from ".";

export type Message = {
  content: string; // 2000 character limit
  attachments?: string[]; // url validation
  embeds?: Embed[]; // max 10
};

export interface IMessage
  extends Document,
    SchemaTimestampsConfig,
    Message {}
