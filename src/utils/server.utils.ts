import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import configRouter from "@/routes/config.routes";
// import { logger } from "@grotto/logysia";
import { cors } from '@elysiajs/cors'

const app = new Elysia();

app.onResponse((handler) => {
  console.log(
    `${handler.request.method} | URL: ${
      handler.request.url
    } | Status Code: ${(handler.set.status ||= 500)}`
  );
});

app.use(cors());

app.use(
  swagger({
    provider: "swagger-ui",
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

// app.use(logger());

app.get("/v1/content", () => {
  return {
    data: "Hello, World!",
    code: 200,
    success: true,
  };
});

app.group("/editor", (app) => app.use(configRouter));

export default app;