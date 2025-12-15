import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useSocket } from "@/hooks/useSocket";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/store/slices/authSlice";
import listsReducer from "@/store/slices/listsSlice";
import tasksReducer from "@/store/slices/tasksSlice";
import notificationsReducer from "@/store/slices/notificationsSlice";

vi.mock("@/utils/socket", () => {
  const mockSocket = {
    connect: vi.fn(),
    disconnect: vi.fn(),
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  };
  return { socket: mockSocket };
});

import { socket } from "@/utils/socket";
const mockSocket = socket as unknown as {
  connect: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
  emit: ReturnType<typeof vi.fn>;
  on: ReturnType<typeof vi.fn>;
  off: ReturnType<typeof vi.fn>;
};

describe("useSocket", () => {
  let store: ReturnType<typeof configureStore>;

  const createStore = (user: any = null, lists: any[] = []) =>
    configureStore({
      reducer: {
        auth: authReducer,
        lists: listsReducer,
        tasks: tasksReducer,
        notifications: notificationsReducer,
      },
      preloadedState: {
        auth: {
          user,
          token: user ? "token" : null,
          isAuthenticated: !!user,
          isLoading: false,
          error: null,
          isInitializing: false,
        },
        lists: {
          lists,
          isLoading: false,
          error: null,
          selectedListId: null,
        },
        tasks: {
          tasks: [],
          isLoading: false,
          error: null,
          filters: {
            status: "all",
            listId: null,
            priority: "all",
            favorite: "all",
          },
          sorting: { field: "createdAt", order: "desc" },
        },
        notifications: { notifications: [], isLoading: false },
      },
    });

  const wrapper =
    (s: ReturnType<typeof configureStore>) =>
    ({ children }: { children: React.ReactNode }) => (
      <Provider store={s}>{children}</Provider>
    );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("connects socket when user is authenticated", () => {
    store = createStore({ id: "user-1", name: "Test" });
    renderHook(() => useSocket(), { wrapper: wrapper(store) });

    expect(mockSocket.connect).toHaveBeenCalled();
    expect(mockSocket.emit).toHaveBeenCalledWith("join_user", "user-1");
  });

  it("sets up event listeners when user is authenticated", () => {
    store = createStore({ id: "user-1", name: "Test" });
    renderHook(() => useSocket(), { wrapper: wrapper(store) });

    expect(mockSocket.on).toHaveBeenCalledWith(
      "task:created",
      expect.any(Function),
    );
    expect(mockSocket.on).toHaveBeenCalledWith(
      "task:updated",
      expect.any(Function),
    );
    expect(mockSocket.on).toHaveBeenCalledWith(
      "task:deleted",
      expect.any(Function),
    );
    expect(mockSocket.on).toHaveBeenCalledWith(
      "list:updated",
      expect.any(Function),
    );
    expect(mockSocket.on).toHaveBeenCalledWith(
      "list:created",
      expect.any(Function),
    );
    expect(mockSocket.on).toHaveBeenCalledWith(
      "notification:created",
      expect.any(Function),
    );
  });

  it("does not connect when user is null", () => {
    store = createStore(null);
    renderHook(() => useSocket(), { wrapper: wrapper(store) });

    expect(mockSocket.connect).not.toHaveBeenCalled();
  });

  it("joins list rooms when lists change", () => {
    const lists = [{ id: "list-1", name: "Test List" }];
    store = createStore({ id: "user-1", name: "Test" }, lists);
    renderHook(() => useSocket(), { wrapper: wrapper(store) });

    expect(mockSocket.emit).toHaveBeenCalledWith("join_list", "list-1");
  });

  it("disconnects and cleans up on unmount", () => {
    store = createStore({ id: "user-1", name: "Test" });
    const { unmount } = renderHook(() => useSocket(), {
      wrapper: wrapper(store),
    });

    unmount();

    expect(mockSocket.disconnect).toHaveBeenCalled();
    expect(mockSocket.off).toHaveBeenCalledWith("task:created");
    expect(mockSocket.off).toHaveBeenCalledWith("task:updated");
  });
});
