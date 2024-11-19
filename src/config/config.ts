const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN as string;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID as string;
const GUILD_ID = process.env.DISCORD_GUILD_ID as string;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET as string;
const MONGO_URI = process.env.MONGO_URI as string;
const JWT_SECRET = process.env.JWT_SECRET as string;
const FRONTEND_URL = process.env.FRONTEND_URL as string;
const DEFAULT_PREFIX = process.env.DEFAULT_PREFIX as string;
const DROP_LOG_CHANNEL_ID = process.env.DROP_LOG_CHANNEL_ID as string;

if (!BOT_TOKEN) {
  throw new Error("DISCORD_BOT_TOKEN is not defined");
}

if (!CLIENT_ID) {
  throw new Error("DISCORD_CLIENT_ID is not defined");
}

if (!GUILD_ID) {
  throw new Error("DISCORD_GUILD_ID is not defined");
}

if (!CLIENT_SECRET) {
  throw new Error("DISCORD_CLIENT_SECRET is not defined");
}

if (!MONGO_URI) {
  throw new Error("MONGO_URI is not defined");
}

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

if (!FRONTEND_URL) {
  throw new Error("FRONTEND_URL is not defined");
}

if (!DEFAULT_PREFIX) {
  throw new Error("DEFAULT_PREFIX is not defined");
}

if (!DROP_LOG_CHANNEL_ID){
  throw new Error("DROP_LOG_CHANNEL_ID is not defined");
}

export {BOT_TOKEN, CLIENT_ID, GUILD_ID, CLIENT_SECRET, MONGO_URI, JWT_SECRET, FRONTEND_URL, DEFAULT_PREFIX, DROP_LOG_CHANNEL_ID};