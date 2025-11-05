import { Request, Response } from "express";
import Theme from "../models/theme";

export const getAllThemes = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const themes = await Theme.find().sort({ isPremium: 1, name: 1 });

    res.status(200).json({
      success: true,
      count: themes.length,
      themes,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getThemeBySlug = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { slug } = req.params;
    const theme = await Theme.findOne({ slug });

    if (!theme) {
      res.status(404).json({ message: "Theme not found" });
      return;
    }

    res.status(200).json({
      success: true,
      theme,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getThemesByCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { category } = req.params;
    const themes = await Theme.find({ category }).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: themes.length,
      themes,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
