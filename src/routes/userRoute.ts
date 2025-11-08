import express from "express";
import { getMe, updateUser } from "../controllers/userController";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

router.get("/me", protect, getMe);
router.put("/update-me", protect, updateUser);

export default router;
