import mongoose, { Document, Schema, Types } from "mongoose";

export interface ISlide {
  id: string;
  type:
    | "title"
    | "plan"
    | "content"
    | "twoColumn"
    | "timeline"
    | "comparison"
    | "cards"
    | "stats"
    // | "chart"
    | "quote"
    | "closing";
  title: string;
  subtitle?: string;
  content: string[];
  position: number;
  layout?: "default" | "centered" | "split";
  backgroundColor?: string;
  textColor?: string;
  stats?: {
    label: string;
    value: string;
    description: string;
    icon?: string;
  }[];
  // chartData?: {
  //   label: string;
  //   value: number;
  //   color?: string;
  // }[];
  quote?: {
    text: string;
    author: string;
  };
  notes?: string;
}

export interface IPresentationDraft extends Document {
  userId: Types.ObjectId;
  title: string;
  subtitle?: string;
  topic: string;
  language: string;
  themeSlug: string;
  slides: ISlide[];
  slidePlan?: string[]; // 👈 new: stores sequence of slide types used (e.g. ["title", "plan", ...])
  thumbnail?: string;
  status: "draft" | "generating" | "completed";
  lastEditedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const slideSchema = new Schema<ISlide>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: [
        "title",
        "plan",
        "content",
        "twoColumn",
        "timeline",
        "comparison",
        "cards",
        "stats",
        "chart",
        "quote",
        "closing",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    subtitle: String,
    content: [
      {
        type: String,
      },
    ],
    position: {
      type: Number,
      required: true,
    },
    layout: {
      type: String,
      enum: ["default", "centered", "split"],
      default: "default",
    },
    backgroundColor: String,
    textColor: String,
    stats: [
      {
        label: String,
        value: String,
        description: String,
        icon: String,
      },
    ],
    // chartData: [
    //   {
    //     label: String,
    //     value: Number,
    //     color: String,
    //   },
    // ],
    quote: {
      text: String,
      author: String,
    },
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
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
    },
    language: {
      type: String,
      required: true,
      default: "en",
      lowercase: true,
    },
    themeSlug: {
      type: String,
      required: true,
    },
    slides: {
      type: [slideSchema],
      default: [],
    },
    slidePlan: {
      type: [String], // e.g. ["title", "plan", "content", "closing"]
      default: [],
    },
    status: {
      type: String,
      enum: ["draft", "generating", "completed"],
      default: "draft",
    },
    thumbnail: {
      type: String,
      default: null,
      sparse: true,
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

presentationDraftSchema.index({ userId: 1, updatedAt: -1 });
presentationDraftSchema.index({ userId: 1, status: 1 });
presentationDraftSchema.index({ createdAt: -1 });

presentationDraftSchema.pre("save", function (next) {
  this.lastEditedAt = new Date();
  next();
});

export default mongoose.model<IPresentationDraft>(
  "PresentationDraft",
  presentationDraftSchema
);
