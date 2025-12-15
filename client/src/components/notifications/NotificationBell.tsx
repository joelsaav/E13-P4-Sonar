import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNotifications } from "@/hooks/useNotifications";
import { useTranslation } from "react-i18next";
import { Bell, Circle } from "lucide-react";
import { useMemo, useState } from "react";

type NotificationTab = "ALL" | "SYSTEM" | "SHARED" | "EXPIRED";

function useFormatRelativeTime() {
  const { t } = useTranslation();

  return (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t("notifications.timeAgo.now");
    if (diffMins < 60)
      return t("notifications.timeAgo.minutes", { count: diffMins });
    if (diffHours < 24)
      return t("notifications.timeAgo.hours", { count: diffHours });
    if (diffDays < 7)
      return t("notifications.timeAgo.days", { count: diffDays });
    return date.toLocaleDateString();
  };
}

export function NotificationBell() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<NotificationTab>("ALL");
  const { notifications, loading, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();

  const formatRelativeTime = useFormatRelativeTime();
  const hasUnread = unreadCount > 0;

  const TAB_LABELS: Record<NotificationTab, string> = {
    ALL: t("notifications.tabs.ALL"),
    SYSTEM: t("notifications.tabs.SYSTEM"),
    SHARED: t("notifications.tabs.SHARED"),
    EXPIRED: t("notifications.tabs.EXPIRED"),
  };

  const filteredNotifications = useMemo(() => {
    if (activeTab === "ALL") {
      return notifications;
    }
    return notifications.filter((n) => n.type === activeTab);
  }, [notifications, activeTab]);

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      if (import.meta.env.DEV)
        console.error("Error al marcar todos como leído:", error);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
    } catch (error) {
      if (import.meta.env.DEV)
        console.error("Error al marcar como leído:", error);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full"
          aria-label={t("notifications.openNotifications")}
        >
          <Bell className="h-5 w-5" />
          {hasUnread && (
            <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3 items-center justify-center">
              <span className="h-2.5 w-2.5 rounded-full border border-background bg-red-500" />
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[380px] p-0 shadow-lg" align="end">
        <Card className="border-0">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex flex-col">
              <span className="text-sm font-semibold">
                {t("notifications.title")}
              </span>
              <span className="text-xs text-muted-foreground">
                {unreadCount > 0
                  ? t("notifications.unread", { count: unreadCount })
                  : t("notifications.allCaughtUp")}
              </span>
            </div>
            {hasUnread && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={handleMarkAllRead}
              >
                {t("notifications.markAllRead")}
              </Button>
            )}
          </div>

          <div className="flex gap-1 border-b px-2 py-2 text-xs font-medium">
            {(Object.keys(TAB_LABELS) as NotificationTab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={[
                  "flex flex-1 items-center justify-center rounded-full px-2 py-1 transition-colors",
                  activeTab === tab
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80",
                ].join(" ")}
              >
                <span>{TAB_LABELS[tab]}</span>
                {tab === "ALL" && hasUnread && (
                  <Circle className="ml-1 h-2 w-2 fill-primary-foreground text-primary-foreground" />
                )}
              </button>
            ))}
          </div>

          <div className="max-h-80 space-y-1 overflow-y-auto px-2 py-2">
            {(() => {
              if (loading) {
                return (
                  <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                    {t("notifications.loading")}
                  </div>
                );
              }

              if (filteredNotifications.length === 0) {
                return (
                  <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                    {t("notifications.noNotifications")}
                  </div>
                );
              }

              return filteredNotifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => handleMarkAsRead(notification.id)}
                  className={[
                    "flex w-full items-start gap-3 rounded-xl px-3 py-2 text-left transition-colors",
                    notification.read
                      ? "bg-background hover:bg-muted/60"
                      : "bg-violet-50 hover:bg-violet-100 dark:bg-violet-950/30 dark:hover:bg-violet-900/50",
                  ].join(" ")}
                >
                  <Avatar className="mt-0.5 h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {notification.actorName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex flex-1 flex-col gap-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold">
                        {notification.actorName}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {formatRelativeTime(notification.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs font-medium">{notification.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {notification.description}
                    </p>

                    <div className="mt-1 flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="h-5 rounded-full px-2 text-[10px] uppercase tracking-wide"
                      >
                        {TAB_LABELS[notification.type as NotificationTab]}
                      </Badge>
                      {!notification.read && (
                        <span className="flex h-1.5 w-1.5 rounded-full bg-primary" />
                      )}
                    </div>
                  </div>
                </button>
              ));
            })()}
          </div>
        </Card>
      </PopoverContent>
    </Popover>
  );
}

export default NotificationBell;
