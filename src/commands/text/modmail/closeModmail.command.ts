import { getMember } from "@/action";
import { mmclient } from "@/utils/discordClient.utils";
import type { TextCommand } from "@/types/commands";
import { CustomDiscordError } from "@/types/errors";
import { GuildMember, PermissionFlagsBits } from "discord.js";

const regexforids = new RegExp(/^\d{16,20}$/); //put this as a util and use it for any id validation

export const wvc: TextCommand = {
  name: "close",
  aliases: ["cm"],
  argumentParser: async (message) => {
    return [];
  },
  validator: async (message, args) => {
    if (!message.guild)
      throw new Error("You need to be in a server to use this command");
    if (args.length > 1)
      throw new CustomDiscordError(
        "You can only close 1 channel at a time"
      ); // in the custom error implementation, the error message will be sent to the user and then deleted after a certain time and all this config will be optional and present in the generic custom error implementation
  },
  execute: async (message, args) => {
    const modmail = mmclient.modmails.find((modmail)=>message.channelId===modmail?.modmailChannelId);
    if (!modmail) return;
    if(!mmclient.ready)return;
    mmclient.deleteModmail(modmail.userId)
  },
};
