import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import fs from "fs/promises";
import connectDb from "./config/db";
import authRoutes from "./routes/authRoutes";
import themeRoutes from "./routes/themeRouter";
import presentationRoutes from "./routes/presentationRoute";
import userRoute from "./routes/userRoute";
import Theme from "./models/theme";
import { seedThemes } from "./seeds/seedThemes";
import draftRoutes from "./routes/draftRoute";
import { protect } from "./middlewares/auth";
import { generateFromDraft } from "./controllers/presentationController";

dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));

const uploadsPath = path.join(__dirname, "../uploads");
fs.mkdir(uploadsPath, { recursive: true });
app.use("/uploads", express.static(uploadsPath));

const startServer = async () => {
  try {
    await connectDb();

    const count = await Theme.countDocuments();
    if (count === 0) {
      console.log("🌱 Seeding themes...");
      await seedThemes();
    } else {
      console.log("🧹 Clearing old themes...");
      await Theme.deleteMany({});
      console.log("🌱 Reseeding themes...");
      await seedThemes();
    }

    app.use("/api/auth", authRoutes);
    app.use("/api/themes", themeRoutes);
    app.use("/api/presentations", presentationRoutes);
    app.use("/api/users", userRoute);
    app.use("/api/drafts", draftRoutes);
    app.post(
      "/api/presentations/from-draft/:draftId",
      protect,
      generateFromDraft
    );

    app.get("/health", (req, res) => {
      res.status(200).json({ status: "OK", message: "Server is running" });
    });

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
