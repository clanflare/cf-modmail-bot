import mongoose from "mongoose";
import { mongoUri } from "../config/config";

export default async function dbConnect() {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
    await mongoose.connect(mongoUri);
}
