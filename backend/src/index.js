import "dotenv/config";
import express from "express";
import cors from "cors";

import { connectDB } from "./config/db.js";
//import { Routes } from "./routes/Routes.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

//app.use("api/", Routes);

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log("Database Connected, Server is Online.");
    });
  } catch (error) {
    console.log("Server failed to load", error);
    process.exit(1);
  }
};

startServer();
