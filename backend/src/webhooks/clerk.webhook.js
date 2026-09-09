import express from "express";
import { clerkController } from "../controllers/clerkController.js";

const router = express.Router();

router.post("/", clerkController);

export default router;
