import { t, type Static, type Context } from "elysia";

const embed = t.Object({
  title: t.Optional(t.String({ maxLength: 256 })),
  description: t.Optional(t.String({ maxLength: 4096 })),
  url: t.Optional(t.String({ format: "uri" })),
  timestamp: t.Optional(t.String({ format: "date-time" })),
  color: t.Optional(t.Number({ minimum: 0x000000, maximum: 0xffffff })),
  footer: t.Optional(
    t.Object({
      text: t.Optional(t.String({ maxLength: 2048 })),
      iconURL: t.Optional(t.String({ format: "uri" })),
    })
  ),
  image: t.Optional(t.Object({ url: t.String({ format: "uri" }) })),
  thumbnail: t.Optional(t.Object({ url: t.String({ format: "uri" }) })),
  video: t.Optional(t.Object({ url: t.String({ format: "uri" }) })),
  provider: t.Optional(
    t.Object({
      name: t.Optional(t.String({ maxLength: 256 })),
      url: t.Optional(t.String({ format: "uri" })),
    })
  ),
  author: t.Optional(
    t.Object({
      name: t.Optional(t.String({ maxLength: 256 })),
      url: t.Optional(t.String({ format: "uri" })),
      iconURL: t.Optional(t.String({ format: "uri" })),
    })
  ),
  fields: t.Optional(
    t.Optional(
      t.Array(
        t.Optional(
          t.Object({
            name: t.Optional(t.String({ maxLength: 256 })),
            value: t.Optional(t.String({ maxLength: 1024 })),
            inline: t.Optional(t.Boolean()),
          })
        ),
        { maxItems: 25 }
      )
    )
  ),
});

/**
 * Additional Notes:
 * - The combined sum of all characters in the title, description, footer.text, author.name, fields.name, and fields.value must be less than or equal to 6000 characters.
 */

const supportMessage = t.Object({
  content: t.String(),
  embed: t.Optional(t.Array(embed, { maxItems: 10 })),
  attachments: t.Optional(t.Array(t.String({ format: "uri" }))),
});

const botComponent = t.Recursive((This) =>
  t.Object({
    message: supportMessage,
    buttons: t.Optional(
      t.Array(
        t.Object({
          label: t.String(),
          linkedComponent: This,
          emoji: t.Optional(t.String()),
          style: t.Optional(t.String()),
        })
      )
    ),
  })
);

export const postConfigValidator = {
  body: t.Object({
    archiveChannelId: t.String(),
    modmailCategoryId: t.String(),
    aiSupport: t.Optional(t.Boolean()),
    initialMessage: botComponent,
  }),
};

export interface PostConfigContext extends Context {
  body: Static<typeof postConfigValidator.body>;
}
