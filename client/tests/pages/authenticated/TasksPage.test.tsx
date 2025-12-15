import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import TasksPage from "@/pages/authenticated/tasksPage";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/store/slices/authSlice";
import themeReducer from "@/store/slices/themeSlice";
import listsReducer from "@/store/slices/listsSlice";
import tasksReducer from "@/store/slices/tasksSlice";
import notificationsReducer from "@/store/slices/notificationsSlice";
import uiReducer from "@/store/slices/uiSlice";
import { useTasks } from "@/hooks/tasks/useTasks";
import { useLists } from "@/hooks/useLists";
import { useTaskFilters } from "@/hooks/tasks/useTaskFilters";

vi.mock("@/hooks/tasks/useTasks", () => ({ useTasks: vi.fn() }));
vi.mock("@/hooks/useLists", () => ({ useLists: vi.fn() }));
vi.mock("@/hooks/tasks/useTaskFilters", () => ({ useTaskFilters: vi.fn() }));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "es" },
  }),
}));

vi.mock("@/lib/api", () => ({
  api: {
    get: vi.fn().mockResolvedValue({ data: [] }),
    post: vi.fn().mockResolvedValue({ data: {} }),
  },
  apiErrorMessage: vi.fn(),
}));

vi.mock("@/components/tasks/TasksPageLayout", () => ({
  TasksPageLayout: ({
    title,
    emptyTasksMessage,
    headerActions,
  }: {
    title: string;
    emptyTasksMessage: string;
    headerActions?: React.ReactNode;
  }) => (
    <div data-testid="tasks-layout">
      <h1>{title}</h1>
      {headerActions && <div data-testid="header-actions">{headerActions}</div>}
      <p>{emptyTasksMessage}</p>
    </div>
  ),
}));

vi.mock("@/components/tasks/dialogs/CreateTaskDialog", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="create-task-dialog">{children}</div>
  ),
}));

vi.mock("@/hooks/useTasks", () => ({
  useTasks: vi.fn(),
}));

vi.mock("@/hooks/useLists", () => ({
  useLists: vi.fn(),
}));

vi.mock("@/hooks/useTaskFilters", () => ({
  useTaskFilters: vi.fn(),
}));

describe("TasksPage", () => {
  let store: ReturnType<typeof configureStore>;
  const mockFetchAllTasks = vi.fn();
  const mockFetchAllLists = vi.fn();
  const mockDisplayTasks = [
    { id: "1", name: "Task 1", listId: "list-1", createdAt: "2024-01-01" },
  ];
  const mockFilters = {
    status: "all",
    priority: "all",
    favorite: "all",
  };
  const mockSorting = { field: "createdAt", order: "desc" };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useTasks).mockReturnValue({
      fetchAllTasks: mockFetchAllTasks,
      isLoading: false,
      tasks: [],
    } as any);
    vi.mocked(useLists).mockReturnValue({
      fetchAllLists: mockFetchAllLists,
      isLoading: false,
      lists: [],
    } as any);
    vi.mocked(useTaskFilters).mockReturnValue({
      displayTasks: [],
      filters: mockFilters,
      sorting: mockSorting,
      filterByStatus: vi.fn(),
      filterByPriority: vi.fn(),
      filterByFavorite: vi.fn(),
      sortBy: vi.fn(),
      toggleSort: vi.fn(),
      accessibleLists: [],
      listTaskCounts: [],
      selectedListId: null,
      handleListFilter: vi.fn(),
    } as any);

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
        auth: { user: { id: "u1", name: "User" } },
      } as any,
    } as any);
  });

  it("fetches tasks and lists on mount", () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <TasksPage />
        </MemoryRouter>
      </Provider>,
    );
    expect(mockFetchAllTasks).toHaveBeenCalled();
    expect(mockFetchAllLists).toHaveBeenCalled();
  });

  it("renders task cards when tasks are present", () => {
    vi.mocked(useTaskFilters).mockReturnValue({
      displayTasks: mockDisplayTasks,
      filters: mockFilters,
      sorting: mockSorting,
      filterByStatus: vi.fn(),
      filterByPriority: vi.fn(),
      filterByFavorite: vi.fn(),
      sortBy: vi.fn(),
      toggleSort: vi.fn(),
      accessibleLists: [{ id: "list-1", name: "List 1" }],
      listTaskCounts: [],
      handleListFilter: vi.fn(),
      selectedListId: null,
    } as any);

    render(
      <Provider store={store}>
        <MemoryRouter>
          <TasksPage />
        </MemoryRouter>
      </Provider>,
    );
  });
});
