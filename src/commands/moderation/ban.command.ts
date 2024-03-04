import banModel from "@/models/ban.model";
import type { SlashCommand } from "@/types/commands";
import { type CommandInteraction, SlashCommandBuilder } from "discord.js";

export const ban: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban an user.")
    .setDefaultMemberPermissions(0)
    .setDMPermission(false)
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to ban")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("The reason for the ban")
        .setRequired(true),
    )
    .addIntegerOption((option) =>
      option
        .setName("duration")
        .setDescription("The duration of the ban in minutes. 0 for permanent.")
        .setRequired(false),
    ),
  async execute(interaction: CommandInteraction) {
    // Fetch the user to ban
    const user = interaction.options.getUser("user", true);

    // Fetch the reason for the ban
    const reason = interaction.options.get("reason", true).value as string;

    // Fetch the duration of the ban
    const duration = interaction.options.get("duration") || 0;

    // Fetch the user who banned the user
    const actionBy = {
      username: interaction.user.username,
      userId: interaction.user.id,
    };

    // Check if the command is being used in a server
    if (!interaction.guild) {
      await interaction.reply("This command can only be used in a server.");
      return;
    }

    // Fetch the server id
    const serverId = interaction.guildId;

    try {
      // ToDo: Has to be implemented with IMessage with customization options
      // Notify the user via DM before banning
      try {
        await user.send(
          `You have been banned from ${interaction.guild.name} for: ${reason}`,
        );
      } catch (dmError) {
        console.warn(`Failed to send DM to user ${user.id}: ${dmError}`);
        // Optionally, handle or log the error. Failure to send a DM should not prevent the ban.
      }

      // Perform the ban
      await interaction.guild.members.ban(user.id, { reason });

      // Create a ban record
      const ban = await banModel.create({
        serverId,
        userId: user.id,
        duration,
        reason,
        actionBy,
      });

      // Reply to the interaction
      await interaction.reply({
        content: `Banned ${user.username} for ${reason} ${duration === 0 ? "permanently" : `for ${duration} minutes`}!`,
        ephemeral: true, // Only the user who used the command can see this reply
      });
    } catch (error) {
      await interaction.reply(
        "An error occurred while trying to ban the user.",
      );
    }
  },
};
