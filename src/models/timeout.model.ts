import type { ITimeout } from "@/types/models";
import { Schema, model } from "mongoose";

const TimeoutSchema = new Schema<ITimeout>(
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
  },
  { timestamps: true },
);

export default model<ITimeout>("Timeout", TimeoutSchema);
