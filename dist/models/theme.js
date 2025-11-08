// src/models/Theme.ts
import mongoose, { Schema } from "mongoose";
const themeSchema = new Schema({
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
}, {
    timestamps: true,
});
export default mongoose.model("Theme", themeSchema);
