/**
 * @file ThemeToggle.tsx
 * @description Componente para alternar entre temas claro y oscuro.
 * Utiliza un hook personalizado para gestionar el estado del tema.
 */

import { useTheme } from "@/hooks/useTheme";
import { Button } from "./ui/button";
import { useTranslation } from "react-i18next";

export default function ThemeToggle() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const next = theme === "dark" ? "light" : "dark";
  return (
    <Button
      leftIcon={next === "dark" ? "IconMoon" : "IconSun"}
      aria-label={`${t("theme.toggle")} ${t(`theme.${next}`)}`}
      onClick={() => setTheme(next)}
      className="my-2"
    />
  );
}
