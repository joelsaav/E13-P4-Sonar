import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { dashboardCards } from "@/config/dashboardConfig";
import { useTranslation } from "react-i18next";
import FeatureCard from "@/components/ui/featureCard";
import Icon from "@/components/ui/icon";
import { useTasks } from "@/hooks/useTasks";
import { useLists } from "@/hooks/useLists";
import { useDashboardCharts } from "@/hooks/useDashboardCharts";
import {
  PriorityChart,
  WeeklyTasksChart,
} from "@/components/dashboard/dashboardCharts";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { accessibleTasks, fetchAllTasks } = useTasks();
  const { accessibleLists, fetchAllLists } = useLists();

  useEffect(() => {
    fetchAllTasks();
    fetchAllLists();
  }, []);

  const {
    priorityChartData,
    priorityChartConfig,
    progressChartData,
    progressChartConfig,
    weeklyTasksData,
    weeklyTasksConfig,
    weekStats,
  } = useDashboardCharts({
    accessibleTasks,
    accessibleLists,
  });

  const cardDataMap: Record<
    string,
    {
      details?: string | number;
      chartData?: unknown;
      chartConfig?: unknown;
      chartComponent?: React.ReactNode;
    }
  > = {
    "dashboard.cards.completedTasks": {
      details: weekStats.completedTasks + " / " + weekStats.upcomingTasks,
    },
    "dashboard.cards.upcomingTasks": { details: weekStats.upcomingTasks },
    "dashboard.cards.tasksByList": {
      chartComponent: (
        <div className="flex flex-wrap gap-2 align-center py-1">
          {weekStats.tasksPerList.length > 0 ? (
            weekStats.tasksPerList.map((item, index) => (
              <Badge
                key={index}
                variant="default"
                className="text-md"
                leftIcon={"IconList"}
              >
                {item.listName}
                <Badge key={index} variant="secondary" className="text-xs">
                  {item.count}
                </Badge>
              </Badge>
            ))
          ) : (
            <span className="text-gray-500 dark:text-gray-400">
              {t("tasks.noTasks")}
            </span>
          )}
        </div>
      ),
    },
    "dashboard.cards.tasksByPriority": {
      chartComponent: (
        <PriorityChart data={priorityChartData} config={priorityChartConfig} />
      ),
    },
    "dashboard.cards.tasksByStatus": {
      chartComponent: (
        <PriorityChart data={progressChartData} config={progressChartConfig} />
      ),
    },
    "dashboard.cards.currentWeek": {
      chartComponent: (
        <WeeklyTasksChart data={weeklyTasksData} config={weeklyTasksConfig} />
      ),
    },
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            {t("dashboard.welcome")}
            {user?.name || "Usuario"}!{" "}
            <Icon as="IconUser" size={26} className="inline-block" />
          </h1>
          <p className="text-muted-foreground">
            {t("dashboard.description")} - {weekStats.weekNumber}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-3 gap-6">
        {dashboardCards.map((card, index) => {
          const cardData = cardDataMap[card.titleKey] || {};
          const details = String(cardData.details ?? "");

          return (
            <FeatureCard
              key={index}
              icon={card.icon}
              title={t(card.titleKey)}
              description={t(card.descriptionKey)}
              bigDetails={card.bigDetails}
              chart={card.chart}
              details={details}
              className={`hover:shadow-lg transition-shadow ${card.span}`}
            >
              {cardData.chartComponent}
            </FeatureCard>
          );
        })}
      </div>
    </div>
  );
}
