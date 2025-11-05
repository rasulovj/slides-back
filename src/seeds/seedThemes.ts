// src/seeds/themes.ts
import Theme from "../models/theme";

export const seedThemes = async () => {
  const themes = [
    {
      name: "Bold Edge",
      slug: "bold-edge",
      description: "Bold and modern design with strong colors",
      colors: {
        primary: "#2C1F47",
        secondary: "#FFD700",
        accent: "#FF6B6B",
        background: "#FFFFFF",
        text: "#2C1F47",
        textLight: "#6B7280",
      },
      fonts: {
        heading: "Montserrat",
        body: "Open Sans",
      },
      layouts: {
        titleSlide: "bold",
        contentSlide: "bold",
        imageSlide: "bold",
      },
      preview: "/themes/bold-edge.png",
      isPremium: false,
      category: "bold",
    },
    {
      name: "Slancia",
      slug: "slancia",
      description: "Clean and professional with diagonal accents",
      colors: {
        primary: "#0066FF",
        secondary: "#FF3333",
        accent: "#FFD700",
        background: "#FFFFFF",
        text: "#1F2937",
        textLight: "#6B7280",
      },
      fonts: {
        heading: "Poppins",
        body: "Inter",
      },
      layouts: {
        titleSlide: "diagonal",
        contentSlide: "diagonal",
        imageSlide: "diagonal",
      },
      preview: "/themes/slancia.png",
      isPremium: false,
      category: "professional",
    },
    {
      name: "Nexa",
      slug: "nexa",
      description: "Modern corporate style with geometric elements",
      colors: {
        primary: "#1E3A8A",
        secondary: "#FBBF24",
        accent: "#10B981",
        background: "#F9FAFB",
        text: "#111827",
        textLight: "#6B7280",
      },
      fonts: {
        heading: "Roboto",
        body: "Roboto",
      },
      layouts: {
        titleSlide: "geometric",
        contentSlide: "geometric",
        imageSlide: "geometric",
      },
      preview: "/themes/nexa.png",
      isPremium: false,
      category: "professional",
    },
    {
      name: "Freshtones",
      slug: "freshtones",
      description: "Fresh and vibrant with energetic colors",
      colors: {
        primary: "#0F172A",
        secondary: "#0EA5E9",
        accent: "#FBBF24",
        background: "#FFFFFF",
        text: "#0F172A",
        textLight: "#64748B",
      },
      fonts: {
        heading: "Nunito",
        body: "Nunito",
      },
      layouts: {
        titleSlide: "fresh",
        contentSlide: "fresh",
        imageSlide: "fresh",
      },
      preview: "/themes/freshtones.png",
      isPremium: true,
      category: "creative",
    },
    {
      name: "Geometric Grace",
      slug: "geometric-grace",
      description: "Elegant minimalism with geometric patterns",
      colors: {
        primary: "#000000",
        secondary: "#E5E7EB",
        accent: "#F59E0B",
        background: "#FFFFFF",
        text: "#111827",
        textLight: "#6B7280",
      },
      fonts: {
        heading: "Playfair Display",
        body: "Lato",
      },
      layouts: {
        titleSlide: "minimal",
        contentSlide: "minimal",
        imageSlide: "minimal",
      },
      preview: "/themes/geometric-grace.png",
      isPremium: true,
      category: "minimal",
    },
    {
      name: "Thesis",
      slug: "thesis",
      description: "Academic and professional presentation style",
      colors: {
        primary: "#1E40AF",
        secondary: "#FBBF24",
        accent: "#8B5CF6",
        background: "#FFFFFF",
        text: "#1F2937",
        textLight: "#6B7280",
      },
      fonts: {
        heading: "Merriweather",
        body: "Source Sans Pro",
      },
      layouts: {
        titleSlide: "academic",
        contentSlide: "academic",
        imageSlide: "academic",
      },
      preview: "/themes/thesis.png",
      isPremium: false,
      category: "professional",
    },
    {
      name: "Executive",
      slug: "executive",
      description: "Professional and dynamic business presentation style",
      colors: {
        primary: "#3D2E5C", // Deep purple from the image
        secondary: "#FFD700", // Gold accent
        accent: "#FF6B6B", // Coral/salmon for variety
        background: "#FFFFFF",
        text: "#1F2937",
        textLight: "#6B7280",
        gradient: ["#3D2E5C", "#5A4578", "#775D94"], // Purple gradient variations
      },
      fonts: {
        heading: "Montserrat",
        body: "Open Sans",
      },
      layouts: {
        titleSlide: "executive",
        contentSlide: "executive",
        imageSlide: "executive",
      },
      preview: "/themes/executive.png",
      isPremium: false,
      category: "professional",
    },
  ];

  try {
    await Theme.deleteMany({});
    await Theme.insertMany(themes);
    console.log("✅ Themes seeded successfully");
  } catch (error) {
    console.error("❌ Error seeding themes:", error);
  }
};
