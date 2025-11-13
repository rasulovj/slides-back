import { Response } from "express";
import { AuthRequest } from "../types/index.js";
import User from "../models/user.js";
import Theme from "../models/theme.js";
import Presentation from "../models/presentation.js";
import PresentationDraft from "../models/presentationDraft.js";
import cloudinary from "../config/cloudinary.js";
import { Readable } from "stream";
import { generatePPTXBuffer } from "../services/slideGenerator.js";

export const generateFromDraft = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { draftId, themeSlug } = req.body;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Check free tier limit
    if (!user.isPremium && user.presentationsCount >= user.freeLimit) {
      res.status(403).json({
        message: "Free limit reached. Please upgrade to premium.",
      });
      return;
    }

    // Fetch draft with latest content
    const draft = await PresentationDraft.findOne({ _id: draftId, userId });
    if (!draft) {
      res.status(404).json({ message: "Draft not found" });
      return;
    }

    // Fetch theme from DB with layouts
    const theme = await Theme.findOne({ id: themeSlug || draft.themeSlug });
    if (!theme) {
      res.status(404).json({ message: "Theme not found" });
      return;
    }

    // Check premium theme
    if (theme.isPremium && !user.isPremium) {
      res.status(403).json({
        message: "This theme requires premium subscription",
      });
      return;
    }

    draft.status = "generating";
    await draft.save();

    console.log(`🚀 Generating PPTX: ${draft.title}`);
    console.log(`📝 Theme: ${theme.id}`);
    console.log(`📊 Slides: ${draft.slides.length}`);

    const filename = `presentation-${Date.now()}.pptx`;

    try {
      // ✅ Generate PPTX using draft slides + DB theme layouts
      const pptxBuffer = await generatePPTXBuffer(draft.slides, theme);
      console.log(`📄 Buffer created: ${pptxBuffer.byteLength} bytes`);

      // Upload to Cloudinary
      const uploadResult = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "presentations",
            public_id: filename.replace(".pptx", ""),
            resource_type: "raw",
            format: "pptx",
          },
          (error, result) => {
            if (error) {
              console.error("❌ Cloudinary error:", error);
              reject(error);
            } else {
              console.log("✅ Uploaded to Cloudinary");
              resolve(result);
            }
          }
        );

        const readable = new Readable();
        readable.push(pptxBuffer);
        readable.push(null);
        readable.pipe(uploadStream);
      });

      // Save presentation record
      const presentation = await Presentation.create({
        userId: user._id,
        title: draft.title,
        topic: draft.topic,
        language: draft.language,
        theme: theme.id,
        fileUrl: uploadResult.secure_url,
        fileFormat: "pptx",
        slideCount: draft.slides.length,
        cloudinaryId: uploadResult.public_id,
        fileSize: uploadResult.bytes,
        exportedAt: new Date(),
      });

      // Update draft status
      draft.status = "completed";
      await draft.save();

      // Increment user counter
      user.presentationsCount = (user.presentationsCount || 0) + 1;
      await user.save();

      console.log(`✅ Presentation created: ${presentation._id}`);

      res.status(201).json({
        success: true,
        presentation: {
          id: presentation._id,
          title: presentation.title,
          slideCount: presentation.slideCount,
          createdAt: presentation.createdAt,
          theme: presentation.theme,
        },
        downloadUrl: uploadResult.secure_url,
      });
    } catch (error: any) {
      console.error("⚠️  Generation error:", error.message);

      // draft.status = "failed";
      await draft.save();

      throw error;
    }
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    res.status(500).json({
      message: "Failed to export presentation",
      error: error.message,
    });
  }
};
