import type {SlashCommand} from "@/types/commands";
import {moderation} from "@/action";
import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
} from "discord.js";
import ms from "ms";

export const timeout: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Timeout an user.")
    .setDefaultMemberPermissions(0)
    .setContexts(0)
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to timeout.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("duration")
        .setDescription("Duration of the timeout. 1m - 14d")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("The reason for the timeout.")
        .setRequired(true)
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    // Fetch the user to timeout
    const user = interaction.options.getUser("user", true);

    // Check if the user and actionBy are the same
    if (user.id === interaction.user.id) {
      await interaction.reply("You cannot timeout yourself.");
      return;
    }

    // Fetch the guild
    const guild = interaction.guild;

    // Check if the command is being used in a guild
    if (!guild) {
      await interaction.reply("This command can only be used in a guild.");
      return;
    }

    // Fetch the reason for the timeout
    const reason = interaction.options.get("reason", true).value as string;

    // Fetch the duration of the timeout
    const duration = interaction.options.get("duration", true).value as string;

    // Fetch the user who timed out the user
    const actionBy = {
      username: interaction.user.username,
      userId: interaction.user.id,
    };

    // Send message for loading
    await interaction.reply("Processing...");

    // Timeout the user
    const timeout = await moderation.timeout({
      user,
      reason,
      duration,
      actionBy,
      guild,
    });

    await interaction.editReply(
      `User ${user.username} has been timed out for ${ms(timeout.duration, {
        long: true,
      })} with reason: ${reason}`
    );
  },
};
