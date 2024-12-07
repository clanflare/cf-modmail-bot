import type { IBan } from "@/types/models";
import { Schema, model } from "mongoose";

const BanSchema = new Schema<IBan>(
  {
    guildId: {
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
  { timestamps: true }
);

export default model<IBan>("Ban", BanSchema);
