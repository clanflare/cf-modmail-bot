import {moderation} from "@/action";
import type {SlashCommand} from "@/types/commands";
import {
  ActionRowBuilder,
  ComponentType,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
  StringSelectMenuOptionBuilder,
  type ChatInputCommandInteraction,
} from "discord.js";

export const removewarn: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("removewarn")
    .setDescription("Remove warn of an user.")
    .setDefaultMemberPermissions(0)
    .setContexts(0)
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to warn")
        .setRequired(true)
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    // Fetch the user to warn
    const user = interaction.options.getUser("user", true);

    // Check if the user and actionBy are the same
    if (user.id === interaction.user.id) {
      await interaction.reply("You cannot remove your warn yourself.");
      return;
    }

    // Fetch the user who warned the user
    const actionBy = {
      username: interaction.user.username,
      userId: interaction.user.id,
    };

    const guild = interaction.guild;

    // Fetch the guild id
    if (!guild) {
      await interaction.reply("This command can only be used in a guild.");
      return;
    }

    // Send message for loading
    await interaction.reply("Processing...");

    // Warn the user
    const warns = await moderation.modlogs({
      user,
      type: "warn",
      guild,
    });

    if (!warns.length) {
      await interaction.editReply(`No warns found for ${user.tag}`);
      return;
    }
    const selectMenuCustomId = `removewarn-${user.id}`;
    // Return select menu for warns
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId(selectMenuCustomId)
      .setPlaceholder("Select the warn you want to remove")
      .addOptions(
        warns.map((warn, index) =>
          new StringSelectMenuOptionBuilder()
            .setLabel(`Warn ${index + 1}`)
            .setDescription(warn.reason)
            .setValue(index.toString())
        )
      );

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      selectMenu
    );

    // Send select menu
    const response = await interaction.editReply({
      content: `User: <@${user.id}> - ${user.id}`,
      components: [row],
    });

    const collector = response.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 60000,
    });

    collector.on("collect", async (collector: StringSelectMenuInteraction) => {
      if (collector.customId !== selectMenuCustomId) return;
      const warnIndex = parseInt(collector.values[0]);
      const warn = warns[warnIndex];
      await moderation.removeWarn({
        guild,
        user,
        actionBy,
        warn,
      });
      await response.edit({
        content: `Removed warn ${warnIndex + 1} for ${user.tag} - ${user.id}`,
        components: [],
      });
    });
  },
};
