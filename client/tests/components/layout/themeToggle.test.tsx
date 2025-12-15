import ThemeToggle from "@/components/layout/ThemeToggle";
import { useTheme } from "@/hooks/ui/useTheme";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { I18nTestProvider } from "../../helpers/i18nTestProvider";

vi.mock("@/hooks/ui/useTheme", () => ({
  useTheme: vi.fn(),
}));

describe("ThemeToggle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("muestra el label para cambiar al modo claro cuando el tema es oscuro", () => {
    vi.mocked(useTheme).mockReturnValue({
      theme: "dark",
      setTheme: vi.fn(),
    });

    render(
      <I18nTestProvider>
        <ThemeToggle />
      </I18nTestProvider>,
    );

    expect(
      screen.getByRole("button", { name: "Cambiar a tema claro" }),
    ).toBeInTheDocument();
  });

  it("Cambia al tema opuesto al hacer click", async () => {
    const setTheme = vi.fn();
    vi.mocked(useTheme).mockReturnValue({
      theme: "light",
      setTheme,
    });

    render(
      <I18nTestProvider>
        <ThemeToggle />
      </I18nTestProvider>,
    );
    const user = userEvent.setup();
    await user.click(
      screen.getByRole("button", { name: "Cambiar a tema oscuro" }),
    );

    expect(setTheme).toHaveBeenCalledWith("dark");
  });
});
