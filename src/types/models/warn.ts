import type { Document, SchemaTimestampsConfig } from "mongoose";
import type { IBan } from "./ban";
import type { IRoleModeration } from "./roleModeration";
import type { ITimeout } from "./timeout";

export type IWarn = Document &
  SchemaTimestampsConfig & {
    serverId: string;
    userId: string;
    reason: string;
    actionBy: {
      // Use another schema for this
      username: string;
      userId: string;
    };
    actions: {
      action: ITimeout | IBan | IRoleModeration;
      actionType?: "timeout" | "ban" | "roleModeration";
    }[];
  };
