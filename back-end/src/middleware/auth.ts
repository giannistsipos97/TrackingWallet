import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

type AuthTokenPayload = jwt.JwtPayload & {
  userId?: string;
};

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) return res.status(401).json({ message: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "SUPER_SECRET_KEY_CHANGEME",
    ) as AuthTokenPayload;

    if (!decoded.userId) {
      return res.status(401).json({ message: "Token is not valid" });
    }

    req.user = { id: decoded.userId };
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};
