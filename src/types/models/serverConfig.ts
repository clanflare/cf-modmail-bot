import type { Document, SchemaTimestampsConfig } from "mongoose";
import type { ISupportMessage } from ".";

export type IServerConfig = Document &
  SchemaTimestampsConfig & {
    serverId: string; // server where the modmail was opened
    archiveChannelId: string; // server channel Id for threads (archived chat)
    modmailCategoryId: string; // server category Id for modmail
    aiSupport: boolean; // whether or not to use AI support
    initialMessage: IBotComponent; // initial message to send to users
  };

export type IBotComponent = {
  message: ISupportMessage;
  buttons: IButton[]; // max 5
  // define max limit 5 in this type
};

export type IButton = {
  label: string;
  linkedComponent: IBotComponent;
  emoji: string;
  style: string;
};
