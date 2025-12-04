/**
 * @file languageSelector.tsx
 * @description Componente para cambiar el idioma de la aplicación.
 * Puede mostrarse como botón independiente o como submenú.
 */

import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import Icon from "./ui/icon";

interface LanguageSelectorProps {
  variant?: "button" | "submenu";
}

export default function LanguageSelector({
  variant = "submenu",
}: LanguageSelectorProps) {
  const { i18n, t } = useTranslation();

  const languageItems = Array.isArray(i18n.options.supportedLngs)
    ? (i18n.options.supportedLngs as string[])
        .filter((lng: string) => lng && lng !== "cimode")
        .map((lng: string) => {
          const resources = i18n.getResourceBundle(lng, "translation");
          const languageName = resources?.language?.name || lng;
          const flag = resources?.language?.flag || "🌐";
          return (
            <DropdownMenuItem
              key={lng}
              onClick={() => i18n.changeLanguage(lng)}
              className={i18n.language === lng ? "bg-accent" : ""}
            >
              {i18n.language === lng ? (
                <Icon as="IconCheck" />
              ) : (
                <span className="w-4 mr-2" />
              )}
              <span className="mr-1">{flag}</span>
              {languageName}
            </DropdownMenuItem>
          );
        })
    : null;

  if (variant === "button") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Icon as="IconLanguage" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">{languageItems}</DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <Icon as="IconLanguage" />
        {t("language.label")}
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>{languageItems}</DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
