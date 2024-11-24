import type { SlashCommand } from "@/types/commands";
import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";

export const ping: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!")
    .setDefaultMemberPermissions(0)
    .setContexts(0),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply("Pong!");
  },
};
