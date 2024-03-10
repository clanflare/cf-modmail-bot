import { moderation } from "@/action";
import type { SlashCommand } from "@/types/commands";
import { SlashCommandBuilder, type CommandInteraction } from "discord.js";

export const warn: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Warn an user.")
    .setDefaultMemberPermissions(0)
    .setDMPermission(false)
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to warn")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("The reason for the warn")
        .setRequired(true)
    ),
  async execute(interaction: CommandInteraction) {
    // Fetch the user to warn
    const user = interaction.options.getUser("user", true);

    // Fetch the reason for the warn
    const reason = interaction.options.get("reason", true).value as string;

    // Fetch the user who warned the user
    const actionBy = {
      username: interaction.user.username,
      userId: interaction.user.id,
    };

    // Fetch the guild id
    if (!interaction.guild) {
      await interaction.reply("This command can only be used in a guild.");
      return;
    }

    // Warn the user
    const warn = await moderation.warn({
      user,
      reason,
      actionBy,
      guild: interaction.guild,
    });

    // Reply to the interaction
    await interaction.reply(`Warned ${user.username} for: ${warn.reason}`);
  },
};
