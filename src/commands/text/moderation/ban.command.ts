import type { TextCommand } from "@/types/commands";
import { CustomDiscordError } from "@/types/errors";
import { PermissionFlagsBits } from "discord.js";

const regexForIds = new RegExp(/^\d{16,20}$/); //put this as a util and use it for any id validation

export const ban: TextCommand = {
  name: "ban",
  aliases: ["banuser"],
  argumentParser: async (message) => {
    const args = [];
    const mentionedMember = message.mentions.members?.first();

    if (mentionedMember) {
      args.push(mentionedMember);
    }

    const parsedArgs = message.content.split(" ").slice(1);
    const userIdOrDuration = parsedArgs[0];
    const reason = parsedArgs.slice(1).join(" ") || "No reason provided.";

    if (message.guild && regexForIds.test(userIdOrDuration)) {
      const member = await getMember(userIdOrDuration, message.guild);
      if (member) {
        args.push(member, reason);
      }
    } else if (mentionedMember) {
      args.push(reason);
    }

    if (!args.length || !args[0]) {
      throw new CustomDiscordError("Please mention a user or provide a valid user ID.");
    }

    return args;
  },
  validator: async (message, args) => {
    if (!message.guild)
      throw new Error("You need to be in a server to use this command");

    const member = await getMember(message.author, message.guild);
    if (!member.permissions.has(PermissionFlagsBits.BanMembers)) {
      throw new CustomDiscordError("You don't have permission to ban members.");
    }

    if (!args.length || args.length < 2) {
      throw new CustomDiscordError("Please provide a reason for the ban.");
    }
  },
  execute: async (message, args) => {
    const memberToBan = args[0];
    const reason = args[1];

    if (memberToBan.id === message.author.id) {
      await message.reply("You cannot ban yourself.");
      return;
    }

    try {
      await moderation.ban({
        user: memberToBan.id,
        reason,
        actionBy: {
          username: message.author.username,
          userId: message.author.id,
        },
        guild: message.guild || "",
      });
      await message.reply(
        `Banned ${memberToBan.displayName} <@${memberToBan.id}>\nReason: ${reason}`
      );
    } catch (error) {
      throw new CustomDiscordError("Failed to ban the user. Please try again.");
    }
  },
};