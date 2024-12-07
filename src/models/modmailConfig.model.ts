import type { MessageComponent, IModmailConfig } from "@/types/models";
import { Schema, model } from "mongoose";

const botComponentValidator = (v: MessageComponent) => {
  // validation should be improved here as the initial message is not validated to be a valid component
  if (v.buttons && v.buttons.length > 0) {
    if (v.buttons.length > 5) return false;
    for (const button of v.buttons) {
      if (!button.label || !button.linkedComponent) return false;
      if (!botComponentValidator(button.linkedComponent)) return false;
    }
  }
  return !!v.message;
};

const ModmailConfigSchema = new Schema<IModmailConfig>(
  {
    guildId: {
      type: String,
      required: [true, "Guild ID is required"],
      unique: true,
    },
    archiveChannelId: {
      type: String,
      required: [true, "Archive Channel ID is required"],
      unique: true,
    },
    modmailCategoryId: {
      type: String,
      required: [true, "Modmail Category ID is required"],
      unique: true,
    },
    aiSupport: {
      type: Boolean,
      default: false,
    },
    initialMessage: {
      type: Object,
      validate: {
        validator: botComponentValidator,
        message: "Invalid initial message",
      },
    },
  },
  { timestamps: true }
);

export default model<IModmailConfig>("ModmailConfig", ModmailConfigSchema);
