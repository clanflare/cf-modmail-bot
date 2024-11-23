import DiscordUtils from "@/action/discordUtils";
import type { TextCommand } from "@/types/commands";
import { CustomDiscordError } from "@/types/errors";
import { GuildMember } from "discord.js";

const regexforids = new RegExp(/^\d{16,20}$/); //put this as a util and use it for any id validation

export const whichvc: TextCommand = {
  name: "whichvc",
  aliases: ["wv"],
  argumentParser: async (message) => {
    const discordUtils = new DiscordUtils(message.client);
    const args: GuildMember[] = [];
    if (message.mentions.members) {
      message.mentions.members.forEach((member) => {
        args.push(member);
      });
    }
    const parsedArgs = message.content.split(" ");
    parsedArgs.shift();
    let distinctArgs = [...new Set(parsedArgs)];
    await Promise.all(
      distinctArgs.map(async (arg) => {
        if (message.guild && regexforids.test(arg)) {
          const member = await discordUtils.getMember(arg, message.guild); // write a utility to populate an array of ids to discord.js objects
          if (member) {
            args.push(member);
          }
        }
      })
    );
    if (!args.length || !args[0]) {
      if (message.guild)
        args.push(await discordUtils.getMember(message.author, message.guild));
    }
    return args;
  },
  validator: async (message, args) => {
    if (!message.guild)
      throw new Error("You need to be in a server to use this command");
    if (args.length > 4)
      throw new CustomDiscordError(
        "You can only mention upto 4 members at a time"
      ); // in the custom error implementation, the error message will be sent to the user and then deleted after a certain time and all this config will be optional and present in the generic custom error implementation
  },
  execute: async (message, args) => {
    if (args.length === 1) {
      const member = args[0];
      if (member.voice.channel) {
        await message.reply(
          `${member.displayName} is in ${member.voice.channel.name} - <#${member.voice.channel.id}>`
        );
      } else {
        await message.reply(`${member.displayName} is not in a voice channel`);
      }
    } else {
      const members = args; // need to be fixed when the argument parser type declaration is made
      await message.reply(
        `The following members are in a voice channel:\n${args
          .map(
            (member: any) =>
              `${member.displayName} - ${
                member.voice.channel?.id
                  ? `<#${member.voice.channel?.id}>`
                  : "Not in VC"
              }`
          )
          .join(",\n")}`
      );
    }
  },
};
