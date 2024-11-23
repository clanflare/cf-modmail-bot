import type { Document, SchemaTimestampsConfig } from "mongoose";

type Timeout = {
  duration: number;
  reason: string;
  type: "Timeout";
};

type Ban = {
  duration: number;
  reason: string;
  type: "Ban";
};

type RoleModeration = {
  roleIds: string[];
  action: "grant" | "revoke";
  duration: number;
  reason: string;
  type: "RoleModeration";
};

export type WarnActions = (Timeout | RoleModeration)[] | [Ban] | [];

export type WarnConfig = {
  guildId: string;
  warnNumber: number;
  actions: WarnActions;
};

export interface IWarnConfig
  extends Document,
  SchemaTimestampsConfig,
  WarnConfig { }
