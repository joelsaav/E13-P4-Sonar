import { useTaskFilters } from "@/hooks/tasks/useTaskFilters";
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

describe("useTaskFilters", () => {
  let store: ReturnType<typeof configureStore>;

  const mockUser = {
    id: "user-1",
    email: "test@example.com",
    name: "Test User",
  };

  const mockLists = [
    {
      id: "list-1",
      name: "List 1",
      description: "Description 1",
      userId: "user-1",
      ownerId: "user-1",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
      shares: [],
    },
    {
      id: "list-2",
      name: "List 2",
      description: "Description 2",
      userId: "user-1",
      ownerId: "user-1",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
      shares: [],
    },
  ];

  const mockTasks = [
    {
      id: "task-1",
      title: "Task 1",
      description: "Description 1",
      listId: "list-1",
      userId: "user-1",
      status: "PENDING",
      priority: "HIGH",
      favorite: false,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
      shares: [],
    },
    {
      id: "task-2",
      title: "Task 2",
      description: "Description 2",
      listId: "list-1",
      userId: "user-1",
      status: "COMPLETED",
      priority: "LOW",
      favorite: true,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
      shares: [],
    },
    {
      id: "task-3",
      title: "Task 3",
      description: "Description 3",
      listId: "list-2",
      userId: "user-1",
      status: "IN_PROGRESS",
      priority: "MEDIUM",
      favorite: false,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
      shares: [],
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
        tasks: {
          tasks: mockTasks,
          isLoading: false,
          error: null,
          filters: {
            status: "all",
            listId: null,
            priority: "all",
            favorite: "all",
          },
          sorting: {
            field: "createdAt",
            order: "desc",
          },
        },
      },
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );

  it("returns displayTasks", () => {
    const { result } = renderHook(() => useTaskFilters(), { wrapper });

    expect(Array.isArray(result.current.displayTasks)).toBe(true);
  });

  it("returns listTaskCounts with correct structure", () => {
    const { result } = renderHook(() => useTaskFilters(), { wrapper });

    expect(result.current.listTaskCounts).toHaveLength(2);
    expect(result.current.listTaskCounts[0]).toHaveProperty("id");
    expect(result.current.listTaskCounts[0]).toHaveProperty("name");
    expect(result.current.listTaskCounts[0]).toHaveProperty("count");
  });

  it("counts tasks per list correctly", () => {
    const { result } = renderHook(() => useTaskFilters(), { wrapper });

    const list1 = result.current.listTaskCounts.find((l) => l.id === "list-1");
    const list2 = result.current.listTaskCounts.find((l) => l.id === "list-2");

    expect(list1?.count).toBe(2);
    expect(list2?.count).toBe(1);
  });

  it("returns selectedListId as null initially", () => {
    const { result } = renderHook(() => useTaskFilters(), { wrapper });

    expect(result.current.selectedListId).toBeNull();
  });

  it("handleListFilter updates list filter", async () => {
    const { result } = renderHook(() => useTaskFilters(), { wrapper });

    act(() => {
      result.current.handleListFilter("list-1");
    });

    await waitFor(() => {
      expect(result.current.selectedListId).toBe("list-1");
    });
  });

  it("handleListFilter with null clears filter", async () => {
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
        tasks: {
          tasks: mockTasks,
          isLoading: false,
          error: null,
          filters: {
            status: "all",
            listId: "list-1",
            priority: "all",
            favorite: "all",
          },
          sorting: {
            field: "createdAt",
            order: "desc",
          },
        },
      },
    });

    const { result } = renderHook(() => useTaskFilters(), { wrapper });

    act(() => {
      result.current.handleListFilter(null);
    });

    await waitFor(() => {
      expect(result.current.selectedListId).toBeNull();
    });
  });

  it("returns filters object", () => {
    const { result } = renderHook(() => useTaskFilters(), { wrapper });

    expect(result.current.filters).toBeDefined();
    expect(result.current.filters).toHaveProperty("status");
    expect(result.current.filters).toHaveProperty("priority");
    expect(result.current.filters).toHaveProperty("favorite");
  });

  it("returns sorting object", () => {
    const { result } = renderHook(() => useTaskFilters(), { wrapper });

    expect(result.current.sorting).toBeDefined();
    expect(result.current.sorting).toHaveProperty("field");
    expect(result.current.sorting).toHaveProperty("order");
  });

  it("provides filterByStatus function", () => {
    const { result } = renderHook(() => useTaskFilters(), { wrapper });

    expect(typeof result.current.filterByStatus).toBe("function");
  });

  it("provides filterByPriority function", () => {
    const { result } = renderHook(() => useTaskFilters(), { wrapper });

    expect(typeof result.current.filterByPriority).toBe("function");
  });

  it("provides filterByFavorite function", () => {
    const { result } = renderHook(() => useTaskFilters(), { wrapper });

    expect(typeof result.current.filterByFavorite).toBe("function");
  });

  it("provides sortBy function", () => {
    const { result } = renderHook(() => useTaskFilters(), { wrapper });

    expect(typeof result.current.sortBy).toBe("function");
  });

  it("provides toggleSort function", () => {
    const { result } = renderHook(() => useTaskFilters(), { wrapper });

    expect(typeof result.current.toggleSort).toBe("function");
  });

  it("returns accessibleLists", () => {
    const { result } = renderHook(() => useTaskFilters(), { wrapper });

    expect(Array.isArray(result.current.accessibleLists)).toBe(true);
  });
});
