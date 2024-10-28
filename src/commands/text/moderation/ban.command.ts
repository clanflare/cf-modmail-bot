import {moderation, getMember} from "@/action";
import type {TextCommand} from "@/types/commands";
import {CustomDiscordError} from "@/types/errors";
import {PermissionFlagsBits} from "discord.js";
import {regexForIds} from "@/utils/regex.utils";

export const ban: TextCommand = {
  name: "ban",
  aliases: ["banuser"],
  argumentParser: async (message) => {
    const mentionedMember = message.mentions.members?.first();
    const parsedArgs = message.content.split(" ").slice(1);
    const userIdOrDuration = parsedArgs[0];
    const reason = parsedArgs.slice(1).join(" ") || "No reason provided.";

    let memberToBan;
    if (mentionedMember) {
      memberToBan = mentionedMember;
    } else if (regexForIds.test(userIdOrDuration) && message.guild) {
      memberToBan = await getMember(userIdOrDuration, message.guild);
    }

    if (!memberToBan) {
      throw new CustomDiscordError("Please mention a user or provide a valid user ID.");
    }

    return [memberToBan, reason];
  },

  validator: async (message, [memberToBan, reason]) => {
    if (!message.guild) {
      throw new Error("You need to be in a server to use this command.");
    }

    const authorMember = await getMember(message.author.id, message.guild);
    if (!authorMember.permissions.has(PermissionFlagsBits.BanMembers)) {
      throw new CustomDiscordError("You don't have permission to ban members.");
    }

    if (memberToBan.id === message.author.id) {
      throw new CustomDiscordError("You cannot ban yourself.");
    }

    if (!reason) {
      throw new CustomDiscordError("Please provide a reason for the ban.");
    }
  },

  execute: async (message, [memberToBan, reason]) => {
    try {
      await moderation.ban({
        user: memberToBan.id,
        reason,
        actionBy: {
          username: message.author.username,
          userId: message.author.id,
        },
        guild: message.guild?.id || "",
      });
      await message.reply(
        `Banned ${memberToBan.displayName} <@${memberToBan.id}>\nReason: ${reason}`
      );
    } catch (error) {
      throw new CustomDiscordError("Failed to ban the user. Please try again later.");
    }
  },
};