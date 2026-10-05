import "dotenv/config";

import path from "node:path";
import fs from "node:fs";

import express from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";

import { connectDB } from "./config/db.js";
import job from "./lib/cron.js";
import clerkWebhook from "./webhooks/clerk.webhook.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./lib/socket.js";

const PORT = Number(process.env["PORT"]) || 5000;
const publicDir = path.join(process.cwd(), "public");

app.use(
  "/api/webhooks/clerk",
  express.raw({ type: "application/json" }),
  clerkWebhook,
);

app.use(express.json());
app.use(cors({ origin: process.env["FRONTEND_URL"], credentials: true }));
app.use(clerkMiddleware());

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));

  app.get("/{*any}", (_req, res, next) => {
    res.sendFile(path.join(publicDir, "index.html"), (err) => next(err));
  });
}

const startServer = async (): Promise<void> => {
  try {
    await connectDB();
    console.log("Database Connected Successfully.");

    server.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is listening on port ${PORT}`);
    });

    if (process.env["NODE_ENV"] === "production") {
      job.start();
    }
  } catch (error) {
    console.error("Database connection failed", error);
    process.exit(1);
  }
};

startServer();
