import type { Document, SchemaTimestampsConfig } from "mongoose";
import type { SupportMessage } from ".";
import type { ButtonStyle } from "discord.js";

export type ModmailConfig = {
  guildId: string; // guild where the modmail was opened
  archiveChannelId: string; // guild channel Id for threads (archived chat)
  modmailCategoryId: string; // guild category Id for modmail
  aiSupport: boolean; // whether or not to use AI support
  initialMessage: MessageComponent; // initial message to send to users
};

export interface IModmailConfig
  extends Document,
    SchemaTimestampsConfig,
    ModmailConfig {}

export type MessageComponent = {
  message: SupportMessage;
  buttons: Button[]; // max 5
  // define max limit 5 in this type
};

export type Button = {
  label: string;
  linkedComponent: MessageComponent;
  emoji: string;
  style: ButtonStyle;
};
