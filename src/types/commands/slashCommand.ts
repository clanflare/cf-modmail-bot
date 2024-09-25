import type { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export type OptionalCommandBuilder = Omit<
  SlashCommandBuilder,
  "addSubcommand" | "addSubcommandGroup"
>;

export type SlashCommand = {
  data: OptionalCommandBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
  id?: string;
};
