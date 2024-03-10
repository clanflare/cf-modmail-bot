import type { Document, SchemaTimestampsConfig } from "mongoose";

type Timeout = {
  duration: number;
  reason: string;
  type: "timeout";
};

type Ban = {
  duration: number;
  reason: string;
  type: "ban";
};

type RoleModeration = {
  roleIds: string[];
  action: "grant" | "revoke";
  duration: number;
  reason: string;
  type: "roleModeration";
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
    WarnConfig {}
