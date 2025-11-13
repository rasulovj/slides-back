import { Response } from "express";
import { AuthRequest } from "../types/index.js";
import User from "../models/user.js";
import Presentation from "../models/presentation.js";
import PresentationDraft from "../models/presentationDraft.js";
import cloudinary from "../config/cloudinary.js";
import axios from "axios";
import FormData from "form-data";
import { Readable } from "stream";

const CONVERTAPI_SECRET = process.env.CONVERTAPI_SECRET;

if (!CONVERTAPI_SECRET) {
  console.error("❌ Missing ConvertAPI credentials");
  console.error(
    "   CONVERTAPI_SECRET:",
    CONVERTAPI_SECRET ? "✓ Set" : "✗ Missing"
  );
  console.error("   Please set CONVERTAPI_SECRET in your .env file");
  console.error("   Get it from: https://www.convertapi.com/a/auth");
} else {
  console.log("✅ ConvertAPI configured");
  console.log("   Secret preview:", CONVERTAPI_SECRET.substring(0, 12) + "...");
}

const convertPDFToPPTXWithAPI = async (pdfBuffer: Buffer): Promise<Buffer> => {
  try {
    console.log("🔄 Converting PDF to PPTX using ConvertAPI...");
    console.log(`   PDF size: ${pdfBuffer.byteLength} bytes`);

    if (!CONVERTAPI_SECRET) {
      throw new Error("ConvertAPI secret is not configured");
    }

    const pdfHeader = pdfBuffer.slice(0, 4).toString();
    if (pdfHeader !== "%PDF") {
      console.error("❌ Invalid PDF header:", pdfHeader);
      throw new Error("Invalid PDF file format");
    }
    console.log("   ✅ PDF header valid");

    const form = new FormData();
    form.append("File", Readable.from([pdfBuffer]), {
      filename: "presentation.pdf",
      contentType: "application/pdf",
    });

    console.log("   Sending conversion request...");

    const apiUrl = `https://v2.convertapi.com/pdf/to/pptx?Secret=${CONVERTAPI_SECRET}&StoreFile=true`;

    const conversionResponse = await axios.post(apiUrl, form, {
      headers: {
        ...form.getHeaders(),
      },
      timeout: 120000,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      validateStatus: (status) => status < 500,
    });

    console.log("   Conversion response status:", conversionResponse.status);

    if (
      conversionResponse.status === 401 ||
      conversionResponse.status === 403
    ) {
      console.error("❌ ConvertAPI authentication failed");
      console.error(
        "   Response:",
        JSON.stringify(conversionResponse.data, null, 2)
      );
      throw new Error(
        "ConvertAPI authentication failed. Please check your CONVERTAPI_SECRET in .env file"
      );
    }

    if (conversionResponse.status !== 200) {
      console.error("❌ ConvertAPI error:", conversionResponse.status);
      console.error(
        "   Response:",
        JSON.stringify(conversionResponse.data, null, 2)
      );
      throw new Error(
        `ConvertAPI returned status ${conversionResponse.status}: ${
          conversionResponse.data?.Message ||
          conversionResponse.data?.message ||
          "Unknown error"
        }`
      );
    }

    console.log("✅ Conversion successful");

    if (
      !conversionResponse.data ||
      !conversionResponse.data.Files ||
      conversionResponse.data.Files.length === 0
    ) {
      console.error("❌ No files in response");
      console.error(
        "   Response:",
        JSON.stringify(conversionResponse.data, null, 2)
      );
      throw new Error("No converted file returned from ConvertAPI");
    }

    const fileUrl = conversionResponse.data.Files[0].Url;
    const fileSize = conversionResponse.data.Files[0].FileSize;
    const fileName = conversionResponse.data.Files[0].FileName;

    console.log("   File URL:", fileUrl);
    console.log("   File name:", fileName);
    console.log("   File size:", fileSize, "bytes");

    console.log("   Downloading converted PPTX...");
    const downloadResponse = await axios.get(fileUrl, {
      responseType: "arraybuffer",
      timeout: 60000,
      maxContentLength: Infinity,
    });

    const pptxBuffer = Buffer.from(downloadResponse.data);
    console.log(`✅ PPTX downloaded: ${pptxBuffer.byteLength} bytes`);

    const pptxHeader = pptxBuffer.slice(0, 2).toString("hex");
    console.log(`   PPTX header: ${pptxHeader} (expecting 504b for PK)`);

    if (pptxHeader !== "504b") {
      console.error("❌ Invalid PPTX file!");
      console.error("   Header hex:", pptxHeader);
      console.error(
        "   First 20 bytes:",
        pptxBuffer.slice(0, 20).toString("hex")
      );
      console.error("   First 20 chars:", pptxBuffer.slice(0, 20).toString());
      throw new Error("Downloaded file is not a valid PPTX");
    }

    console.log("   ✅ PPTX file is valid");
    return pptxBuffer;
  } catch (error: any) {
    console.error("❌ ConvertAPI conversion error:");
    console.error("   Error type:", error.constructor.name);
    console.error("   Message:", error.message);

    if (error.response) {
      console.error("   HTTP Status:", error.response.status);
      console.error("   Status Text:", error.response.statusText);
      console.error(
        "   Response Data:",
        JSON.stringify(error.response.data, null, 2)
      );
    }

    if (error.code) {
      console.error("   Error Code:", error.code);
    }

    if (
      error.message.includes("authentication") ||
      error.message.includes("401")
    ) {
      throw new Error(
        "ConvertAPI authentication failed. Please verify your CONVERTAPI_SECRET in .env file"
      );
    }

    throw new Error(`PDF to PPTX conversion failed: ${error.message}`);
  }
};

