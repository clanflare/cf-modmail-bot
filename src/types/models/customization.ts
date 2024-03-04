import type { Document, SchemaTimestampsConfig } from "mongoose";
import type { SupportMessage } from ".";

export type Customization = {
  serverId: string;
  supportMessage: SupportMessage;
  commandId: string;
  variables: string[];
};

export interface ICustomization
  extends Document,
    SchemaTimestampsConfig,
    Customization {}
