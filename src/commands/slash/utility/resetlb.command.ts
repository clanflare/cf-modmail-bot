import type { SlashCommand } from "@/types/commands";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentType,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import DropLeaderboard from "@/models/dropLeaderboard.model.ts"; // Mongoose model

export const resetlb: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("resetlb")
    .setDescription("Resets the drop leaderboard")
    .setDefaultMemberPermissions(0)
    .setContexts(0),
  async execute(interaction: ChatInputCommandInteraction) {
    const guildId = interaction.guild?.id;
    if (!guildId) {
      interaction.reply({
        content: "This command can only be used in a guild.",
        ephemeral: true,
      });
      return;
    }

    // Create confirmation buttons
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("confirm_reset")
        .setLabel("Yes, reset leaderboard")
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId("cancel_reset")
        .setLabel("Cancel")
        .setStyle(ButtonStyle.Secondary)
    );

    // Send confirmation message
    const message = await interaction.reply({
      content:
        "⚠️ **Are you sure you want to reset the entire leaderboard?** This action is irreversible.",
      components: [row],
      ephemeral: true,
    });

    // Create a message collector to handle button interactions
    const filter = (i: any) =>
      i.user.id === interaction.user.id &&
      ["confirm_reset", "cancel_reset"].includes(i.customId);

    const collector = message.createMessageComponentCollector({
      filter,
      componentType: ComponentType.Button,
      time: 15000, // 15 seconds
    });

    collector.on("collect", async (btnInteraction) => {
      if (btnInteraction.customId === "confirm_reset") {
        try {
          // Delete all entries from the database
          await DropLeaderboard.deleteMany({ guildId });
          await btnInteraction.update({
            content: "✅ The leaderboard has been successfully reset.",
            components: [],
          });
        } catch (error) {
          console.error("Error resetting leaderboard:", error);
          await btnInteraction.update({
            content: "❌ An error occurred while resetting the leaderboard.",
            components: [],
          });
        }
      } else if (btnInteraction.customId === "cancel_reset") {
        await btnInteraction.update({
          content: "❌ Leaderboard reset has been cancelled.",
          components: [],
        });
      }
      collector.stop();
    });

    collector.on("end", async (collected, reason) => {
      if (reason === "time") {
        await interaction.editReply({
          content: "⏳ The leaderboard reset confirmation has timed out.",
          components: [],
        });
      }
    });
  },
};
