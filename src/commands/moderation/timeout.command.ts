import type { SlashCommand } from "@/types/comands";
import { SlashCommandBuilder } from "@discordjs/builders";
import type { CommandInteraction } from "discord.js";

export const timeout: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Timeout an user."),
  async execute(interaction: CommandInteraction) {
    console.log("timeout command executed");
    await interaction.reply("Timeout given!");
  },
};
