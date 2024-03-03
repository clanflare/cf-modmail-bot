import { t, type Static, type Context } from "elysia";

const supportMessage = t.Object({
  content: t.String(),
  embed: t.Optional(t.Array(t.Object({}))),
  attachments: t.Optional(t.Array(t.String({ format: "uri" }))),
});

let button = t.Object({});

const botComponent = t.Object({
  message: supportMessage,
  buttons: t.Optional(t.Array(button)),
});

button = t.Object({
  label: t.String(),
  linkedComponent: botComponent,
  emoji: t.Optional(t.String()),
  style: t.Optional(t.String()),
});


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
