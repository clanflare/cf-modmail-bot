import client from "./utils/discordClient.utils";
import dbConnect from "./utils/dbConn.utils";
import app from "./utils/server.utils";


dbConnect().then(() => {
  console.log("DB Connected");
  client.login(Bun.env.DISCORD_BOT_TOKEN);
  app.listen(3000, () => {
    console.log("Server started on http://localhost:3000");
  });
});

export {
  client
}