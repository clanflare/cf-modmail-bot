import { moderation } from "@/action";
import type { SlashCommand } from "@/types/commands";
import { CustomDiscordError } from "@/types/errors";
import { SlashCommandBuilder, type CommandInteraction } from "discord.js";

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
    try {
      // Fetch the user to unban
      const user = interaction.options.getUser("user", true);

      // Fetch the reason for the unban
      const reason = interaction.options.get("reason", true).value as string;

      // Fetch the user who unbanned the user
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
      const serverId = interaction.guild.id;

      // Unban the user
      const unban = await moderation.unban({
        user: user.id,
        reason,
        actionBy,
        serverId,
      });

      await interaction.reply(
        `Unbanned ${user.username} for: ${unban.reason}.\nUser ${user.username} is not in any mutual servers with the bot.`,
      );
    } catch (err) {
      if (err instanceof CustomDiscordError) {
        await interaction.reply(err.message);
        return;
      }
      console.error(err);
      await interaction.reply("Failed to unban the user.");
      return;
    }
  },
};
