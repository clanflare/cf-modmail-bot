import type { SlashCommand } from "@/types/commands";
import { Collection } from "discord.js";
import * as moderation from "./moderation";
import * as utility from "./utility";

export default function createSlashCommands(): Collection<
  string,
  SlashCommand
> {
  const collection = new Collection<string, SlashCommand>();

  const commands = { ...moderation, ...utility };
  for (const [key, command] of Object.entries(commands)) {
    const commandCopy = { ...command };
    collection.set(commandCopy.data.name, commandCopy);
  }

  return collection;
}
