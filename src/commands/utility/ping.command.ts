import type { SlashCommand } from "types/comands";
import { SlashCommandBuilder } from "@discordjs/builders";
import type { CommandInteraction } from "discord.js";

export const ping: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!"),
  async execute(interaction: CommandInteraction) {
    await interaction.reply("Pong!");
  },
};
