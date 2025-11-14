import express from "express";
import passport from "../config/passport.js";
import tokenService from "../utils/generateToken.js";

const router = express.Router();

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  async (req: any, res) => {
    const user = req.user;

    const accessToken = tokenService.generateAccessToken({
      id: user._id,
      email: user.email,
      isPremium: user.isPremium,
    });

    const refreshToken = tokenService.generateRefreshToken({
      id: user._id,
      email: user.email,
    });

    await user.updateOne({ $push: { refreshTokens: refreshToken } });

    res.redirect(
      `${process.env.FRONTEND_URL}/success?accessToken=${accessToken}&refreshToken=${refreshToken}`
    );
  }
);

export default router;
