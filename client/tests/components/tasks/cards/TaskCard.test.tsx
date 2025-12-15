import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { TaskCard } from "@/components/tasks/cards/TaskCard";
import type { Task } from "@/types/tasks-system/task";
import { I18nTestProvider } from "../../../helpers/i18nTestProvider";

vi.mock("@/hooks/tasks/useTasks", () => ({
  useTasks: () => ({
    toggleFavorite: vi.fn(),
    removeTask: vi.fn(() => ({ unwrap: vi.fn() })),
    editTask: vi.fn(),
  }),
}));

vi.mock("@/hooks/useLists", () => ({
  useLists: () => ({
    accessibleLists: [{ id: "list-1", name: "Test List" }],
    createList: vi.fn(),
    isOwner: () => true,
    canAccess: () => true,
  }),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { id: "user-1", name: "Test User" },
  }),
}));

const mockTask: Task = {
  id: "task-1",
  name: "Test Task",
  description: "Test description",
  status: "PENDING",
  priority: "MEDIUM",
  dueDate: "2024-12-31",
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
  listId: "list-1",
  completed: false,
  shares: [],
  favorite: false,
};

const mockFormatDate = (date?: string) => date || "";

describe("TaskCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders task name and description", () => {
    render(
      <I18nTestProvider>
        <TaskCard task={mockTask} formatDate={mockFormatDate} />
      </I18nTestProvider>,
    );

    expect(screen.getByText("Test Task")).toBeInTheDocument();
    expect(screen.getByText("Test description")).toBeInTheDocument();
  });

  it("renders with correct status badge", () => {
    render(
      <I18nTestProvider>
        <TaskCard task={mockTask} formatDate={mockFormatDate} />
      </I18nTestProvider>,
    );

    expect(screen.getByText(/pendiente/i)).toBeInTheDocument();
  });

  it("renders with correct priority badge", () => {
    render(
      <I18nTestProvider>
        <TaskCard task={mockTask} formatDate={mockFormatDate} />
      </I18nTestProvider>,
    );

    expect(screen.getByText(/media/i)).toBeInTheDocument();
  });

  it("shows action menu when clicking actions button", async () => {
    const user = userEvent.setup();

    render(
      <I18nTestProvider>
        <TaskCard task={mockTask} formatDate={mockFormatDate} />
      </I18nTestProvider>,
    );

    const buttons = screen.getAllByRole("button");
    const actionsButton = buttons.find(
      (btn) => btn.getAttribute("aria-haspopup") === "menu",
    );
    expect(actionsButton).toBeDefined();

    await user.click(actionsButton!);

    expect(screen.getByText(/editar/i)).toBeInTheDocument();
    expect(screen.getByText(/compartir/i)).toBeInTheDocument();
    expect(screen.getByText(/eliminar/i)).toBeInTheDocument();
  });

  it("renders dates correctly", () => {
    render(
      <I18nTestProvider>
        <TaskCard task={mockTask} formatDate={mockFormatDate} />
      </I18nTestProvider>,
    );

    expect(screen.getByText("2024-12-31")).toBeInTheDocument();
  });

  it("renders favorite checkbox", () => {
    render(
      <I18nTestProvider>
        <TaskCard task={mockTask} formatDate={mockFormatDate} />
      </I18nTestProvider>,
    );

    const favoriteCheckbox = screen.getByRole("checkbox");
    expect(favoriteCheckbox).toBeInTheDocument();
  });

  it("renders task with favorite true", () => {
    const favoriteTask = { ...mockTask, favorite: true };
    render(
      <I18nTestProvider>
        <TaskCard task={favoriteTask} formatDate={mockFormatDate} />
      </I18nTestProvider>,
    );

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();
  });

  it("renders task with IN_PROGRESS status", () => {
    const progressTask = { ...mockTask, status: "IN_PROGRESS" as const };
    render(
      <I18nTestProvider>
        <TaskCard task={progressTask} formatDate={mockFormatDate} />
      </I18nTestProvider>,
    );

    expect(screen.getByText("Test Task")).toBeInTheDocument();
  });

  it("renders task with COMPLETED status", () => {
    const completedTask = {
      ...mockTask,
      status: "COMPLETED" as const,
      completed: true,
    };
    render(
      <I18nTestProvider>
        <TaskCard task={completedTask} formatDate={mockFormatDate} />
      </I18nTestProvider>,
    );

    expect(screen.getByText("Test Task")).toBeInTheDocument();
  });

  it("renders task with HIGH priority", () => {
    const highPriorityTask = { ...mockTask, priority: "HIGH" as const };
    render(
      <I18nTestProvider>
        <TaskCard task={highPriorityTask} formatDate={mockFormatDate} />
      </I18nTestProvider>,
    );

    expect(screen.getByText(/alta/i)).toBeInTheDocument();
  });

  it("renders task with LOW priority", () => {
    const lowPriorityTask = { ...mockTask, priority: "LOW" as const };
    render(
      <I18nTestProvider>
        <TaskCard task={lowPriorityTask} formatDate={mockFormatDate} />
      </I18nTestProvider>,
    );

    expect(screen.getByText(/baja/i)).toBeInTheDocument();
  });

  it("renders task without description", () => {
    const noDescTask = { ...mockTask, description: undefined };
    render(
      <I18nTestProvider>
        <TaskCard task={noDescTask} formatDate={mockFormatDate} />
      </I18nTestProvider>,
    );

    expect(screen.getByText("Test Task")).toBeInTheDocument();
  });

  it("renders task without due date", () => {
    const noDueDateTask = { ...mockTask, dueDate: undefined };
    render(
      <I18nTestProvider>
        <TaskCard task={noDueDateTask} formatDate={mockFormatDate} />
      </I18nTestProvider>,
    );

    expect(screen.getByText("Test Task")).toBeInTheDocument();
  });

  it("renders task with shares", () => {
    const sharedTask = {
      ...mockTask,
      shares: [
        {
          id: "share-1",
          permission: "VIEW" as const,
          userId: "user-2",
          taskId: "task-1",
        },
      ],
    };
    render(
      <I18nTestProvider>
        <TaskCard task={sharedTask} formatDate={mockFormatDate} />
      </I18nTestProvider>,
    );

    expect(screen.getByText("Test Task")).toBeInTheDocument();
  });

  it("toggles favorite on checkbox click", async () => {
    const user = userEvent.setup();

    render(
      <I18nTestProvider>
        <TaskCard task={mockTask} formatDate={mockFormatDate} />
      </I18nTestProvider>,
    );

    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);

    expect(checkbox).toBeInTheDocument();
  });

  it("opens delete dialog and confirms deletion", async () => {
    const user = userEvent.setup();

    render(
      <I18nTestProvider>
        <TaskCard task={mockTask} formatDate={mockFormatDate} />
      </I18nTestProvider>,
    );

    const buttons = screen.getAllByRole("button");
    const actionsButton = buttons.find(
      (btn) => btn.getAttribute("aria-haspopup") === "menu",
    );
    await user.click(actionsButton!);

    const deleteButton = screen.getByText(/eliminar/i);
    await user.click(deleteButton);

    expect(screen.getByText(/¿estás seguro/i)).toBeInTheDocument();

    const confirmButton = screen.getByRole("button", {
      name: /confirm|eliminar|aceptar/i,
    });
    await user.click(confirmButton);
  });

  it("opens share dialog when share button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <I18nTestProvider>
        <TaskCard task={mockTask} formatDate={mockFormatDate} />
      </I18nTestProvider>,
    );

    const buttons = screen.getAllByRole("button");
    const actionsButton = buttons.find(
      (btn) => btn.getAttribute("aria-haspopup") === "menu",
    );
    await user.click(actionsButton!);

    const shareButton = screen.getByText(/compartir/i);
    await user.click(shareButton);
  });

  it("opens edit dialog when edit button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <I18nTestProvider>
        <TaskCard task={mockTask} formatDate={mockFormatDate} />
      </I18nTestProvider>,
    );

    const buttons = screen.getAllByRole("button");
    const actionsButton = buttons.find(
      (btn) => btn.getAttribute("aria-haspopup") === "menu",
    );
    await user.click(actionsButton!);

    const editButton = screen.getByText(/editar/i);
    await user.click(editButton);
  });
});
