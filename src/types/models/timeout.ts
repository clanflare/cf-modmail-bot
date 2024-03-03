import type { Document, SchemaTimestampsConfig } from "mongoose";

export type ITimeout = Document &
  SchemaTimestampsConfig & {
    serverId: string;
    userId: string;
    duration: number;
    reason: string;
    actionBy: {
      // Use another schema for this
      username: string;
      userId: string;
    };
  };
