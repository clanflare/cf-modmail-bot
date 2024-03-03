import type { Document, SchemaTimestampsConfig } from "mongoose";
import type { IEmbed } from ".";

export type ISupportMessage = Document &
  SchemaTimestampsConfig & {
    content: string; // 2000 character limit
    attachments?: string[]; // url validation
    embeds?: IEmbed[]; // max 10
  };
