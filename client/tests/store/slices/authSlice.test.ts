import authReducer, {
  changeUserPassword,
  deleteUserAccount,
  loginUser,
  loginWithGoogleUser,
  logout,
  registerUser,
  selectAuthError,
  selectAuthLoading,
  selectIsAuthenticated,
  selectToken,
  selectUser,
  updateUserProfile,
} from "@/store/slices/authSlice";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { api, apiErrorMessage } from "@/lib/api";
import type { AuthState, User } from "@/types/auth/auth";
import { configureStore } from "@reduxjs/toolkit";

vi.mock("@/lib/api", () => ({
  setAuthToken: vi.fn(),
  api: {
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
  apiErrorMessage: vi.fn((err) => err.message || "Error desconocido"),
}));

describe("authSlice", () => {
  let initialState: AuthState;
  const mockUser: User = {
    id: "1",
    email: "test@example.com",
    name: "Test User",
  };

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    initialState = {
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isInitializing: false,
    };
  });

  describe("reducer", () => {
    it("should return initial state", () => {
      expect(authReducer(undefined, { type: "unknown" })).toMatchObject({
        isAuthenticated: expect.any(Boolean),
        isLoading: false,
        error: null,
      });
    });

    it("should handle logout action", () => {
      const loggedInState: AuthState = {
        ...initialState,
        user: mockUser,
        token: "token123",
        isAuthenticated: true,
      };
      localStorage.setItem("user", JSON.stringify(mockUser));

      const action = logout();
      const state = authReducer(loggedInState, action);

      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe("selectors", () => {
    it("selectUser should return user", () => {
      const state = { auth: { ...initialState, user: mockUser } };
      expect(selectUser(state as { auth: AuthState })).toEqual(mockUser);
    });

    it("selectIsAuthenticated should return authentication status", () => {
      const state = { auth: { ...initialState, isAuthenticated: true } };
      expect(selectIsAuthenticated(state as { auth: AuthState })).toBe(true);
    });

    it("selectToken should return token", () => {
      const state = { auth: { ...initialState, token: "token123" } };
      expect(selectToken(state as { auth: AuthState })).toBe("token123");
    });

    it("selectAuthLoading should return loading status", () => {
      const state = { auth: { ...initialState, isLoading: true } };
      expect(selectAuthLoading(state as { auth: AuthState })).toBe(true);
    });

    it("selectAuthError should return error", () => {
      const state = { auth: { ...initialState, error: "Error message" } };
      expect(selectAuthError(state as { auth: AuthState })).toBe(
        "Error message",
      );
    });
  });

  describe("getUserFromLocalStorage error handling", () => {
    it("should handle JSON parse errors in localStorage", () => {
      localStorage.setItem("user", "invalid-json{");
      const state = authReducer(undefined, { type: "@@INIT" });
      expect(state.user).toBeNull();
    });
  });

  describe("Async thunk error handling", () => {
    it("updateUserProfile should handle API errors", async () => {
      const store = configureStore({
        reducer: { auth: authReducer },
      });

      const error = new Error("Network error");
      vi.mocked(api.patch).mockRejectedValueOnce(error);

      await store.dispatch(updateUserProfile({ name: "Test" }) as any);

      const state = store.getState().auth;
      expect(state.error).toBe("Network error");
      expect(apiErrorMessage).toHaveBeenCalledWith(error);
    });

    it("updateUserProfile should handle successful API response", async () => {
      const store = configureStore({
        reducer: { auth: authReducer },
        preloadedState: {
          auth: {
            ...initialState,
            user: mockUser,
            isAuthenticated: true,
          },
        },
      });

      const updatedUser = { ...mockUser, name: "Updated User" };
      vi.mocked(api.patch).mockResolvedValueOnce({ data: updatedUser });

      await store.dispatch(updateUserProfile({ name: "Updated User" }) as any);

      const state = store.getState().auth;
      expect(state.user?.name).toBe("Updated User");
      expect(state.error).toBeNull();
    });

    it("changeUserPassword should handle API errors", async () => {
      const store = configureStore({
        reducer: { auth: authReducer },
      });

      const error = new Error("Password update failed");
      vi.mocked(api.put).mockRejectedValueOnce(error);

      await store.dispatch(
        changeUserPassword({
          currentPassword: "old",
          newPassword: "new",
        }) as any,
      );

      const state = store.getState().auth;
      expect(state.error).toBe("Password update failed");
      expect(apiErrorMessage).toHaveBeenCalledWith(error);
    });

    it("changeUserPassword should handle successful API response", async () => {
      const store = configureStore({
        reducer: { auth: authReducer },
      });

      vi.mocked(api.put).mockResolvedValueOnce({ data: true });

      await store.dispatch(
        changeUserPassword({
          currentPassword: "old",
          newPassword: "new",
        }) as any,
      );

      const state = store.getState().auth;
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it("deleteUserAccount should handle API errors", async () => {
      const store = configureStore({
        reducer: { auth: authReducer },
      });

      const error = new Error("Delete failed");
      vi.mocked(api.delete).mockRejectedValueOnce(error);

      await store.dispatch(deleteUserAccount() as any);

      const state = store.getState().auth;
      expect(state.error).toBe("Delete failed");
      expect(apiErrorMessage).toHaveBeenCalledWith(error);
    });

    it("deleteUserAccount should handle successful API response", async () => {
      const store = configureStore({
        reducer: { auth: authReducer },
        preloadedState: {
          auth: {
            ...initialState,
            user: mockUser,
            token: "token123",
            isAuthenticated: true,
          },
        },
      });

      vi.mocked(api.delete).mockResolvedValueOnce({ data: true });

      await store.dispatch(deleteUserAccount() as any);

      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it("loginUser should execute successfully", async () => {
      const store = configureStore({
        reducer: { auth: authReducer },
      });

      const response = { user: mockUser, token: "token123" };
      vi.mocked(api.post).mockResolvedValueOnce({ data: response });

      await store.dispatch(
        loginUser({ email: "test@test.com", password: "pass123" }) as unknown,
      );

      const state = store.getState().auth;
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe("token123");
      expect(state.isAuthenticated).toBe(true);
    });

    it("registerUser should execute successfully", async () => {
      const store = configureStore({
        reducer: { auth: authReducer },
      });

      const response = { user: mockUser, token: "token123" };
      vi.mocked(api.post)
        .mockResolvedValueOnce({ data: null })
        .mockResolvedValueOnce({ data: response });

      await store.dispatch(
        registerUser({
          name: "Test",
          email: "test@test.com",
          password: "pass123",
        }) as unknown,
      );

      const state = store.getState().auth;
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe("token123");
      expect(state.isAuthenticated).toBe(true);
    });

    it("loginWithGoogleUser should execute successfully", async () => {
      const store = configureStore({
        reducer: { auth: authReducer },
      });

      const response = { user: mockUser, token: "token123" };
      vi.mocked(api.post).mockResolvedValueOnce({ data: response });

      await store.dispatch(loginWithGoogleUser("google-token") as any);

      const state = store.getState().auth;
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe("token123");
      expect(state.isAuthenticated).toBe(true);
    });

    it("updateUserProfile should handle errors correctly", async () => {
      const store = configureStore({
        reducer: { auth: authReducer },
      });

      const error = new Error("Update failed");
      vi.mocked(api.patch).mockRejectedValueOnce(error);

      await store.dispatch(updateUserProfile({ name: "New Name" }) as any);

      const state = store.getState().auth;
      expect(state.error).toBe("Update failed");
    });

    it("changeUserPassword should handle errors correctly", async () => {
      const store = configureStore({
        reducer: { auth: authReducer },
      });

      const error = new Error("Password change failed");
      vi.mocked(api.put).mockRejectedValueOnce(error);

      await store.dispatch(
        changeUserPassword({
          currentPassword: "old123",
          newPassword: "new456",
        }) as unknown,
      );

      const state = store.getState().auth;
      expect(state.error).toBe("Password change failed");
    });

    it("deleteUserAccount should handle errors correctly", async () => {
      const store = configureStore({
        reducer: { auth: authReducer },
      });

      const error = new Error("Delete account failed");
      vi.mocked(api.delete).mockRejectedValueOnce(error);

      await store.dispatch(deleteUserAccount() as any);

      const state = store.getState().auth;
      expect(state.error).toBe("Delete account failed");
    });
  });

  describe("getUserFromLocalStorage", () => {
    it("should handle corrupted localStorage data", () => {
      localStorage.setItem("user", "invalid-json{");

      const state = authReducer(undefined, { type: "@@INIT" });
      expect(state.user).toBeNull();
    });
  });
});
