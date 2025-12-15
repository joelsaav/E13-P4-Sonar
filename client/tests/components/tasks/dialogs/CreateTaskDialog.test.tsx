import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import CreateTaskDialog from "@/components/tasks/dialogs/CreateTaskDialog";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/store/slices/authSlice";
import listsReducer from "@/store/slices/listsSlice";
import tasksReducer from "@/store/slices/tasksSlice";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("@/components/shared/FormDialog", () => ({
  FormDialog: ({
    title,
    children,
    open,
  }: {
    title: string;
    children: React.ReactNode;
    open?: boolean;
  }) =>
    open ? (
      <div data-testid="form-dialog">
        <h2>{title}</h2>
        {children}
      </div>
    ) : null,
}));

vi.mock("@/components/tasks/TaskFormFields", () => ({
  TaskFormFields: () => <div data-testid="task-form-fields">Form Fields</div>,
}));

vi.mock("@/components/lists/CreateListDialog", () => ({
  CreateListDialog: () => <div data-testid="create-list-dialog" />,
}));

describe("CreateTaskDialog", () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    store = configureStore({
      reducer: {
        auth: authReducer,
        lists: listsReducer,
        tasks: tasksReducer,
      },
      preloadedState: {
        auth: {
          user: { id: "user-1", name: "Test User" },
          token: "token",
          isAuthenticated: true,
          isLoading: false,
          error: null,
          isInitializing: false,
        },
        lists: {
          lists: [{ id: "list-1", name: "Test List", shares: [] }],
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

  const renderDialog = (props = {}) => {
    return render(
      <Provider store={store}>
        <MemoryRouter>
          <CreateTaskDialog {...props} />
        </MemoryRouter>
      </Provider>,
    );
  };

  it("renders create dialog with form when open", () => {
    renderDialog({ open: true, onOpenChange: vi.fn() });
    expect(screen.getByTestId("form-dialog")).toBeInTheDocument();
    expect(screen.getByText("tasks.create.title")).toBeInTheDocument();
    expect(screen.getByTestId("task-form-fields")).toBeInTheDocument();
  });

  it("renders edit dialog when editTask is provided", () => {
    const editTask = {
      id: "task-1",
      name: "Edit Task",
      status: "PENDING",
      priority: "HIGH",
    };
    renderDialog({ open: true, onOpenChange: vi.fn(), editTask });
    expect(screen.getByText("tasks.edit.title")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    renderDialog({ open: false, onOpenChange: vi.fn() });
    expect(screen.queryByTestId("form-dialog")).not.toBeInTheDocument();
  });

  it("renders create list dialog when showCreateList is true", () => {
    renderDialog({ open: true, onOpenChange: vi.fn() });
    expect(screen.getByTestId("create-list-dialog")).toBeInTheDocument();
  });
});
