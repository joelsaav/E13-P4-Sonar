import { useTheme } from "@/hooks/ui/useTheme";
import { Button } from "@/components/ui/button";
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
