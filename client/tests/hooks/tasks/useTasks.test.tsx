import { useTasks } from "@/hooks/tasks/useTasks";
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

describe("useTasks", () => {
  let store: ReturnType<typeof configureStore>;

  const mockUser = {
    id: "user-1",
    email: "test@example.com",
    name: "Test User",
  };

  const mockTasks = [
    {
      id: "task-1",
      name: "Task 1",
      description: "Description 1",
      listId: "list-1",
      status: "PENDING",
      priority: "HIGH",
      favorite: false,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
      shares: [],
    },
    {
      id: "task-2",
      name: "Task 2",
      description: "Description 2",
      listId: "list-1",
      status: "COMPLETED",
      priority: "LOW",
      favorite: true,
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

  it("returns initial state correctly", () => {
    const { result } = renderHook(() => useTasks(), { wrapper });

    expect(result.current.tasks).toEqual(mockTasks);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.filters).toEqual({
      status: "all",
      listId: null,
      priority: "all",
      favorite: "all",
    });
    expect(result.current.sorting).toEqual({
      field: "createdAt",
      order: "desc",
    });
  });

  it("filterByStatus updates status filter", async () => {
    const { result } = renderHook(() => useTasks(), { wrapper });
    act(() => result.current.filterByStatus("PENDING"));
    await waitFor(() => expect(result.current.filters.status).toBe("PENDING"));
  });

  it("filterByList updates list filter", async () => {
    const { result } = renderHook(() => useTasks(), { wrapper });
    act(() => result.current.filterByList("list-1"));
    await waitFor(() => expect(result.current.filters.listId).toBe("list-1"));
  });

  it("filterByPriority updates priority filter", async () => {
    const { result } = renderHook(() => useTasks(), { wrapper });
    act(() => result.current.filterByPriority("HIGH"));
    await waitFor(() => expect(result.current.filters.priority).toBe("HIGH"));
  });

  it("filterByFavorite updates favorite filter", async () => {
    const { result } = renderHook(() => useTasks(), { wrapper });
    act(() => result.current.filterByFavorite("yes"));
    await waitFor(() => expect(result.current.filters.favorite).toBe("yes"));
  });

  it("sorting updates work correctly", async () => {
    const { result } = renderHook(() => useTasks(), { wrapper });

    act(() => result.current.sortBy("priority", "asc"));
    await waitFor(() => {
      expect(result.current.sorting.field).toBe("priority");
      expect(result.current.sorting.order).toBe("asc");
    });

    act(() => result.current.toggleSort());
    await waitFor(() => expect(result.current.sorting.order).toBe("desc"));
  });

  it("filteredTasks filters by status", () => {
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
        tasks: {
          tasks: mockTasks,
          isLoading: false,
          error: null,
          filters: {
            status: "PENDING",
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

    const { result } = renderHook(() => useTasks(), { wrapper });

    expect(result.current.filteredTasks).toHaveLength(1);
    expect(result.current.filteredTasks[0].id).toBe("task-1");
  });

  it("accessibleTasks returns tasks", () => {
    const { result } = renderHook(() => useTasks(), { wrapper });

    expect(Array.isArray(result.current.accessibleTasks)).toBe(true);
  });
});
