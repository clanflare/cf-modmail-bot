import dbConnect from "./utils/dbConn.utils";
import app from "./utils/server.utils";
import fs from "fs";
import { BOT_TOKEN } from "./config/config";
import { CFClient } from "./utils/discordClient.utils";
import { Collection } from "discord.js";

export const cfClients = new Collection<string, CFClient>();
const data = [
  {
    clientId: "13042342343249769595770423634281", // Replace with your client ID
    guildId: "117032423423627136059609118", // Replace with your guild ID
    token: "MTfasdfMwOTc2OTU5NTasdfadsc3MadfsafasDYzNDI4MQ.GIorxW.RttYMKbckjCO4iRbzvfasdfasdfasdfJeep89NyCQqiBpoSADiQ",
    clientSecret: "QIoGCFdZaPqEgfhhsdfgaBz8patHAjLJsadsfadfulSwxZ2-",
    prefix: "!",
  },
  {
    clientId: "913451459313451920713721459761459624", // Replace with your client ID
    guildId: "1170627136145059609118", // Replace with your guild ID
    token: "OTkzOTIwNzEzNzI5NzYsdfgsdffgsg5NjI0.G6SZjk.Bty0sfgsddfgsdtPteFU3bhwCPYdfgdsfgUBGZjSlVVYmItfzm2xqs",
    clientSecret: "REFq-kCLb2ddfgsdfG8sfgq22RI4w-gdsfgsEEsdfdfdfggyGjKF_Xz5",
    prefix: "!",
  },
  {
    clientId: "13097742651314311421246938687", // Replace with your client ID
    guildId: "11451170627133654616059609118", // Replace with your guild ID
    token: "MTMwOTc3MTMxNDMxMDkzsdfgsfdgsODY4Nw.GcN16-.2bYhh5sVfDCjfXTN5VuOz0FINcM0f6X0dfRE_4",
    clientSecret: "--TddTyijkKDLsagarsgafdgsfdgsdfgtksDXq-d67EhEQ5GXEV",
    prefix: "!",
  }
]

dbConnect().then(() => {
  console.log("DB Connected");
  data.forEach(async(d) => {
    const bot = new CFClient(d.token, d.clientId, d.guildId, d.clientSecret, d.prefix);
    console.log(`Starting bot ${d.clientId}`);
    await bot.login();
    await bot.loadSlashCommands();
    
    cfClients.set(d.clientId, bot);
  })
  app.listen(3000, () => {
    console.log("Server started on http://localhost:3000");
  });
});
