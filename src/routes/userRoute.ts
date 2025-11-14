import express, { RequestHandler } from "express";
import { getMe, updateUser } from "../controllers/userController.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

router.get("/me", protect as RequestHandler, getMe as RequestHandler);
router.put(
  "/update-me",
  protect as RequestHandler,
  updateUser as RequestHandler
);

export default router;
