import type { IEmbed } from "@/types/models";
import { isISO8601Valid, isURLValid } from "@/utils/stringValidators.utils";
import { Schema, model } from "mongoose";

const EmbedSchema = new Schema(
  {
    title: {
      type: String,
      maxlength: 256,
    },
    description: {
      type: String,
      maxlength: 4096,
    },
    url: {
      type: String,
      validate: {
        validator: (v: string) => isURLValid(v),
        message: "Please provide a valid URL",
      },
    },
    timestamp: {
      type: String,
      validate: {
        validator: (v: string) => isISO8601Valid(v),
        message: "Please provide a valid ISO8601 timestamp",
      },
    },
    color: {
      type: Number,
      min: 0x000000,
      max: 0xffffff,
    },
    footer: {
      text: {
        type: String,
        maxlength: 2048,
      },
      iconURL: {
        type: String,
        validate: {
          validator: (v: string) => isURLValid(v),
          message: "Please provide a valid URL for iconURL",
        },
      },
    },
    image: {
      url: {
        type: String,
        validate: {
          validator: (v: string) => isURLValid(v),
          message: "Please provide a valid URL for image",
        },
      },
    },
    thumbnail: {
      url: {
        type: String,
        validate: {
          validator: (v: string) => isURLValid(v),
          message: "Please provide a valid URL for thumbnail",
        },
      },
    },
    video: {
      url: {
        type: String,
        validate: {
          validator: (v: string) => isURLValid(v),
          message: "Please provide a valid URL for video",
        },
      },
    },
    provider: {
      name: {
        type: String,
        maxlength: 256,
      },
      url: {
        type: String,
        validate: {
          validator: (v: string) => isURLValid(v),
          message: "Please provide a valid URL for provider",
        },
      },
    },
    author: {
      name: {
        type: String,
        maxlength: 256,
      },
      url: {
        type: String,
        validate: {
          validator: (v: string) => isURLValid(v),
          message: "Please provide a valid URL for author",
        },
      },
      iconURL: {
        type: String,
        validate: {
          validator: (v: string) => isURLValid(v),
          message: "Please provide a valid URL for iconURL",
        },
      },
    },
    fields: {
      type: [
        {
          name: {
            type: String,
            maxlength: 256,
          },
          value: {
            type: String,
            maxlength: 1024,
          },
          inline: {
            type: Boolean,
            default: false,
          },
        },
      ],
      validate: {
        validator: (v: string) => v.length <= 25, // Max 25 fields
        message: "A maximum of 25 fields is allowed",
      },
    },
  },
  { timestamps: true },
);

const fieldsToCheck = ["title", "description"];

const calculateFieldLength = (field: string | undefined): number =>
  typeof field === "string" ? field.length : 0;

// **Character Limit Validation (6000 total)**
EmbedSchema.pre<IEmbed>("validate", function (next) {
  let totalChars = 0;

  // Top-level fields
  for (const field of fieldsToCheck) {
    totalChars += calculateFieldLength(this[field as keyof IEmbed]);
  }

  // Fields array
  totalChars +=
    this.fields?.reduce((sum, field) => {
      return (
        sum +
        calculateFieldLength(field.name) +
        calculateFieldLength(field.value)
      );
    }, 0) || 0;

  // Footer and author
  totalChars += calculateFieldLength(this.footer?.text);
  totalChars += calculateFieldLength(this.author?.name);

  // Validation check
  if (totalChars > 6000) {
    this.invalidate(
      "Embed",
      "The combined character count of specified fields exceeds the limit of 6000",
    );
  } else {
    next();
  }
});

export default model<IEmbed>("Embed", EmbedSchema);
