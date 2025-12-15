import { z } from "zod";

export const TaskStatus = z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]);
export const Priority = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);
export const SharePermission = z.enum(["VIEW", "EDIT", "ADMIN"]);

export const registerSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  email: z.email({ message: "Email inválido" }),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Password must contain uppercase letter")
    .regex(/[a-z]/, "Password must contain lowercase letter")
    .regex(/[0-9]/, "Password must contain a number"),
});

export const loginSchema = z.object({
  email: z.email({ message: "Email inválido" }),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Password must contain uppercase letter")
    .regex(/[a-z]/, "Password must contain lowercase letter")
    .regex(/[0-9]/, "Password must contain a number"),
});

export const googleAuthSchema = z.object({
  idToken: z.string().min(1, "ID Token is required"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(6, "New password must be at least 6 characters")
    .regex(/[A-Z]/, "New password must contain uppercase letter")
    .regex(/[a-z]/, "New password must contain lowercase letter")
    .regex(/[0-9]/, "New password must contain a number"),
});

export const updateNameSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
});
