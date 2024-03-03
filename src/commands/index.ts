import type { SlashCommand } from "@/types/comands";
import { Collection } from "discord.js";
import * as moderation from "./moderation";
import * as utility from "./utility";

const collection = new Collection<string, SlashCommand>();

const commands = { ...moderation, ...utility };
for (const [key, value] of Object.entries(commands)) {
  collection.set(key, value);
}

export default collection;
