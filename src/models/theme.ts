// src/models/theme.ts
import mongoose, { Schema, Document } from "mongoose";

interface FontConfig {
  family: string;
  weight?: {
    bold?: string;
    regular?: string;
  };
}

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  textDark: string;
  textLight: string;
}

interface ThemeConfig {
  colors: ThemeColors;
  fonts: {
    heading: FontConfig;
    body: FontConfig;
  };
}

interface LayoutFunction {
  name: string;
  // Store the layout logic as a string that we'll execute with Function()
  // Or store individual shape/text instructions
}

interface ITheme extends Document {
  id: string; // "executive", "minimal", etc
  name: string; // "Executive Corporate Theme"
  description?: string;
  isPremium: boolean;
  config: ThemeConfig;
  layouts: {
    [key: string]: any; // title, content, twoColumn, etc
  };
  previewImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ThemeSchema = new Schema<ITheme>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: String,
    isPremium: {
      type: Boolean,
      default: false,
    },
    config: {
      colors: {
        primary: { type: String, required: true },
        secondary: { type: String, required: true },
        accent: { type: String, required: true },
        background: { type: String, required: true },
        textDark: { type: String, required: true },
        textLight: { type: String, required: true },
      },
      fonts: {
        heading: {
          family: { type: String, required: true },
          weight: {
            bold: String,
            regular: String,
          },
        },
        body: {
          family: { type: String, required: true },
          weight: {
            bold: String,
            regular: String,
          },
        },
      },
    },
    layouts: {
      type: Schema.Types.Mixed, // Store layout instructions
      default: {},
    },
    previewImageUrl: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ITheme>("Theme", ThemeSchema);
