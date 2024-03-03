import type { Document, SchemaTimestampsConfig } from "mongoose";
import type { IBan } from ".";

export type IUnban = Document &
  SchemaTimestampsConfig & {
    serverId: string;
    userId: string;
    reason: string;
    actionBy: {
      // Use another schema for this
      username: string;
      userId: string;
    };
    ban?: IBan;
  };
