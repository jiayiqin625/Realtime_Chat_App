import type { RequestHandler } from "express";

export const checkAuth: RequestHandler = async (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  res.status(200).json(req.user);
  return;
};
