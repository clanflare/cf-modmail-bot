import type {SlashCommand} from "@/types/commands";
import {
  BaseGuildTextChannel,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} from "discord.js";
import {v4 as uuidv4} from "uuid"; // For generating confession IDs
import {PUBLIC_CONFESSIONS_CHANNEL_ID, CONFESSION_LOGS_CHANNEL_ID} from "@/config/config.ts";

export const confess: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("confess")
    .setDescription("Send a confession anonymously or publicly.")
    .addStringOption((option) =>
      option.setName("message").setDescription("Your confession message").setRequired(true)
    )
    .addBooleanOption((option) =>
      option.setName("anonymous").setDescription("If true, no-one can see that you sent the confession. Default: true")
    )
    .setDefaultMemberPermissions(0)
    .setContexts(0),

  async execute(interaction: ChatInputCommandInteraction) {
    const guild = interaction.guild;
    if (!guild) {
      await interaction.reply("This command can only be used in a server.");
      return;
    }

    const message = interaction.options.getString("message", true);
    const isAnonymous = interaction.options.getBoolean("anonymous") ?? true;
    const confessionId = uuidv4();

    const publicConfessionChannel = guild.channels.cache.get(PUBLIC_CONFESSIONS_CHANNEL_ID) as BaseGuildTextChannel;
    const confessionLogsChannel = guild.channels.cache.get(CONFESSION_LOGS_CHANNEL_ID) as BaseGuildTextChannel;

    // Build the embed for the public confessions channel
    const publicEmbed = new EmbedBuilder()
      .setTitle("New Confession!")
      .setDescription(message)
      .setColor(isAnonymous ? 0x808080 : 0x0099ff) // Gray for anonymous, blue for non-anonymous
      .setTimestamp();

    if (!isAnonymous) {
      publicEmbed.setFooter({text: `Sent by: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL()});
    } else {
      publicEmbed.setFooter({text: confessionId, iconURL: "https://cdn.discordapp.com/embed/avatars/0.png"});
    }

    // Build the embed for the moderation logs channel
    const logEmbed = new EmbedBuilder()
      .setTitle("Confession Log")
      .addFields(
        {name: "Confession ID", value: confessionId, inline: true},
        {name: "User", value: `<@${interaction.user.id}>`, inline: true},
        {name: "Anonymous", value: isAnonymous ? "Yes" : "No", inline: true},
        {name: "Message", value: message, inline: false}
      )
      .setTimestamp();

    try {
      // Send the confession to the public confessions channel
      if (publicConfessionChannel) {
        await publicConfessionChannel.send({embeds: [publicEmbed]});
      }

      // Send the confession log to the moderation logs channel
      if (confessionLogsChannel) {
        await confessionLogsChannel.send({embeds: [logEmbed]});
      }

      // Acknowledge the user who sent the confession
      await interaction.reply({
        content: `Your confession has been sent successfully${isAnonymous ? " and anonymously": ""}!`,
        ephemeral: true,
      });
    } catch (error) {
      console.error("Error sending confession:", error);
      await interaction.reply({
        content: "There was an error sending your confession. Please try again.",
        ephemeral: true,
      });
    }
  },
};
