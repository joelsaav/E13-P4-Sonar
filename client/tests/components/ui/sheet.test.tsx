import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { render, screen, waitFor } from "@testing-library/react";
import { I18nTestProvider } from "../../testUtils/i18nTestProvider";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

describe("Sheet", () => {
  it("Renderiza el Sheet correctamente", () => {
    const { container } = render(
      <I18nTestProvider>
        <Sheet>
          <SheetTrigger>Abrir</SheetTrigger>
          <SheetContent>
            <SheetTitle>Título</SheetTitle>
            <SheetDescription>Descripción</SheetDescription>
          </SheetContent>
        </Sheet>
      </I18nTestProvider>,
    );

    expect(
      container.querySelector('[data-slot="sheet-trigger"]'),
    ).toBeInTheDocument();
  });

  it("Abre el Sheet al hacer click en el trigger", async () => {
    const user = userEvent.setup();

    render(
      <I18nTestProvider>
        <Sheet>
          <SheetTrigger>Abrir Sheet</SheetTrigger>
          <SheetContent>
            <SheetTitle>Título del Sheet</SheetTitle>
            <SheetDescription>Descripción del contenido</SheetDescription>
          </SheetContent>
        </Sheet>
      </I18nTestProvider>,
    );

    const trigger = screen.getByText("Abrir Sheet");
    await user.click(trigger);

    expect(screen.getByText("Título del Sheet")).toBeInTheDocument();
  });

  it("Renderiza SheetHeader correctamente", async () => {
    const user = userEvent.setup();

    render(
      <I18nTestProvider>
        <Sheet>
          <SheetTrigger>Abrir</SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Título</SheetTitle>
              <SheetDescription>Descripción</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </I18nTestProvider>,
    );

    await user.click(screen.getByText("Abrir"));

    await waitFor(() => {
      const header = document.querySelector('[data-slot="sheet-header"]');
      expect(header).toBeInTheDocument();
    });
  });

  it("Renderiza SheetFooter correctamente", async () => {
    const user = userEvent.setup();

    render(
      <Sheet>
        <SheetTrigger>Abrir</SheetTrigger>
        <SheetContent>
          <SheetTitle>Título</SheetTitle>
          <SheetDescription>Descripción</SheetDescription>
          <SheetFooter>
            <button>Aceptar</button>
          </SheetFooter>
        </SheetContent>
      </Sheet>,
    );

    await user.click(screen.getByText("Abrir"));

    await waitFor(() => {
      expect(
        document.querySelector('[data-slot="sheet-footer"]'),
      ).toBeInTheDocument();
    });
  });

  it("Aplica clases personalizadas al SheetContent", async () => {
    const user = userEvent.setup();

    render(
      <Sheet>
        <SheetTrigger>Abrir</SheetTrigger>
        <SheetContent className="custom-content">
          <SheetTitle>Título</SheetTitle>
          <SheetDescription>Descripción</SheetDescription>
        </SheetContent>
      </Sheet>,
    );

    await user.click(screen.getByText("Abrir"));

    await waitFor(() => {
      const content = document.querySelector('[data-slot="sheet-content"]');
      expect(content).toHaveClass("custom-content");
    });
  });

  it("Renderiza con side='left'", async () => {
    const user = userEvent.setup();

    render(
      <Sheet>
        <SheetTrigger>Abrir</SheetTrigger>
        <SheetContent side="left">
          <SheetTitle>Título</SheetTitle>
        </SheetContent>
      </Sheet>,
    );

    await user.click(screen.getByText("Abrir"));

    expect(screen.getByText("Título")).toBeInTheDocument();
  });

  it("Renderiza con side='top'", async () => {
    const user = userEvent.setup();

    render(
      <Sheet>
        <SheetTrigger>Abrir</SheetTrigger>
        <SheetContent side="top">
          <SheetTitle>Título</SheetTitle>
        </SheetContent>
      </Sheet>,
    );

    await user.click(screen.getByText("Abrir"));

    expect(screen.getByText("Título")).toBeInTheDocument();
  });

  it("Renderiza con side='bottom'", async () => {
    const user = userEvent.setup();

    render(
      <Sheet>
        <SheetTrigger>Abrir</SheetTrigger>
        <SheetContent side="bottom">
          <SheetTitle>Título</SheetTitle>
        </SheetContent>
      </Sheet>,
    );

    await user.click(screen.getByText("Abrir"));

    expect(screen.getByText("Título")).toBeInTheDocument();
  });

  it("Renderiza SheetDescription correctamente", async () => {
    const user = userEvent.setup();

    render(
      <Sheet>
        <SheetTrigger>Abrir</SheetTrigger>
        <SheetContent>
          <SheetTitle>Título</SheetTitle>
          <SheetDescription>Esta es la descripción</SheetDescription>
        </SheetContent>
      </Sheet>,
    );

    await user.click(screen.getByText("Abrir"));

    await waitFor(() => {
      expect(
        document.querySelector('[data-slot="sheet-description"]'),
      ).toBeInTheDocument();
      expect(screen.getByText("Esta es la descripción")).toBeInTheDocument();
    });
  });

  it("Renderiza el botón de cierre", async () => {
    const user = userEvent.setup();

    render(
      <Sheet>
        <SheetTrigger>Abrir</SheetTrigger>
        <SheetContent>
          <SheetTitle>Título</SheetTitle>
        </SheetContent>
      </Sheet>,
    );

    await user.click(screen.getByText("Abrir"));

    expect(screen.getByText("Cerrar")).toBeInTheDocument();
  });

  it("Renderiza SheetClose correctamente", async () => {
    const user = userEvent.setup();

    render(
      <Sheet>
        <SheetTrigger>Abrir</SheetTrigger>
        <SheetContent>
          <SheetTitle>Título</SheetTitle>
          <SheetDescription>Descripción</SheetDescription>
          <SheetClose>Cerrar personalizado</SheetClose>
        </SheetContent>
      </Sheet>,
    );

    await user.click(screen.getByText("Abrir"));

    await waitFor(() => {
      expect(
        document.querySelector('[data-slot="sheet-close"]'),
      ).toBeInTheDocument();
    });
  });

  it("Renderiza overlay cuando está abierto", async () => {
    const user = userEvent.setup();

    render(
      <Sheet>
        <SheetTrigger>Abrir</SheetTrigger>
        <SheetContent>
          <SheetTitle>Título</SheetTitle>
          <SheetDescription>Descripción</SheetDescription>
        </SheetContent>
      </Sheet>,
    );

    await user.click(screen.getByText("Abrir"));

    await waitFor(() => {
      expect(
        document.querySelector('[data-slot="sheet-overlay"]'),
      ).toBeInTheDocument();
    });
  });

  it("Aplica clases personalizadas al SheetHeader", async () => {
    const user = userEvent.setup();

    render(
      <Sheet>
        <SheetTrigger>Abrir</SheetTrigger>
        <SheetContent>
          <SheetHeader className="custom-header">
            <SheetTitle>Título</SheetTitle>
            <SheetDescription>Descripción</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>,
    );

    await user.click(screen.getByText("Abrir"));

    await waitFor(() => {
      const header = document.querySelector('[data-slot="sheet-header"]');
      expect(header).toHaveClass("custom-header");
    });
  });

  it("Aplica clases personalizadas al SheetFooter", async () => {
    const user = userEvent.setup();

    render(
      <Sheet>
        <SheetTrigger>Abrir</SheetTrigger>
        <SheetContent>
          <SheetTitle>Título</SheetTitle>
          <SheetDescription>Descripción</SheetDescription>
          <SheetFooter className="custom-footer">
            <button>Aceptar</button>
          </SheetFooter>
        </SheetContent>
      </Sheet>,
    );

    await user.click(screen.getByText("Abrir"));

    await waitFor(() => {
      const footer = document.querySelector('[data-slot="sheet-footer"]');
      expect(footer).toHaveClass("custom-footer");
    });
  });
});
