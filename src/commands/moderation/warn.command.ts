import warnModel from "@/models/warn.model";
import type { SlashCommand } from "@/types/comands";
import { SlashCommandBuilder } from "@discordjs/builders";
import type { CommandInteraction } from "discord.js";

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
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("The reason for the warn")
        .setRequired(true),
    ),
  async execute(interaction: CommandInteraction) {
    // Fetch the user to warn
    const user = interaction.options.getUser("user");
    if (!user) {
      await interaction.reply("User not found.");
      return;
    }

    // Fetch the reason for the warn
    const reason = interaction.options.get("reason")?.value;
    if (!reason) {
      await interaction.reply("Reason not found.");
      return;
    }

    // Fetch the user who warned the user
    const actionBy = {
      username: interaction.user.username,
      userId: interaction.user.id,
    };

    // Fetch the server id
    const serverId = interaction.guildId;

    // Warn the user
    // ToDo: Has to be implemented with IMessage with customization options
    user.send(
      `You have been warned in ${interaction.guild?.name} for: ${reason}`,
    );

    // Create a warn record
    const warn = await warnModel.create({
      serverId,
      userId: user.id,
      reason,
      actionBy,
    });

    // Reply to the interaction
    await interaction.reply(`Warned ${user.username} for: ${warn.reason}`);
  },
};
