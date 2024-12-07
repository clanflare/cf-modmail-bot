import type {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
} from "discord.js";

// export type OptionalCommandBuilder = Omit<
//   SlashCommandBuilder,
//   "addSubcommand" | "addSubcommandGroup"
// >;

export type SlashCommand = {
  data: SlashCommandOptionsOnlyBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
  id?: string;
};
