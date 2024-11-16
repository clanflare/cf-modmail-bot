import type {Document, SchemaTimestampsConfig} from "mongoose";

export type DiscordEmbed = {
  title?: string; // 256 character limit
  description?: string; // 4096 character limit
  url?: string; // url validation
  timestamp?: string; // ISO8601 timestamp
  color?: number; // 0x000000 - 0xFFFFFF
  footer?: {
    text: string; // 2048 character limit
    iconURL?: string; // url validation
    proxyIconUrl?: string; // url validation
  };
  image?: {
    url: string; // url validation
    height?: number;
    proxyURL?: string; // url validation
    width?: number;
  };
  thumbnail?: {
    url: string; // url validation
    height?: number;
    proxyURL?: string; // url validation
    width?: number;
  };
  video?: {
    url: string; // url validation
    height?: number;
    proxyURL?: string; // url validation
    width?: number;
  };
  provider?: {
    name?: string; // 256 character limit
    url?: string; // url validation
  };
  author?: {
    name: string; // 256 character limit
    url?: string; // url validation
    iconURL?: string; // url validation
    proxyIconUrl?: string; // url validation
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

export interface IDiscordEmbed extends Document, SchemaTimestampsConfig, DiscordEmbed {
}
