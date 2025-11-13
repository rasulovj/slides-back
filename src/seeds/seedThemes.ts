import theme from "../models/theme.js";
import { executiveThemeLayouts } from "../services/themes/executive/themeLayout.js";
import dotenv from "dotenv";

dotenv.config();
export const seedThemes = async () => {
  const themes = [
    {
      id: "executive",
      name: "Executive Corporate Theme",
      description: "Professional corporate theme with geometric shapes",
      isPremium: false,
      config: {
        colors: {
          primary: "#1E40AF",
          secondary: "#60A5FA",
          accent: "#F4B740",
          background: "#FFFFFF",
          textDark: "#0F172A",
          textLight: "#FFFFFF",
        },
        fonts: {
          heading: {
            family: "Arial",
            weight: {
              bold: "700",
              regular: "400",
            },
          },
          body: {
            family: "Calibri",
            weight: {
              bold: "700",
              regular: "400",
            },
          },
        },
      },
      layouts: executiveThemeLayouts,
    },
    // Add more themes here
  ];
  try {
    await theme.deleteMany({});
    await theme.insertMany(themes);
    console.log("✅ Themes seeded successfully");
  } catch (error) {
    console.error("❌ Error seeding themes:", error);
  }
};
