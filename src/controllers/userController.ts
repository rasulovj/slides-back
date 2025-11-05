import { Response } from "express";
import asyncHandler from "express-async-handler";
import cloudinary from "../config/cloudinary";
import User from "../models/user";
import { AuthRequest } from "../types";

export const updateUser = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401);
      throw new Error("Unauthorized");
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      user.password = req.body.password;
    }

    if (req.body.avatar && req.body.avatar !== user.avatar) {
      const result = await cloudinary.uploader.upload(req.body.avatar, {
        folder: "slidesproject/avatars",
      });
      user.avatar = result.secure_url;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
      },
    });
  }
);

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401);
    throw new Error("Unauthorized");
  }

  const user = await User.findById(userId).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json({
    success: true,
    user,
  });
});
