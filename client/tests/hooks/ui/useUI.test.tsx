import { useUI } from "@/hooks/ui/useUI";
import authReducer from "@/store/slices/authSlice";
import themeReducer from "@/store/slices/themeSlice";
import uiReducer from "@/store/slices/uiSlice";
import { configureStore } from "@reduxjs/toolkit";
import { renderHook, act } from "@testing-library/react";
import { Provider } from "react-redux";
import { describe, expect, it, vi, beforeEach } from "vitest";

describe("useUI", () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    store = configureStore({
      reducer: {
        auth: authReducer,
        theme: themeReducer,
        ui: uiReducer,
      },
      preloadedState: {
        ui: { sidebarWidth: "normal", taskCardSize: 2 },
      },
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );

  it("returns initial state from store", () => {
    const { result } = renderHook(() => useUI(), { wrapper });
    expect(result.current.sidebarWidth).toBe("normal");
    expect(result.current.taskCardSize).toBe(2);
  });

  it("setSidebarWidth updates the store", () => {
    const { result } = renderHook(() => useUI(), { wrapper });

    act(() => {
      result.current.setSidebarWidth("compact");
    });

    expect(result.current.sidebarWidth).toBe("compact");
  });

  it("setTaskCardSize updates the store", () => {
    const { result } = renderHook(() => useUI(), { wrapper });

    act(() => {
      result.current.setTaskCardSize(4);
    });

    expect(result.current.taskCardSize).toBe(4);
  });
});
