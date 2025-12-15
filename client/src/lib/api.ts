import axios, { AxiosError } from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 8000,
});

export function setAuthToken(token?: string) {
  if (token) {
    localStorage.setItem("token", token);
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    localStorage.removeItem("token");
    delete api.defaults.headers.common.Authorization;
  }
}

const existing = localStorage.getItem("token");
if (existing) setAuthToken(existing);

export function apiErrorMessage(err: unknown): string {
  if (!axios.isAxiosError(err)) {
    return err instanceof Error ? err.message : "Error desconocido";
  }

  const ax = err as AxiosError;
  if (!ax.response) {
    return "Sin conexión con el servidor.";
  }

  const { data, statusText } = ax.response;

  if (typeof data === "string" && data.trim().length > 0) {
    return data;
  }

  if (data && typeof data === "object") {
    const rec = data as Record<string, unknown>;
    const serverMsg = rec.error ?? rec.message ?? rec.detail;
    if (typeof serverMsg === "string" && serverMsg.trim().length > 0) {
      return serverMsg;
    }
  }

  return ax.message || statusText || "Error inesperado en la API.";
}
