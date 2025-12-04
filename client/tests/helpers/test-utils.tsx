import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import type { PreloadedState } from "@reduxjs/toolkit";
import type { RootState, AppStore } from "@/store/store";
import authReducer from "@/store/slices/authSlice";
import themeReducer from "@/store/slices/themeSlice";
import listsReducer from "@/store/slices/listsSlice";
import tasksReducer from "@/store/slices/tasksSlice";

interface ExtendedRenderOptions extends Omit<RenderOptions, "queries"> {
  preloadedState?: PreloadedState<RootState>;
  store?: AppStore;
}

export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState = {},
    store = configureStore({
      reducer: {
        auth: authReducer,
        theme: themeReducer,
        lists: listsReducer,
        tasks: tasksReducer,
      },
      preloadedState,
    }),
    wrapper: CustomWrapper,
    ...renderOptions
  }: ExtendedRenderOptions & {
    wrapper?: React.ComponentType<{ children: React.ReactNode }>;
  } = {},
) {
  function DefaultWrapper({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  }
  const Wrapper = CustomWrapper
    ? ({ children }: { children: React.ReactNode }) => (
        <Provider store={store}>
          <CustomWrapper>{children}</CustomWrapper>
        </Provider>
      )
    : DefaultWrapper;
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

export * from "@testing-library/react";
