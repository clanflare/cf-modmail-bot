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
    userChannelId: {
      type: String,
      required: [true, "User Channel ID is required"],
    },
    modmailChannelId: {
      type: String,
      required: [true, "Modmail Channel ID is required"],
    },
    interactiveMessageId:{
      type: String,
      required: [true, "interactiveMessageId is required"]
    }
  },
  { timestamps: true }
);

export default model<IModmail>("Modmail", ModmailSchema);
