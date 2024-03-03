import type { Document, SchemaTimestampsConfig } from "mongoose";

export type RoleModeration = {
  serverId: string;
  userId: string;
  duration: number;
  reason: string;
  actionBy: {
    // Use another schema for this
    username: string;
    userId: string;
  };
  roleIds: string[];
  action: "revoked" | "granted";
};

export type IRoleModeration = Document &
  SchemaTimestampsConfig & RoleModeration;