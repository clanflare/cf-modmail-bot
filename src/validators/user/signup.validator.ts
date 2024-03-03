import { t, type Static, type Context } from "elysia";

export const signupValidator = {
  body: t.Object({
    message: t.Optional(t.String()),
  }),
};

export interface ContextWithSignupBody extends Context {
  body: Static<typeof signupValidator.body>;
}
