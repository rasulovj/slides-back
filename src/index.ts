import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { dirname } from "path";
import connectDb from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import themeRoutes from "./routes/themeRouter.js";
import presentationRoutes from "./routes/presentationRoute.js";
import userRoute from "./routes/userRoute.js";
import draftRoutes from "./routes/draftRoute.js";
import converRoute from "./routes/converRoute.js";
import googleRoute from "./routes/auth.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
  "https://slidesmind.vercel.app",
  "https://slides-back.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const uploadsPath = path.join(__dirname, "../uploads");
await fs.mkdir(uploadsPath, { recursive: true });
app.use("/uploads", express.static(uploadsPath));

const startServer = async () => {
  try {
    await connectDb();

    console.log(
      `Memory used: ${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`
    );

    app.use("/api/auth", authRoutes);
    app.use("/api/themes", themeRoutes);
    app.use("/api/presentations", presentationRoutes);
    app.use("/api/users", userRoute);
    app.use("/api/drafts", draftRoutes);
    app.use("/api/export", converRoute);
    app.use("/api/auth/", googleRoute);

    app.get("/health", (req, res) => {
      res.status(200).json({ status: "OK", message: "Server is running" });
    });

    app.use(
      (
        err: any,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ) => {
        if (err.name === "MulterError") {
          console.error("Multer error:", err);
          return res.status(400).json({
            message: "File upload error",
            error: err.message,
            code: err.code,
          });
        }
        next(err);
      }
    );

    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server startup error:", error);
    process.exit(1);
  }
};

startServer();
