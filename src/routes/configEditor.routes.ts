import { getConfig, saveConfig } from "@/controllers/config.controller";
import { postConfigValidator } from "@/validators/configEditor";
import { Elysia } from "elysia";


const app = new Elysia();

app
.guard(postConfigValidator)
.post("/config", saveConfig);

app
.get("/config", getConfig);


export default app;
