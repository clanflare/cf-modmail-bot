import { Schema, model } from "mongoose";

const dropLeaderboardSchema = new Schema({
  userId: { type: String, required: true },
  points: { type: Number, default: 0 },
});

export default model("DropLeaderboard", dropLeaderboardSchema);
