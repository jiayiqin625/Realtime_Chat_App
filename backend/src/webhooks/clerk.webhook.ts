import express from "express";
import { clerkController } from "../controllers/clerk.controller.js";

const router = express.Router();

router.post("/", clerkController);

export default router;
