import type { Message } from "discord.js";

export interface TextCommandMessage extends Message {
  args: string[] | any; // types of all argument parsers for all commands need to be made later
}

export type TextCommand = {
  name: string;
  aliases: string[];
  argumentParser: (message: Message) => Promise<Array<any>>;
  validator: (message: Message, args: any) => Promise<void>; //fix with different validators for all commands
  execute: (message: Message<true>, args: any) => Promise<void>; //fix with different executors for all commands
};
