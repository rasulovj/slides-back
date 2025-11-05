import express from "express";
import {
  register,
  login,
  refreshToken,
  logout,
  logoutAll,
} from "../controllers/authController";
import { protect } from "../middlewares/auth";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshToken);
router.post("/logout", protect, logout);
router.post("/logout-all", protect, logoutAll);

export default router;
