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
  avatarUrl?: string;
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
    avatarUrl: {
      type: String,
      default:
        "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.vectorstock.com%2Froyalty-free-vector%2Fdefault-profile-picture-avatar-user-icon-vector-46389216&psig=AOvVaw2BIPGLsjR3OvN9zsv606VO&ust=1762411315507000&source=images&cd=vfe&opi=89978449&ved=0CBIQjRxqFwoTCMjK9_Wz2pADFQAAAAAdAAAAABAE",
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
