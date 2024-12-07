import type { MessageComponent } from "@/types/models/modmailConfig";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  type Message,
} from "discord.js";

/**
 * Parse a message for stickers and attachments (supporting multiple stickers and attachments).
 */
export function messageStickerAndAttachmentParser(message: Message) {
  const stickers = message.stickers
    .map((sticker) => `sticker: ${sticker.url}`)
    .join("\n");
  const attachments = message.attachments.map((attachment) => attachment.url);
  return {
    content: `${message.content}\n${stickers}`,
    files: attachments.length ? attachments : undefined,
  };
}

/**
 * Parse message components into Discord.js ActionRow and Button objects.
 */
export function messageComponentParser(
  messageComponent: MessageComponent,
  disableButton = false
) {
  if (!messageComponent.buttons || messageComponent.buttons.length == 0) {
    return {
      content: messageComponent.message.content,
      embeds: messageComponent.message.embeds,
      files: [], // attachments to be implemented from messageComponent.message.attachments
      components: [],
    };
  }

  const parsedButtons = messageComponent?.buttons?.map((btn) =>
    new ButtonBuilder()
      .setCustomId(btn.label)
      .setLabel(btn.label)
      .setDisabled(disableButton)
      .setStyle(btn.style || ButtonStyle.Primary)
  );

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    parsedButtons
  );

  return {
    content: messageComponent.message.content,
    embeds: messageComponent.message.embeds,
    files: [], // attachments to be implemented from messageComponent.message.attachments
    components: [row],
  };
}
