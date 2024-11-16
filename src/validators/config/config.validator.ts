import { ButtonStyle } from "discord.js";
import { t, type Context, type Static } from "elysia";

// Embed schema
const embed = t.Object({
  title: t.Optional(t.String({ maxLength: 256 })), // 256 character limit
  description: t.Optional(t.String({ maxLength: 4096 })), // 4096 character limit
  url: t.Optional(t.String({ format: "uri" })), // URL validation
  timestamp: t.Optional(t.String({ format: "date-time" })), // ISO8601 timestamp,
  color: t.Optional(t.Number({ minimum: 0x000000, maximum: 0xffffff })), // Hex color code
  footer: t.Optional(
    t.Object({
      text: t.String({ maxLength: 2048 }), // 2048 character limit
      iconURL: t.Optional(t.String({ format: "uri" })), // URL validation
      proxyIconUrl: t.Optional(t.String({ format: "uri" })), // URL validation
    })
  ),
  image: t.Optional(
    t.Object({
      url: t.String({ format: "uri" }), // URL validation
      height: t.Optional(t.Number()),
      proxyURL: t.Optional(t.String({ format: "uri" })), // URL validation
      width: t.Optional(t.Number()),
    })
  ),
  thumbnail: t.Optional(
    t.Object({
      url: t.String({ format: "uri" }), // URL validation
      height: t.Optional(t.Number()),
      proxyURL: t.Optional(t.String({ format: "uri" })), // URL validation
      width: t.Optional(t.Number()),
    })
  ),
  video: t.Optional(
    t.Object({
      url: t.String({ format: "uri" }), // URL validation
      height: t.Optional(t.Number()),
      proxyURL: t.Optional(t.String({ format: "uri" })), // URL validation
      width: t.Optional(t.Number()),
    })
  ),
  provider: t.Optional(
    t.Object({
      name: t.Optional(t.String({ maxLength: 256 })), // 256 character limit
      url: t.Optional(t.String({ format: "uri" })), // URL validation
    })
  ),
  author: t.Optional(
    t.Object({
      name: t.String({ maxLength: 256 }), // 256 character limit
      url: t.Optional(t.String({ format: "uri" })), // URL validation
      iconURL: t.Optional(t.String({ format: "uri" })), // URL validation
      proxyIconUrl: t.Optional(t.String({ format: "uri" })), // URL validation
    })
  ),
  fields: t.Optional(
    t.Array(
      t.Object({
        name: t.String({ maxLength: 256 }), // 256 character limit
        value: t.String({ maxLength: 1024 }), // 1024 character limit
        inline: t.Optional(t.Boolean()),
      }),
      { maxItems: 25 } // Maximum of 25 fields
    )
  ),
});

// Message schema
const message = t.Object({
  content: t.String(),
  embeds: t.Optional(t.Array(embed, { maxItems: 10 })), // Maximum of 10 embeds
  attachments: t.Optional(t.Array(t.String({ format: "uri" }))), // URL validation
});

// Recursive message component schema
export const messageComponent = t.Recursive(
  (Self) =>
    t.Object({
      message: message,
      aiInstructions: t.Optional(t.String()),
      categoryId: t.Optional(t.String()),
      messageToSupportTeam: t.Optional(t.String()),
      buttons: t.Optional(
        t.Array(
          t.Object({
            label: t.String(),
            linkedComponent: Self,
            emoji: t.Optional(t.String()),
            style: t.Optional(t.Enum(ButtonStyle)),
          })
        )
      ),
    }),
  { $id: "MessageComponent" }
);

// Validator for POST configuration
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

// Context interface for the POST configuration
export interface PostConfigContext extends Context {
  body: Static<typeof postConfigValidator.body>;
}
