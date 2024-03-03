import type { IWarn } from "@/types/models";
import { Schema, model } from "mongoose";

const WarnSchema = new Schema<IWarn>(
  {
    serverId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
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
    actions: {
      type: [
        {
          action: {
            type: Schema.Types.ObjectId,
            required: true,
            refPath: "actions.actionType",
          },
          actionType: {
            type: String,
            required: true,
            enum: ["timeout", "ban", "roleModeration"],
          },
        },
      ],
      required: false,
      default: [],
    },
  },
  { timestamps: true },
);

export default model<IWarn>("Warn", WarnSchema);
