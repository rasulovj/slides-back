import mongoose, { Schema } from "mongoose";
const userSchema = new Schema({
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
        required: function () {
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
        default: "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg",
    },
    refreshTokens: {
        type: [String],
        default: [],
    },
}, {
    timestamps: true,
});
export default mongoose.model("User", userSchema);
