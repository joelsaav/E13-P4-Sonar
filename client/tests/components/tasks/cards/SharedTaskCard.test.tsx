import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { SharedTaskCard } from "@/components/tasks/cards/SharedTaskCard";
import type { Task } from "@/types/tasks-system/task";
import { I18nTestProvider } from "../../../helpers/i18nTestProvider";

vi.mock("@/hooks/tasks/useTasks", () => ({
  useTasks: () => ({
    removeTask: vi.fn(() => ({ unwrap: vi.fn() })),
    editTask: vi.fn(),
    removeShare: vi.fn(() => ({ unwrap: vi.fn() })),
  }),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { id: "user-1", name: "Test User" },
  }),
}));

vi.mock("@/hooks/useLists", () => ({
  useLists: () => ({
    accessibleLists: [{ id: "list-1", name: "Test List" }],
  }),
}));

const mockTask: Task = {
  id: "task-1",
  name: "Shared Task",
  description: "Shared description",
  status: "PENDING",
  priority: "MEDIUM",
  dueDate: "2024-12-31",
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
  listId: "list-1",
  completed: false,
  shares: [
    { id: "share-1", permission: "EDIT", userId: "user-1", taskId: "task-1" },
  ],
  favorite: false,
  list: {
    id: "list-1",
    name: "Test List",
    owner: { id: "owner-1", name: "Owner", email: "owner@example.com" },
  },
};

const mockFormatDate = (date?: string) => date || "";

describe("SharedTaskCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders shared task with name and description", () => {
    render(
      <I18nTestProvider>
        <SharedTaskCard task={mockTask} formatDate={mockFormatDate} />
      </I18nTestProvider>,
    );

    expect(screen.getByText("Shared Task")).toBeInTheDocument();
    expect(screen.getByText("Shared description")).toBeInTheDocument();
  });

  it("renders with VIEW permission (readonly)", () => {
    const viewTask = {
      ...mockTask,
      shares: [
        {
          id: "share-1",
          permission: "VIEW" as const,
          userId: "user-1",
          taskId: "task-1",
        },
      ],
    };
    render(
      <I18nTestProvider>
        <SharedTaskCard task={viewTask} formatDate={mockFormatDate} />
      </I18nTestProvider>,
    );

    expect(screen.getByText("Shared Task")).toBeInTheDocument();
  });

  it("renders with ADMIN permission", () => {
    const adminTask = {
      ...mockTask,
      shares: [
        {
          id: "share-1",
          permission: "ADMIN" as const,
          userId: "user-1",
          taskId: "task-1",
        },
      ],
    };
    render(
      <I18nTestProvider>
        <SharedTaskCard task={adminTask} formatDate={mockFormatDate} />
      </I18nTestProvider>,
    );

    expect(screen.getByText("Shared Task")).toBeInTheDocument();
  });

  it("renders owner badge when owner is present", () => {
    render(
      <I18nTestProvider>
        <SharedTaskCard task={mockTask} formatDate={mockFormatDate} />
      </I18nTestProvider>,
    );

    expect(screen.getByText("O")).toBeInTheDocument();
  });

  it("renders without list prop", () => {
    render(
      <I18nTestProvider>
        <SharedTaskCard task={mockTask} formatDate={mockFormatDate} />
      </I18nTestProvider>,
    );

    expect(screen.getByText("Shared Task")).toBeInTheDocument();
  });
});
