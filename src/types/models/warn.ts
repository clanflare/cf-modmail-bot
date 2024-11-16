import type { Document, SchemaTimestampsConfig } from "mongoose";
import type { IBan, IRoleModeration, ITimeout } from ".";

export type Warn = {
  guildId: string;
  userId: string;
  reason: string;
  actionBy: {
    // Use another schema for this
    username: string;
    userId: string;
  };
  actions: {
    action: ITimeout | IBan | IRoleModeration; //need to be tested could be source of possible bugs in typesaftey when accessing unpopulated items.
    actionType?: "Timeout" | "Ban" | "RoleModeration";
  }[];
};

export interface IWarn extends Document, SchemaTimestampsConfig, Warn {}
