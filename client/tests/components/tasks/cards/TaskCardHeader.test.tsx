import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  TaskCardHeader,
  StatusDropdown,
  PriorityDropdown,
  FavoriteCheckbox,
} from "@/components/tasks/cards/TaskCardHeader";
import { I18nTestProvider } from "../../../helpers/i18nTestProvider";

describe("TaskCardHeader", () => {
  it("renders status and priority dropdowns when handlers provided", () => {
    render(
      <I18nTestProvider>
        <TaskCardHeader
          status="PENDING"
          priority="MEDIUM"
          canEdit={true}
          onStatusChange={vi.fn()}
          onPriorityChange={vi.fn()}
        />
      </I18nTestProvider>,
    );

    expect(screen.getByText(/pendiente/i)).toBeInTheDocument();
    expect(screen.getByText(/media/i)).toBeInTheDocument();
  });

  it("renders favorite checkbox when showFavorite is true", () => {
    render(
      <I18nTestProvider>
        <TaskCardHeader
          status="PENDING"
          priority="MEDIUM"
          favorite={false}
          showFavorite={true}
          onFavoriteToggle={vi.fn()}
        />
      </I18nTestProvider>,
    );

    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });

  it("hides favorite checkbox when showFavorite is false", () => {
    render(
      <I18nTestProvider>
        <TaskCardHeader
          status="PENDING"
          priority="MEDIUM"
          showFavorite={false}
        />
      </I18nTestProvider>,
    );

    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });
});

describe("StatusDropdown", () => {
  it("renders current status", () => {
    render(
      <I18nTestProvider>
        <StatusDropdown
          status="IN_PROGRESS"
          canEdit={true}
          onStatusChange={vi.fn()}
        />
      </I18nTestProvider>,
    );

    expect(screen.getByText(/en progreso/i)).toBeInTheDocument();
  });

  it("shows dropdown options when clicked", async () => {
    const user = userEvent.setup();
    const onStatusChange = vi.fn();

    render(
      <I18nTestProvider>
        <StatusDropdown
          status="PENDING"
          canEdit={true}
          onStatusChange={onStatusChange}
        />
      </I18nTestProvider>,
    );

    await user.click(screen.getByText(/pendiente/i));

    expect(screen.getByText(/completada/i)).toBeInTheDocument();
    expect(screen.getByText(/en progreso/i)).toBeInTheDocument();
  });
});

describe("PriorityDropdown", () => {
  it("renders current priority", () => {
    render(
      <I18nTestProvider>
        <PriorityDropdown
          priority="HIGH"
          canEdit={true}
          onPriorityChange={vi.fn()}
        />
      </I18nTestProvider>,
    );

    expect(screen.getByText(/alta/i)).toBeInTheDocument();
  });

  it("shows dropdown options when clicked", async () => {
    const user = userEvent.setup();

    render(
      <I18nTestProvider>
        <PriorityDropdown
          priority="MEDIUM"
          canEdit={true}
          onPriorityChange={vi.fn()}
        />
      </I18nTestProvider>,
    );

    await user.click(screen.getByText(/media/i));

    expect(screen.getByText(/baja/i)).toBeInTheDocument();
    expect(screen.getByText(/urgente/i)).toBeInTheDocument();
  });
});

describe("FavoriteCheckbox", () => {
  it("renders unchecked state", () => {
    render(
      <I18nTestProvider>
        <FavoriteCheckbox checked={false} onToggle={vi.fn()} />
      </I18nTestProvider>,
    );

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();
  });

  it("renders checked state", () => {
    render(
      <I18nTestProvider>
        <FavoriteCheckbox checked={true} onToggle={vi.fn()} />
      </I18nTestProvider>,
    );

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();
  });

  it("calls onToggle when clicked", async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();

    render(
      <I18nTestProvider>
        <FavoriteCheckbox checked={false} onToggle={onToggle} />
      </I18nTestProvider>,
    );

    await user.click(screen.getByRole("checkbox"));
    expect(onToggle).toHaveBeenCalled();
  });
});
