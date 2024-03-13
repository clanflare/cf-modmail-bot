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
    const member = interaction.options.getMember("user") as GuildMember;

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
      user: member,
      reason,
      duration,
      actionBy,
      guild: member.guild, // workaround for guild not being available in interaction because of cache thingy , look into it and the types
    });

    await interaction.editReply(
      `User ${member.user.username} has been timed out for ${ms(
        timeout.duration, {long: true}
      )} with reason: ${reason}`
    );
  },
};
