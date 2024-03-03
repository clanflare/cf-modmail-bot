import { t } from "elysia";
export const response = t.Object({
  message: t.String(),
  code: t.Integer(),
  data: t.Unknown(),
});

export * from "./config.validator";
