import type { TextCommand } from "@/types/commands";
import { CustomDiscordError } from "@/types/errors";
import Moderation from "@/action/moderation";
import DiscordUtils from "@/action/discordUtils";
import { PermissionFlagsBits } from "discord.js";

const regexForIds = new RegExp(/^\d{16,20}$/); // Utility for ID validation

export const warn: TextCommand = {
  name: "warn",
  aliases: ["w"],
  argumentParser: async (message) => {
    const args = [];
    const mentionedMember = message.mentions.members?.first();

    if (mentionedMember) {
      args.push(mentionedMember);
    }

    const parsedArgs = message.content.split(" ").slice(1);
    const userId = parsedArgs[0];
    const reason = parsedArgs.slice(1).join(" ") || "No reason provided.";

    if (message.guild && regexForIds.test(userId)) {
      const discordUtils = new DiscordUtils(message.client);
      const member = await discordUtils.getMember(userId, message.guild);
      if (member) {
        args.push(member, reason);
      }
    } else if (mentionedMember) {
      args.push(reason);
    }

    if (!args.length || !args[0]) {
      throw new CustomDiscordError(
        "Please mention a user or provide a valid user ID."
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

    if (!args.length || args.length < 2) {
      throw new CustomDiscordError("Please provide a reason for the warn.");
    }
  },
  execute: async (message, args) => {
    const [member, reason] = args;
    const moderation = new Moderation(message.client);
    const actionBy = {
      username: message.author.username,
      userId: message.author.id,
    };

    await moderation.warn({
      user: member,
      reason,
      actionBy,
      guild: message.guild,
    });

    await message.reply(`Warned ${member.user.username} for: ${reason}`);
  },
};
