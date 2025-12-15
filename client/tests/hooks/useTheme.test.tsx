import { useTheme } from "@/hooks/ui/useTheme";
import themeReducer from "@/store/slices/themeSlice";
import { configureStore } from "@reduxjs/toolkit";
import { act, renderHook } from "@testing-library/react";
import { Provider } from "react-redux";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("useTheme", () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
    vi.spyOn(localStorage, "setItem");
    vi.spyOn(localStorage, "getItem");

    store = configureStore({
      reducer: {
        theme: themeReducer,
      },
      preloadedState: {
        theme: {
          theme: "light" as const,
        },
      },
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );

  it("Retorna el tema actual", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.theme).toBe("light");
  });

  it("Actualiza el tema cuando se llama setTheme", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.setTheme("dark");
    });

    expect(result.current.theme).toBe("dark");
  });

  it("Remueve la clase dark cuando el tema se establece como light", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.setTheme("light");
    });

    expect(result.current.theme).toBe("light");
  });

  it("Retorna el tema actual desde el store", () => {
    store = configureStore({
      reducer: {
        theme: themeReducer,
      },
      preloadedState: {
        theme: {
          theme: "dark" as const,
        },
      },
    });

    const wrapperWithDark = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useTheme(), {
      wrapper: wrapperWithDark,
    });
    expect(result.current.theme).toBe("dark");
  });
});
