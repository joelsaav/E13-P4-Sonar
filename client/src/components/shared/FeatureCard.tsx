import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import type { FeatureCardProps } from "@/types/components";

export default function FeatureCard({
  icon,
  title,
  description,
  bigDetails = false,
  details,
  className = "",
  iconLabel,
  children,
  chart = false,
}: Readonly<FeatureCardProps>) {
  return (
    <Card
      className={`group relative border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-sm hover:shadow-primary/5 ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <CardHeader className="relative flex flex-row items-start gap-4 pb-3 sm:pb-4">
        {icon ? (
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shrink-0">
            <Icon
              as={icon}
              size={22}
              ariaLabel={iconLabel}
              className="transition-transform duration-300 group-hover:scale-110"
            />
          </div>
        ) : null}
        <div className="min-w-0 pt-1">
          <CardTitle className="text-base sm:text-lg font-semibold tracking-tight">
            {title}
          </CardTitle>
          {description ? (
            <CardDescription className="text-xs sm:text-sm mt-1 text-muted-foreground/80">
              {description}
            </CardDescription>
          ) : null}
        </div>
      </CardHeader>

      {(() => {
        if (bigDetails && details) {
          return (
            <CardContent id="big-details" className="relative pt-0">
              <span className="text-3xl sm:text-4xl leading-none font-bold text-foreground">
                {details}
              </span>
            </CardContent>
          );
        }
        if (details && !chart) {
          return (
            <CardContent id="details" className="relative pt-0">
              <p className="text-xs sm:text-sm text-muted-foreground/70 whitespace-pre-line leading-relaxed">
                {details}
              </p>
            </CardContent>
          );
        }
        return null;
      })()}

      {children && (
        <CardContent className="relative pt-0">{children}</CardContent>
      )}
    </Card>
  );
}
