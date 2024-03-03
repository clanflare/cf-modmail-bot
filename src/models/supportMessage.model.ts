import type { IEmbed, ISupportMessage } from "@/types/models";
import { isURLValid } from "@/utils/stringValidators.utils";
import { Schema, model } from "mongoose";

const SupportMessageSchema = new Schema<ISupportMessage>(
  {
    content: {
      type: String,
      required: [true, "Content is required"],
      minlength: 1,
      maxlength: 2000,
    },
    attachments: {
      type: [String],
      default: [],
      validate: {
        validator: (v: string) => isURLValid(v),
        message: "Please provide valid URLs for attachments",
      },
    },
    embeds: {
      type: [Schema.Types.ObjectId],
      ref: "Embed",
      default: [],
      validate: {
        validator: (v: string) => v.length <= 10, // Max 10 fields
        message: "A maximum of 10 embeds is allowed",
      },
    },
  },
  { timestamps: true },
);

export default model<ISupportMessage>("SupportMessage", SupportMessageSchema);
