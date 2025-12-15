import { useMemo } from "react";
import { priorityConfig } from "@/config/taskConfig";
import type { Task } from "@/types/tasks-system/task";
import { useTranslation } from "react-i18next";
import {
  TaskStatusColors,
  TaskPriorityColors,
} from "@/types/tasks-system/task";

const PRIORITY_COLORS = TaskPriorityColors;
const STATUS_COLORS = TaskStatusColors;
const LIST_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

function getStartOfWeek(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function parseDate(value?: string): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

interface UseDashboardChartsProps {
  accessibleTasks: Task[];
  accessibleLists?: Array<{ id: string; name: string }>;
}

export function useDashboardCharts({
  accessibleTasks,
  accessibleLists = [],
}: UseDashboardChartsProps) {
  const { t } = useTranslation();

  const tasksThisWeek = useMemo(() => {
    const weekStart = getStartOfWeek();
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    return accessibleTasks.filter((task) => {
      const due = parseDate(task.dueDate);

      if (due && due >= weekStart && due < weekEnd) return true;

      return false;
    });
  }, [accessibleTasks]);

  const tasksPerList = useMemo(() => {
    const grouped = accessibleTasks.reduce<Record<string, number>>(
      (acc, task) => {
        acc[task.listId] = (acc[task.listId] || 0) + 1;
        return acc;
      },
      {},
    );

    return accessibleLists.map((list) => ({
      listName: list.name,
      count: grouped[list.id] || 0,
    }));
  }, [accessibleTasks, accessibleLists]);

  const weekStats = useMemo(() => {
    const weekStart = getStartOfWeek();

    const oneJan = new Date(weekStart.getFullYear(), 0, 1);
    const numberOfDays = Math.floor(
      (weekStart.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000),
    );
    const weekNumber = Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7);

    return {
      upcomingTasks: tasksThisWeek.length,
      pendingTasks: tasksThisWeek.filter((t) => t.status === "PENDING").length,
      completedTasks: tasksThisWeek.filter((t) => t.status === "COMPLETED")
        .length,
      weekNumber: t("dashboard.weekNumber", { number: weekNumber }),
      tasksPerList,
    };
  }, [tasksThisWeek, tasksPerList]);

  const priorityStats = useMemo(() => {
    const stats: Record<string, number> = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      URGENT: 0,
    };

    accessibleTasks.forEach((task) => {
      stats[task.priority] = (stats[task.priority] || 0) + 1;
    });

    return stats;
  }, [accessibleTasks]);

  const taskStats = useMemo(() => {
    const pending = accessibleTasks.filter(
      (t) => t.status === "PENDING",
    ).length;
    const inProgress = accessibleTasks.filter(
      (t) => t.status === "IN_PROGRESS",
    ).length;
    const completed = accessibleTasks.filter(
      (t) => t.status === "COMPLETED",
    ).length;

    return { pending, inProgress, completed };
  }, [accessibleTasks]);

  const priorityChartData = useMemo(() => {
    return Object.entries(priorityStats)
      .map(([priority, count]) => {
        const labelKey = `tasks.priority.${priority}`;
        const priorityKey =
          priority.toUpperCase() as keyof typeof PRIORITY_COLORS;
        return {
          name: t(labelKey),
          value: count as number,
          fill: PRIORITY_COLORS[priorityKey],
        };
      })
      .filter((item) => item.value > 0);
  }, [priorityStats, t]);

  const priorityChartConfig = useMemo(() => {
    return Object.entries(priorityConfig).reduce((acc, [key]) => {
      const priorityKey = key as keyof typeof PRIORITY_COLORS;
      return {
        ...acc,
        [t(`tasks.priority.${key}`)]: {
          label: t(`tasks.priority.${key}`),
          color: PRIORITY_COLORS[priorityKey],
        },
      };
    }, {});
  }, [t]);

  const progressChartData = useMemo(() => {
    return [
      {
        name: t("dashboard.statusLabels.pending"),
        value: taskStats.pending,
        fill: STATUS_COLORS.PENDING,
      },
      {
        name: t("dashboard.statusLabels.inProgress"),
        value: taskStats.inProgress,
        fill: STATUS_COLORS.IN_PROGRESS,
      },
      {
        name: t("dashboard.statusLabels.completed"),
        value: taskStats.completed,
        fill: STATUS_COLORS.COMPLETED,
      },
    ].filter((item) => item.value > 0);
  }, [taskStats, t]);

  const progressChartConfig = useMemo(
    () => ({
      [t("dashboard.statusLabels.pending")]: {
        label: t("dashboard.statusLabels.pending"),
        color: STATUS_COLORS.PENDING,
      },
      [t("dashboard.statusLabels.inProgress")]: {
        label: t("dashboard.statusLabels.inProgress"),
        color: STATUS_COLORS.IN_PROGRESS,
      },
      [t("dashboard.statusLabels.completed")]: {
        label: t("dashboard.statusLabels.completed"),
        color: STATUS_COLORS.COMPLETED,
      },
    }),
    [t],
  );

  const weeklyTasksData = useMemo(() => {
    const days = [
      t("dashboard.days.mon"),
      t("dashboard.days.tue"),
      t("dashboard.days.wed"),
      t("dashboard.days.thu"),
      t("dashboard.days.fri"),
      t("dashboard.days.sat"),
      t("dashboard.days.sun"),
    ];
    const weekStart = new Date();
    const day = weekStart.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    weekStart.setDate(weekStart.getDate() + diff);
    weekStart.setHours(0, 0, 0, 0);

    const weekData = [];

    for (let i = 0; i < 7; i++) {
      const targetDate = new Date(weekStart);
      targetDate.setDate(weekStart.getDate() + i);

      const tasksForDay = accessibleTasks.filter((task) => {
        if (!task.dueDate) return false;

        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);

        return dueDate.getTime() === targetDate.getTime();
      });

      const pending = tasksForDay.filter((t) => t.status === "PENDING").length;
      const inProgress = tasksForDay.filter(
        (t) => t.status === "IN_PROGRESS",
      ).length;
      const completed = tasksForDay.filter(
        (t) => t.status === "COMPLETED",
      ).length;

      weekData.push({
        day: days[i],
        pending,
        inProgress,
        completed,
      });
    }

    return weekData;
  }, [accessibleTasks, t]);

  const weeklyTasksConfig = useMemo(
    () => ({
      pending: {
        label: t("dashboard.statusLabels.pending"),
        color: STATUS_COLORS.PENDING,
      },
      inProgress: {
        label: t("dashboard.statusLabels.inProgress"),
        color: STATUS_COLORS.IN_PROGRESS,
      },
      completed: {
        label: t("dashboard.statusLabels.completed"),
        color: STATUS_COLORS.COMPLETED,
      },
    }),
    [t],
  );

  const tasksPerListData = useMemo(() => {
    return tasksPerList
      .filter((item) => item.count > 0)
      .map((item, index) => ({
        status: item.listName,
        count: item.count,
        fill: LIST_COLORS[index % LIST_COLORS.length],
      }));
  }, [tasksPerList]);

  const tasksPerListConfig = useMemo(() => {
    return tasksPerList.reduce(
      (acc, item, index) => ({
        ...acc,
        [item.listName]: {
          label: item.listName,
          color: LIST_COLORS[index % LIST_COLORS.length],
        },
      }),
      { count: { label: t("tasks.title") } },
    );
  }, [tasksPerList, t]);

  return {
    priorityChartData,
    priorityChartConfig,
    progressChartData,
    progressChartConfig,
    weeklyTasksData,
    weeklyTasksConfig,
    tasksPerListData,
    tasksPerListConfig,
    weekStats,
  };
}
