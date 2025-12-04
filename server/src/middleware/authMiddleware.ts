import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ error: "No token provided" });
      return;
    }
    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    req.user = { id: payload.userId };
    next();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid token";
    res.status(401).json({ error: message });
  }
};
