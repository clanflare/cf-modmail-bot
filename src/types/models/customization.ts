import type { Document, SchemaTimestampsConfig } from "mongoose";
import type { Message } from ".";

export type Customization = {
  guildId: string;
  commandId: string;
  message: Message;
  variables: string[];
  logChannelId: string;
};

export interface ICustomization
  extends Document,
    SchemaTimestampsConfig,
    Customization {}
