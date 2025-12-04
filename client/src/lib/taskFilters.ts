import type { Task, TaskPriority } from "@/types/tasks-system/task";

/**
 * Helpers de fechas.
 * Devuelve null si la fecha no es válida.
 */

/**
 * Filtra una cadena por una fecha válida y devuelve un objeto Date o null si no es válida.
 * @param value Cadena de fecha en formato ISO o similar.
 * @return Objeto Date o null.
 */
function parseDate(value?: string): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Devuelve el inicio del día (00:00:00) para una fecha dada. */
function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/** Devuelve el final del día (00:00:00 del día siguiente) para una fecha dada. */
function endOfDay(d: Date): Date {
  const copy = startOfDay(d);
  copy.setDate(copy.getDate() + 1);
  return copy;
}

/**
 * Número de tareas completadas en los últimos `days` días.
 * Por defecto, cuenta la última semana.
 */
export function getCompletedTasksLastNDays(
  tasks: Task[],
  days: number = 7,
): number {
  if (days <= 0) return 0;

  const now = new Date();
  const from = new Date();
  from.setDate(now.getDate() - days);

  return tasks.filter((task) => {
    if (!task.completed || !task.completedAt) return false;
    const completedAt = parseDate(task.completedAt);
    if (!completedAt) return false;
    return completedAt >= from && completedAt <= now;
  }).length;
}

/**
 * Obtiene tareas completadas en un día específico.
 * @param tasks Array de tareas
 * @param date Fecha del día a consultar
 * @return Array de tareas completadas ese día
 */
export function getCompletedTasksForDay(tasks: Task[], date: Date): Task[] {
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  return tasks.filter((task) => {
    if (!task.completed || !task.completedAt) return false;
    const completedAt = parseDate(task.completedAt);
    if (!completedAt) return false;
    return completedAt >= dayStart && completedAt < dayEnd;
  });
}

/**
 * Devuelve las tareas con fecha de vencimiento más próxima.
 * Solo tiene en cuenta tareas con dueDate válido y futuro/actual.
 * Ordena de más cercano a más lejano.
 * Limita el resultado a `limit` tareas (por defecto 5).
 */
export function getNextDueTasks(tasks: Task[], limit: number = 5): Task[] {
  const now = new Date();

  return tasks
    .map((task) => {
      const due = parseDate(task.dueDate);
      return { task, due };
    })
    .filter((entry): entry is { task: Task; due: Date } => entry.due !== null)
    .filter(({ due }) => due >= now)
    .sort((a, b) => a.due.getTime() - b.due.getTime())
    .slice(0, limit)
    .map(({ task }) => task);
}

/**
 * Devuelve las tareas más recientes según `createdAt`,
 * ordenadas de más nueva a más antigua.
 * Limita el resultado a `limit` tareas (por defecto 5).
 */
export function getMostRecentTasks(tasks: Task[], limit: number = 5): Task[] {
  return [...tasks]
    .map((task) => {
      const created = parseDate(task.createdAt) ?? new Date(0);
      return { task, created };
    })
    .sort((a, b) => b.created.getTime() - a.created.getTime())
    .slice(0, limit)
    .map(({ task }) => task);
}

/**
 * Devuelve las tareas marcadas como favoritas.
 */
export function getFavoriteTasks(tasks: Task[]): Task[] {
  return tasks.filter((task) => task.favorite === true);
}

/**
 * Tareas con vencimiento hoy, entre inicio y fin del día actual.
 */
export function getTodayTasks(tasks: Task[]): Task[] {
  const today = new Date();
  const from = startOfDay(today);
  const to = endOfDay(today);

  return tasks.filter((task) => {
    const due = parseDate(task.dueDate);
    return due !== null && due >= from && due < to;
  });
}

/**
 * Tareas atrasadas (vencidas y no completadas).
 */
export function getOverdueTasks(tasks: Task[]): Task[] {
  const today = startOfDay(new Date());

  return tasks.filter((task) => {
    const due = parseDate(task.dueDate);
    return due !== null && due < today && task.status !== "COMPLETED";
  });
}

/**
 * Tareas que vencen en los próximos 7 días (incluyendo hoy).
 */
export function getTasksDueThisWeek(tasks: Task[]): Task[] {
  const today = startOfDay(new Date());
  const endOfWeek = startOfDay(new Date());
  endOfWeek.setDate(today.getDate() + 7);

  return tasks.filter((task) => {
    const due = parseDate(task.dueDate);
    return due !== null && due >= today && due < endOfWeek;
  });
}

/**
 * Tareas sin fecha y no completadas (tipo bandeja de entrada).
 */
export function getInboxTasks(tasks: Task[]): Task[] {
  return tasks.filter((task) => !task.dueDate && task.status !== "COMPLETED");
}

/**
 * Tareas pendientes de prioridad alta o urgente.
 * Considera tareas no completadas.
 * Devuelve tareas con prioridad "HIGH" o "URGENT".
 */
