import jwt from "jsonwebtoken";
import { JwtPayload } from "../types/jwt";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const JWT_EXPIRES_IN = "7d";
const JWT_ISSUER = "taskgrid-api";
const JWT_ALGORITHM = "HS256";

if (process.env.NODE_ENV === "production" && JWT_SECRET === "dev-secret") {
  throw new Error("JWT_SECRET must be set in production environment");
}

if (process.env.NODE_ENV !== "production" && JWT_SECRET === "dev-secret") {
  console.warn(
    "⚠️  Using default JWT_SECRET. Set JWT_SECRET in .env for security.",
  );
}

/**
 * Genera un token JWT para un usuario
 * @param payload Datos del usuario a incluir en el token
 * @returns Token JWT firmado
 */
export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    algorithm: JWT_ALGORITHM,
    issuer: JWT_ISSUER,
  });
};

/**
 * Verifica un token JWT
 * @param token Token JWT a verificar
 * @returns Payload decodificado si el token es válido
 * @throws Error si el token es inválido o ha expirado
 */
export const verifyToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, JWT_SECRET, {
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
