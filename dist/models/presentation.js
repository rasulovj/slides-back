// src/models/Presentation.ts
import mongoose, { Schema } from "mongoose";
const presentationSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
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
    theme: {
        type: String,
        required: true,
    },
    fileUrl: {
        type: String,
        required: true,
    },
    fileFormat: {
        type: String,
        enum: ["pptx", "pdf"],
        default: "pptx",
    },
    slideCount: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});
export default mongoose.model("Presentation", presentationSchema);
