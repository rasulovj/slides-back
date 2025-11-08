// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import morgan from "morgan";
// import path from "path";
// import fs from "fs/promises";
// import { fileURLToPath } from "url";
// import { dirname } from "path";
// import connectDb from "./config/db.js";
// import authRoutes from "./routes/authRoutes.js";
// import themeRoutes from "./routes/themeRouter.js";
// import presentationRoutes from "./routes/presentationRoute.js";
// import userRoute from "./routes/userRoute.js";
// import Theme from "./models/theme.js";
// import { seedThemes } from "./seeds/seedThemes.js";
// import draftRoutes from "./routes/draftRoute.js";
// import { protect } from "./middlewares/auth.js";
// import { generateFromDraft } from "./controllers/presentationController.js";

// dotenv.config();

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// const app = express();

// const allowedOrigins = [
//   "http://localhost:3000",
//   "http://localhost:5173",
//   "http://127.0.0.1:3000",
//   "http://127.0.0.1:5173",
//   "https://slidesmind.vercel.app",
//   "https://slides-back.vercel.app",
// ];

// app.use(
//   cors({
//     origin: allowedOrigins,
//     credentials: true,
//   })
// );

// app.use(express.json());
// app.use(morgan("dev"));
// app.use(express.urlencoded({ extended: true }));

// const uploadsPath = path.join(__dirname, "../uploads");
// await fs.mkdir(uploadsPath, { recursive: true });
// app.use("/uploads", express.static(uploadsPath));

// const startServer = async () => {
//   try {
//     await connectDb();

//     const count = await Theme.countDocuments();
//     if (count === 0) {
//       console.log("🌱 Seeding themes...");
//       await seedThemes();
//     } else {
//       console.log("🧹 Clearing old themes...");
//       await Theme.deleteMany({});
//       console.log("🌱 Reseeding themes...");
//       await seedThemes();
//     }
//     console.log(
//       `Memory used: ${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`
//     );

//     app.use("/api/auth", authRoutes);
//     app.use("/api/themes", themeRoutes);
//     app.use("/api/presentations", presentationRoutes);
//     app.use("/api/users", userRoute);
//     app.use("/api/drafts", draftRoutes);
//     app.post(
//       "/api/presentations/from-draft/:draftId",
//       protect,
//       generateFromDraft
//     );

//     app.get("/health", (req, res) => {
//       res.status(200).json({ status: "OK", message: "Server is running" });
//     });

//     const PORT = process.env.PORT || 8080;
//     app.listen(PORT, () => {
//       console.log(`🚀 Server running on port ${PORT}`);
//     });
//   } catch (error) {
//     console.error("❌ Server startup error:", error);
//     process.exit(1);
//   }
// };

// startServer();

// api/index.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import connectDb from "../api/config/db.js";
import authRoutes from "../api/routes/authRoutes.js";
import themeRoutes from "../api/routes/themeRouter.js";
import presentationRoutes from "../api/routes/presentationRoute.js";
import userRoute from "../api/routes/userRoute.js";
import draftRoutes from "../api/routes/draftRoute.js";
import { protect } from "../api/middlewares/auth.js";
import { generateFromDraft } from "../api/controllers/presentationController.js";
import Theme from "../api/models/theme.js";
import { seedThemes } from "../api/seeds/seedThemes.js";

dotenv.config();

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
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/themes", themeRoutes);
app.use("/api/presentations", presentationRoutes);
app.use("/api/users", userRoute);
app.use("/api/drafts", draftRoutes);
app.post("/api/presentations/from-draft/:draftId", protect, generateFromDraft);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

// Database connection & seeding
const initDb = async () => {
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
  } catch (err) {
    console.error("❌ DB init error:", err);
  }
};

await initDb();

// **Export app as serverless handler**
export default (req: any, res: any) => app(req, res);
