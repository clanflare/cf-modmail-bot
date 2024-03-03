import type { SlashCommand } from "@/types/comands";
import { SlashCommandBuilder } from "@discordjs/builders";
import type { CommandInteraction } from "discord.js";

export const ban: SlashCommand = {
  data: new SlashCommandBuilder().setName("ban").setDescription("Ban a user."),
  async execute(interaction: CommandInteraction) {
    console.log("ban command executed");
    await interaction.reply("Banned!");
  },
};
