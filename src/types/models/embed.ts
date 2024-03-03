import type { Document, SchemaTimestampsConfig } from "mongoose";

export type IEmbed = Document &
  SchemaTimestampsConfig & {
    title?: string; // 256 character limit
    description?: string; // 4096 character limit
    url?: string; // url validation
    timestamp?: string; // ISO8601 timestamp
    color?: number; // 0x000000 - 0xFFFFFF
    footer?: {
      text: string; // 2048 character limit
      iconURL?: string; // url validation
    };
    image?: {
      url: string; // url validation
    };
    thumbnail?: {
      url: string; // url validation
    };
    video?: {
      url: string; // url validation
    };
    provider?: {
      name: string; // 256 character limit
      url: string; // url validation
    };
    author?: {
      name: string; // 256 character limit
      url: string; // url validation
      iconURL: string; // url validation
    };
    fields?: {
      name: string; // 256 character limit
      value: string; // 1024 character limit
      inline?: boolean;
    }[]; // 25 max fields
  };
/**
 * Additional Notes:
 * - The combined sum of all characters in the title, description, footer.text, author.name, fields.name, and fields.value must be less than or equal to 6000 characters.
 */
