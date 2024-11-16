import type { IModmail } from "@/types/models";
import { Schema, model } from "mongoose";

const ModmailMessageSchema = new Schema(
  {
    author: {
      discordUserId: {
        type: String,
        required: [true, "Author's Discord User ID is required"],
      },
      discordUsername: {
        type: String,
        required: [true, "Author's Discord Username is required"],
      },
    },
    message: {
      type: Schema.Types.ObjectId, // Referencing the Message model
      ref: "DMessage",
      required: [true, "Message content is required"],
    },
  },
  { _id: false } // Prevents creating a unique ID for each embedded message
);

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
      enum: ["open", "resolved", "closed", "errored"],
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
    },
    messages: {
      type: [ModmailMessageSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export default model<IModmail>("Modmail", ModmailSchema);
