import express from "express";
import {
  getAllThemes,
  getThemeBySlug,
  getThemesByCategory,
} from "../controllers/themeController";

const router = express.Router();

router.get("/", getAllThemes);
router.get("/:slug", getThemeBySlug);
router.get("/category/:category", getThemesByCategory);

export default router;
