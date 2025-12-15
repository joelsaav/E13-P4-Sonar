import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import SharedPage from "@/pages/authenticated/sharedPage";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/store/slices/authSlice";
import listsReducer from "@/store/slices/listsSlice";
import tasksReducer from "@/store/slices/tasksSlice";
import notificationsReducer from "@/store/slices/notificationsSlice";
import uiReducer from "@/store/slices/uiSlice";
import themeReducer from "@/store/slices/themeSlice";

import { useTasks } from "@/hooks/tasks/useTasks";
import { useLists } from "@/hooks/useLists";
import { useTaskFilters } from "@/hooks/tasks/useTaskFilters";

vi.mock("@/hooks/tasks/useTasks", () => ({ useTasks: vi.fn() }));
vi.mock("@/hooks/useLists", () => ({ useLists: vi.fn() }));
vi.mock("@/hooks/tasks/useTaskFilters", () => ({ useTaskFilters: vi.fn() }));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en" },
  }),
}));

vi.mock("@/components/tasks/TasksPageLayout", () => ({
  TasksPageLayout: ({ title, headerActions, tasks, renderCard }: any) => (
    <div data-testid="tasks-layout">
      <h1>{title}</h1>
      <div data-testid="header-actions">{headerActions}</div>
      <div data-testid="task-list">
        {tasks.map((task: any) => renderCard(task))}
      </div>
    </div>
  ),
}));

vi.mock("@/components/tasks/cards/SharedTaskCard", () => ({
  SharedTaskCard: ({ task }: any) => (
    <div data-testid={`task-${task.id}`}>{task.name}</div>
  ),
}));

describe("SharedPage", () => {
  let store: ReturnType<typeof configureStore>;
  const mockFetchSharedTasks = vi.fn();
  const mockFetchSharedLists = vi.fn();
  const mockDisplayTasks = [
    {
      id: "1",
      name: "Shared Task 1",
      listId: "list-1",
      createdAt: "2024-01-01",
    },
  ];
  const mockFilters = {
    status: "all",
    priority: "all",
  };
  const mockSorting = { field: "createdAt", order: "desc" };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useTasks).mockReturnValue({
      fetchSharedTasks: mockFetchSharedTasks,
      isLoading: false,
    } as any);

    vi.mocked(useLists).mockReturnValue({
      fetchSharedLists: mockFetchSharedLists,
      isLoading: false,
      isOwner: vi.fn(),
      canAccess: vi.fn(),
      accessibleLists: [],
    } as any);

    vi.mocked(useTaskFilters).mockReturnValue({
      displayTasks: [],
      filters: mockFilters,
      sorting: mockSorting,
      filterByStatus: vi.fn(),
      filterByPriority: vi.fn(),
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

  it("fetches shared tasks and lists on mount", () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <SharedPage />
        </MemoryRouter>
      </Provider>,
    );
    expect(mockFetchSharedTasks).toHaveBeenCalled();
    expect(mockFetchSharedLists).toHaveBeenCalled();
  });

  it("renders shared task cards", () => {
    vi.mocked(useTaskFilters).mockReturnValue({
      displayTasks: mockDisplayTasks,
      filters: mockFilters,
      sorting: mockSorting,
      filterByStatus: vi.fn(),
      filterByPriority: vi.fn(),
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
          <SharedPage />
        </MemoryRouter>
      </Provider>,
    );

    expect(screen.getByTestId("task-1")).toBeInTheDocument();
    expect(screen.getByText("Shared Task 1")).toBeInTheDocument();
  });
});
