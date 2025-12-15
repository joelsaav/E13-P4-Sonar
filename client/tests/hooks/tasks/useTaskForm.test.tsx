import { useTaskForm } from "@/hooks/tasks/useTaskForm";
import authReducer from "@/store/slices/authSlice";
import listsReducer from "@/store/slices/listsSlice";
import tasksReducer from "@/store/slices/tasksSlice";
import themeReducer from "@/store/slices/themeSlice";
import notificationsReducer from "@/store/slices/notificationsSlice";
import uiReducer from "@/store/slices/uiSlice";
import { configureStore } from "@reduxjs/toolkit";
import { renderHook, act, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/api", () => ({
  api: {
    get: vi.fn().mockResolvedValue({ data: [] }),
    post: vi.fn().mockResolvedValue({ data: {} }),
    patch: vi.fn().mockResolvedValue({ data: {} }),
    delete: vi.fn(),
  },
  apiErrorMessage: vi.fn(),
}));

describe("useTaskForm", () => {
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
      name: "Work List",
      userId: "user-1",
      ownerId: "user-1",
      createdAt: "2024-01-02T00:00:00Z",
      updatedAt: "2024-01-02T00:00:00Z",
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
      },
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );

  it("returns initial form data", () => {
    const { result } = renderHook(() => useTaskForm(), { wrapper });

    expect(result.current.formData).toEqual({
      name: "",
      description: "",
      priority: "MEDIUM",
      status: "PENDING",
      listId: expect.any(String),
      dueDate: "",
      favorite: false,
    });
  });

  it("provides updateField function", () => {
    const { result } = renderHook(() => useTaskForm(), { wrapper });

    expect(typeof result.current.updateField).toBe("function");
  });

  it("updates field value", async () => {
    const { result } = renderHook(() => useTaskForm(), { wrapper });

    act(() => {
      result.current.updateField("name", "New Task");
    });

    await waitFor(() => {
      expect(result.current.formData.name).toBe("New Task");
    });
  });

  it("provides resetForm function", () => {
    const { result } = renderHook(() => useTaskForm(), { wrapper });

    expect(typeof result.current.resetForm).toBe("function");
  });

  it("resets form data", async () => {
    const { result } = renderHook(() => useTaskForm(), { wrapper });

    act(() => {
      result.current.updateField("name", "Some Task");
    });

    act(() => {
      result.current.resetForm();
    });

    await waitFor(() => {
      expect(result.current.formData.name).toBe("");
    });
  });

  it("returns accessible lists", () => {
    const { result } = renderHook(() => useTaskForm(), { wrapper });

    expect(result.current.accessibleLists).toHaveLength(2);
  });

  it("provides handleSubmit function", () => {
    const { result } = renderHook(() => useTaskForm(), { wrapper });

    expect(typeof result.current.handleSubmit).toBe("function");
  });

  it("handleSubmit returns false when name is empty", () => {
    const { result } = renderHook(() => useTaskForm(), { wrapper });

    const onSuccess = vi.fn();
    const submitResult = result.current.handleSubmit(onSuccess);

    expect(submitResult).toBe(false);
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("handleSubmit returns false when listId is empty", async () => {
    const emptyStore = configureStore({
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
          lists: [],
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
      },
    });

    const { result } = renderHook(() => useTaskForm(), {
      wrapper: ({ children }) => (
        <Provider store={emptyStore}>{children}</Provider>
      ),
    });

    act(() => {
      result.current.updateField("name", "Task Name");
    });

    const submitResult = result.current.handleSubmit();

    expect(submitResult).toBe(false);
  });

  it("provides list dialog state", () => {
    const { result } = renderHook(() => useTaskForm(), { wrapper });

    expect(result.current.listDialogOpen).toBe(false);
    expect(typeof result.current.setListDialogOpen).toBe("function");
  });

  it("provides handleListCreated function", () => {
    const { result } = renderHook(() => useTaskForm(), { wrapper });

    expect(typeof result.current.handleListCreated).toBe("function");
  });

  it("initializes with edit task data", () => {
    const editTask = {
      id: "task-1",
      name: "Existing Task",
      description: "Description",
      priority: "HIGH" as const,
      status: "IN_PROGRESS" as const,
      listId: "list-1",
      dueDate: "2024-06-15",
      favorite: true,
      userId: "user-1",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
      shares: [],
    };

    const { result } = renderHook(() => useTaskForm(editTask), { wrapper });

    expect(result.current.formData.name).toBe("Existing Task");
    expect(result.current.formData.priority).toBe("HIGH");
    expect(result.current.formData.status).toBe("IN_PROGRESS");
    expect(result.current.formData.favorite).toBe(true);
  });
});
