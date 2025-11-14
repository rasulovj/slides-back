import express, { RequestHandler } from "express";
import { generateFromDraft } from "../controllers/presentationController.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

router.post(
  "/generate",
  protect as RequestHandler,
  generateFromDraft as RequestHandler
);

export default router;
