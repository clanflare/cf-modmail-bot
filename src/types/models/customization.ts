import type { Document, SchemaTimestampsConfig } from "mongoose";
import type { DiscordMessage } from ".";

export type Customization = {
  guildId: string;
  commandId: string;
  message: DiscordMessage;
  variables: string[];
  logChannelId: string;
};

export interface ICustomization
  extends Document,
    SchemaTimestampsConfig,
    Customization {}
