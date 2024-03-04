import type { Document, SchemaTimestampsConfig } from "mongoose";
import type { Ban } from ".";

export type Unban = {
  serverId: string;
  userId: string;
  reason: string;
  actionBy: {
    // Use another schema for this
    username: string;
    userId: string;
  };
  ban?: Ban;
};

export interface IUnban extends Document, SchemaTimestampsConfig, Unban {}
