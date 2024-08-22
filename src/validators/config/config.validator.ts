import { ButtonStyle } from "discord.js";
import { t, type Context, type Static } from "elysia";

const embed = t.Object({
  title: t.Optional(t.String({ maxLength: 256 })),
  description: t.Optional(t.String({ maxLength: 4096 })),
  url: t.Optional(t.String({ format: "uri" })),
  timestamp: t.Optional(t.String({ format: "date-time" })),
  color: t.Optional(t.Number({ minimum: 0x000000, maximum: 0xffffff })), // hex color code in number format //because number is more efficient
  footer: t.Optional(
    t.Object({
      text: t.String({ maxLength: 2048 }),
      iconURL: t.Optional(t.String({ format: "uri" })),
    }),
  ),
  image: t.Optional(t.Object({ url: t.String({ format: "uri" }) })),
  thumbnail: t.Optional(t.Object({ url: t.String({ format: "uri" }) })),
  video: t.Optional(t.Object({ url: t.String({ format: "uri" }) })),
  provider: t.Optional(
    t.Object({
      name: t.Optional(t.String({ maxLength: 256 })),
      url: t.Optional(t.String({ format: "uri" })),
    }),
  ),
  author: t.Optional(
    t.Object({
      name: t.Optional(t.String({ maxLength: 256 })),
      url: t.Optional(t.String({ format: "uri" })),
      iconURL: t.Optional(t.String({ format: "uri" })),
    }),
  ),
  fields: t.Optional(
    t.Optional(
      t.Array(
        t.Optional(
          t.Object({
            name: t.Optional(t.String({ maxLength: 256 })),
            value: t.Optional(t.String({ maxLength: 1024 })),
            inline: t.Optional(t.Boolean()),
          }),
        ),
        { maxItems: 25 },
      ),
    ),
  ),
});

const supportMessage = t.Object({
  content: t.String(),
  embeds: t.Optional(t.Array(embed, { maxItems: 10 })),
  attachments: t.Optional(t.Array(t.String({ format: "uri" }))),
});

export const messageComponent = t.Recursive(
  (thiss) =>
    t.Object({
      message: supportMessage,
      aiPrompt: t.Optional(t.String()),
      buttons: t.Optional(
        t.Array(
          t.Object({
            label: t.String(),
            linkedComponent: thiss,
            emoji: t.Optional(t.String()),
            style: t.Optional(t.Enum(ButtonStyle)),
          }),
        ),
      ),
    }),
  { $id: "MessageComponent" },
);

export const postConfigValidator = {
  headers: t.Object({
    authorization: t.String(),
  }),
  body: t.Object({
    archiveChannelId: t.Optional(t.String()),
    modmailCategoryId: t.Optional(t.String()),
    aiSupport: t.Optional(t.Boolean()),
    initialMessage: messageComponent,
  }),
};

export interface PostConfigContext extends Context {
  body: Static<typeof postConfigValidator.body>;
}
