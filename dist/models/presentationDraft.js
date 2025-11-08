// src/models/PresentationDraft.ts
import mongoose, { Schema } from "mongoose";
const slideSchema = new Schema({
    id: { type: String, required: true },
    type: {
        type: String,
        enum: [
            "title",
            "content",
            "stats",
            "timeline",
            "chart",
            "closing",
            "image",
        ],
        required: true,
    },
    title: { type: String, required: true },
    content: [{ type: String }],
    position: { type: Number, required: true },
    layout: { type: String, default: "default" },
    backgroundColor: String,
    textColor: String,
    stats: [
        {
            label: String,
            value: String,
            description: String,
        },
    ],
    chartData: [
        {
            label: String,
            value: Number,
        },
    ],
    imageUrl: String,
    notes: String,
}, { _id: false });
const presentationDraftSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    title: {
        type: String,
        required: true,
    },
    topic: {
        type: String,
        required: true,
    },
    language: {
        type: String,
        required: true,
        default: "en",
    },
    themeSlug: {
        type: String,
        required: true,
    },
    slides: [slideSchema],
    status: {
        type: String,
        enum: ["draft", "generating", "completed"],
        default: "draft",
    },
    thumbnail: {
        type: String,
        default: null,
    },
    lastEditedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});
// Index for faster queries
presentationDraftSchema.index({ userId: 1, updatedAt: -1 });
export default mongoose.model("PresentationDraft", presentationDraftSchema);
