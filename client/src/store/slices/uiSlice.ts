import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type SidebarWidth = "compact" | "normal" | "wide";
export type TaskCardSize = 2 | 3 | 4;

export interface UIState {
  sidebarWidth: SidebarWidth;
  taskCardSize: TaskCardSize;
}

const getInitialSidebarWidth = (): SidebarWidth => {
  const stored = localStorage.getItem("sidebarWidth");
  if (stored === "compact" || stored === "normal" || stored === "wide") {
    return stored;
  }
  return "normal";
};

const getInitialTaskCardSize = (): TaskCardSize => {
  const stored = localStorage.getItem("taskCardSize");
  if (stored) {
    const parsed = Number.parseInt(stored, 10);
    if (parsed === 2 || parsed === 3 || parsed === 4) {
      return parsed as TaskCardSize;
    }
  }
  return 2;
};

const initialState: UIState = {
  sidebarWidth: getInitialSidebarWidth(),
  taskCardSize: getInitialTaskCardSize(),
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setSidebarWidth: (state, action: PayloadAction<SidebarWidth>) => {
      state.sidebarWidth = action.payload;
    },
    setTaskCardSize: (state, action: PayloadAction<TaskCardSize>) => {
      state.taskCardSize = action.payload;
    },
  },
});

export const { setSidebarWidth, setTaskCardSize } = uiSlice.actions;
export default uiSlice.reducer;

export const selectSidebarWidth = (state: { ui: UIState }) =>
  state.ui.sidebarWidth;
export const selectTaskCardSize = (state: { ui: UIState }) =>
  state.ui.taskCardSize;
