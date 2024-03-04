import { getConfig, saveConfig } from "@/controllers/config.controller";
import type { MessageComponent } from "@/types/models";
import { postConfigValidator } from "@/validators/config";
import { Elysia } from "elysia";

const characterCounter = (botComponent: MessageComponent) => {
  const { message, buttons } = botComponent;
  const { embeds } = message;
  embeds?.forEach((embed) => {
    const { title, description, footer, author, fields } = embed;
    const titleLength = title?.length || 0;
    const descriptionLength = description?.length || 0;
    const footerTextLength = footer?.text?.length || 0;
    const authorNameLength = author?.name?.length || 0;
    const fieldsLength =
      fields?.reduce((acc, field) => {
        return acc + field.name.length + field.value.length;
      }, 0) || 0;
    const totalLength =
      titleLength +
      descriptionLength +
      footerTextLength +
      authorNameLength +
      fieldsLength;
    if (totalLength > 6000) {
      throw new Error(
        "The combined sum of all characters in the title, description, footer.text, author.name, fields.name, and fields.value must be less than or equal to 6000 characters.",
      );
    }
  });

  if (buttons && buttons.length > 0) {
    buttons.forEach((button) => {
      characterCounter(button.linkedComponent);
    });
  }
};

const app = new Elysia();

app.get("/", getConfig);

app.guard(postConfigValidator).post("/", saveConfig, {
  beforeHandle: (context) => {
    return characterCounter(context.body.initialMessage as MessageComponent);
  },
});

export default app;
