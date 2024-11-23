import Moderation from "@/action/moderation";
import type { SlashCommand } from "@/types/commands";
import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";

const choices = [
  { name: "all", value: "all" },
  { name: "warn", value: "warn" },
  { name: "timeout", value: "timeout" },
  { name: "ban", value: "ban" },
  { name: "unban", value: "unban" },
];

export const modlogs: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("modlogs")
    .setDescription("Get the modlogs of an user.")
    .setDefaultMemberPermissions(0)
    .setContexts(0)
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to get the modlogs of.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("The type of modlogs to get. Defaults to all.")
        .setChoices(...choices)
        .setRequired(false)
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    // Fetch the user to modlogs
    const user = interaction.options.getUser("user", true);

    // Fetch the type of modlogs
    const type = (interaction.options.get("type")?.value as string) || "all";

    // Fetch the duration of the modlogs
    const duration = interaction.options.get("duration")?.value as string;

    // Check if the command is being used in a guild
    if (!interaction.guild) {
      await interaction.reply("This command can only be used in a guild.");
      return;
    }

    // Send message for loading
    await interaction.reply("Processing...");
    const moderation = new Moderation(interaction.client)

    // Fetch the modlogs
    const modlogs = await moderation.modlogs({
      user: user.id,
      type,
      guild: interaction.guild,
    });
    if (!modlogs.length) {
      await interaction.editReply("No modlogs found for this user.");
      return;
    }
    const modlogsEmbed = {
      title: `Modlogs for ${user.tag} - ${user.id}`,
      description: modlogs
        .map((log) => {
          return `\n\n\n**Type:** ${log.type}\n**Reason:** ${log.reason
            }\n**Date:** ${new Date(
              String(log.createdAt)
            ).toLocaleString()}\n**Action by:** <@${log.actionBy.userId}>`;
        })
        .toString(),
    };

    // Reply to the interaction
    await interaction.editReply({
      content: "",
      embeds: [modlogsEmbed],
    });
  },
};
