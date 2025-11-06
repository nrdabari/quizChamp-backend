import mongoose from "mongoose";
import { env } from "./env";

export async function connectDB(): Promise<typeof mongoose> {
  if (!env.MONGO_URI) throw new Error("MONGO_URI is not set");
  mongoose.set("strictQuery", true);
  return mongoose.connect(env.MONGO_URI, {} as any);
}

export async function disconnectDB(): Promise<void> {
  await mongoose.connection.close();
}
