import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { TasksPageLayout } from "@/components/tasks/TasksPageLayout";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/store/slices/authSlice";
import uiReducer from "@/store/slices/uiSlice";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("@/components/shared/Typewriter", () => ({
  Typewriter: ({ text, className }: { text: string; className?: string }) => (
    <h1 className={className}>{text}</h1>
  ),
}));

vi.mock("@/components/tasks/FilterableList", () => ({
  FilterableList: ({ title }: { title: string }) => (
    <div data-testid="filterable-list">{title}</div>
  ),
}));

describe("TasksPageLayout", () => {
  let store: ReturnType<typeof configureStore>;

  const defaultProps = {
    title: "Tasks",
    sidebarTitle: "Lists",
    sidebarItems: [],
    selectedListId: null,
    onListClick: vi.fn(),
    isSidebarLoading: false,
    sidebarEmptyMessage: "No lists",
    filters: {
      status: "all" as const,
      priority: "all" as const,
      favorite: "all" as const,
    },
    onStatusChange: vi.fn(),
    onPriorityChange: vi.fn(),
    sorting: { field: "createdAt" as const, order: "desc" as const },
    onSortChange: vi.fn(),
    onToggleSort: vi.fn(),
    isLoadingTasks: false,
    tasks: [],
    renderCard: vi.fn((task) => <div key={task.id}>{task.name}</div>),
    emptyTasksMessage: "No tasks",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    store = configureStore({
      reducer: {
        auth: authReducer,
        ui: uiReducer,
      },
      preloadedState: {
        ui: { sidebarWidth: "normal", taskCardSize: 2 },
      },
    });
  });

  const renderLayout = (props = {}) => {
    return render(
      <Provider store={store}>
        <TasksPageLayout {...defaultProps} {...props} />
      </Provider>,
    );
  };

  it("renders title and sidebar", () => {
    renderLayout();
    expect(screen.getByText("Tasks")).toBeInTheDocument();
    expect(screen.getByTestId("filterable-list")).toBeInTheDocument();
  });

  it("renders header actions when provided", () => {
    renderLayout({ headerActions: <button>Create</button> });
    expect(screen.getByText("Create")).toBeInTheDocument();
  });

  it("renders empty message when no tasks", () => {
    renderLayout();
    expect(screen.getByText("No tasks")).toBeInTheDocument();
  });

  it("renders tasks when provided", () => {
    const tasks = [
      { id: "1", name: "Task 1", status: "PENDING", priority: "HIGH" },
      { id: "2", name: "Task 2", status: "COMPLETED", priority: "LOW" },
    ];
    renderLayout({ tasks });
    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("Task 2")).toBeInTheDocument();
  });

  it("renders loading skeletons when loading", () => {
    const { container } = renderLayout({ isLoadingTasks: true });
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders error message when error is present", () => {
    renderLayout({ error: "Something went wrong" });
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });
});
