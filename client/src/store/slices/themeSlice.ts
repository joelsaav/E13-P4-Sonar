import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Theme, ThemeState } from "@/types/theme";

const getInitialTheme = (): Theme => {
  const stored = localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") {
    return stored;
  }
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
};

const initialState: ThemeState = {
  theme: getInitialTheme(),
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
    },
  },
});

export const { setTheme } = themeSlice.actions;
export default themeSlice.reducer;
export const selectTheme = (state: { theme: ThemeState }) => state.theme.theme;
export const selectIsDark = (state: { theme: ThemeState }) =>
  state.theme.theme === "dark";
