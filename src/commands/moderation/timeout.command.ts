import timeoutModel from "@/models/timeout.model";
import type { SlashCommand } from "@/types/commands";
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
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("duration")
        .setDescription("Duration of the timeout. 1m - 14d")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("The reason for the unban")
        .setRequired(true),
    ),
  async execute(interaction: CommandInteraction) {
    // Fetch the user to timeout
    const member = interaction.options.getMember("user") as GuildMember;

    const reason = interaction.options.get("reason", true).value as string;

    const duration = ms(
      interaction.options.get("duration", true).value as string,
    );

    // Fetch the user who timed out the user
    const actionBy = {
      username: interaction.user.username,
      userId: interaction.user.id,
    };

    // Fetch the server id
    const serverId = interaction.guildId;

    // Timeout the user
    await member.timeout(duration, reason);
    await member.send(
      `You have been timed out in ${interaction.guild?.name} for: ${reason}`,
    );

    // Create a timeout record
    await timeoutModel.create({
      userId: member.id,
      serverId,
      actionBy,
      reason,
      duration,
    });

    await interaction.reply(
      `User ${member.user.username} has been timed out for ${ms(duration)} with reason: ${reason}`,
    );
    await interaction.reply("Timeout given!");
  },
};
