import type { Document, SchemaTimestampsConfig } from "mongoose";
import type { DMessage } from ".";

export type Customization = {
  guildId: string;
  commandId: string;
  message: DMessage;
  variables: string[];
  logChannelId: string;
};

export interface ICustomization
  extends Document,
    SchemaTimestampsConfig,
    Customization {}
