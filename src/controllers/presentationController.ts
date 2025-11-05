// src/controllers/presentationController.ts
import { Response } from "express";
import { AuthRequest } from "../types";
import User from "../models/user";
import Theme from "../models/theme";
import Presentation from "../models/presentation";
import { AIService } from "../services/aiService";
import { SlideGeneratorService } from "../services/slideGenerator";
import path from "path";
import fs from "fs/promises";

const aiService = new AIService();

export const generatePresentation = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { topic, language, themeSlug, format } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Check user limits
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (!user.isPremium && user.presentationsCount >= user.freeLimit) {
      res.status(403).json({
        message: "Free limit reached. Please upgrade to premium.",
      });
      return;
    }

    // Get theme
    const theme = await Theme.findOne({ slug: themeSlug });
    if (!theme) {
      res.status(404).json({ message: "Theme not found" });
      return;
    }

    // Check if theme is premium
    if (theme.isPremium && !user.isPremium) {
      res.status(403).json({
        message: "This theme requires premium subscription",
      });
      return;
    }

    // Generate content with AI
    const slideContent = await aiService.generateSlideContent(topic, language);

    // Generate PPTX
    const slideGenerator = new SlideGeneratorService(theme);
    const pptxBuffer = await slideGenerator.generateFromContent(
      slideContent.slides
    );

    // Save file
    const filename = `presentation-${Date.now()}.pptx`;
    const filepath = path.join(__dirname, "../../uploads", filename);
    await fs.writeFile(filepath, pptxBuffer);

    // Save to database
    const presentation = await Presentation.create({
      userId: user._id,
      title: slideContent.title,
      topic,
      language,
      theme: themeSlug,
      fileUrl: `/uploads/${filename}`,
      fileFormat: format || "pptx",
      slideCount: slideContent.slides.length,
    });

    // Update user count
    user.presentationsCount += 1;
    await user.save();

    res.status(201).json({
      success: true,
      presentation,
      downloadUrl: `/uploads/${filename}`,
    });
  } catch (error) {
    console.error("Generation error:", error);
    res.status(500).json({ message: "Failed to generate presentation", error });
  }
};

export const getUserPresentations = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const presentations = await Presentation.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      count: presentations.length,
      presentations,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
