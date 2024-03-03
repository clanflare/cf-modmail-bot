import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
// import userRouter from "@/routes/user.routes";
import configEditorRoter from "@/routes/configEditor.routes";
import { logger } from "@grotto/logysia";

const app = new Elysia();

app.onResponse((handler) => {
  console.log(
    `${handler.request.method} | URL: ${
      handler.request.url
    } | Status Code: ${(handler.set.status ||= 500)}`
  );
});

app.use(
  swagger({
    path: "/docs",
    documentation: {
      info: {
        title: "Modmail Bot Documentation",
        description: "This is the documentation for the Modmail Bot's API.",
        version: "1.0.0",
      },
    },
  })
);

app.use(logger());

app.get("/v1/content", () => {
  return {
    data: "Hello, World!",
    code: 200,
    success: true,
  };
});

// app.group("/user", (app) => app.use(userRouter));
app.group("/editor", (app) => app.use(configEditorRoter));

export default app;