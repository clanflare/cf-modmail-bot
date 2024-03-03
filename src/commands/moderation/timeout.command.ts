import timeoutModel from "@/models/timeout.model";
import type { SlashCommand } from "@/types/comands";
import { SlashCommandBuilder } from "@discordjs/builders";
import type { CommandInteraction } from "discord.js";

export const timeout: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Timeout an user.")
    .setDefaultMemberPermissions(0)
    .setDMPermission(false)
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to timeout")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("The reason for the timeout")
        .setRequired(true),
    )
    .addIntegerOption((option) =>
      option
        .setName("time")
        .setDescription("The time for the timeout in minutes")
        .setRequired(true),
    ),
  async execute(interaction: CommandInteraction) {
    // Fetch the user to timeout
    const user = interaction.options.getUser("user");
    if (!user) {
      await interaction.reply("User not found.");
      return;
    }

    // Fetch the reason for the timeout
    const reason = interaction.options.get("reason")?.value as string;
    if (!reason) {
      await interaction.reply("Reason not found.");
      return;
    }

    // Fetch the time for the timeout
    const time = interaction.options.get("time")?.value as number;
    if (!time) {
      await interaction.reply("Time not found.");
      return;
    }

    // Fetch the user who timed out the user
    const actionBy = {
      username: interaction.user.username,
      userId: interaction.user.id,
    };

    // Fetch the server id
    const serverId = interaction.guildId;

    // Timeout the user
    const timeout = await timeoutModel.create({
      serverId,
      userId: user.id,
      reason: reason.value,
      actionBy,
      time: time.value,
    });
  },
};
