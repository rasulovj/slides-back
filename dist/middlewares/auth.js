import tokenService from "../utils/generateToken.js";
export const protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }
        if (!token) {
            res.status(401).json({ message: "Not authorized, no token" });
            return;
        }
        const decoded = tokenService.verifyAccessToken(token);
        req.user = {
            id: decoded.id,
            email: decoded.email,
            isPremium: decoded.isPremium || false,
        };
        next();
    }
    catch (error) {
        res.status(401).json({ message: "Not authorized, token failed" });
    }
};
export const isPremium = (req, res, next) => {
    if (req.user?.isPremium) {
        next();
    }
    else {
        res.status(403).json({ message: "Premium subscription required" });
    }
};
