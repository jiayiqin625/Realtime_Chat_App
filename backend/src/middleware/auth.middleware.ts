import { getAuth } from "@clerk/express";
import User from "../model/user.model.js";
import type { RequestHandler } from "express";

export const protectRoute: RequestHandler = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      res.status(404).json({ message: "User profile is not synced yet" });
      return;
    }

    req.user = user;

    next();
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error in protectRoute middleware:", errorMessage);
    res.status(500).json({ message: "Internal server error" });
  }
};
