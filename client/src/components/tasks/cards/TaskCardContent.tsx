import { memo } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Icon from "@/components/ui/icon";
import { useTranslation } from "react-i18next";

interface TaskOwner {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

interface TaskCardContentProps {
  name: string;
  description?: string | null;
  createdAt?: string;
  dueDate?: string | null;
  formatDate: (dateString?: string) => string;
  owner?: TaskOwner | null;
  showOwner?: boolean;
}

export const TaskCardContent = memo(function TaskCardContent({
  name,
  description,
  createdAt,
  dueDate,
  formatDate,
  owner,
  showOwner = false,
}: TaskCardContentProps) {
  const { t } = useTranslation();

  return (
    <div className="flex-1 flex flex-col justify-center text-left space-y-2">
      <h3 className="text-base sm:text-lg font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors duration-300 break-words">
        {name}
      </h3>

      {description && (
        <p className="text-sm text-muted-foreground/80 line-clamp-2 leading-relaxed break-words">
          {description}
        </p>
      )}

      <div className="flex flex-row justify-between items-center pt-1">
        <div className="flex flex-wrap gap-2">
          {createdAt && (
            <div className="inline-flex items-center gap-1.5 px-2 py-1 text-xs text-muted-foreground bg-secondary border border-border rounded-full">
              <Icon
                as="IconCalendarPlus"
                size={12}
                className="shrink-0 opacity-70"
              />
              <span>{formatDate(createdAt)}</span>
            </div>
          )}
          <div className="inline-flex items-center gap-1.5 px-2 py-1 text-xs text-muted-foreground bg-secondary border border-border rounded-full">
            <Icon
              as="IconCalendarEvent"
              size={12}
              className="shrink-0 opacity-70"
            />
            <span className="truncate max-w-[100px] sm:max-w-none">
              {dueDate ? formatDate(dueDate) : t("tasks.card.noDate")}
            </span>
          </div>
        </div>

        {showOwner && owner && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar className="h-7 w-7 ring-2 ring-background shadow-sm cursor-help transition-transform hover:scale-105">
                  <AvatarImage
                    src={owner.image || undefined}
                    alt={owner.name}
                  />
                  <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-medium">
                    {owner.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {t("share.sharedBy", {
                    name: owner.name,
                    email: owner.email,
                  })}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
});
