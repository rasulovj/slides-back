// src/routes/export.ts (or wherever your route is defined)
import express from "express";
import multer from "multer";
import { convertPDFToPPTX } from "../controllers/convertController.js";
import { protect } from "../middlewares/auth.js"; // Adjust path as needed

const router = express.Router();

// Configure multer for PDF uploads
const storage = multer.memoryStorage(); // Store in memory as Buffer

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
  },
  fileFilter: (req, file, cb) => {
    console.log("📎 File upload attempt:");
    console.log("   Field name:", file.fieldname);
    console.log("   Original name:", file.originalname);
    console.log("   Mimetype:", file.mimetype);
    console.log("   Size:", file.size);

    // Accept PDF files
    if (file.mimetype === "application/pdf") {
      console.log("   ✅ PDF file accepted");
      cb(null, true);
    } else {
      console.log("   ❌ File rejected - not a PDF");
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

// Route: Convert PDF to PPTX
// IMPORTANT: The field name must match what the frontend sends
router.post(
  "/pdf-to-pptx",
  protect, // Your authentication middleware
  upload.single("pdf"), // ✅ Field name is "pdf" - must match frontend FormData
  (req, res, next) => {
    // Debug middleware to see what we received
    console.log("\n=== MULTER DEBUG ===");
    console.log("req.file:", req.file ? "✓ Present" : "✗ Missing");
    console.log("req.body:", req.body);
    console.log("==================\n");

    if (!req.file) {
      console.error("❌ Multer did not receive file!");
      console.error("   Check frontend FormData field name");
      return res.status(400).json({
        message: "No PDF file uploaded",
        debug: {
          bodyKeys: Object.keys(req.body),
          expectedField: "pdf",
        },
      });
    }

    next();
  },
  convertPDFToPPTX
);

export default router;
