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

const LEADERBOARD_PAGE_SIZE = 10; // Number of users per page

export const leaderboard: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("View the drop leaderboard.")
    .setContexts(0)
    .setDefaultMemberPermissions(0),

  async execute(interaction: ChatInputCommandInteraction) {
    const guild = interaction.guild;
    if (!guild) {
      await interaction.reply("This command can only be used in a server.");
      return;
    }

    await interaction.deferReply(); // Defer the reply to avoid timeout

    // Fetch leaderboard data from the database
    const users = await DropLeaderboard.find({ guildId: interaction.guild.id })
      .sort({ points: -1 }) // Sort by points descending
      .lean(); // Fetch plain objects

    if (users.length === 0) {
      await interaction.editReply("The leaderboard is currently empty.");
      return;
    }

    let currentPage = 0;
    const totalPages = Math.ceil(users.length / LEADERBOARD_PAGE_SIZE);

    const generateEmbed = (page: number) => {
      const start = page * LEADERBOARD_PAGE_SIZE;
      const end = start + LEADERBOARD_PAGE_SIZE;
      const leaderboardSlice = users.slice(start, end);

      return new EmbedBuilder()
        .setTitle("🏆 Drop Leaderboard 🏆")
        .setDescription(
          leaderboardSlice
            .map(
              (user, index) =>
                `${start + index + 1}. <@${user.userId}> (${user.userId}) - **${
                  user.points
                }** points`
            )
            .join("\n")
        )
        .setFooter({ text: `Page ${page + 1} of ${totalPages}` })
        .setTimestamp();
    };

    const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("prev")
        .setLabel("Previous")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(currentPage === 0),
      new ButtonBuilder()
        .setCustomId("next")
        .setLabel("Next")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(currentPage === totalPages - 1)
    );

    const message = await interaction.editReply({
      embeds: [generateEmbed(currentPage)],
      components: [buttons],
    });

    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 60_000, // 1 minute
    });

    collector.on("collect", async (buttonInteraction) => {
      if (buttonInteraction.user.id !== interaction.user.id) {
        await buttonInteraction.reply({
          content: "You cannot interact with these buttons.",
          ephemeral: true,
        });
        return;
      }

      if (buttonInteraction.customId === "prev" && currentPage > 0) {
        currentPage--;
      } else if (
        buttonInteraction.customId === "next" &&
        currentPage < totalPages - 1
      ) {
        currentPage++;
      }

      await buttonInteraction.update({
        embeds: [generateEmbed(currentPage)],
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
              .setCustomId("prev")
              .setLabel("Previous")
              .setStyle(ButtonStyle.Primary)
              .setDisabled(currentPage === 0),
            new ButtonBuilder()
              .setCustomId("next")
              .setLabel("Next")
              .setStyle(ButtonStyle.Primary)
              .setDisabled(currentPage === totalPages - 1)
          ),
        ],
      });
    });

    collector.on("end", async () => {
      await interaction.editReply({
        components: [],
      });
    });
  },
};
