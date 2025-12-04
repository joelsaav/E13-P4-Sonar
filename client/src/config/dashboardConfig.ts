/**
 * @file dashboardConfig.ts
 * @description Configuración del panel de control de la aplicación de gestión de tareas.
 * Aquí se definen las tarjetas que se mostrarán en el dashboard, incluyendo
 * iconos, títulos, descripciones y detalles específicos para cada tarjeta.
 */

export const dashboardCards = [
  {
    icon: "IconCalendar",
    titleKey: "dashboard.cards.upcomingTasks",
    descriptionKey: "dashboard.cards.upcomingTasksDesc",
    bigDetails: true,
    span: "md:col-span-2 lg:col-span-1",
  },
  {
    icon: "IconChecklist",
    titleKey: "dashboard.cards.completedTasks",
    descriptionKey: "dashboard.cards.completedTasksDesc",
    bigDetails: true,
    span: "md:col-span-2 lg:col-span-1",
  },
  {
    icon: "IconList",
    titleKey: "dashboard.cards.tasksByList",
    descriptionKey: "dashboard.cards.tasksByListDesc",
    bigDetails: true,
    span: "md:col-span-2 lg:col-span-2",
  },
  {
    icon: "IconChartBar",
    titleKey: "dashboard.cards.currentWeek",
    descriptionKey: "dashboard.cards.currentWeekDesc",
    chart: true,
    chartType: "bar",
    span: "md:col-span-2 lg:col-span-2 row-span-2",
  },
  {
    icon: "IconChartPie",
    titleKey: "dashboard.cards.tasksByPriority",
    descriptionKey: "dashboard.cards.tasksByPriorityDesc",
    chart: true,
    chartType: "pie",
    span: "md:col-span-2 lg:col-span-1 row-span-2",
  },
  {
    icon: "IconChartPie",
    titleKey: "dashboard.cards.tasksByStatus",
    descriptionKey: "dashboard.cards.tasksByStatusDesc",
    chart: true,
    chartType: "pie",
    span: "md:col-span-2 lg:col-span-1 row-span-2",
  },
];
