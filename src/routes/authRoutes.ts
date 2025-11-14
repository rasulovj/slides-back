import express, { RequestHandler } from "express";
import {
  register,
  login,
  refreshToken,
  logout,
  logoutAll,
} from "../controllers/authController.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshToken);
router.post("/logout", protect as RequestHandler, logout as RequestHandler);

export default router;
