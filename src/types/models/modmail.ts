import type { Document, SchemaTimestampsConfig } from "mongoose";

export type IModmail = Document &
  SchemaTimestampsConfig & {
    serverId: string; // server where the modmail was opened
    userId: string; // user who opened the modmail
    status: "open" | "resolved" | "closed"; // status of the modmail
    channelId: string; // server channel Id for modmail (if open)
    threadId: string; // for storing archived chat
  };
