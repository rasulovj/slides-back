import jwt from "jsonwebtoken";
const generateAccessToken = (payload) => {
    if (!process.env.JWT_ACCESS_SECRET) {
        throw new Error("JWT_ACCESS_SECRET is not defined in environment variables");
    }
    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
        expiresIn: "60m",
    });
};
const generateRefreshToken = (payload) => {
    if (!process.env.JWT_REFRESH_SECRET) {
        throw new Error("JWT_REFRESH_SECRET is not defined in environment variables");
    }
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
        expiresIn: "7d",
    });
};
const generateTokens = (payload) => {
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    return { accessToken, refreshToken };
};
const verifyAccessToken = (token) => {
    if (!process.env.JWT_ACCESS_SECRET) {
        throw new Error("JWT_ACCESS_SECRET is not defined in environment variables");
    }
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
};
const verifyRefreshToken = (token) => {
    if (!process.env.JWT_REFRESH_SECRET) {
        throw new Error("JWT_REFRESH_SECRET is not defined in environment variables");
    }
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};
export default {
    generateTokens,
    generateAccessToken,
    verifyAccessToken,
    verifyRefreshToken,
};
