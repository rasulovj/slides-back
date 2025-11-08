// src/routes/draftRoutes.ts
import express from "express";
import {
  createDraft,
  getUserDrafts,
  getDraftById,
  updateDraft,
  updateSlide,
  addSlide,
  deleteSlide,
  reorderSlides,
  deleteDraft,
  duplicateDraft,
  updateDraftThumbnail,
} from "../controllers/draftController.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

router.use(protect);

router.post("/", createDraft);
router.get("/", getUserDrafts);
router.get("/:id", getDraftById);
router.put("/:id", updateDraft);
router.delete("/:id", deleteDraft);
router.post("/:id/duplicate", duplicateDraft);
router.put("/:id/thumbnail", updateDraftThumbnail);

// Slide operations
router.put("/:id/slides/:slideId", updateSlide);
router.post("/:id/slides", addSlide);
router.delete("/:id/slides/:slideId", deleteSlide);
router.put("/:id/slides/reorder", reorderSlides);

export default router;
