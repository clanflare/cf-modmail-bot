import type { SlashCommand } from "@/types/commands";
import { SlashCommandBuilder, type ChatInputCommandInteraction, PermissionOverwrites } from "discord.js";

export const copychan: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("copychan")
    .setDescription("Copy the permissions from one channel to multiple channels.")
    .addChannelOption((option) =>
      option
        .setName("copyfrom")
        .setDescription("Select the channel to copy permissions from.")
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName("copyto")
        .setDescription("Select a channel to copy permissions to.")
        .setRequired(false)
    )
    .addChannelOption((option) =>
      option
        .setName("copyto1")
        .setDescription("Select another channel to copy permissions to.")
        .setRequired(false)
    )
    .addChannelOption((option) =>
      option
        .setName("copyto2")
        .setDescription("Select another channel to copy permissions to.")
        .setRequired(false)
    )
    .addChannelOption((option) =>
      option
        .setName("copyto3")
        .setDescription("Select another channel to copy permissions to.")
        .setRequired(false)
    )
    .addChannelOption((option) =>
      option
        .setName("copyto4")
        .setDescription("Select another channel to copy permissions to.")
        .setRequired(false)
    )
    .addChannelOption((option) =>
      option
        .setName("copyto5")
        .setDescription("Select another channel to copy permissions to.")
        .setRequired(false)
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const copyFrom = interaction.options.getChannel("copyfrom");
    const copyToChannels = [
      interaction.options.getChannel("copyto"),
      interaction.options.getChannel("copyto1"),
      interaction.options.getChannel("copyto2"),
      interaction.options.getChannel("copyto3"),
      interaction.options.getChannel("copyto4"),
      interaction.options.getChannel("copyto5"),
    ].filter((channel) => channel !== null); // Filter out null options

    if (!copyFrom || !("permissionOverwrites" in copyFrom)) {
      await interaction.reply({ content: "Invalid source channel or channel does not support permissions.", ephemeral: true });
      return;
    }

    const permissions = copyFrom.permissionOverwrites.cache;
    for (const channel of copyToChannels) {
      // Skip channels that don't support permission overwrites
      if (!channel || !("permissionOverwrites" in channel)) {
        console.warn(`Skipping ${channel?.name} as it does not support permission overwrites.`);
        continue;
      }

      for (const overwrite of permissions.values()) {
        try {
          await channel.permissionOverwrites.edit(overwrite.id, {
            allow: overwrite.allow,
            deny: overwrite.deny,
            type: overwrite.type,
          });
        } catch (error) {
          console.warn(`Failed to copy a specific permission to ${channel.name}:`, error);
        }
      }
    }

    await interaction.reply({ content: "Permissions copied successfully, with any incompatible permissions skipped.", ephemeral: true });
  },
};