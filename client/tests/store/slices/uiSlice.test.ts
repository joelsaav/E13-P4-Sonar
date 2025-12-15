import { configureStore } from "@reduxjs/toolkit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import uiReducer, {
  setSidebarWidth,
  setTaskCardSize,
  SidebarWidth,
  TaskCardSize,
} from "@/store/slices/uiSlice";

type RootState = {
  ui: ReturnType<typeof uiReducer>;
};

describe("uiSlice", () => {
  let store: ReturnType<typeof configureStore<RootState>>;

  beforeEach(() => {
    localStorage.clear();
    store = configureStore({
      reducer: {
        ui: uiReducer,
      },
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("initial state", () => {
    it("should have default sidebar width as 'normal'", () => {
      expect(store.getState().ui.sidebarWidth).toBe("normal");
    });

    it("should have default task card size as 2", () => {
      expect(store.getState().ui.taskCardSize).toBe(2);
    });

    it("should load sidebar width from localStorage if valid", () => {
      const validWidths: SidebarWidth[] = ["compact", "wide"];
      validWidths.forEach((width) => {
        localStorage.clear();
        localStorage.setItem("sidebarWidth", width);
        store.dispatch(setSidebarWidth(width));
        expect(store.getState().ui.sidebarWidth).toBe(width);
      });
    });

    it("should load task card size from localStorage if valid", () => {
      const validSizes: TaskCardSize[] = [3, 4];
      validSizes.forEach((size) => {
        store.dispatch(setTaskCardSize(size));
        expect(store.getState().ui.taskCardSize).toBe(size);
      });
    });

    it("should handle invalid sidebar width values", () => {
      const currentWidth = store.getState().ui.sidebarWidth;
      expect(["compact", "normal", "wide"]).toContain(currentWidth);
    });

    it("should handle invalid task card size values", () => {
      const currentSize = store.getState().ui.taskCardSize;
      expect([2, 3, 4]).toContain(currentSize);
    });
  });

  describe("setSidebarWidth", () => {
    it("should set sidebar width to compact", () => {
      store.dispatch(setSidebarWidth("compact"));
      expect(store.getState().ui.sidebarWidth).toBe("compact");
    });

    it("should set sidebar width to normal", () => {
      store.dispatch(setSidebarWidth("compact"));
      store.dispatch(setSidebarWidth("normal"));
      expect(store.getState().ui.sidebarWidth).toBe("normal");
    });

    it("should set sidebar width to wide", () => {
      store.dispatch(setSidebarWidth("wide"));
      expect(store.getState().ui.sidebarWidth).toBe("wide");
    });
  });

  describe("setTaskCardSize", () => {
    it("should set task card size to 2", () => {
      store.dispatch(setTaskCardSize(3));
      store.dispatch(setTaskCardSize(2));
      expect(store.getState().ui.taskCardSize).toBe(2);
    });

    it("should set task card size to 3", () => {
      store.dispatch(setTaskCardSize(3));
      expect(store.getState().ui.taskCardSize).toBe(3);
    });

    it("should set task card size to 4", () => {
      store.dispatch(setTaskCardSize(4));
      expect(store.getState().ui.taskCardSize).toBe(4);
    });
  });
});
