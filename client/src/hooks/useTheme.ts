/**
 * @file useTheme.ts
 * @description Hook personalizado para manejar el tema de la aplicación (claro/oscuro).
 * Ahora usa Redux para gestionar el estado global del tema.
 */

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./useRedux";
import {
  selectTheme,
  setTheme as setThemeAction,
} from "@/store/slices/themeSlice";
import { Theme } from "@/types/theme";

export function useTheme() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectTheme);

  const setTheme = (newTheme: Theme) => {
    dispatch(setThemeAction(newTheme));
  };

  return { theme, setTheme };
}
