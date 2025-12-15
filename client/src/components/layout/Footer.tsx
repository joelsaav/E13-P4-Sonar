import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <footer
      className="fixed bottom-0 left-0 right-0 z-50 border border-border bg-card w-fit rounded-lg mx-auto px-4 my-2"
      role="contentinfo"
      aria-label={t("footer.ariaLabel")}
    >
      <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Icon as="IconCopyright" size={16} className="inline-block" />
          <span className="whitespace-nowrap">
            {new Date().getFullYear()} — {t("footer.rights")}
          </span>
        </div>

        <Button
          variant="link"
          leftIcon="IconMail"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring rounded p-0"
          aria-label={t("footer.contact")}
          onClick={() => navigate("/contacts")}
          text={t("footer.contact")}
        />
      </div>
    </footer>
  );
}
