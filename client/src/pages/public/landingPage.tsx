import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { landingCards } from "@/config/landingCards";
import FeatureCard from "@/components/ui/featureCard";
import { useTranslation } from "react-i18next";

export default function LandingPage() {
  const { t } = useTranslation();
  return (
    // <div className="min-h-screen">
    <div className="container mx-auto p-6">
      <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4 text-center">
        {t("landing.welcome")}{" "}
        <span className="text-primary">{t("app.name")}</span>
      </h1>
      <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-center">
        {t("landing.subtitle")}
      </p>

      <div className="flex gap-4 justify-center mb-16">
        <Link to="/login">
          <Button size="lg" className="text-lg px-8">
            {t("auth.login")}
          </Button>
        </Link>
        <Link to="/register">
          <Button size="lg" variant="outline" className="text-lg px-8">
            {t("auth.register")}
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {landingCards.map((card, index) => (
          <FeatureCard
            key={index}
            icon={card.icon}
            title={t(card.title)}
            description={t(card.description)}
            className={`hover:shadow-lg transition-shadow ${card.span}`}
          >
            <p className="text-sm text-muted-foreground">{t(card.details)}</p>
          </FeatureCard>
        ))}
      </div>
    </div>
    // </div>
  );
}
