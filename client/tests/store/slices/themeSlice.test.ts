import themeReducer, { selectTheme, setTheme } from "@/store/slices/themeSlice";
import type { ThemeState } from "@/types/theme";
import { beforeEach, describe, expect, it } from "vitest";

describe("themeSlice", () => {
  let initialState: ThemeState;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
    initialState = {
      theme: "light",
    };
  });

  describe("reducer", () => {
    it("should return initial state", () => {
      expect(themeReducer(undefined, { type: "unknown" })).toEqual({
        theme: expect.any(String),
      });
    });

    it("should handle setTheme action to dark", () => {
      const action = setTheme("dark");
      const state = themeReducer(initialState, action);

      expect(state.theme).toBe("dark");
    });

    it("should handle setTheme action to light", () => {
      const action = setTheme("light");
      const state = themeReducer({ theme: "dark" }, action);

      expect(state.theme).toBe("light");
    });
  });

  describe("selectors", () => {
    it("selectTheme should return theme", () => {
      const state = { theme: { theme: "dark" as const } };
      expect(selectTheme(state)).toBe("dark");
    });
  });
});
