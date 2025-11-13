import express from "express";
import { generateFromDraft } from "../controllers/presentationController.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

router.post("/generate", protect, generateFromDraft);

export default router;
