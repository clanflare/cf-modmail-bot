import type { Document, SchemaTimestampsConfig } from "mongoose";
import type { Ban, RoleModeration, Timeout } from ".";

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
    action: Timeout | Ban | RoleModeration;
    actionType?: "timeout" | "ban" | "roleModeration";
  }[];
};

export interface IWarn extends Document, SchemaTimestampsConfig, Warn {}
