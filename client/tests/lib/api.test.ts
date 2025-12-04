import {
  api,
  apiErrorMessage,
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  setAuthToken,
} from "@/lib/api";
import { AxiosError } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("axios", () => {
  const mockIsAxiosError = vi.fn();
  return {
    default: {
      create: vi.fn(() => ({
        get: vi.fn(),
        post: vi.fn(),
        patch: vi.fn(),
        defaults: {
          headers: {
            common: {},
          },
        },
      })),
      isAxiosError: mockIsAxiosError,
    },
    isAxiosError: mockIsAxiosError,
  };
});

describe("api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe("setAuthToken", () => {
    it("sets and removes token correctly", () => {
      setAuthToken("my-token");
      expect(localStorage.getItem("token")).toBe("my-token");
      expect(api.defaults.headers.common.Authorization).toBe("Bearer my-token");

      setAuthToken();
      expect(localStorage.getItem("token")).toBeNull();
      expect(api.defaults.headers.common.Authorization).toBeUndefined();
    });
  });

  describe("apiErrorMessage", () => {
    it("returns offline message when there is no response", async () => {
      const axiosError = {
        isAxiosError: true,
        message: "Network Error",
        response: undefined,
      } as AxiosError;

      const axios = await import("axios");
      vi.mocked(axios.isAxiosError).mockReturnValue(true);

      expect(apiErrorMessage(axiosError)).toBe("Sin conexión con el servidor.");
    });

    it("prefers `error` field from server payload", async () => {
      const error = {
        isAxiosError: true,
        message: "Request failed",
        response: {
          status: 400,
          data: { error: "Bad request" },
        },
      } as AxiosError;

      const axios = await import("axios");
      vi.mocked(axios.isAxiosError).mockReturnValue(true);

      expect(apiErrorMessage(error)).toBe("Bad request");
    });

    it("falls back to `message` field when `error` is absent", async () => {
      const error = {
        isAxiosError: true,
        message: "Request failed",
        response: {
          status: 404,
          data: { message: "Not found" },
        },
      } as AxiosError;
      const axios = await import("axios");
      vi.mocked(axios.isAxiosError).mockReturnValue(true);

      expect(apiErrorMessage(error)).toBe("Not found");
    });

    it("returns string payloads directly", async () => {
      const error = {
        isAxiosError: true,
        message: "Request failed",
        response: {
          status: 500,
          data: "Server exploded",
        },
      } as AxiosError;
      const axios = await import("axios");
      vi.mocked(axios.isAxiosError).mockReturnValue(true);

      expect(apiErrorMessage(error)).toBe("Server exploded");
    });

    it("handles non-Axios errors", async () => {
      const axios = await import("axios");
      vi.mocked(axios.isAxiosError).mockReturnValue(false);

      expect(apiErrorMessage(new Error("Boom"))).toBe("Boom");
      expect(apiErrorMessage("string error")).toBe("Error desconocido");
    });

    it("falls back to AxiosError message when no payload info", async () => {
      const error = {
        isAxiosError: true,
        message: "Generic Axios error",
        response: {
          status: 418,
          data: {},
        },
      } as AxiosError;
      const axios = await import("axios");
      vi.mocked(axios.isAxiosError).mockReturnValue(true);

      expect(apiErrorMessage(error)).toBe("Generic Axios error");
    });
  });

  describe("Funciones de notificaciones", () => {
    it("fetchNotifications llama a GET /notifications", async () => {
      const mockNotifications = [
        {
          id: "n1",
          message: "Test notification",
          isRead: false,
          createdAt: "2024-01-01",
        },
      ];
      vi.spyOn(api, "get").mockResolvedValue({ data: mockNotifications });

      const result = await fetchNotifications();

      expect(api.get).toHaveBeenCalledWith("/notifications");
      expect(result).toEqual(mockNotifications);
    });

    it("fetchUnreadCount llama a GET /notifications/unread-count", async () => {
      const mockResponse = { count: 5 };
      vi.spyOn(api, "get").mockResolvedValue({ data: mockResponse });

      const result = await fetchUnreadCount();

      expect(api.get).toHaveBeenCalledWith("/notifications/unread-count");
      expect(result).toBe(5);
    });

    it("markNotificationAsRead llama a PATCH /notifications/:id/read", async () => {
      const mockNotification = {
        id: "n1",
        message: "Test",
        isRead: true,
        createdAt: "2024-01-01",
      };
      vi.spyOn(api, "patch").mockResolvedValue({ data: mockNotification });

      const result = await markNotificationAsRead("n1");

      expect(api.patch).toHaveBeenCalledWith("/notifications/n1/read");
      expect(result).toEqual(mockNotification);
    });

    it("markAllNotificationsAsRead llama a PATCH /notifications/read-all", async () => {
      vi.spyOn(api, "patch").mockResolvedValue({ data: undefined });

      await markAllNotificationsAsRead();

      expect(api.patch).toHaveBeenCalledWith("/notifications/read-all");
    });
  });
});
