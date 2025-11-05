import mongoose, { Document, Schema, Types } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  telegramId?: string;
  isPremium: boolean;
  presentationsCount: number;
  freeLimit: number;
  avatar?: string;
  refreshTokens: string[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function (this: IUser): boolean {
        return !this.telegramId;
      },
    },
    telegramId: {
      type: String,
      unique: true,
      sparse: true,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    presentationsCount: {
      type: Number,
      default: 0,
    },
    freeLimit: {
      type: Number,
      default: 3,
    },
    avatar: {
      type: String,
      default:
        "https://cdn.vectorstock.com/i/2000v/92/16/default-profile-picture-avatar-user-icon-vector-46389216.avif",
    },
    refreshTokens: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUser>("User", userSchema);
