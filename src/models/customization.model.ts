import type { ICustomization } from "@/types/models";
import { Schema, model } from "mongoose";

const CustomizationSchema = new Schema<ICustomization>(
  {
    guildId: {
      type: String,
      required: [true, "Guild ID is required"],
      unique: true,
    },
    message: {
      type: Object,
      required: [true, "Message is required"],
    },
    commandId: {
      type: String,
      required: [true, "Command ID is required"],
    },
    variables: {
      type: [String],
      required: [true, "Variables are required"],
    },
  },
  { timestamps: true }
);

export default model<ICustomization>("Customization", CustomizationSchema);