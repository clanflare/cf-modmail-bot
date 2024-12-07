import type { IDiscordMessage } from "@/types/models";
import { isURLValid } from "@/utils/stringValidators.utils";
import { Schema, model } from "mongoose";

const DiscordMessageSchema = new Schema<IDiscordMessage>(
  {
    discordMessageId: {
      type: String,
      required: [true, "Message ID is required"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      maxlength: [2000, "Content exceeds the maximum limit of 2000 characters"],
    },
    attachments: {
      type: [String],
      default: [],
      validate: {
        validator: (attachments: string[]) => attachments.every(isURLValid),
        message: "Please provide valid URLs for attachments",
      },
    },
    sticker: {
      type: String,
      validate: {
        validator: isURLValid,
        message: "Please provide valid URL for sticker",
      },
    },
    embeds: {
      type: [Schema.Types.ObjectId],
      ref: "Embed",
      default: [],
      validate: {
        validator: (embeds: Schema.Types.ObjectId[]) => embeds.length <= 10,
        message: "A maximum of 10 embeds is allowed",
      },
    },
    authorId: {
      type: String,
      required: [true, "Author ID is required"],
    },
    channelId: {
      type: String,
      required: [true, "Channel ID is required"],
    },
    guildId: {
      type: String,
      default: null,
    },
    reactions: {
      type: Map,
      of: Number,
      default: new Map(),
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    replyToMessageId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export default model<IDiscordMessage>("DiscordMessage", DiscordMessageSchema);
