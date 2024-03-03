import type { IBotComponent, IModmailConfig } from "@/types/models";
import { Schema, model } from "mongoose";


const botComponentValidator = (v: IBotComponent) => {
  if (!v.message || !v.buttons || v.buttons.length > 5) return false;
  if(v.buttons.length > 0){
    for (const button of v.buttons) {
      if (!button.label || !button.linkedComponent ) return false;
      if(!botComponentValidator(button.linkedComponent)) return false;
    }
  }
  return true;
}

const ModmailConfigSchema = new Schema<IModmailConfig>(
  {
    serverId: {
      type: String,
      required: [true, "Server ID is required"],
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
      required: [true, "Initial Message is required"],
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

