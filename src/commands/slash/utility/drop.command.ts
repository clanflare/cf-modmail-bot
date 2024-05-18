import type { SlashCommand } from "@/types/commands";
import {
  BaseGuildTextChannel,
  Message,
  SlashCommandBuilder,
  type CommandInteraction,
} from "discord.js";
import ms from "ms";

export const drop: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("drop")
    .setDescription(
      "Creates a drop in the selected channel with the specified message!"
    )
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel in which you want to drop")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("The message you want to show for drop")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("word")
        .setDescription("The claim word which user will enter")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("duration")
        .setDescription("Duration of the drop, defaults to 1h.")
    )
    .addStringOption((option) =>
      option
        .setName("victory-message")
        .setDescription("The victory message, winning user will receive")
    )
    .addStringOption((option) =>
      option
        .setName("case-sensitive")
        .setDescription("Want the word to be case sensitive, default no")
        .setChoices({name: "Yes", value: "yes"}, {name: "No", value: "no"})
    )
    .setDefaultMemberPermissions(0)
    .setDMPermission(false),
  async execute(interaction: CommandInteraction) {
    // Fetch the guild of the interaction
    const guild = interaction.guild;

    // Fetch the guild id
    if (!guild) {
      await interaction.reply("This command can only be used in a guild.");
      return;
    }

    // Fetch the data
    const channelId = interaction.options.get("channel", true).value as string;
    const message = interaction.options.get("message", true).value as string;
    const word = interaction.options.get("word", true).value as string;
    const duration = interaction.options.get("duration")?.value as string;
    const caseSensitive = interaction.options.get("case-sensitive")
      ?.value as string;
    const victoryMessage =
      (interaction.options.get("victory-message")?.value as string) ||
      "You have won the drop.";

    const durationInMs = duration ? ms(duration) : ms("1h");
    const channel = guild.channels.cache.get(channelId) as BaseGuildTextChannel;

    // Drop the message in the channel
    const drop = await channel.send(message);
    const link = `https://discord.com/channels/${guild.id}/${channelId}/${drop.id}`;

    // Send the reply
    interaction.reply({
      content: "Drop created successfully\n" + link,
      ephemeral: true,
    });

    // Message collector
    const collectorFilter = (m: Message) =>
      caseSensitive === "yes"
        ? m.content === word
        : m.content.toLowerCase === word.toLowerCase;
    try {
      const claimed = await channel.awaitMessages({
        filter: collectorFilter,
        max: 1,
        time: durationInMs,
        errors: ["time"],
      });
      claimed.first()?.reply(victoryMessage);
    } catch (err) {
      console.log(err);
    }
  },
};
