import express from "express";
import { generateFromDraft,
// getUserPresentations,
 } from "../controllers/presentationController.js";
import { protect } from "../middlewares/auth.js";
const router = express.Router();
router.post("/generate", protect, generateFromDraft);
// router.get("/my-presentations", protect, getUserPresentations);
export default router;
