import express from "express";
import { updateUser } from "../controllers/userController";
import { protect } from "../middlewares/auth";

const router = express.Router();

router.put("/update-me", protect, updateUser);

export default router;
