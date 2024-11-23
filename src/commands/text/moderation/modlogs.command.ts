import type { TextCommand } from "@/types/commands";
import { CustomDiscordError } from "@/types/errors";
import Moderation from "@/action/moderation";
import { EmbedBuilder, PermissionFlagsBits } from "discord.js";

export const modlogs: TextCommand = {
  name: "modlogs",
  aliases: ["ml"],
  argumentParser: async (message) => {
    const args = message.content.split(" ").slice(1);
    if (args.length < 1) {
      throw new CustomDiscordError(
        "Please provide a user ID or mention a user."
      );
    }
    return args;
  },
  validator: async (message, args) => {
    if (!message.guild) {
      throw new CustomDiscordError(
        "You need to be in a server to use this command."
      );
    }
    const member = await message.guild.members.fetch(message.author.id);
    if (!member.permissions.has(PermissionFlagsBits.ViewAuditLog)) {
      throw new CustomDiscordError(
        "You don't have permission to view modlogs."
      );
    }
  },
  execute: async (message, args) => {
    const userId = args[0];
    const type = args[1] || "all";
    const moderation = new Moderation(message.client);

    const modlogs = await moderation.modlogs({
      user: userId,
      type,
      guild: message.guild,
    });

    const reply = await message.reply("Processing...");

    if (!modlogs.length) {
      await message.reply("No modlogs found for this user.");
      return;
    }

    const modlogsEmbed = new EmbedBuilder()
      .setTitle(`Modlogs for ${userId}`)
      .setDescription(
        modlogs
          .map((log) => {
            return `**Type:** ${log.type}\n**Reason:** ${
              log.reason
            }\n**Date:** ${new Date(
              String(log.createdAt)
            ).toLocaleString()}\n**Action by:** <@${log.actionBy.userId}>`;
          })
          .join("\n\n")
      );

    await reply.edit({ embeds: [modlogsEmbed] });
  },
};
