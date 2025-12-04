import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { FeatureCardProps } from "@/types/components";

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
}: FeatureCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center gap-3 pb-3 sm:pb-6">
        {icon ? (
          <div className="text-xl shrink-0">
            <Icon
              as={icon}
              size={24}
              ariaLabel={iconLabel}
              className="inline-block"
            />
          </div>
        ) : null}
        <div className="min-w-0">
          <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
          {description ? (
            <CardDescription className="text-xs sm:text-sm">
              {description}
            </CardDescription>
          ) : null}
        </div>
      </CardHeader>

      {bigDetails && details ? (
        <CardContent id="big-details" className="pt-0">
          <span className="text-3xl sm:text-4xl leading-none font-bold text-foreground">
            {details}
          </span>
        </CardContent>
      ) : details && !chart ? (
        <CardContent id="details" className="pt-0">
          <p className="text-xs sm:text-sm text-muted-foreground whitespace-pre-line">
            {details}
          </p>
        </CardContent>
      ) : null}

      {children && <CardContent className="pt-0">{children}</CardContent>}
    </Card>
  );
}
