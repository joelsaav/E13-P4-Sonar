import { useMemo } from "react";
import { priorityConfig } from "@/config/taskConfig";
import type { Task } from "@/types/tasks-system/task";
import { useTranslation } from "react-i18next";

// Helper para obtener inicio de semana
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

// Colores de gráficos
const PRIORITY_COLORS = {
  Baja: "#1d4ed8", // blue-700
  Media: "#a16207", // yellow-700
  Alta: "#c2410c", // orange-700
  Urgente: "#b91c1c", // red-700
} as const;

const STATUS_COLORS = {
  pending: "#374151", // gray-700
  inProgress: "#1d4ed8", // blue-700
  completed: "#15803d", // green-700
} as const;

interface UseDashboardChartsProps {
  accessibleTasks: Task[];
  accessibleLists?: Array<{ id: string; name: string }>;
}

export function useDashboardCharts({
  accessibleTasks,
  accessibleLists = [],
}: UseDashboardChartsProps) {
  const { t } = useTranslation();

  // Filtrar TODAS las tareas de la semana actual (lunes a domingo)
  // Solo incluye tareas con dueDate dentro de la semana actual
  const tasksThisWeek = useMemo(() => {
    const weekStart = getStartOfWeek();
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    return accessibleTasks.filter((task) => {
      const due = parseDate(task.dueDate);

      // Solo incluir si tiene dueDate dentro de la semana actual
      if (due && due >= weekStart && due < weekEnd) return true;

      return false;
    });
  }, [accessibleTasks]);

  // Agrupar tareas por lista (usando TODAS las tareas accesibles)
  const tasksPerList = useMemo(() => {
    const grouped = accessibleTasks.reduce<Record<string, number>>(
      (acc, task) => {
        acc[task.listId] = (acc[task.listId] || 0) + 1;
        return acc;
      },
      {},
    );

    // Mapear a nombres de listas con sus contadores
    return accessibleLists.map((list) => ({
      listName: list.name,
      count: grouped[list.id] || 0,
    }));
  }, [accessibleTasks, accessibleLists]);

  // Contadores para las tarjetas superiores
  const weekStats = useMemo(() => {
    const weekStart = getStartOfWeek();

    // Calcular número de semana del año
    const oneJan = new Date(weekStart.getFullYear(), 0, 1);
    const numberOfDays = Math.floor(
      (weekStart.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000),
    );
    const weekNumber = Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7);

    return {
      // Próximas Tareas: todas las tareas de la semana actual
      upcomingTasks: tasksThisWeek.length,

      // Tareas Pendientes: tareas con estado PENDING de esta semana
      pendingTasks: tasksThisWeek.filter((t) => t.status === "PENDING").length,

      // Tareas Completadas: tareas con estado COMPLETED de esta semana
      completedTasks: tasksThisWeek.filter((t) => t.status === "COMPLETED")
        .length,

      // Número de semana
      weekNumber: t("dashboard.weekNumber", { number: weekNumber }),

      // Tareas por lista
      tasksPerList,
    };
  }, [tasksThisWeek, tasksPerList]);

  // Calcular stats de prioridad globales
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

  // Calcular stats de estado globales (para gráfico)
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

  // Gráfico de prioridades (usando datos globales)
  const priorityChartData = useMemo(() => {
    console.log("Dashboard - accessibleTasks:", accessibleTasks);
    console.log("Dashboard - tasksThisWeek:", tasksThisWeek);

    return Object.entries(priorityStats)
      .map(([priority, count]) => {
        const labelKey = `tasks.priority.${priority}`;
        return {
          name: t(labelKey),
          value: count as number,
          fill: PRIORITY_COLORS[
            priorityConfig[
              priority.toUpperCase() as keyof typeof priorityConfig
            ].label as keyof typeof PRIORITY_COLORS
          ],
        };
      })
      .filter((item) => item.value > 0);
  }, [priorityStats, accessibleTasks, tasksThisWeek, t]);

  const priorityChartConfig = useMemo(() => {
    return Object.entries(priorityConfig).reduce(
      (acc, [key]) => ({
        ...acc,
        [t(`tasks.priority.${key}`)]: {
          label: t(`tasks.priority.${key}`),
          color:
            PRIORITY_COLORS[
              priorityConfig[key as keyof typeof priorityConfig]
                .label as keyof typeof PRIORITY_COLORS
            ],
        },
      }),
      {},
    );
  }, [t]);

  // Gráfico de distribución por estado (usando datos globales)
  const progressChartData = useMemo(() => {
    return [
      {
        name: t("dashboard.statusLabels.pending"),
        value: taskStats.pending,
        fill: STATUS_COLORS.pending,
      },
      {
        name: t("dashboard.statusLabels.inProgress"),
        value: taskStats.inProgress,
        fill: STATUS_COLORS.inProgress,
      },
      {
        name: t("dashboard.statusLabels.completed"),
        value: taskStats.completed,
        fill: STATUS_COLORS.completed,
      },
    ].filter((item) => item.value > 0);
  }, [taskStats, t]);

  const progressChartConfig = useMemo(
    () => ({
      [t("dashboard.statusLabels.pending")]: {
        label: t("dashboard.statusLabels.pending"),
        color: STATUS_COLORS.pending,
      },
      [t("dashboard.statusLabels.inProgress")]: {
        label: t("dashboard.statusLabels.inProgress"),
        color: STATUS_COLORS.inProgress,
      },
      [t("dashboard.statusLabels.completed")]: {
        label: t("dashboard.statusLabels.completed"),
        color: STATUS_COLORS.completed,
      },
    }),
    [t],
  );

  // Gráfico de tareas de la semana actual (Lun-Dom)
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

      // Contar tareas por estado para ese día
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
        color: STATUS_COLORS.pending,
      },
      inProgress: {
        label: t("dashboard.statusLabels.inProgress"),
        color: STATUS_COLORS.inProgress,
      },
      completed: {
        label: t("dashboard.statusLabels.completed"),
        color: STATUS_COLORS.completed,
      },
    }),
    [t],
  );

  // Gráfica de tareas por lista con colores distintos
  const LIST_COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

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
    // Datos de gráficos
    priorityChartData,
    priorityChartConfig,
    progressChartData,
    progressChartConfig,
    weeklyTasksData,
    weeklyTasksConfig,
    tasksPerListData,
    tasksPerListConfig,

    // Stats para tarjetas
    weekStats,
  };
}
