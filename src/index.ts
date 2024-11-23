import dbConnect from "./utils/dbConn.utils";
import app from "./utils/server.utils";
import { CFClient } from "./utils/discordClient.utils";
import { Collection } from "discord.js";

export const cfClients = new Collection<string, CFClient>();
const clientsData = [
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
];

(async () => {
  try {
    await dbConnect();
    console.log("Database connected");


    clientsData.forEach(async (clientConfig) => {
      const bot = new CFClient(clientConfig);
      console.log(`Starting bot ${clientConfig.clientId}`);
      await bot.login();
      cfClients.set(clientConfig.clientId, bot);
    });

    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server started on http://localhost:${process.env.PORT || 3000}`);
    });
  } catch (error) {
    console.error("Error starting application:", error);
    process.exit(1);
  }
})();