import type { Document, SchemaTimestampsConfig } from "mongoose";
import type { SupportMessage } from ".";

export type Customization = {
  serverId: string;
  commandId: string;
  supportMessage: SupportMessage;
  variables: string[];
  logChannelId: string;
};

export interface ICustomization
  extends Document,
    SchemaTimestampsConfig,
    Customization {}
