import { useAppDispatch, useAppSelector } from "../useRedux";
import {
  selectTheme,
  setTheme as setThemeAction,
} from "@/store/slices/themeSlice";
import type { Theme } from "@/types/theme";

export function useTheme() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectTheme);

  const setTheme = (newTheme: Theme) => {
    dispatch(setThemeAction(newTheme));
  };

  return { theme, setTheme };
}
