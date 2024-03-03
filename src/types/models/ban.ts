import type { Document, SchemaTimestampsConfig } from "mongoose";

export type IBan = Document &
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
