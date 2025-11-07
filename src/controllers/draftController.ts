// src/controllers/draftController.ts
import { Response } from "express";
import { AuthRequest } from "../types";
import PresentationDraft, { ISlide } from "../models/presentationDraft";
import User from "../models/user";
import Theme from "../models/theme";
import { AIService } from "../services/aiService";
import { v4 as uuidv4 } from "uuid";

const aiService = new AIService();

// Create new draft from AI generation
export const createDraft = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { topic, language, themeSlug } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Validate theme
    const theme = await Theme.findOne({ slug: themeSlug });
    if (!theme) {
      res.status(404).json({ message: "Theme not found" });
      return;
    }

    // Generate content with AI
    console.log(`Generating draft for: ${topic}`);
    const slideContent = await aiService.generateSlideContent(topic, language);

    // Convert to draft format
    const slides: ISlide[] = slideContent.slides.map((slide, index) => ({
      id: uuidv4(),
      type: slide.type,
      title: slide.title,
      content: slide.content,
      position: index,
      layout: "default",
      stats: slide.stats,
      chartData: slide.chartData,
    }));

    // Create draft
    const draft = await PresentationDraft.create({
      userId,
      title: slideContent.title,
      topic,
      language,
      themeSlug,
      slides,
      status: "draft",
      lastEditedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      draft: {
        id: draft._id,
        title: draft.title,
        slideCount: draft.slides.length,
        themeSlug: draft.themeSlug,
        createdAt: draft.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Draft creation error:", error);
    res.status(500).json({
      message: "Failed to create draft",
      error: error.message,
    });
  }
};

// Get user's drafts
export const getUserDrafts = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const drafts = await PresentationDraft.find({ userId })
      .sort({ lastEditedAt: -1 })
      .limit(50)
      .select(
        "title topic themeSlug slides.length status lastEditedAt createdAt"
      );

    res.status(200).json({
      success: true,
      count: drafts.length,
      drafts: drafts.map((draft) => ({
        id: draft._id,
        title: draft.title,
        topic: draft.topic,
        themeSlug: draft.themeSlug,
        slideCount: draft.slides.length,
        status: draft.status,
        lastEditedAt: draft.lastEditedAt,
        createdAt: draft.createdAt,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get single draft with full data
export const getDraftById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const draft = await PresentationDraft.findOne({ _id: id, userId });

    if (!draft) {
      res.status(404).json({ message: "Draft not found" });
      return;
    }

    res.status(200).json({
      success: true,
      draft: {
        id: draft._id,
        title: draft.title,
        topic: draft.topic,
        language: draft.language,
        themeSlug: draft.themeSlug,
        slides: draft.slides,
        status: draft.status,
        lastEditedAt: draft.lastEditedAt,
        createdAt: draft.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const updateDraft = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, slides } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const draft = await PresentationDraft.findOne({ _id: id, userId });

    if (!draft) {
      res.status(404).json({ message: "Draft not found" });
      return;
    }

    // Update fields
    if (title) draft.title = title;
    if (slides) draft.slides = slides;
    draft.lastEditedAt = new Date();

    await draft.save();

    res.status(200).json({
      success: true,
      message: "Draft updated successfully",
      draft: {
        id: draft._id,
        title: draft.title,
        slideCount: draft.slides.length,
        lastEditedAt: draft.lastEditedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Update single slide
export const updateSlide = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id, slideId } = req.params;
    const slideUpdate = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const draft = await PresentationDraft.findOne({ _id: id, userId });

    if (!draft) {
      res.status(404).json({ message: "Draft not found" });
      return;
    }

    // Find and update slide
    const slideIndex = draft.slides.findIndex((s) => s.id === slideId);

    if (slideIndex === -1) {
      res.status(404).json({ message: "Slide not found" });
      return;
    }

    draft.slides[slideIndex] = { ...draft.slides[slideIndex], ...slideUpdate };
    draft.lastEditedAt = new Date();

    await draft.save();

    res.status(200).json({
      success: true,
      message: "Slide updated successfully",
      slide: draft.slides[slideIndex],
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Add new slide
export const addSlide = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { position, type } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const draft = await PresentationDraft.findOne({ _id: id, userId });

    if (!draft) {
      res.status(404).json({ message: "Draft not found" });
      return;
    }

    // Create new slide
    const newSlide: ISlide = {
      id: uuidv4(),
      type: type || "content",
      title: "New Slide",
      content: ["Add your content here"],
      position: position ?? draft.slides.length,
      layout: "default",
    };

    // Insert at position
    draft.slides.splice(newSlide.position, 0, newSlide);

    // Update positions
    draft.slides.forEach((slide, index) => {
      slide.position = index;
    });

    draft.lastEditedAt = new Date();
    await draft.save();

    res.status(201).json({
      success: true,
      message: "Slide added successfully",
      slide: newSlide,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Delete slide
export const deleteSlide = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id, slideId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const draft = await PresentationDraft.findOne({ _id: id, userId });

    if (!draft) {
      res.status(404).json({ message: "Draft not found" });
      return;
    }

    // Remove slide
    draft.slides = draft.slides.filter((s) => s.id !== slideId);

    // Update positions
    draft.slides.forEach((slide, index) => {
      slide.position = index;
    });

    draft.lastEditedAt = new Date();
    await draft.save();

    res.status(200).json({
      success: true,
      message: "Slide deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Reorder slides
export const reorderSlides = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { slideOrder } = req.body; // Array of slide IDs in new order
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const draft = await PresentationDraft.findOne({ _id: id, userId });

    if (!draft) {
      res.status(404).json({ message: "Draft not found" });
      return;
    }

    // Reorder slides
    const reorderedSlides: ISlide[] = [];
    slideOrder.forEach((slideId: string, index: number) => {
      const slide = draft.slides.find((s) => s.id === slideId);
      if (slide) {
        slide.position = index;
        reorderedSlides.push(slide);
      }
    });

    draft.slides = reorderedSlides;
    draft.lastEditedAt = new Date();
    await draft.save();

    res.status(200).json({
      success: true,
      message: "Slides reordered successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Delete draft
export const deleteDraft = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const result = await PresentationDraft.deleteOne({ _id: id, userId });

    if (result.deletedCount === 0) {
      res.status(404).json({ message: "Draft not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Draft deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Duplicate draft
export const duplicateDraft = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const original = await PresentationDraft.findOne({ _id: id, userId });

    if (!original) {
      res.status(404).json({ message: "Draft not found" });
      return;
    }

    // Create duplicate with new IDs
    const duplicate = await PresentationDraft.create({
      userId: original.userId,
      title: `${original.title} (Copy)`,
      topic: original.topic,
      language: original.language,
      themeSlug: original.themeSlug,
      slides: original.slides.map((slide) => ({
        ...slide,
        id: uuidv4(),
      })),
      status: "draft",
      lastEditedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Draft duplicated successfully",
      draft: {
        id: duplicate._id,
        title: duplicate.title,
        slideCount: duplicate.slides.length,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
