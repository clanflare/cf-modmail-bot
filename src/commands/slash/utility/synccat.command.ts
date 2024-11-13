import type { SlashCommand } from "@/types/commands";
import { SlashCommandBuilder, type ChatInputCommandInteraction, PermissionOverwrites, ChannelType, CategoryChannel } from "discord.js";

export const synccat: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("synccat")
    .setDescription("Copy the permissions from one channel to multiple channels.")
    .addChannelOption((option) =>
      option
        .setName("syncat")
        .setDescription("Select the channel to copy permissions from.")
        .setRequired(true)
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const category = interaction.options.getChannel("syncat") as CategoryChannel;

    if (category?.type !== ChannelType.GuildCategory){
      await interaction.reply("Please enter a category.")
      return }
    
    await Promise.all(category.children.cache.map(
      chan => chan.lockPermissions()
    ))
    await interaction.reply({ content: "Permissions synced for all child channels", ephemeral: true });
  },
};