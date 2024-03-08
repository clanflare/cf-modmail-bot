import type { Document, SchemaTimestampsConfig } from "mongoose";

export type Ban = {
  guildId: string;
  userId: string;
  duration: number;
  reason: string;
  actionBy: {
    // Use another schema for this
    username: string;
    userId: string;
  };
};

export interface IBan extends Document, SchemaTimestampsConfig, Ban {}
