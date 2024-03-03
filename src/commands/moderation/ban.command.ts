import banModel from "@/models/ban.model";
import type { SlashCommand } from "@/types/comands";
import { SlashCommandBuilder } from "@discordjs/builders";
import type { CommandInteraction } from "discord.js";

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
    try {
      // Fetch the user to ban
      const user = interaction.options.getUser("user");
      if (!user) {
        await interaction.reply("User not found.");
        return;
      }

      // Fetch the reason for the ban
      const reason = interaction.options.get("reason")?.value;
      if (!reason) {
        await interaction.reply("Reason not found.");
        return;
      }

      // Fetch the duration of the ban
      const duration = interaction.options.get("duration")?.value;

      // Fetch the user who banned the user
      const actionBy = {
        username: interaction.user.username,
        userId: interaction.user.id,
      };

      // Fetch the server id
      const serverId = interaction.guildId;

      // ToDo: Has to be implemented with IMessage with customization options
      await user.send(
        `You have been banned in ${interaction.guild?.name} for: ${reason}`,
      );

      // Ban the user
      interaction.guild?.members.ban(user.id);

      // Create a ban record
      const ban = await banModel.create({
        serverId,
        userId: user.id,
        duration: duration || 0,
        reason: reason,
        actionBy,
      });

      // Reply to the interaction
      await interaction.reply(
        `Banned ${user.username} for ${ban.reason} ${
          ban.duration === 0 ? "permanently" : `for ${ban.duration} minutes`
        }!`,
      );
    } catch (error) {
      await interaction.reply(
        "An error occurred while trying to ban the user.",
      );
    }
  },
};
