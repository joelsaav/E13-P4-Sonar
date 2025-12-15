import { I18nextProvider } from "react-i18next";
import i18n from "@/utils/i18n";
import { ReactNode } from "react";

export function I18nTestProvider({ children }: { children: ReactNode }) {
  i18n.changeLanguage("es");
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
