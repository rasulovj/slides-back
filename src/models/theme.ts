// src/models/Theme.ts
import mongoose, { Document, Schema } from "mongoose";

export interface ITheme extends Document {
  name: string;
  slug: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    textLight: string;
    gradient?: string[];
  };
  fonts: {
    heading: string;
    body: string;
  };
  layouts: {
    titleSlide: string;
    contentSlide: string;
    imageSlide: string;
  };
  preview: string;
  isPremium: boolean;
  category: string;
}

const themeSchema = new Schema<ITheme>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
    },
    colors: {
      primary: { type: String, required: true },
      secondary: { type: String, required: true },
      accent: { type: String, required: true },
      background: { type: String, required: true },
      text: { type: String, required: true },
      textLight: { type: String, required: true },
    },
    fonts: {
      heading: { type: String, default: "Arial" },
      body: { type: String, default: "Arial" },
    },
    layouts: {
      titleSlide: { type: String, default: "default" },
      contentSlide: { type: String, default: "default" },
      imageSlide: { type: String, default: "default" },
    },
    preview: {
      type: String,
      required: true,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      enum: ["professional", "creative", "minimal", "bold"],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ITheme>("Theme", themeSchema);
