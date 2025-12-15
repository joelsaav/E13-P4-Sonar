import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useAutosizeTextArea } from "@/hooks/chatBot/useAutosizeTextarea";

describe("useAutosizeTextArea", () => {
  let textareaRef: React.RefObject<HTMLTextAreaElement>;
  let mockTextarea: HTMLTextAreaElement;

  beforeEach(() => {
    mockTextarea = document.createElement("textarea");
    Object.defineProperty(mockTextarea, "scrollHeight", {
      writable: true,
      value: 100,
    });
    mockTextarea.style.height = "50px";

    textareaRef = { current: mockTextarea };
  });

  it("debe ajustar la altura del textarea según el scrollHeight", () => {
    const { rerender } = renderHook(
      ({ dependencies }) =>
        useAutosizeTextArea({
          ref: textareaRef,
          dependencies,
        }),
      { initialProps: { dependencies: ["initial"] } },
    );

    expect(mockTextarea.style.height).toBe("100px");

    Object.defineProperty(mockTextarea, "scrollHeight", {
      writable: true,
      value: 150,
    });

    rerender({ dependencies: ["changed"] });
    expect(mockTextarea.style.height).toBe("150px");
  });

  it("debe respetar maxHeight", () => {
    Object.defineProperty(mockTextarea, "scrollHeight", {
      writable: true,
      value: 100,
    });

    const { rerender } = renderHook(
      ({ deps }) =>
        useAutosizeTextArea({
          ref: textareaRef,
          maxHeight: 200,
          dependencies: deps,
        }),
      { initialProps: { deps: ["initial"] } },
    );

    Object.defineProperty(mockTextarea, "scrollHeight", {
      writable: true,
      value: 300,
    });

    rerender({ deps: ["changed"] });

    const height = parseInt(mockTextarea.style.height);
    expect(height).toBeLessThanOrEqual(200);
  });

  it("debe mantener altura mínima original", () => {
    Object.defineProperty(mockTextarea, "scrollHeight", {
      writable: true,
      value: 100,
    });

    const { rerender } = renderHook(
      ({ dependencies }) =>
        useAutosizeTextArea({
          ref: textareaRef,
          dependencies,
        }),
      { initialProps: { dependencies: ["initial"] } },
    );

    Object.defineProperty(mockTextarea, "scrollHeight", {
      writable: true,
      value: 50,
    });

    rerender({ dependencies: ["changed"] });

    expect(mockTextarea.style.height).toBe("100px");
  });

  it("debe aplicar borderWidth correctamente", () => {
    Object.defineProperty(mockTextarea, "scrollHeight", {
      writable: true,
      value: 100,
    });

    renderHook(() =>
      useAutosizeTextArea({
        ref: textareaRef,
        borderWidth: 5,
        dependencies: ["test"],
      }),
    );

    const height = parseInt(mockTextarea.style.height);
    expect(height).toBeGreaterThan(90);
  });

  it("no debe hacer nada si ref.current es null", () => {
    const nullRef = { current: null as unknown as HTMLTextAreaElement };

    renderHook(() =>
      useAutosizeTextArea({
        ref: nullRef,
        dependencies: ["test"],
      }),
    );

    expect(true).toBe(true);
  });

  it("debe reaccionar a cambios en dependencies", () => {
    Object.defineProperty(mockTextarea, "scrollHeight", {
      writable: true,
      value: 100,
    });

    const { rerender } = renderHook(
      ({ deps }) =>
        useAutosizeTextArea({
          ref: textareaRef,
          dependencies: deps,
        }),
      { initialProps: { deps: ["dep1"] } },
    );

    const initialHeight = mockTextarea.style.height;

    Object.defineProperty(mockTextarea, "scrollHeight", {
      writable: true,
      value: 150,
    });

    rerender({ deps: ["dep2"] });

    expect(mockTextarea.style.height).not.toBe(initialHeight);
    expect(mockTextarea.style.height).toBe("150px");
  });

  it("debe usar maxHeight por defecto como Number.MAX_SAFE_INTEGER", () => {
    Object.defineProperty(mockTextarea, "scrollHeight", {
      writable: true,
      value: 10000,
    });

    renderHook(() =>
      useAutosizeTextArea({
        ref: textareaRef,
        dependencies: ["test"],
      }),
    );

    expect(mockTextarea.style.height).toBe("10000px");
  });
});
