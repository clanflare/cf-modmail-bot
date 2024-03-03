import { signup } from "@/controllers/user.controller";
import { signupValidator } from "@/validators/user";
import { Elysia } from "elysia";

const app = new Elysia();

app
.guard(signupValidator)
.post("/signup", signup);


export default app;
