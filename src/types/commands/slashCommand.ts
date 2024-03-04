import type { CommandInteraction, SlashCommandBuilder } from "discord.js";

export type OptionalCommandBuilder = Omit<
  SlashCommandBuilder,
  "addSubcommand" | "addSubcommandGroup" | "_sharedAddOptionMethod"
>;

export type SlashCommand = {
  data: OptionalCommandBuilder;
  execute: (interaction: CommandInteraction) => Promise<void>;
};
