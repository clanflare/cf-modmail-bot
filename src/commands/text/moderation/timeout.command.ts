import type { TextCommand } from "@/types/commands";
import { CustomDiscordError } from "@/types/errors";
import { Message, PermissionFlagsBits } from "discord.js";
import ms from "ms";
import Moderation from "@/action/moderation";
import DiscordUtils from "@/action/discordUtils";

const regexForIds = new RegExp(/^\d{16,20}$/); // Utility for ID validation

export const timeout: TextCommand = {
  name: "timeout",
  aliases: ["to"],
  argumentParser: async (message) => {
    const args = [];
    const mentionedMember = message.mentions.members?.first();

    if (mentionedMember) {
      args.push(mentionedMember);
    }

    const parsedArgs = message.content.split(" ").slice(1);
    const userIdOrDuration = parsedArgs[0];
    const duration = parsedArgs[1];
    const reason = parsedArgs.slice(2).join(" ") || "No reason provided.";

    if (message.guild && regexForIds.test(userIdOrDuration)) {
      const discordUtils = new DiscordUtils(message.client);
      const member = await discordUtils.getMember(userIdOrDuration, message.guild);
      if (member) {
        args.push(member, duration, reason);
      }
    } else if (mentionedMember) {
      args.push(duration, reason);
    }

    if (!args.length || !args[0]) {
      throw new CustomDiscordError("Please mention a user or provide a valid user ID.");
    }

    return args;
  },
  validator: async (message: Message, args) => {
    if (!message.guild)
      throw new Error("You need to be in a server to use this command");
    const discordUtils = new DiscordUtils(message.client);
    const member = await discordUtils.getMember(message.author, message.guild);
    if (!member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      throw new CustomDiscordError("You don't have permission to timeout members.");
    }

    if (!args.length || args.length < 3) {
      throw new CustomDiscordError("Please provide a duration and reason for the timeout.");
    }
  },
  execute: async (message, args) => {
    const [member, duration, reason] = args;
    const moderation = new Moderation(message.client);
    const actionBy = {
      username: message.author.username,
      userId: message.author.id,
    };

    await moderation.timeout({
      user: member,
      reason,
      duration,
      actionBy,
      guild: message.guild,
    });

    await message.reply(`User ${member.user.username} has been timed out for ${ms(duration, { long: true })} with reason: ${reason}`);
  },
};