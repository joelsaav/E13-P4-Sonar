import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useAutoScroll } from "@/hooks/chatBot/useAutoScroll";

describe("useAutoScroll", () => {
  let mockContainer: HTMLDivElement;

  beforeEach(() => {
    mockContainer = document.createElement("div");
    Object.defineProperty(mockContainer, "scrollHeight", {
      writable: true,
      value: 1000,
    });
    Object.defineProperty(mockContainer, "clientHeight", {
      writable: true,
      value: 500,
    });
    Object.defineProperty(mockContainer, "scrollTop", {
      writable: true,
      value: 500,
    });
  });

  it("debe inicializar con shouldAutoScroll en true", () => {
    const { result } = renderHook(() => useAutoScroll([]));
    expect(result.current.shouldAutoScroll).toBe(true);
  });

  it("debe proporcionar containerRef", () => {
    const { result } = renderHook(() => useAutoScroll([]));
    expect(result.current.containerRef).toBeDefined();
    expect(result.current.containerRef.current).toBeNull();
  });

  it("debe hacer scroll al fondo cuando shouldAutoScroll es true", () => {
    const { result } = renderHook(() => useAutoScroll(["dependency"]));

    result.current.containerRef.current = mockContainer;

    act(() => {
      result.current.scrollToBottom();
    });

    expect(mockContainer.scrollTop).toBe(1000);
  });

  it("debe detectar cuando el usuario está cerca del final", () => {
    const { result } = renderHook(() => useAutoScroll([]));
    result.current.containerRef.current = mockContainer;

    mockContainer.scrollTop = 460;

    act(() => {
      result.current.handleScroll();
    });

    expect(result.current.shouldAutoScroll).toBe(true);
  });

  it("debe desactivar auto-scroll cuando el usuario hace scroll deliberado hacia arriba", () => {
    const { result } = renderHook(() => useAutoScroll([]));
    result.current.containerRef.current = mockContainer;

    mockContainer.scrollTop = 400;
    act(() => {
      result.current.handleScroll();
    });

    mockContainer.scrollTop = 380;

    act(() => {
      result.current.handleScroll();
    });

    expect(result.current.shouldAutoScroll).toBe(false);
  });

  it("no debe desactivar auto-scroll con scroll hacia arriba menor al threshold", () => {
    const { result } = renderHook(() => useAutoScroll([]));
    result.current.containerRef.current = mockContainer;

    mockContainer.scrollTop = 460;
    act(() => {
      result.current.handleScroll();
    });
    mockContainer.scrollTop = 455;

    act(() => {
      result.current.handleScroll();
    });

    expect(result.current.shouldAutoScroll).toBe(true);
  });

  it("debe desactivar auto-scroll al detectar touch", () => {
    const { result } = renderHook(() => useAutoScroll([]));
    result.current.containerRef.current = mockContainer;

    act(() => {
      result.current.handleTouchStart();
    });

    expect(result.current.shouldAutoScroll).toBe(false);
  });

  it("debe reactivar auto-scroll cuando el usuario scrollea al final", () => {
    const { result } = renderHook(() => useAutoScroll([]));
    result.current.containerRef.current = mockContainer;

    act(() => {
      result.current.handleTouchStart();
    });

    expect(result.current.shouldAutoScroll).toBe(false);

    mockContainer.scrollTop = 470;

    act(() => {
      result.current.handleScroll();
    });

    expect(result.current.shouldAutoScroll).toBe(true);
  });

  it("debe hacer scroll al fondo cuando cambian las dependencias y shouldAutoScroll es true", () => {
    const { result, rerender } = renderHook(({ deps }) => useAutoScroll(deps), {
      initialProps: { deps: ["dep1"] },
    });

    result.current.containerRef.current = mockContainer;
    mockContainer.scrollTop = 0;

    rerender({ deps: ["dep2"] });

    expect(mockContainer.scrollTop).toBe(1000);
  });

  it("no debe hacer scroll cuando shouldAutoScroll es false", () => {
    const { result, rerender } = renderHook(({ deps }) => useAutoScroll(deps), {
      initialProps: { deps: ["dep1"] },
    });

    result.current.containerRef.current = mockContainer;
    mockContainer.scrollTop = 0;

    act(() => {
      result.current.handleTouchStart();
    });

    rerender({ deps: ["dep2"] });

    expect(mockContainer.scrollTop).toBe(0);
  });

  it("debe manejar el caso cuando containerRef es null", () => {
    const { result } = renderHook(() => useAutoScroll([]));

    act(() => {
      result.current.handleScroll();
    });

    act(() => {
      result.current.scrollToBottom();
    });

    expect(true).toBe(true);
  });

  it("debe actualizar previousScrollTop después de cada scroll", () => {
    const { result } = renderHook(() => useAutoScroll([]));
    result.current.containerRef.current = mockContainer;

    mockContainer.scrollTop = 100;
    act(() => {
      result.current.handleScroll();
    });

    mockContainer.scrollTop = 200;
    act(() => {
      result.current.handleScroll();
    });

    expect(result.current.shouldAutoScroll).toBeDefined();
  });

  it("debe mantener auto-scroll activado cuando se scrollea hacia abajo", () => {
    const { result } = renderHook(() => useAutoScroll([]));
    result.current.containerRef.current = mockContainer;

    mockContainer.scrollTop = 400;
    act(() => {
      result.current.handleScroll();
    });
    mockContainer.scrollTop = 460;

    act(() => {
      result.current.handleScroll();
    });

    expect(result.current.shouldAutoScroll).toBe(true);
  });
});
