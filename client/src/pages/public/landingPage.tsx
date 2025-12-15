import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { landingCards } from "@/config/landingCards";
import FeatureCard from "@/components/shared/FeatureCard";
import { useTranslation } from "react-i18next";
import { Typewriter } from "@/components/shared/Typewriter";
import Icon from "@/components/ui/icon";
import { motion } from "framer-motion";

export default function LandingPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen overflow-hidden">
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="mb-6">
            <Typewriter
              text={`${t("landing.welcome")} ${t("app.name")}`}
              className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tighter leading-tight"
              speed={60}
              showCursor={true}
            />
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            {t("landing.subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <Link to="/register">
              <Button
                size="lg"
                className="text-lg px-8 py-6 rounded-full transition-all duration-300"
              >
                {t("auth.register")}
                <Icon as="IconArrowRight" size={20} className="ml-2" />
              </Button>
            </Link>
            <Link to="/login">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 rounded-full hover:bg-primary/5 transition-all duration-300"
              >
                {t("auth.login")}
                <Icon as="IconArrowRight" size={20} className="ml-2" />
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <Icon as="IconCheck" size={16} className="text-green-500" />
              <span>{t("landing.benefits.free") || "Gratis para siempre"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon as="IconCheck" size={16} className="text-green-500" />
              <span>{t("landing.benefits.unlimited") || "Ilimitado"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon as="IconCheck" size={16} className="text-green-500" />
              <span>{t("landing.benefits.real_time") || "En tiempo real"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon as="IconCheck" size={16} className="text-green-500" />
              <span>
                {t("landing.benefits.collaboration") || "Colaboración"}
              </span>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2 text-muted-foreground"
          >
            <span className="text-xs">
              {t("landing.scroll") || "Descubre más"}
            </span>
            <Icon as="IconChevronDown" size={20} />
          </motion.div>
        </motion.div>
      </section>

      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              {t("landing.features.title")}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {landingCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={card.span || ""}
              >
                <FeatureCard
                  icon={card.icon}
                  title={t(card.title)}
                  description={t(card.description)}
                  className="h-full"
                >
                  <p className="text-sm text-muted-foreground/70 leading-relaxed">
                    {t(card.details)}
                  </p>
                </FeatureCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center p-12 rounded-3xl bg-card border border-primary/20"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            {t("landing.cta.title") || "¿Listo para empezar?"}
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            {t("landing.cta.subtitle") ||
              "Únete a miles de usuarios que ya están organizando mejor su tiempo"}
          </p>
          <Link to="/register">
            <Button
              size="lg"
              className="text-lg px-10 py-6 rounded-full shadow-lg shadow-primary/20"
            >
              {t("landing.cta.register") || "Regístrate"}
              <Icon as="IconArrowRight" size={20} className="ml-2" />
            </Button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
