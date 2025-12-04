import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ZodError } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function firstZodIssueMessage(error: ZodError<unknown>): string {
  return (
    error.issues[0]?.message ||
    "Datos inválidos. Revisa los campos e intenta nuevamente."
  );
}