export const convertPDFToPPTX = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { draftId, title } = req.body;

    console.log("\n=== PDF TO PPTX CONVERSION REQUEST ===");
    console.log("   User ID:", userId);
    console.log("   Draft ID:", draftId);
    console.log("   Title:", title);
    console.log("   File uploaded:", !!req.file);
    console.log("   File size:", req.file?.size, "bytes");
    console.log("   File mimetype:", req.file?.mimetype);
    console.log("=====================================\n");

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!req.file) {
      res.status(400).json({ message: "No PDF file uploaded" });
      return;
    }

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

    const draft = await PresentationDraft.findOne({ _id: draftId, userId });
    if (!draft) {
      res.status(404).json({ message: "Draft not found" });
      return;
    }

    console.log(`📄 Starting conversion: "${title}"`);

    // Step 1: Convert PDF to PPTX
    const pptxBuffer = await convertPDFToPPTXWithAPI(req.file.buffer);
    console.log(`✅ Conversion complete: ${pptxBuffer.byteLength} bytes`);

    // Step 2: Upload to Cloudinary
    const timestamp = Date.now();
    const filename = `presentation-${timestamp}.pptx`;
    let fileUrl: string;
    let cloudinaryId: string | undefined;

    try {
      console.log("☁️  Uploading to Cloudinary...");
      const uploadResult = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "presentations",
            public_id: `presentation-${timestamp}`,
            resource_type: "raw",
            format: "pptx",
          },
          (error, result) => {
            if (error) {
              console.error("❌ Cloudinary upload error:", error);
              reject(error);
            } else {
              console.log("✅ Cloudinary upload successful");
              console.log("   URL:", result?.secure_url);
              console.log("   Size:", result?.bytes, "bytes");
              resolve(result);
            }
          }
        );

        const readable = new Readable();
        readable.push(pptxBuffer);
        readable.push(null);
        readable.pipe(uploadStream);
      });

      fileUrl = uploadResult.secure_url;
      cloudinaryId = uploadResult.public_id;
    } catch (error: any) {
      console.error("⚠️  Cloudinary upload failed:", error.message);
      throw new Error("Failed to upload PPTX to cloud storage");
    }

    // Step 3: Save Presentation record
    const presentation = await Presentation.create({
      userId: user._id,
      title: draft.title,
      topic: draft.topic,
      language: draft.language,
      theme: draft.themeSlug,
      fileUrl,
      fileFormat: "pptx",
      slideCount: draft.slides.length,
      cloudinaryId,
      fileSize: pptxBuffer.byteLength,
      exportedAt: new Date(),
      exportMethod: "pdf", // Track that this was converted from PDF
    });

    // Step 4: Update draft status
    draft.status = "completed";
    await draft.save();

    // Step 5: Increment user counter
    user.presentationsCount = (user.presentationsCount || 0) + 1;
    await user.save();

    console.log(`✅ Presentation saved: ${presentation._id}`);
    console.log("=== CONVERSION COMPLETE ===\n");

    res.status(201).json({
      success: true,
      presentation: {
        id: presentation._id,
        title: presentation.title,
        slideCount: presentation.slideCount,
        createdAt: presentation.createdAt,
        theme: presentation.theme,
      },
      downloadUrl: fileUrl,
    });
  } catch (error: any) {
    console.error("\n❌ CONVERSION FAILED");
    console.error("   Error:", error.message);
    console.error("   Stack:", error.stack);
    console.error("=========================\n");

    res.status(500).json({
      message: "Failed to convert PDF to PPTX",
      error: error.message,
    });
  }
};
