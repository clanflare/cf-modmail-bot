import client from "./utils/discordClient.utils";
import dbConnect from "./utils/dbConn.utils";
import app from "./utils/server.utils";
import fs from "fs";
import { BOT_TOKEN } from "./config/config";

if (!fs.existsSync("./logs")) {
  fs.mkdirSync("./logs");
}

dbConnect().then(() => {
  console.log("DB Connected");
  client.login(BOT_TOKEN);
  app.listen(3000, () => {
    console.log("Server started on http://localhost:3000");
  });
});

export { client };
