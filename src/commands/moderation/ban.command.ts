import { moderation } from "@/action";
import type { SlashCommand } from "@/types/commands";
import { SlashCommandBuilder, type CommandInteraction } from "discord.js";
import ms from "ms";

export const ban: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban an user.")
    .setDefaultMemberPermissions(0)
    .setDMPermission(false)
    .addUserOption((option) =>
      option.setName("user").setDescription("The user to ban").setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("The reason for the ban")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("duration")
        .setDescription("The duration of the ban. 0 for permanent.")
        .setRequired(false)
    ),
  async execute(interaction: CommandInteraction) {
    // Fetch the user to ban
    const user = interaction.options.getUser("user", true);

    // Fetch the reason for the ban
    const reason = interaction.options.get("reason", true).value as string;

    // Fetch the duration of the ban
    const duration = interaction.options.get("duration")?.value as string;

    // Fetch the user who banned the user
    const actionBy = {
      username: interaction.user.username,
      userId: interaction.user.id,
    };

    // Check if the command is being used in a guild
    if (!interaction.guild) {
      await interaction.reply("This command can only be used in a guild.");
      return;
    }

    // Send message for loading
    await interaction.reply("Processing...");

    // Ban the user
    const ban = await moderation.ban({
      user: user.id,
      reason,
      duration,
      actionBy,
      guild: interaction.guild,
    });

    // Notify the moderator about the ban
    await interaction.editReply({
      content: `Banned ${user.username} <@${user.id}>\nReason: ${
        ban.reason
      }\nDuration: ${
        ban.duration === 0
          ? "Permanent"
          : `for ${ms(ban.duration, { long: true })}`
      }`,
    });
  },
};
