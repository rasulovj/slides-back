import express from "express";
import {
  getAllThemes,
  getThemeBySlug,
} from "../controllers/themeController.js";

const router = express.Router();

router.get("/", getAllThemes);
router.get("/:slug", getThemeBySlug);

export default router;
