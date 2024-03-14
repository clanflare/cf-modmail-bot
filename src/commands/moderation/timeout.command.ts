import type { SlashCommand } from "@/types/commands";
import { moderation } from "@/action";
import { timeoutService } from "@/services";
import {
  SlashCommandBuilder,
  type CommandInteraction,
  type GuildMember,
} from "discord.js";
import ms from "ms";

export const timeout: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Timeout an user.")
    .setDefaultMemberPermissions(0)
    .setDMPermission(false)
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
        .setDescription("The reason for the unban")
        .setRequired(true)
    ),
  async execute(interaction: CommandInteraction) {
    // Fetch the user to timeout
    const user = interaction.options.getUser("user", true);

    // Check if the user and actionBy are the same
    if (user.id === interaction.user.id) {
      await interaction.reply("You cannot timeout yourself.");
      return;
    }

    // Fetch the guild
    const guild = interaction.guild;

    if (!guild) {
      await interaction.reply("This command can only be used in a guild.");
      return;
    }

    const reason = interaction.options.get("reason", true).value as string;

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
