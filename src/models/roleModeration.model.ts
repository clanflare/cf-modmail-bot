import type { IRoleModeration } from "@/types/models";
import { Schema, model } from "mongoose";

const RoleModerationSchema = new Schema<IRoleModeration>(
  {
    serverId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    actionBy: {
      type: {
        username: {
          type: String,
          required: true,
        },
        userId: {
          type: String,
          required: true,
        },
      },
      required: true,
    },
    roleIds: {
      type: [String],
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: ["revoked", "granted"],
    },
  },
  { timestamps: true },
);

export default model<IRoleModeration>("RoleModeration", RoleModerationSchema);
