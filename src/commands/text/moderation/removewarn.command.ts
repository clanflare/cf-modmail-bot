import type { TextCommand } from "@/types/commands";
import { CustomDiscordError } from "@/types/errors";
import Moderation from "@/action/moderation";
import { PermissionFlagsBits } from "discord.js";
import DiscordUtils from "@/action/discordUtils";

export const removewarn: TextCommand = {
  name: "removewarn",
  aliases: ["rw"],
  argumentParser: async (message) => {
    const args = [];
    const mentionedMember = message.mentions.members?.first();

    if (mentionedMember) {
      args.push(mentionedMember);
    }

    const parsedArgs = message.content.split(" ").slice(1);
    const userId = parsedArgs[0];

    if (message.guild && userId) {
      const discordUtils = new DiscordUtils(message.client);
      const member = await discordUtils.getMember(userId, message.guild);
      if (member) {
        args.push(member);
      }
    }

    if (!args.length || !args[0]) {
      throw new CustomDiscordError("Please mention a user or provide a valid user ID.");
    }

    return args;
  },
  validator: async (message, args) => {
    if (!message.guild) {
      throw new CustomDiscordError("You need to be in a server to use this command.");
    }
    const member = await message.guild.members.fetch(message.author.id);
    if (!member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      throw new CustomDiscordError("You don't have permission to remove warns.");
    }
  },
  execute: async (message, args) => {
    const [member] = args;
    const moderation = new Moderation(message.client);
    const actionBy = {
      username: message.author.username,
      userId: message.author.id,
    };

    const warns = await moderation.modlogs({
      user: member,
      type: "warn",
      guild: message.guild,
    });

    if (!warns.length) {
      throw new CustomDiscordError(`No warns found for ${member.user.username}.`);
    }

    const warn = warns[0]; // Assuming we remove the most recent warn
    await moderation.removeWarn({
      user: member,
      warn,
      guild: message.guild,
      actionBy,
    });

    await message.reply(`Removed warn for ${member.user.username}.`);
  },
};
