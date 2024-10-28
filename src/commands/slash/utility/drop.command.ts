import type {SlashCommand} from "@/types/commands";
import {
  BaseGuildTextChannel,
  type ChatInputCommandInteraction,
  EmbedBuilder,
  Message,
  SlashCommandBuilder,
} from "discord.js";
import ms from "ms";
import DropLeaderboard from "@/models/dropLeaderboard.model.ts";
import {DROP_LOG_CHANNEL_ID} from "@/config/config.ts";

export const drop: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("drop")
    .setDescription(
      "Creates a drop with prizes for multiple winners based on their position."
    )
    .addStringOption((option) =>
      option.setName("message").setDescription("The message to announce for the drop").setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("claim-word").setDescription("The word to claim the drop").setRequired(true)
    )
    .addChannelOption((option) =>
      option.setName("channel").setDescription("The channel for the drop")
    )
    .addIntegerOption((option) =>
      option.setName("winner-count").setDescription("The number of winners, defaults to 1")
    )
    .addStringOption((option) =>
      option.setName("prizes").setDescription("Comma-separated list of prizes, e.g., '10,20,30'")
    )
    .addStringOption((option) =>
      option.setName("victory-message").setDescription("Custom victory message. Use {winner} and {prize} placeholders.")
    )
    .addStringOption((option) =>
      option.setName("end-message").setDescription("The message if no one wins the drop")
    )
    .addStringOption((option) =>
      option.setName("time").setDescription("Duration of the drop, defaults to 60m")
    )
    .addBooleanOption((option) =>
      option.setName("case-sensitive").setDescription("Should the claim word be case sensitive?")
    )
    .setDefaultMemberPermissions(0)
    .setContexts(0),
  async execute(interaction: ChatInputCommandInteraction) {
    const guild = interaction.guild;
    if (!guild) {
      await interaction.reply("This command can only be used in a guild.");
      return;
    }

    const message = interaction.options.getString("message", true);
    const claimWord = interaction.options.getString("claim-word", true);
    const channelOption = interaction.options.getChannel("channel");
    const winnerCount = interaction.options.getInteger("winner-count") || 1;
    const prizesInput = interaction.options.getString("prizes") || "No prize";
    const victoryMessage = interaction.options.getString("victory-message") || "Congratulations {winner}, you won {prize} points!";
    const endMessage = interaction.options.getString("end-message") || "No one won the drop!";
    const time = interaction.options.getString("time") || "60m";
    const caseSensitive = interaction.options.getBoolean("case-sensitive") || false;

    const durationInMs = ms(time);
    const channel = (channelOption as BaseGuildTextChannel) || interaction.channel;

    const prizeArray = prizesInput.split(",").map((p) => parseInt(p.trim()) || 0);

    const dropMessage = await channel.send(message);
    const link = `https://discord.com/channels/${guild.id}/${channel.id}/${dropMessage.id}`;

    await interaction.reply({
      content: `Drop created successfully!\n${link}`,
      ephemeral: true,
    });

    const collectorFilter = (m: Message) =>
      caseSensitive
        ? m.content === claimWord && !m.author.bot
        : m.content.toLowerCase() === claimWord.toLowerCase() && !m.author.bot;

    const collectedWinners: { userId: string; prize: number }[] = [];
    const winnerSet = new Set<string>(); // Ensures no duplicate winners

    const collector = channel.createMessageCollector({
      filter: collectorFilter,
      time: durationInMs,
    });

    collector.on("collect", async (m: Message) => {
      // Ensure the user isn't already a winner
      if (winnerSet.has(m.author.id)) return;

      const winnerIndex = collectedWinners.length;
      const prize = prizeArray[winnerIndex] || 0;

      collectedWinners.push({userId: m.author.id, prize});
      winnerSet.add(m.author.id); // Track winners to prevent duplicates

      // Update user points in the database
      await DropLeaderboard.findOneAndUpdate(
        {userId: m.author.id},
        {$inc: {points: prize}},
        {upsert: true}
      );

      const victoryMsg = victoryMessage
        .replace("{winner}", `<@${m.author.id}>`)
        .replace("{prize}", prize.toString());

      await m.reply(victoryMsg);

      // Stop the collector if the winner limit is reached
      if (collectedWinners.length >= winnerCount) {
        collector.stop("maxWinners");
      }
    });

    collector.on("end", async (collected, _reason) => {
      // if (collected.size === 0) {
      //   await channel.send(endMessage);
      // }

      const logChannel = guild.channels.cache.get(DROP_LOG_CHANNEL_ID) as BaseGuildTextChannel;
      const winnersWithPrizes = collectedWinners.length ? collectedWinners.map((w, i) => (i > 0 ? `${i + 1}.` : "").toString() + `<@${w.userId}> got ${w.prize} points`).join("\n") : endMessage;
      if (logChannel) {
        const embed = new EmbedBuilder()
          .setTitle("Drop Ended")
          .addFields(
            {name: "Created By", value: `<@${interaction.user.id}>`, inline: true},
            {name: "Claim Word", value: claimWord, inline: true},
            {name: "Winner Count", value: winnerCount.toString(), inline: true},
            {name: "Channel", value: `<#${channel.id}>`, inline: true},
            {name: "Victory Message", value: victoryMessage, inline: false},
            {name: "Duration", value: time, inline: true},
            {name: "Points", value: prizeArray.toString(), inline: true},
            {name: "Message", value: message, inline: false},
            {
              name: "Winners with Prizes",
              value: winnersWithPrizes,
              inline: false,
            }
          )
          .setTimestamp();

        await logChannel.send({embeds: [embed]});

        await channel.send(`Drop ended!!!\n${winnersWithPrizes}`);
      }
    });
  },
};
