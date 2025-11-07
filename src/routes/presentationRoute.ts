import express from "express";
import {
  generateFromDraft,
  // getUserPresentations,
} from "../controllers/presentationController";
import { protect } from "../middlewares/auth";

const router = express.Router();

router.post("/generate", protect, generateFromDraft);
// router.get("/my-presentations", protect, getUserPresentations);

export default router;
