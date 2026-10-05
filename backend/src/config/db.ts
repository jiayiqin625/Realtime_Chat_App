import mongoose from "mongoose";

export const connectDB = async () => {
  if (!process.env["MONGO_URI"]) {
    throw new Error("Missing Database Key");
  }
  const conn = await mongoose.connect(process.env["MONGO_URI"]);

  console.log(`Database is connected: ${conn.connection.host}`);
};
