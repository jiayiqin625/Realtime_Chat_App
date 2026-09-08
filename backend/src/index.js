import "dotenv/config";
import express from "express";
import cors from "cors";

import path from "path";
import fs from "fs";

import { clerkMiddleware } from "@clerk/express";

import { connectDB } from "./config/db.js";
//import { Routes } from "./routes/Routes.js";
import job from "./lib/cron.js";

const app = express();
const PORT = process.env.PORT || 5000;

const publicDir = path.join(process.cwd(), "public");

app.use(express.json());
app.use(cors({ orgin: process.env.FRONTEND_URL, credentials: true }));
app.use(clerkMiddleware);

app.get("/health", (req, res) => {
  res.status(200).json({ ok: true });
});

if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));

  app.get("/{*any}", (req, res, next) => {
    res.sendFile(path.join(publicDir, "index.html"), (err) => next(err));
  });
}

//app.use("api/", Routes);

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log("Database Connected, Server is Online.");
    });

    if (process.env.NODE_ENV === "production") {
      job.start();
    }
  } catch (error) {
    console.log("Server failed to load", error);
    process.exit(1);
  }
};

startServer();
