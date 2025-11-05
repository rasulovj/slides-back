import express from "express";
import {
  generatePresentation,
  getUserPresentations,
} from "../controllers/presentationController";
import { protect } from "../middlewares/auth";

const router = express.Router();

router.post("/generate", protect, generatePresentation);
router.get("/my-presentations", protect, getUserPresentations);

export default router;
