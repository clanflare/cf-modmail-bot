import type { SlashCommand } from "@/types/commands";
import { SlashCommandBuilder, type CommandInteraction } from "discord.js";

export const ping: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!"),
  async execute(interaction: CommandInteraction) {
    await interaction.reply("Pong!");
  },
};
