import type { TextCommand } from "@/types/commands";
import { CustomDiscordError } from "@/types/errors";
import Moderation from "@/action/moderation";
import DiscordUtils from "@/action/discordUtils";
import { PermissionFlagsBits } from "discord.js";

export const unban: TextCommand = {
  name: "unban",
  aliases: ["ub"],
  argumentParser: async (message) => {
    const args = message.content.split(" ").slice(1);
    if (args.length < 2) {
      throw new CustomDiscordError("Please provide a user ID and a reason.");
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
    if (!member.permissions.has(PermissionFlagsBits.BanMembers)) {
      throw new CustomDiscordError(
        "You don't have permission to unban members."
      );
    }
  },
  execute: async (message, args) => {
    const [userId, ...reasonParts] = args;
    const reason = reasonParts.join(" ");
    const moderation = new Moderation(message.client);
    const discordUtils = new DiscordUtils(message.client);

    const user = await discordUtils.getUser(userId);
    if (!user) {
      throw new CustomDiscordError("User not found.");
    }

    const actionBy = {
      username: message.author.username,
      userId: message.author.id,
    };

    await moderation.unban({
      user,
      reason,
      actionBy,
      guild: message.guild,
    });

    await message.reply(`Unbanned ${user.username} for: ${reason}.`);
  },
};
