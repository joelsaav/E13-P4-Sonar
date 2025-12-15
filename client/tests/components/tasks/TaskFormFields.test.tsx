import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TaskFormFields } from "@/components/tasks/TaskFormFields";
import userEvent from "@testing-library/user-event";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("@/components/ui/combobox", () => ({
  Combobox: ({ onValueChange, onCreateNew }: any) => (
    <div data-testid="combobox">
      <button onClick={() => onValueChange("list-2")}>Select List</button>
      <button onClick={onCreateNew}>Create List</button>
    </div>
  ),
}));

vi.mock("@/components/tasks/TaskFilters", () => ({
  TaskPriorityFilter: ({ onChange }: any) => (
    <button onClick={() => onChange("HIGH")}>Set Priority</button>
  ),
  TaskStatusFilter: ({ onChange }: any) => (
    <button onClick={() => onChange("IN_PROGRESS")}>Set Status</button>
  ),
}));

vi.mock("@/components/shared/Field", () => ({
  FormField: ({ label, children, htmlFor }: any) => (
    <div>
      <label htmlFor={htmlFor}>{label}</label>
      {children}
    </div>
  ),
}));

describe("TaskFormFields", () => {
  const mockFormData = {
    name: "Test Task",
    description: "Desc",
    priority: "MEDIUM" as const,
    status: "PENDING" as const,
    listId: "list-1",
    dueDate: "2024-12-31",
  };
  const mockUpdateField = vi.fn();
  const mockCreateList = vi.fn();

  const defaultProps = {
    formData: mockFormData,
    updateField: mockUpdateField,
    accessibleLists: [{ id: "list-1", name: "List 1" }] as any,
    onCreateList: mockCreateList,
    showCreateList: true,
  };

  it("renders all form fields", () => {
    render(<TaskFormFields {...defaultProps} />);
    expect(screen.getByLabelText("tasks.fields.name.label")).toHaveValue(
      "Test Task",
    );
    expect(screen.getByLabelText("tasks.fields.description.label")).toHaveValue(
      "Desc",
    );
    expect(screen.getByLabelText("tasks.fields.dueDate.label")).toHaveValue(
      "2024-12-31",
    );
  });

  it("calls updateField on inputs change", async () => {
    const user = userEvent.setup();
    render(<TaskFormFields {...defaultProps} />);

    fireEvent.change(screen.getByLabelText("tasks.fields.name.label"), {
      target: { value: "New Task Name" },
    });
    expect(mockUpdateField).toHaveBeenCalledWith("name", "New Task Name");
  });

  it("calls updateField on component changes", () => {
    render(<TaskFormFields {...defaultProps} />);

    fireEvent.click(screen.getByText("Select List"));
    expect(mockUpdateField).toHaveBeenCalledWith("listId", "list-2");

    fireEvent.click(screen.getByText("Set Priority"));
    expect(mockUpdateField).toHaveBeenCalledWith("priority", "HIGH");

    fireEvent.click(screen.getByText("Set Status"));
    expect(mockUpdateField).toHaveBeenCalledWith("status", "IN_PROGRESS");
  });

  it("calls onCreateList when triggered from combobox", () => {
    render(<TaskFormFields {...defaultProps} />);
    fireEvent.click(screen.getByText("Create List"));
    expect(mockCreateList).toHaveBeenCalled();
  });
});
