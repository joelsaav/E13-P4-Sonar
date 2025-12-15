export const priorityConfig = {
  LOW: {
    color:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 [&_svg]:stroke-blue-600 dark:[&_svg]:stroke-blue-400",
    label: "Baja",
  },
  MEDIUM: {
    color:
      "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 [&_svg]:stroke-yellow-600 dark:[&_svg]:stroke-yellow-400",
    label: "Media",
  },
  HIGH: {
    color:
      "bg-orange-500/10 text-orange-600 dark:text-orange-400 [&_svg]:stroke-orange-600 dark:[&_svg]:stroke-orange-400",
    label: "Alta",
  },
  URGENT: {
    color:
      "bg-red-500/10 text-red-600 dark:text-red-400 [&_svg]:stroke-red-600 dark:[&_svg]:stroke-red-400",
    label: "Urgente",
  },
} as const;

export const statusConfig = {
  PENDING: {
    color:
      "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 [&_svg]:stroke-yellow-600 dark:[&_svg]:stroke-yellow-400",
    label: "Pendiente",
  },
  IN_PROGRESS: {
    color:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 [&_svg]:stroke-blue-600 dark:[&_svg]:stroke-blue-400",
    label: "En Progreso",
  },
  COMPLETED: {
    color:
      "bg-green-500/10 text-green-600 dark:text-green-400 [&_svg]:stroke-green-600 dark:[&_svg]:stroke-green-400",
    label: "Completada",
  },
} as const;
