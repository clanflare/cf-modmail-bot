const token = process.env.DISCORD_BOT_TOKEN as string;
const clientId = process.env.DISCORD_CLIENT_ID as string;
const guildId = process.env.DISCORD_GUILD_ID as string;
const clientSecret = process.env.DISCORD_CLIENT_SECRET as string;
const mongoUri = process.env.MONGO_URI as string;
const jwtSecret = process.env.JWT_SECRET as string;
const frontendUrl = process.env.FRONTEND_URL as string;
const defaultPrefix = process.env.DEFAULT_PREFIX as string;

if (!token) {
  throw new Error("DISCORD_BOT_TOKEN is not defined");
}

if (!clientId) {
  throw new Error("DISCORD_CLIENT_ID is not defined");
}

if (!guildId) {
  throw new Error("DISCORD_GUILD_ID is not defined");
}

if (!clientSecret) {
  throw new Error("DISCORD_CLIENT_SECRET is not defined");
}

if (!mongoUri) {
  throw new Error("MONGO_URI is not defined");
}

if (!jwtSecret) {
  throw new Error("JWT_SECRET is not defined");
}

if (!frontendUrl) {
  throw new Error("FRONTEND_URL is not defined");
}

if(!defaultPrefix) {
  throw new Error("DEFAULT_PREFIX is not defined");
}
export { token, clientId, guildId, clientSecret, mongoUri, jwtSecret, frontendUrl, defaultPrefix };
// all exports must be CAPS