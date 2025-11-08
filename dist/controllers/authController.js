import bcrypt from "bcryptjs";
import User from "../models/user.js";
import tokenService from "../utils/generateToken.js";
export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) {
            res.status(400).json({ message: "User already exists" });
            return;
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });
        const { accessToken, refreshToken } = tokenService.generateTokens({
            id: user._id.toString(),
            email: user.email,
            isPremium: user.isPremium,
        });
        user.refreshTokens.push(refreshToken);
        await user.save();
        res.status(201).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isPremium: user.isPremium,
            },
            accessToken,
            refreshToken,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server erroreer", error });
    }
};
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }
        const isMatch = await bcrypt.compare(password, user.password || "");
        if (!isMatch) {
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }
        const { accessToken, refreshToken } = tokenService.generateTokens({
            id: user._id.toString(),
            email: user.email,
            isPremium: user.isPremium,
        });
        user.refreshTokens.push(refreshToken);
        if (user.refreshTokens.length > 3) {
            user.refreshTokens = user.refreshTokens.slice(-3);
        }
        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isPremium: user.isPremium,
                presentationsCount: user.presentationsCount,
                freeLimit: user.freeLimit,
            },
            accessToken,
            refreshToken,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
export const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            res.status(401).json({ message: "Refresh token required" });
            return;
        }
        const decoded = tokenService.verifyRefreshToken(refreshToken);
        const user = await User.findById(decoded.id);
        if (!user || !user.refreshTokens.includes(refreshToken)) {
            res.status(403).json({ message: "Invalid refresh token" });
            return;
        }
        const newAccessToken = tokenService.generateAccessToken({
            id: user._id.toString(),
            email: user.email,
            isPremium: user.isPremium,
        });
        res.status(200).json({
            success: true,
            accessToken: newAccessToken,
        });
    }
    catch (error) {
        res.status(403).json({ message: "Invalid or expired refresh token" });
    }
};
export const logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        await User.findByIdAndUpdate(userId, {
            $pull: { refreshTokens: refreshToken },
        });
        res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
export const logoutAll = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        await User.findByIdAndUpdate(userId, {
            refreshTokens: [],
        });
        res.status(200).json({
            success: true,
            message: "Logged out from all devices",
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
