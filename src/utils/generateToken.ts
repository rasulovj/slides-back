import jwt, { JwtPayload } from "jsonwebtoken";

interface TokenPayload {
  id: string;
  email: string;
  isPremium?: boolean;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

const generateAccessToken = (payload: TokenPayload): string => {
  if (!process.env.JWT_ACCESS_SECRET) {
    throw new Error(
      "JWT_ACCESS_SECRET is not defined in environment variables"
    );
  }

  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "60m",
  });
};

const generateRefreshToken = (payload: TokenPayload): string => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error(
      "JWT_REFRESH_SECRET is not defined in environment variables"
    );
  }

  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

const generateTokens = (payload: TokenPayload): TokenPair => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  return { accessToken, refreshToken };
};

const verifyAccessToken = (token: string): JwtPayload => {
  if (!process.env.JWT_ACCESS_SECRET) {
    throw new Error(
      "JWT_ACCESS_SECRET is not defined in environment variables"
    );
  }

  return jwt.verify(token, process.env.JWT_ACCESS_SECRET) as JwtPayload;
};

const verifyRefreshToken = (token: string): JwtPayload => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error(
      "JWT_REFRESH_SECRET is not defined in environment variables"
    );
  }

  return jwt.verify(token, process.env.JWT_REFRESH_SECRET) as JwtPayload;
};

export default {
  generateTokens,
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
