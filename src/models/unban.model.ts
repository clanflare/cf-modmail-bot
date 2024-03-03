import type { IUnban } from "@/types/models";
import { Schema, model } from "mongoose";

const UnbanSchema = new Schema<IUnban>(
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
    ban: {
      type: Schema.Types.ObjectId,
      ref: "Ban",
    },
  },
  { timestamps: true },
);

export default model<IUnban>("Unban", UnbanSchema);
