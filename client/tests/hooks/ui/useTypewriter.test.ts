import { useTypewriter } from "@/hooks/ui/useTypewriter";
import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

describe("useTypewriter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts with empty displayText", () => {
    const { result } = renderHook(() =>
      useTypewriter({ text: "Hello", speed: 50, delay: 0 }),
    );

    expect(result.current.displayText).toBe("");
  });

  it("isTyping starts as false", () => {
    const { result } = renderHook(() =>
      useTypewriter({ text: "Hello", speed: 50, delay: 0 }),
    );

    expect(result.current.isTyping).toBe(false);
  });

  it("isComplete starts as false", () => {
    const { result } = renderHook(() =>
      useTypewriter({ text: "Hello", speed: 50, delay: 0 }),
    );

    expect(result.current.isComplete).toBe(false);
  });

  it("types text character by character", async () => {
    const { result } = renderHook(() =>
      useTypewriter({ text: "Hi", speed: 10, delay: 0 }),
    );

    act(() => {
      vi.advanceTimersByTime(10);
    });

    act(() => {
      vi.advanceTimersByTime(10);
    });

    expect(result.current.displayText).toBe("H");

    act(() => {
      vi.advanceTimersByTime(10);
    });

    expect(result.current.displayText).toBe("Hi");
  });

  it("sets isComplete to true when done", async () => {
    const { result } = renderHook(() =>
      useTypewriter({ text: "A", speed: 10, delay: 0 }),
    );

    act(() => {
      vi.advanceTimersByTime(10);
    });
    act(() => {
      vi.advanceTimersByTime(10);
    });

    expect(result.current.displayText).toBe("A");
    expect(result.current.isComplete).toBe(true);
  });

  it("calls onComplete callback when done", async () => {
    const onComplete = vi.fn();
    renderHook(() =>
      useTypewriter({ text: "A", speed: 10, delay: 0, onComplete }),
    );

    act(() => {
      vi.advanceTimersByTime(10);
    });
    act(() => {
      vi.advanceTimersByTime(10);
    });

    expect(onComplete).toHaveBeenCalled();
  });

  it("respects delay before starting", () => {
    const { result } = renderHook(() =>
      useTypewriter({ text: "Hello", speed: 10, delay: 100 }),
    );

    expect(result.current.isTyping).toBe(false);

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.isTyping).toBe(true);
  });

  it("provides restart function", () => {
    const { result } = renderHook(() =>
      useTypewriter({ text: "Hi", speed: 10, delay: 0 }),
    );

    expect(typeof result.current.restart).toBe("function");
  });

  it("restart resets the state", () => {
    const { result } = renderHook(() =>
      useTypewriter({ text: "Hi", speed: 10, delay: 0 }),
    );

    act(() => {
      vi.advanceTimersByTime(10);
    });
    act(() => {
      vi.advanceTimersByTime(10);
    });

    expect(result.current.displayText).toBe("H");

    act(() => {
      result.current.restart();
    });

    expect(result.current.displayText).toBe("");
    expect(result.current.isComplete).toBe(false);
    expect(result.current.isTyping).toBe(false);
  });

  it("uses default speed of 50ms", () => {
    const { result } = renderHook(() => useTypewriter({ text: "AB" }));

    act(() => {
      vi.advanceTimersByTime(0);
    });
    act(() => {
      vi.advanceTimersByTime(50);
    });

    expect(result.current.displayText).toBe("A");
  });

  it("uses default delay of 0", () => {
    const { result } = renderHook(() =>
      useTypewriter({ text: "A", speed: 10 }),
    );

    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(result.current.isTyping).toBe(true);
  });
});
