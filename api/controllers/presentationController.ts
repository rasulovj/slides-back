// src/controllers/presentationController.ts

import { Response } from "express";
import { AuthRequest } from "../types/index.js";
import User from "../models/user.js";
import Theme from "../models/theme.js";
import Presentation from "../models/presentation.js";
import PresentationDraft from "../models/presentationDraft.js";
import { SlideGeneratorService } from "../services/slideGenerator.js";
import path from "path";
import fs from "fs/promises";

export const generateFromDraft = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { draftId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Check free limit
    if (!user.isPremium && user.presentationsCount >= user.freeLimit) {
      res.status(403).json({
        message: "Free limit reached. Please upgrade to premium.",
      });
      return;
    }

    // Find draft
    const draft = await PresentationDraft.findOne({ _id: draftId, userId });
    if (!draft) {
      res.status(404).json({ message: "Draft not found" });
      return;
    }

    // Find theme
    const theme = await Theme.findOne({ slug: draft.themeSlug });
    if (!theme) {
      res.status(404).json({ message: "Theme not found" });
      return;
    }

    // Check premium theme restriction
    if (theme.isPremium && !user.isPremium) {
      res.status(403).json({
        message: "This theme requires premium subscription",
      });
      return;
    }

    draft.status = "generating";
    await draft.save();

    console.log(`Generating presentation from draft: ${draft.title}`);

    const slideGenerator = new SlideGeneratorService(theme);
    const pptxBuffer = await slideGenerator.generateFromContent(draft.slides);

    const filename = `presentation-${Date.now()}.pptx`;
    const uploadDir = path.join(__dirname, "../../uploads");
    await fs.mkdir(uploadDir, { recursive: true });
    const filepath = path.join(uploadDir, filename);
    await fs.writeFile(filepath, pptxBuffer);

    const presentation = await Presentation.create({
      userId: user._id,
      title: draft.title,
      topic: draft.topic,
      language: draft.language,
      theme: draft.themeSlug,
      fileUrl: `/uploads/${filename}`,
      fileFormat: "pptx",
      slideCount: draft.slides.length,
    });

    draft.status = "completed";
    await draft.save();

    user.presentationsCount += 1;
    await user.save();

    res.status(201).json({
      success: true,
      presentation: {
        id: presentation._id,
        title: presentation.title,
        slideCount: presentation.slideCount,
        createdAt: presentation.createdAt,
      },
      downloadUrl: `/uploads/${filename}`,
    });
  } catch (error: any) {
    console.error("Generation error:", error);
    res.status(500).json({
      message: "Failed to generate presentation",
      error: error.message,
    });
  }
};
