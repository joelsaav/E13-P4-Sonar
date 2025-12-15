import { useLists } from "@/hooks/useLists";
import authReducer from "@/store/slices/authSlice";
import listsReducer from "@/store/slices/listsSlice";
import tasksReducer from "@/store/slices/tasksSlice";
import themeReducer from "@/store/slices/themeSlice";
import notificationsReducer from "@/store/slices/notificationsSlice";
import uiReducer from "@/store/slices/uiSlice";
import { configureStore } from "@reduxjs/toolkit";
import { renderHook, act, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
  apiErrorMessage: (err: unknown) => {
    if (err instanceof Error) return err.message;
    return "Error desconocido";
  },
}));

describe("useLists", () => {
  let store: ReturnType<typeof configureStore>;

  const mockUser = {
    id: "user-1",
    email: "test@example.com",
    name: "Test User",
  };

  const mockLists = [
    {
      id: "list-1",
      name: "My List",
      userId: "user-1",
      ownerId: "user-1",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
      shares: [],
    },
    {
      id: "list-2",
      name: "Shared List",
      userId: "user-2",
      ownerId: "user-2",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
      shares: [{ userId: "user-1", permission: "read" }],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    store = configureStore({
      reducer: {
        auth: authReducer,
        theme: themeReducer,
        lists: listsReducer,
        tasks: tasksReducer,
        notifications: notificationsReducer,
        ui: uiReducer,
      },
      preloadedState: {
        auth: {
          user: mockUser,
          token: "token123",
          isAuthenticated: true,
          isLoading: false,
          error: null,
          isInitializing: false,
        },
        lists: {
          lists: mockLists,
          isLoading: false,
          error: null,
          selectedListId: null,
        },
      },
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );

  it("returns lists from the store", () => {
    const { result } = renderHook(() => useLists(), { wrapper });

    expect(result.current.lists).toEqual(mockLists);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("returns selectedListId as null initially", () => {
    const { result } = renderHook(() => useLists(), { wrapper });

    expect(result.current.selectedListId).toBeNull();
    expect(result.current.selectedList).toBeFalsy();
  });

  it("filters owned lists correctly", () => {
    const { result } = renderHook(() => useLists(), { wrapper });

    expect(result.current.ownedLists).toHaveLength(1);
    expect(result.current.ownedLists[0].id).toBe("list-1");
  });

  it("filters shared lists correctly", () => {
    const { result } = renderHook(() => useLists(), { wrapper });

    expect(result.current.sharedLists).toHaveLength(1);
    expect(result.current.sharedLists[0].id).toBe("list-2");
  });

  it("selectList updates the selected list", async () => {
    const { result } = renderHook(() => useLists(), { wrapper });

    act(() => {
      result.current.selectList("list-1");
    });

    await waitFor(() => {
      expect(result.current.selectedListId).toBe("list-1");
    });
  });

  it("selectList with null clears selection", async () => {
    store = configureStore({
      reducer: {
        auth: authReducer,
        theme: themeReducer,
        lists: listsReducer,
        tasks: tasksReducer,
        notifications: notificationsReducer,
        ui: uiReducer,
      },
      preloadedState: {
        auth: {
          user: mockUser,
          token: "token123",
          isAuthenticated: true,
          isLoading: false,
          error: null,
          isInitializing: false,
        },
        lists: {
          lists: mockLists,
          isLoading: false,
          error: null,
          selectedListId: "list-1",
        },
      },
    });

    const { result } = renderHook(() => useLists(), { wrapper });

    act(() => {
      result.current.selectList(null);
    });

    await waitFor(() => {
      expect(result.current.selectedListId).toBeNull();
    });
  });

  it("canAccess returns a boolean for list access", () => {
    const { result } = renderHook(() => useLists(), { wrapper });

    const hasAccess = result.current.canAccess("list-1");
    expect(typeof hasAccess).toBe("boolean");
  });

  it("isOwner returns a boolean for list ownership", () => {
    const { result } = renderHook(() => useLists(), { wrapper });

    const ownerStatus = result.current.isOwner("list-1");
    expect(typeof ownerStatus).toBe("boolean");
  });

  it("returns accessibleLists", () => {
    const { result } = renderHook(() => useLists(), { wrapper });

    expect(Array.isArray(result.current.accessibleLists)).toBe(true);
  });

  it("provides fetchAllLists function", () => {
    const { result } = renderHook(() => useLists(), { wrapper });

    expect(typeof result.current.fetchAllLists).toBe("function");
  });

  it("provides fetchSharedLists function", () => {
    const { result } = renderHook(() => useLists(), { wrapper });

    expect(typeof result.current.fetchSharedLists).toBe("function");
  });

  it("provides createList function", () => {
    const { result } = renderHook(() => useLists(), { wrapper });

    expect(typeof result.current.createList).toBe("function");
  });

  it("provides editList function", () => {
    const { result } = renderHook(() => useLists(), { wrapper });

    expect(typeof result.current.editList).toBe("function");
  });

  it("provides removeList function", () => {
    const { result } = renderHook(() => useLists(), { wrapper });

    expect(typeof result.current.removeList).toBe("function");
  });

  it("provides shareList function", () => {
    const { result } = renderHook(() => useLists(), { wrapper });

    expect(typeof result.current.shareList).toBe("function");
  });

  it("provides updateShare function", () => {
    const { result } = renderHook(() => useLists(), { wrapper });

    expect(typeof result.current.updateShare).toBe("function");
  });

  it("provides removeShare function", () => {
    const { result } = renderHook(() => useLists(), { wrapper });

    expect(typeof result.current.removeShare).toBe("function");
  });
});
