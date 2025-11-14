import express, {
  RequestHandler,
  Request,
  Response,
  NextFunction,
} from "express";
import multer from "multer";
import { convertPDFToPPTX } from "../controllers/convertController.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

router.post(
  "/pdf-to-pptx",
  protect as RequestHandler,
  upload.single("pdf"),
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
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
  convertPDFToPPTX as RequestHandler
);

export default router;
