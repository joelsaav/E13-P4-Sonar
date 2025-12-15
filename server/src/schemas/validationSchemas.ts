import { z } from "zod";

export const TaskStatus = z.enum([
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
] as const);
export const TaskPriority = z.enum([
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
] as const);
export const SharePermission = z.enum(["VIEW", "EDIT", "ADMIN"] as const);

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
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Password must contain uppercase letter")
    .regex(/[a-z]/, "Password must contain lowercase letter")
    .regex(/[0-9]/, "Password must contain a number"),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").optional(),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
});

export const createTaskSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  description: z
    .string()
    .max(100, "La descripción debe tener menos de 100 caracteres")
    .optional(),
  status: TaskStatus.optional(),
  listId: z.string(),
  priority: TaskPriority.optional(),
  dueDate: z.coerce.date().optional(),
  favorite: z.boolean().optional(),
});

export const updateTaskSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").optional(),
  description: z
    .string()
    .max(100, "La descripción debe tener menos de 100 caracteres")
    .optional(),
  status: TaskStatus.optional(),
  listId: z.string().optional(),
  priority: TaskPriority.optional(),
  dueDate: z.coerce.date().optional(),
  favorite: z.boolean().optional(),
});

export const shareTaskSchema = z.object({
  email: z.email({ message: "Email inválido" }),
  permission: SharePermission.optional(),
});

export const updateShareSchema = z.object({
  permission: SharePermission,
});

export const createListSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  description: z
    .string()
    .max(100, "La descripción debe tener menos de 100 caracteres")
    .optional(),
});

export const updateListSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").optional(),
  description: z
    .string()
    .max(100, "La descripción debe tener menos de 100 caracteres")
    .optional(),
});

export const shareListSchema = z.object({
  email: z.email({ message: "Email inválido" }),
  permission: SharePermission.optional(),
});
