import { JWT_SECRET, FRONTEND_URL } from "@/config/config";
import type { SlashCommand } from "@/types/commands";
import jwt from "jsonwebtoken";
import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
} from "discord.js";
import modmailConfigModel from "@/models/modmailConfig.model";

export const modmailconfig: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("modmailconfig")
    .setDescription("Setup the modmail config.")
    .addChannelOption((option) =>
      option
        .setName("modmailcategory")
        .setDescription("Select the modmail category.")
    )
    .addChannelOption((option) =>
      option
        .setName("archivechannel")
        .setDescription("Select the archive channel.")
    )
    .setDefaultMemberPermissions(0)
    .setContexts(0),
  async execute(interaction: ChatInputCommandInteraction) {
    // Fetch the guild of the interaction
    const guild = interaction.guild;

    // Fetch the guild id
    if (!guild) {
      await interaction.reply("This command can only be used in a guild.");
      return;
    }

    // Fetch the user who ran the command
    const user = interaction.user;

    // Send message for loading , ephemeral true
    await interaction.reply({ content: "Processing...", ephemeral: true });

    // Get the modmail config for the guild
    const config = await modmailConfigModel.findOne({ guildId: guild.id });

    // In case of updating the modmail config
    const modmailCategory = interaction.options.get("modmailcategory")?.channel;
    const archiveChannel = interaction.options.get("archivechannel")?.channel;

    // Check if the modmail category and archive channel is provided
    if ((modmailCategory && archiveChannel) || !config) {
      // Check if the modmail category and archive channel is provided in case of !config = true
      if (!modmailCategory || !archiveChannel) {
        await interaction.editReply({
          content: "Please provide the modmail category and archive channel.",
        });
        return;
      }

      // Get the modmail category id
      const modmailCategoryId = interaction.options.get("modmailcategory", true)
        ?.channel?.id;

      // Get the archive channel id
      const archiveChannelId = interaction.options.get("archivechannel", true)
        ?.channel?.id;

      // Check if the modmail category and archive channel is provided
      if (!modmailCategoryId || !archiveChannelId) {
        await interaction.editReply({
          content: "Invalid modmail category or archive channel.",
        });
        return;
      }

      // Create the modmail config
      await modmailConfigModel.findOneAndUpdate(
        { guildId: guild.id },
        {
          guildId: guild.id,
          modmailCategoryId,
          archiveChannelId,
        },
        { upsert: true }
      );
    }

    // Create the jwt token expiring in 1 hour
    const token = jwt.sign(
      {
        guildId: guild.id,
        userId: user.id,
        expiresAt: Date.now() + 60 * 60 * 1000,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Send the token
    await interaction.editReply({
      content: `Click [here](${FRONTEND_URL}/auth/magic-link?token=${token}) to setup the modmail config.`,
    });
  },
};
