import { configureStore } from "@reduxjs/toolkit";
import { setAuthToken } from "@/lib/api";
import authReducer from "./slices/authSlice";
import themeReducer from "./slices/themeSlice";
import listsReducer from "./slices/listsSlice";
import tasksReducer from "./slices/tasksSlice";
import uiReducer from "./slices/uiSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    lists: listsReducer,
    tasks: tasksReducer,
    ui: uiReducer,
  },
});

const initialTheme = store.getState().theme.theme;
if (initialTheme === "dark") {
  document.documentElement.classList.add("dark");
} else {
  document.documentElement.classList.remove("dark");
}

let previousState = store.getState();

store.subscribe(() => {
  const state = store.getState();
  const { auth, theme, ui } = state;

  if (auth.token !== previousState.auth.token) {
    if (auth.token) {
      localStorage.setItem("token", auth.token);
      setAuthToken(auth.token);
    } else {
      localStorage.removeItem("token");
      setAuthToken();
    }
  }

  if (auth.user !== previousState.auth.user) {
    if (auth.user) {
      localStorage.setItem("user", JSON.stringify(auth.user));
    } else {
      localStorage.removeItem("user");
    }
  }

  if (theme.theme !== previousState.theme.theme) {
    localStorage.setItem("theme", theme.theme);
    const root = document.documentElement;
    if (theme.theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }

  if (ui.sidebarWidth !== previousState.ui.sidebarWidth) {
    localStorage.setItem("sidebarWidth", ui.sidebarWidth);
  }

  if (ui.taskCardSize !== previousState.ui.taskCardSize) {
    localStorage.setItem("taskCardSize", ui.taskCardSize.toString());
  }

  previousState = state;
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
