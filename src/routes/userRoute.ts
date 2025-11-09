import express from "express";
import { getMe, updateUser } from "../controllers/userController.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

router.get("/me", protect, getMe);
router.put("/update-me", protect, updateUser);

export default router;
