//ToDo: This whole thing needs a revamp
import { cfClients } from "@/index";
import type { TextCommand } from "@/types/commands";
import { CustomDiscordError } from "@/types/errors";

import { AttachmentBuilder, TextChannel } from "discord.js";
import { getModmailConfig } from "@/services/config.service";

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
      throw new CustomDiscordError("You can only close 1 channel at a time");
  },
  execute: async (message, args) => {
    const mmclient = cfClients.get(
      message.client?.application?.id
    )?.modmailClient;
    if (!mmclient) return;
    const modmail = mmclient.modmails.find(
      (modmail: any) => message.channelId === modmail?.modmailChannelId
    );
    if (!message.guild) return;
    if (!modmail) return;
    if (!mmclient.ready) return;

    // Fetch all messages from the modmail channel
    let messageLog = "";
    if (modmail.modmailChannel) {
      const messages = await modmail.modmailChannel.messages.fetch({
        limit: 100,
      });
      messageLog = messages
        .map(
          (msg: any) =>
            `[${msg.createdAt.toISOString()}] ${msg.author.tag}: ${msg.content}`
        )
        .reverse()
        .join("\n");
    }

    // Prepare modmail metadata
    const modmailDataLog = `
Modmail ID: ${modmail.dbId}
Guild ID: ${modmail.guildId}
User ID: ${modmail.userId}
Channel ID: ${modmail.modmailChannelId}
Status: ${modmail.status}
Staff Involved: ${[...modmail.staffInTicket].join(", ")}
Messages Count: ${modmail.messages?.length || 0}
    `;

    // Create in-memory files for logs
    const messageLogAttachment = new AttachmentBuilder(
      Buffer.from(messageLog, "utf-8"),
      { name: `${modmail.userId}-channel-log.txt` }
    );

    // Send the files to a specific log channel
    const config = await getModmailConfig(message.guild.id);
    const logChannelId = config?.archiveChannelId;
    if (!logChannelId) return;
    const logChannel = message.client.channels.cache.get(
      logChannelId
    ) as TextChannel;
    if (logChannel) {
      await logChannel.send({
        content: `Modmail closed for user <@${modmail.userId}>`,
        embeds: [{ description: modmailDataLog }],
        files: [messageLogAttachment],
      });
    }

    mmclient.deleteModmail(modmail.userId);
  },
};
