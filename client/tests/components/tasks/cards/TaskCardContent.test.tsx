import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TaskCardContent } from "@/components/tasks/cards/TaskCardContent";
import { I18nTestProvider } from "../../../helpers/i18nTestProvider";

const mockFormatDate = (date?: string) => date || "";

describe("TaskCardContent", () => {
  it("renders task name", () => {
    render(
      <I18nTestProvider>
        <TaskCardContent name="My Test Task" formatDate={mockFormatDate} />
      </I18nTestProvider>,
    );

    expect(screen.getByText("My Test Task")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(
      <I18nTestProvider>
        <TaskCardContent
          name="Task"
          description="This is a description"
          formatDate={mockFormatDate}
        />
      </I18nTestProvider>,
    );

    expect(screen.getByText("This is a description")).toBeInTheDocument();
  });

  it("renders due date when provided", () => {
    render(
      <I18nTestProvider>
        <TaskCardContent
          name="Task"
          dueDate="2024-12-25"
          formatDate={mockFormatDate}
        />
      </I18nTestProvider>,
    );

    expect(screen.getByText("2024-12-25")).toBeInTheDocument();
  });

  it("renders created date when provided", () => {
    render(
      <I18nTestProvider>
        <TaskCardContent
          name="Task"
          createdAt="2024-01-01"
          formatDate={mockFormatDate}
        />
      </I18nTestProvider>,
    );

    expect(screen.getByText("2024-01-01")).toBeInTheDocument();
  });

  it("handles empty dates gracefully", () => {
    render(
      <I18nTestProvider>
        <TaskCardContent name="Task" formatDate={mockFormatDate} />
      </I18nTestProvider>,
    );

    expect(screen.getByText("Task")).toBeInTheDocument();
  });
});