export function getHighPriorityPendingTasks(tasks: Task[]): Task[] {
  const importantPriorities: TaskPriority[] = ["HIGH", "URGENT"];

  return tasks.filter(
    (task) =>
      task.status !== "COMPLETED" &&
      importantPriorities.includes(task.priority),
  );
}

/**
 * Tareas en progreso ordenadas por última actualización.
 * Limita el resultado a `limit` tareas (por defecto 5).
 * Devuelve tareas con estado "IN_PROGRESS", ordenadas
 * por `updatedAt` de más reciente a más antigua.
 */
export function getInProgressRecentlyUpdatedTasks(
  tasks: Task[],
  limit: number = 5,
): Task[] {
  return tasks
    .filter((task) => task.status === "IN_PROGRESS")
    .map((task) => ({
      task,
      updated: parseDate(task.updatedAt) ?? new Date(0),
    }))
    .sort((a, b) => b.updated.getTime() - a.updated.getTime())
    .slice(0, limit)
    .map(({ task }) => task);
}

/**
 * Tareas compartidas con un usuario concreto.
 * @param userId ID del usuario con el que se han compartido las tareas.
 * @return Array de tareas compartidas con el usuario.
 */
export function getTasksSharedWithUser(tasks: Task[], userId: string): Task[] {
  return tasks.filter((task) =>
    task.shares.some((share) => share.userId === userId),
  );
}

/**
 * Agrupa tareas por lista.
 * Devuelve un objeto donde las claves son los IDs de lista
 * y los valores son arrays de tareas pertenecientes a esa lista.
 */
export function groupTasksByList(tasks: Task[]): Record<string, Task[]> {
  return tasks.reduce<Record<string, Task[]>>((acc, task) => {
    const key = task.listId;
    if (!acc[key]) acc[key] = [];
    acc[key].push(task);
    return acc;
  }, {});
}

/**
 * Obtiene el inicio de la semana actual (lunes 00:00:00)
 */
function getStartOfWeek(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Si es domingo (0), retrocede 6 días; sino, calcula días hasta el lunes
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  return startOfDay(monday);
}

/**
 * Número de tareas pendientes (no completadas) de esta semana.
 * Incluye tareas con dueDate en esta semana o antes (aún no completadas)
 * y tareas sin dueDate creadas esta semana.
 */
export function getPendingTasksThisWeek(tasks: Task[]): number {
  const weekStart = getStartOfWeek();
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  return tasks.filter((task) => {
    if (task.status !== "PENDING") return false;

    const due = parseDate(task.dueDate);
    if (due && due < weekEnd) return true;

    // Tareas sin dueDate: incluir solo si fueron creadas esta semana
    const created = parseDate(task.createdAt);
    if (created && created >= weekStart && created < weekEnd && !task.dueDate)
      return true;

    return false;
  }).length;
}

/**
 * Número de tareas completadas esta semana.
 */
export function getCompletedTasksThisWeek(tasks: Task[]): number {
  const weekStart = getStartOfWeek();
  const now = new Date();

  return tasks.filter((task) => {
    if (!task.completed || !task.completedAt) return false;
    const completedAt = parseDate(task.completedAt);
    if (!completedAt) return false;
    return completedAt >= weekStart && completedAt <= now;
  }).length;
}

/**
 * Obtiene las tareas más recientes de esta semana según `createdAt`,
 * ordenadas de más nueva a más antigua.
 */
export function getRecentTasksThisWeek(
  tasks: Task[],
  limit: number = 5,
): Task[] {
  const weekStart = getStartOfWeek();
  const now = new Date();

  return tasks
    .filter((task) => {
      const created = parseDate(task.createdAt);
      if (!created) return false;
      return created >= weekStart && created <= now;
    })
    .sort((a, b) => {
      const dateA = parseDate(a.createdAt);
      const dateB = parseDate(b.createdAt);
      if (!dateA || !dateB) return 0;
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, limit);
}

/**
 * Obtiene las próximas tareas de esta semana con dueDate.
 * Filtra tareas que vencen desde ahora hasta el final de esta semana.
 */
export function getNextDueTasksThisWeek(tasks: Task[], limit?: number): Task[] {
  const now = new Date();
  const weekStart = getStartOfWeek();
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  const filtered = tasks
    .map((task) => {
      const due = parseDate(task.dueDate);
      return { task, due };
    })
    .filter((entry): entry is { task: Task; due: Date } => entry.due !== null)
    .filter(({ due, task }) => {
      // Solo tareas no completadas que vencen desde ahora hasta el final de la semana
      return task.status !== "COMPLETED" && due >= now && due < weekEnd;
    })
    .sort((a, b) => a.due.getTime() - b.due.getTime());

  return limit
    ? filtered.slice(0, limit).map(({ task }) => task)
    : filtered.map(({ task }) => task);
}
