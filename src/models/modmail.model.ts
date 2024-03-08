import type { IModmail } from "@/types/models";
import { Schema, model } from "mongoose";

const ModmailSchema = new Schema<IModmail>(
  {
    guildId: {
      type: String,
      required: [true, "Guild ID is required"],
    },
    userId: {
      type: String,
      required: [true, "User ID is required"],
    },
    status: {
      type: String,
      enum: ["open", "resolved"],
      default: "open",
    },
    channelId: {
      type: String,
      required: [true, "Channel ID is required"],
    },
    threadId: {
      type: String,
      required: [true, "Thread ID is required"],
    },
  },
  { timestamps: true }
);

export default model<IModmail>("Modmail", ModmailSchema);
