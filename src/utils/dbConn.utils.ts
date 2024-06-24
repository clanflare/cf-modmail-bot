import mongoose from "mongoose";
import { mongoUri } from "../config/config";

/**
 * Connects to MongoDB
 * @returns {Promise<void>}
 * @throws {Error}
 * @description Connects to MongoDB using the MONGO_URI config variable.
 */
export default async function dbConnect(): Promise<void> {
  try {
    if (mongoose.connection.readyState >= 1) {
      return;
    }

    console.log("Connecting to MongoDB...");
    mongoose.set("strictQuery", false);
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB!");

    mongoose.connection.on("error", (error: Error) => {
      console.error("Connection error:", error);
      throw error;
    });
    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected, attempting reconnection...");
      setTimeout(dbConnect, 5000);
    });
  } catch (error) {
    console.error("Connection error:", error);
    throw error;
  }
}
