import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ItemActionsMenu } from "@/components/shared/ItemActionsMenu";
import userEvent from "@testing-library/user-event";
import { I18nTestProvider } from "../../helpers/i18nTestProvider";

describe("ItemActionsMenu", () => {
  it("renders menu trigger button", () => {
    render(
      <I18nTestProvider>
        <ItemActionsMenu onEdit={vi.fn()} />
      </I18nTestProvider>,
    );

    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("shows edit option when onEdit provided", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();

    render(
      <I18nTestProvider>
        <ItemActionsMenu onEdit={onEdit} />
      </I18nTestProvider>,
    );

    const button = screen.getByRole("button");
    await user.click(button);

    expect(screen.getByText(/editar/i)).toBeInTheDocument();
  });

  it("shows delete option when onDelete provided", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    render(
      <I18nTestProvider>
        <ItemActionsMenu onDelete={onDelete} />
      </I18nTestProvider>,
    );

    const button = screen.getByRole("button");
    await user.click(button);

    expect(screen.getByText(/eliminar/i)).toBeInTheDocument();
  });

  it("shows share option when onShare provided", async () => {
    const user = userEvent.setup();
    const onShare = vi.fn();

    render(
      <I18nTestProvider>
        <ItemActionsMenu onShare={onShare} />
      </I18nTestProvider>,
    );

    const button = screen.getByRole("button");
    await user.click(button);

    expect(screen.getByText(/compartir/i)).toBeInTheDocument();
  });

  it("calls onEdit when edit option clicked", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();

    render(
      <I18nTestProvider>
        <ItemActionsMenu onEdit={onEdit} />
      </I18nTestProvider>,
    );

    const button = screen.getByRole("button");
    await user.click(button);
    await user.click(screen.getByText(/editar/i));

    expect(onEdit).toHaveBeenCalled();
  });
});
