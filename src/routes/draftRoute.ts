import express, { RequestHandler } from "express";
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

router.use(protect as RequestHandler);

router.post("/", createDraft as RequestHandler);
router.get("/", getUserDrafts as RequestHandler);
router.get("/:id", getDraftById as RequestHandler);
router.put("/:id", updateDraft as RequestHandler);
router.delete("/:id", deleteDraft as RequestHandler);
router.post("/:id/duplicate", duplicateDraft as RequestHandler);
router.put("/:id/thumbnail", updateDraftThumbnail as RequestHandler);

router.put("/:id/slides/:slideId", updateSlide as RequestHandler);
router.post("/:id/slides", addSlide as RequestHandler);
router.delete("/:id/slides/:slideId", deleteSlide as RequestHandler);
router.put("/:id/slides/reorder", reorderSlides as RequestHandler);

export default router;
