import jwt from "jsonwebtoken";
import { JwtPayload } from "../types/jwt.js";

const JWT_EXPIRES_IN = "7d";
const JWT_ISSUER = "taskgrid-api";
const JWT_ALGORITHM = "HS256";

let SECRET: string | null = null;
let secretWarningShown = false;

const getSecret = (): string => {
  if (SECRET !== null) {
    return SECRET;
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (!secretWarningShown) {
      console.warn(
        "⚠️  JWT_SECRET not set. Using insecure default. Set JWT_SECRET in .env for security.",
      );
      secretWarningShown = true;
    }
    SECRET = "dev-secret-fallback";
  } else {
    SECRET = secret;
  }

  return SECRET;
};

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, getSecret(), {
    expiresIn: JWT_EXPIRES_IN,
    algorithm: JWT_ALGORITHM,
    issuer: JWT_ISSUER,
  });
};

export const verifyToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, getSecret(), {
      algorithms: [JWT_ALGORITHM],
      issuer: JWT_ISSUER,
    }) as JwtPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Token has expired");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Invalid token");
    }
    throw error;
  }
};
