import {
  TaskStatusFilter,
  TaskPriorityFilter,
  TaskFavoriteToggle,
  TaskSortFilter,
} from "@/components/tasks/TaskFilters";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "tasks.filters.statusPlaceholder": "Status",
        "tasks.filters.statusAll": "All Statuses",
        "tasks.filters.priorityPlaceholder": "Priority",
        "tasks.filters.priorityAll": "All Priorities",
        "tasks.filters.showAll": "Show All",
        "tasks.filters.showFavorites": "Show Favorites",
        "tasks.filters.sortPlaceholder": "Sort by",
        "tasks.filters.sortFields.dueDate": "Due Date",
        "tasks.filters.sortFields.createdAt": "Created At",
        "tasks.filters.sortFields.name": "Name",
        "tasks.filters.sortOrder.asc": "Ascending",
        "tasks.filters.sortOrder.desc": "Descending",
        "tasks.status.PENDING": "Pending",
        "tasks.status.IN_PROGRESS": "In Progress",
        "tasks.status.COMPLETED": "Completed",
        "tasks.priority.LOW": "Low",
        "tasks.priority.MEDIUM": "Medium",
        "tasks.priority.HIGH": "High",
      };
      return translations[key] || key;
    },
  }),
}));

describe("TaskStatusFilter", () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with default value", () => {
    render(<TaskStatusFilter value="all" onChange={mockOnChange} />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("renders in compact variant", () => {
    render(
      <TaskStatusFilter
        value="all"
        onChange={mockOnChange}
        variant="compact"
      />,
    );
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("displays selected status", () => {
    render(<TaskStatusFilter value="PENDING" onChange={mockOnChange} />);
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("calls onChange when status is selected", async () => {
    render(<TaskStatusFilter value="all" onChange={mockOnChange} />);
    fireEvent.click(screen.getByRole("combobox"));
    await waitFor(() => {
      const pendingOption = screen.getByRole("option", { name: /pending/i });
      fireEvent.click(pendingOption);
    });
    expect(mockOnChange).toHaveBeenCalledWith("PENDING");
  });

  it("shows all option when showAll is true", async () => {
    render(
      <TaskStatusFilter value="all" onChange={mockOnChange} showAll={true} />,
    );
    fireEvent.click(screen.getByRole("combobox"));
    await waitFor(() => {
      const options = screen.getAllByRole("option");
      expect(options.length).toBeGreaterThan(0);
    });
  });
});

describe("TaskPriorityFilter", () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with default value", () => {
    render(<TaskPriorityFilter value="all" onChange={mockOnChange} />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("displays selected priority", () => {
    render(<TaskPriorityFilter value="HIGH" onChange={mockOnChange} />);
    expect(screen.getByText("High")).toBeInTheDocument();
  });

  it("renders in compact variant", () => {
    render(
      <TaskPriorityFilter
        value="all"
        onChange={mockOnChange}
        variant="compact"
      />,
    );
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("calls onChange when priority is selected", async () => {
    render(<TaskPriorityFilter value="all" onChange={mockOnChange} />);
    fireEvent.click(screen.getByRole("combobox"));
    await waitFor(() => {
      const highOption = screen.getByRole("option", { name: /high/i });
      fireEvent.click(highOption);
    });
    expect(mockOnChange).toHaveBeenCalledWith("HIGH");
  });
});

describe("TaskFavoriteToggle", () => {
  const mockOnToggle = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders inactive state", () => {
    render(<TaskFavoriteToggle active={false} onToggle={mockOnToggle} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("renders active state", () => {
    render(<TaskFavoriteToggle active={true} onToggle={mockOnToggle} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("calls onToggle when clicked", () => {
    render(<TaskFavoriteToggle active={false} onToggle={mockOnToggle} />);
    fireEvent.click(screen.getByRole("button"));
    expect(mockOnToggle).toHaveBeenCalled();
  });

  it("shows correct title for inactive state", () => {
    render(<TaskFavoriteToggle active={false} onToggle={mockOnToggle} />);
    expect(screen.getByTitle("Show Favorites")).toBeInTheDocument();
  });

  it("shows correct title for active state", () => {
    render(<TaskFavoriteToggle active={true} onToggle={mockOnToggle} />);
    expect(screen.getByTitle("Show All")).toBeInTheDocument();
  });
});

describe("TaskSortFilter", () => {
  const mockOnSortFieldChange = vi.fn();
  const mockOnToggleOrder = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders sort field select", () => {
    render(
      <TaskSortFilter
        sortField="createdAt"
        sortOrder="desc"
        onSortFieldChange={mockOnSortFieldChange}
        onToggleOrder={mockOnToggleOrder}
      />,
    );
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("renders sort order toggle button", () => {
    render(
      <TaskSortFilter
        sortField="createdAt"
        sortOrder="desc"
        onSortFieldChange={mockOnSortFieldChange}
        onToggleOrder={mockOnToggleOrder}
      />,
    );
    expect(screen.getByTitle("Descending")).toBeInTheDocument();
  });

  it("calls onSortFieldChange when field is selected", async () => {
    render(
      <TaskSortFilter
        sortField="createdAt"
        sortOrder="desc"
        onSortFieldChange={mockOnSortFieldChange}
        onToggleOrder={mockOnToggleOrder}
      />,
    );
    fireEvent.click(screen.getByRole("combobox"));
    await waitFor(() => {
      const dueDateOption = screen.getByRole("option", { name: /due date/i });
      fireEvent.click(dueDateOption);
    });
    expect(mockOnSortFieldChange).toHaveBeenCalledWith("dueDate");
  });

  it("calls onToggleOrder when order button is clicked", () => {
    render(
      <TaskSortFilter
        sortField="createdAt"
        sortOrder="desc"
        onSortFieldChange={mockOnSortFieldChange}
        onToggleOrder={mockOnToggleOrder}
      />,
    );
    fireEvent.click(screen.getByTitle("Descending"));
    expect(mockOnToggleOrder).toHaveBeenCalled();
  });

  it("shows ascending title when sortOrder is asc", () => {
    render(
      <TaskSortFilter
        sortField="createdAt"
        sortOrder="asc"
        onSortFieldChange={mockOnSortFieldChange}
        onToggleOrder={mockOnToggleOrder}
      />,
    );
    expect(screen.getByTitle("Ascending")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <TaskSortFilter
        sortField="createdAt"
        sortOrder="desc"
        onSortFieldChange={mockOnSortFieldChange}
        onToggleOrder={mockOnToggleOrder}
        className="custom-class"
      />,
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
