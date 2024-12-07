import type { Document, SchemaTimestampsConfig } from "mongoose";

export type Timeout = {
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

export interface ITimeout extends Document, SchemaTimestampsConfig, Timeout {}
