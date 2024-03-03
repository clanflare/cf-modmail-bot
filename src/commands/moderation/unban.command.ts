import banModel from "@/models/ban.model";
import unbanModel from "@/models/unban.model";
import type { SlashCommand } from "@/types/comands";
import { SlashCommandBuilder } from "@discordjs/builders";
import type { CommandInteraction } from "discord.js";

export const unban: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("unban")
    .setDescription("Unban an user.")
    .setDefaultMemberPermissions(0)
    .setDMPermission(false)
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to unban")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("The reason for the unban")
        .setRequired(true),
    ),
  async execute(interaction: CommandInteraction) {
    // Fetch the user to unban
    const user = interaction.options.getUser("user");
    if (!user) {
      await interaction.reply("User not found.");
      return;
    }

    // Fetch the reason for the unban
    const reason = interaction.options.get("reason")?.value;
    if (!reason) {
      await interaction.reply("Reason not found.");
      return;
    }

    // Fetch the user who unbanned the user
    const actionBy = {
      username: interaction.user.username,
      userId: interaction.user.id,
    };

    // Fetch the server id
    const serverId = interaction.guildId;

    // Check if the user is banned
    const bannedUser = await interaction.guild?.bans
      .fetch(user.id)
      .catch(() => null);

    if (!bannedUser) {
      await interaction.reply("User is not banned.");
      return;
    }

    // Unban the user
    interaction.guild?.members.unban(user.id, reason as string);

    // fetch last ban record of user.id
    const ban = await banModel
      .findOne({ userId: user.id })
      .sort({ createdAt: -1 });

    // Create an unban record
    const unban = await unbanModel.create({
      serverId,
      userId: user.id,
      reason,
      actionBy,
      ban,
    });

    await interaction.reply(
      `Unbanned ${user.username} for: ${unban.reason}.\nUser ${user.username} is not in any mutual servers with the bot.`,
    );
  },
};
