// src/models/PresentationDraft.ts
import mongoose, { Document, Schema, Types } from "mongoose";

export interface ISlide {
  id: string;
  type:
    | "title"
    | "content"
    | "stats"
    | "timeline"
    | "chart"
    | "closing"
    | "image";
  title: string;
  content: string[];
  position: number;
  layout: string;
  backgroundColor?: string;
  textColor?: string;
  stats?: {
    label: string;
    value: string;
    description: string;
  }[];
  chartData?: {
    label: string;
    value: number;
  }[];
  imageUrl?: string;
  notes?: string;
}

export interface IPresentationDraft extends Document {
  userId: Types.ObjectId;
  title: string;
  topic: string;
  language: string;
  themeSlug: string;
  slides: ISlide[];
  status: "draft" | "generating" | "completed";
  lastEditedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const slideSchema = new Schema<ISlide>(
  {
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
  },
  { _id: false }
);

const presentationDraftSchema = new Schema<IPresentationDraft>(
  {
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
    lastEditedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
presentationDraftSchema.index({ userId: 1, updatedAt: -1 });

export default mongoose.model<IPresentationDraft>(
  "PresentationDraft",
  presentationDraftSchema
);
