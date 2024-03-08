import type { Document, SchemaTimestampsConfig } from "mongoose";

export type RoleModeration = {
  guildId: string;
  userId: string;
  duration: number;
  reason: string;
  endsAt?: Date;
  ended?: boolean;
  actionBy: {
    // Use another schema for this
    username: string;
    userId: string;
  };
  roleIds: string[];
  action: "revoke" | "grant";
};

export interface IRoleModeration
  extends Document,
    SchemaTimestampsConfig,
    RoleModeration {}
