import {
  getCompletedTasksForDay,
  getCompletedTasksLastNDays,
  getCompletedTasksThisWeek,
  getFavoriteTasks,
  getHighPriorityPendingTasks,
  getInboxTasks,
  getInProgressRecentlyUpdatedTasks,
  getMostRecentTasks,
  getNextDueTasks,
  getNextDueTasksThisWeek,
  getOverdueTasks,
  getPendingTasksThisWeek,
  getRecentTasksThisWeek,
  getTasksDueThisWeek,
  getTasksSharedWithUser,
  getTodayTasks,
  groupTasksByList,
} from "@/lib/taskFilters";
import type { Task } from "@/types/tasks-system/task";
import { describe, expect, it } from "vitest";

const createTask = (overrides: Partial<Task> = {}): Task => ({
  id: "test-id",
  name: "Test Task",
  description: "Test description",
  status: "PENDING",
  priority: "MEDIUM",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  listId: "list-1",
  completed: false,
  shares: [],
  favorite: false,
  ...overrides,
});

describe("taskFilters", () => {
  describe("getCompletedTasksLastNDays", () => {
    it("devuelve 0 cuando no hay tareas completadas", () => {
      const tasks = [
        createTask({ completed: false }),
        createTask({ completed: false }),
      ];
      expect(getCompletedTasksLastNDays(tasks, 7)).toBe(0);
    });

    it("cuenta tareas completadas en los últimos 7 días", () => {
      const now = new Date();
      const threeDaysAgo = new Date(now);
      threeDaysAgo.setDate(now.getDate() - 3);

      const tasks = [
        createTask({
          completed: true,
          completedAt: threeDaysAgo.toISOString(),
        }),
        createTask({
          completed: true,
          completedAt: now.toISOString(),
        }),
        createTask({ completed: false }),
      ];

      expect(getCompletedTasksLastNDays(tasks, 7)).toBe(2);
    });

    it("no cuenta tareas completadas hace más de N días", () => {
      const now = new Date();
      const tenDaysAgo = new Date(now);
      tenDaysAgo.setDate(now.getDate() - 10);

      const tasks = [
        createTask({
          completed: true,
          completedAt: tenDaysAgo.toISOString(),
        }),
      ];

      expect(getCompletedTasksLastNDays(tasks, 7)).toBe(0);
    });

    it("devuelve 0 cuando days es 0 o negativo", () => {
      const tasks = [
        createTask({ completed: true, completedAt: new Date().toISOString() }),
      ];
      expect(getCompletedTasksLastNDays(tasks, 0)).toBe(0);
      expect(getCompletedTasksLastNDays(tasks, -5)).toBe(0);
    });

    it("maneja fechas inválidas correctamente", () => {
      const tasks = [
        createTask({ completed: true, completedAt: "invalid-date" }),
      ];
      expect(getCompletedTasksLastNDays(tasks, 7)).toBe(0);
    });

    it("devuelve 0 cuando el array de tareas está vacío", () => {
      expect(getCompletedTasksLastNDays([], 7)).toBe(0);
    });

    it("maneja tareas completadas sin campo completedAt", () => {
      const tasks = [createTask({ completed: true, completedAt: undefined })];
      expect(getCompletedTasksLastNDays(tasks, 7)).toBe(0);
    });

    it("cuenta correctamente en el límite exacto del período", () => {
      const now = new Date();
      const sixDaysAgo = new Date(now);
      sixDaysAgo.setDate(now.getDate() - 6);

      const tasks = [
        createTask({
          completed: true,
          completedAt: sixDaysAgo.toISOString(),
        }),
      ];

      expect(getCompletedTasksLastNDays(tasks, 7)).toBe(1);
    });
  });

  describe("getNextDueTasks", () => {
    it("devuelve tareas ordenadas por fecha de vencimiento", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      const tasks = [
        createTask({ id: "1", dueDate: nextWeek.toISOString() }),
        createTask({ id: "2", dueDate: tomorrow.toISOString() }),
      ];

      const result = getNextDueTasks(tasks, 5);
      expect(result[0].id).toBe("2");
      expect(result[1].id).toBe("1");
    });

    it("no incluye tareas sin fecha de vencimiento", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const tasks = [
        createTask({ id: "1", dueDate: undefined }),
        createTask({ id: "2", dueDate: tomorrow.toISOString() }),
      ];

      const result = getNextDueTasks(tasks, 5);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("2");
    });

    it("no incluye tareas vencidas (pasadas)", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const tasks = [createTask({ dueDate: yesterday.toISOString() })];

      expect(getNextDueTasks(tasks, 5)).toHaveLength(0);
    });

    it("limita resultados según el parámetro limit", () => {
      const tasks = Array.from({ length: 10 }, (_, i) => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + i + 1);
        return createTask({
          id: `task-${i}`,
          dueDate: futureDate.toISOString(),
        });
      });

      expect(getNextDueTasks(tasks, 3)).toHaveLength(3);
      expect(getNextDueTasks(tasks, 5)).toHaveLength(5);
    });

    it("maneja fechas inválidas", () => {
      const tasks = [createTask({ dueDate: "invalid-date" })];
      expect(getNextDueTasks(tasks, 5)).toHaveLength(0);
    });

    it("devuelve array vacío cuando no hay tareas", () => {
      expect(getNextDueTasks([], 5)).toHaveLength(0);
    });

    it("incluye tareas que vencen en el futuro inmediato", () => {
      const soon = new Date();
      soon.setMinutes(soon.getMinutes() + 5);

      const tasks = [createTask({ dueDate: soon.toISOString() })];

      const result = getNextDueTasks(tasks, 5);
      expect(result).toHaveLength(1);
    });
  });

  describe("getMostRecentTasks", () => {
    it("devuelve tareas ordenadas de más nueva a más antigua", () => {
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);

      const tasks = [
        createTask({ id: "1", createdAt: yesterday.toISOString() }),
        createTask({ id: "2", createdAt: now.toISOString() }),
      ];

      const result = getMostRecentTasks(tasks, 5);
      expect(result[0].id).toBe("2");
      expect(result[1].id).toBe("1");
    });

    it("limita resultados según el parámetro limit", () => {
      const tasks = Array.from({ length: 10 }, (_, i) =>
        createTask({ id: `task-${i}` }),
      );

      expect(getMostRecentTasks(tasks, 3)).toHaveLength(3);
      expect(getMostRecentTasks(tasks, 5)).toHaveLength(5);
    });

    it("maneja fechas inválidas usando época 0", () => {
      const tasks = [
        createTask({ id: "1", createdAt: "invalid-date" }),
        createTask({ id: "2", createdAt: new Date().toISOString() }),
      ];

      const result = getMostRecentTasks(tasks, 5);
      expect(result[0].id).toBe("2");
      expect(result[1].id).toBe("1");
    });
  });

  describe("getFavoriteTasks", () => {
    it("devuelve solo tareas marcadas como favoritas", () => {
      const tasks = [
        createTask({ id: "1", favorite: true }),
        createTask({ id: "2", favorite: false }),
        createTask({ id: "3", favorite: true }),
      ];

      const result = getFavoriteTasks(tasks);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("1");
      expect(result[1].id).toBe("3");
    });

    it("devuelve array vacío cuando no hay favoritas", () => {
      const tasks = [
        createTask({ favorite: false }),
        createTask({ favorite: false }),
      ];

      expect(getFavoriteTasks(tasks)).toHaveLength(0);
    });

    it("devuelve array vacío cuando no hay tareas", () => {
      expect(getFavoriteTasks([])).toHaveLength(0);
    });
  });

  describe("getTodayTasks", () => {
    it("devuelve tareas que vencen hoy", () => {
      const today = new Date();
      today.setHours(12, 0, 0, 0);

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const tasks = [
        createTask({ id: "1", dueDate: today.toISOString() }),
        createTask({ id: "2", dueDate: tomorrow.toISOString() }),
      ];

      const result = getTodayTasks(tasks);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("1");
    });

    it("no incluye tareas sin fecha de vencimiento", () => {
      const tasks = [createTask({ dueDate: undefined })];
      expect(getTodayTasks(tasks)).toHaveLength(0);
    });

    it("no incluye tareas de ayer", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const tasks = [createTask({ dueDate: yesterday.toISOString() })];

      expect(getTodayTasks(tasks)).toHaveLength(0);
    });

    it("maneja múltiples tareas que vencen hoy", () => {
      const morning = new Date();
      morning.setHours(8, 0, 0, 0);

      const afternoon = new Date();
      afternoon.setHours(16, 0, 0, 0);

      const tasks = [
        createTask({ id: "1", dueDate: morning.toISOString() }),
        createTask({ id: "2", dueDate: afternoon.toISOString() }),
      ];

      expect(getTodayTasks(tasks)).toHaveLength(2);
    });
  });

  describe("getOverdueTasks", () => {
    it("devuelve tareas vencidas y no completadas", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const tasks = [
        createTask({
          id: "1",
          dueDate: yesterday.toISOString(),
          status: "PENDING",
        }),
        createTask({
          id: "2",
          dueDate: yesterday.toISOString(),
          status: "COMPLETED",
        }),
      ];

      const result = getOverdueTasks(tasks);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("1");
    });

    it("no incluye tareas futuras", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const tasks = [
        createTask({ dueDate: tomorrow.toISOString(), status: "PENDING" }),
      ];

      expect(getOverdueTasks(tasks)).toHaveLength(0);
    });

    it("incluye tareas IN_PROGRESS atrasadas", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const tasks = [
        createTask({
          dueDate: yesterday.toISOString(),
          status: "IN_PROGRESS",
        }),
      ];

      expect(getOverdueTasks(tasks)).toHaveLength(1);
    });

    it("no incluye tareas sin fecha de vencimiento", () => {
      const tasks = [createTask({ dueDate: undefined, status: "PENDING" })];
      expect(getOverdueTasks(tasks)).toHaveLength(0);
    });
  });

  describe("getTasksDueThisWeek", () => {
    it("devuelve tareas que vencen en los próximos 7 días", () => {
      const in3Days = new Date();
      in3Days.setDate(in3Days.getDate() + 3);

      const in10Days = new Date();
      in10Days.setDate(in10Days.getDate() + 10);

      const tasks = [
        createTask({ id: "1", dueDate: in3Days.toISOString() }),
        createTask({ id: "2", dueDate: in10Days.toISOString() }),
      ];

      const result = getTasksDueThisWeek(tasks);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("1");
    });

    it("incluye tareas de hoy", () => {
      const today = new Date();

      const tasks = [createTask({ dueDate: today.toISOString() })];

      expect(getTasksDueThisWeek(tasks)).toHaveLength(1);
    });

    it("no incluye tareas sin fecha de vencimiento", () => {
      const tasks = [createTask({ dueDate: undefined })];
      expect(getTasksDueThisWeek(tasks)).toHaveLength(0);
    });

    it("incluye tarea en el límite exacto (día 7)", () => {
      const day7 = new Date();
      day7.setDate(day7.getDate() + 6);
      day7.setHours(23, 59, 59, 0);

      const tasks = [createTask({ dueDate: day7.toISOString() })];

      expect(getTasksDueThisWeek(tasks)).toHaveLength(1);
    });
  });

  describe("getInboxTasks", () => {
    it("devuelve tareas sin fecha y no completadas", () => {
      const tasks = [
        createTask({ id: "1", dueDate: undefined, status: "PENDING" }),
        createTask({ id: "2", dueDate: undefined, status: "COMPLETED" }),
        createTask({
          id: "3",
          dueDate: new Date().toISOString(),
          status: "PENDING",
        }),
      ];

      const result = getInboxTasks(tasks);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("1");
    });

    it("incluye tareas IN_PROGRESS sin fecha", () => {
      const tasks = [createTask({ dueDate: undefined, status: "IN_PROGRESS" })];

      expect(getInboxTasks(tasks)).toHaveLength(1);
    });

    it("devuelve array vacío cuando todas tienen fecha o están completadas", () => {
      const tasks = [
        createTask({ dueDate: new Date().toISOString(), status: "PENDING" }),
        createTask({ dueDate: undefined, status: "COMPLETED" }),
      ];

      expect(getInboxTasks(tasks)).toHaveLength(0);
    });
  });

  describe("getHighPriorityPendingTasks", () => {
    it("devuelve tareas de prioridad alta o urgente no completadas", () => {
      const tasks = [
        createTask({ id: "1", priority: "HIGH", status: "PENDING" }),
        createTask({ id: "2", priority: "URGENT", status: "IN_PROGRESS" }),
        createTask({ id: "3", priority: "MEDIUM", status: "PENDING" }),
        createTask({ id: "4", priority: "HIGH", status: "COMPLETED" }),
      ];

      const result = getHighPriorityPendingTasks(tasks);
      expect(result).toHaveLength(2);
      expect(result.map((t) => t.id)).toContain("1");
      expect(result.map((t) => t.id)).toContain("2");
    });

    it("devuelve array vacío si no hay tareas de alta prioridad pendientes", () => {
      const tasks = [
        createTask({ priority: "LOW", status: "PENDING" }),
        createTask({ priority: "MEDIUM", status: "PENDING" }),
      ];

      expect(getHighPriorityPendingTasks(tasks)).toHaveLength(0);
    });
  });

  describe("getInProgressRecentlyUpdatedTasks", () => {
    it("devuelve tareas en progreso ordenadas por actualización", () => {
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);

      const tasks = [
        createTask({
          id: "1",
          status: "IN_PROGRESS",
          updatedAt: yesterday.toISOString(),
        }),
        createTask({
          id: "2",
          status: "IN_PROGRESS",
          updatedAt: now.toISOString(),
        }),
        createTask({
          id: "3",
          status: "PENDING",
          updatedAt: now.toISOString(),
        }),
      ];

      const result = getInProgressRecentlyUpdatedTasks(tasks, 5);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("2");
      expect(result[1].id).toBe("1");
    });

    it("limita resultados según el parámetro limit", () => {
      const tasks = Array.from({ length: 10 }, (_, i) =>
        createTask({ id: `task-${i}`, status: "IN_PROGRESS" }),
      );

      expect(getInProgressRecentlyUpdatedTasks(tasks, 3)).toHaveLength(3);
    });

    it("no incluye tareas que no están en progreso", () => {
      const tasks = [
        createTask({ status: "PENDING" }),
        createTask({ status: "COMPLETED" }),
      ];

      expect(getInProgressRecentlyUpdatedTasks(tasks, 5)).toHaveLength(0);
    });

    it("maneja fechas de actualización inválidas usando época 0", () => {
      const now = new Date();
      const tasks = [
        createTask({
          id: "1",
          status: "IN_PROGRESS",
          updatedAt: "invalid-date",
        }),
        createTask({
          id: "2",
          status: "IN_PROGRESS",
          updatedAt: now.toISOString(),
        }),
      ];

      const result = getInProgressRecentlyUpdatedTasks(tasks, 5);
      expect(result[0].id).toBe("2");
      expect(result[1].id).toBe("1");
    });
  });

  describe("getTasksSharedWithUser", () => {
    it("devuelve tareas compartidas con un usuario específico", () => {
      const tasks = [
        createTask({
          id: "1",
          shares: [
            {
              id: "share-1",
              userId: "user-123",
              taskId: "1",
              permission: "VIEW",
            },
          ],
        }),
        createTask({
          id: "2",
          shares: [
            {
              id: "share-2",
              userId: "user-456",
              taskId: "2",
              permission: "EDIT",
            },
          ],
        }),
        createTask({ id: "3", shares: [] }),
      ];

      const result = getTasksSharedWithUser(tasks, "user-123");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("1");
    });

    it("devuelve array vacío si no hay tareas compartidas con el usuario", () => {
      const tasks = [
        createTask({
          shares: [
            {
              id: "share-1",
              userId: "user-456",
              taskId: "1",
              permission: "VIEW",
            },
          ],
        }),
      ];

      expect(getTasksSharedWithUser(tasks, "user-123")).toHaveLength(0);
    });

    it("devuelve tareas con múltiples shares para el mismo usuario", () => {
      const tasks = [
        createTask({
          id: "1",
          shares: [
            {
              id: "share-1",
              userId: "user-123",
              taskId: "1",
              permission: "VIEW",
            },
            {
              id: "share-2",
              userId: "user-456",
              taskId: "1",
              permission: "EDIT",
            },
          ],
        }),
      ];

      expect(getTasksSharedWithUser(tasks, "user-123")).toHaveLength(1);
      expect(getTasksSharedWithUser(tasks, "user-456")).toHaveLength(1);
    });

    it("devuelve array vacío cuando todas las tareas no tienen shares", () => {
      const tasks = [createTask({ shares: [] }), createTask({ shares: [] })];

      expect(getTasksSharedWithUser(tasks, "user-123")).toHaveLength(0);
    });
  });

  describe("getCompletedTasksForDay", () => {
    it("Devuelve tareas completadas en un día específico", () => {
      const specificDate = new Date("2024-03-15");
      const sameDayMorning = new Date("2024-03-15T08:00:00");
      const sameDayAfternoon = new Date("2024-03-15T16:00:00");
      const differentDay = new Date("2024-03-16");

      const tasks = [
        createTask({
          id: "1",
          completed: true,
          completedAt: sameDayMorning.toISOString(),
        }),
        createTask({
          id: "2",
          completed: true,
          completedAt: sameDayAfternoon.toISOString(),
        }),
        createTask({
          id: "3",
          completed: true,
          completedAt: differentDay.toISOString(),
        }),
        createTask({ id: "4", completed: false }),
      ];

      const result = getCompletedTasksForDay(tasks, specificDate);
      expect(result).toHaveLength(2);
      expect(result.map((t) => t.id)).toContain("1");
      expect(result.map((t) => t.id)).toContain("2");
    });

    it("Devuelve array vacío cuando no hay tareas completadas ese día", () => {
      const specificDate = new Date("2024-03-15");
      const tasks = [createTask({ completed: false })];
      expect(getCompletedTasksForDay(tasks, specificDate)).toHaveLength(0);
    });

    it("Maneja tareas sin completedAt", () => {
      const specificDate = new Date("2024-03-15");
      const tasks = [createTask({ completed: true, completedAt: undefined })];
      expect(getCompletedTasksForDay(tasks, specificDate)).toHaveLength(0);
    });
  });

  describe("groupTasksByList", () => {
    it("Agrupa tareas por listId correctamente", () => {
      const tasks = [
        createTask({ id: "1", listId: "list-A" }),
        createTask({ id: "2", listId: "list-B" }),
        createTask({ id: "3", listId: "list-A" }),
      ];

      const result = groupTasksByList(tasks);
      expect(Object.keys(result)).toHaveLength(2);
      expect(result["list-A"]).toHaveLength(2);
      expect(result["list-B"]).toHaveLength(1);
    });

    it("Devuelve objeto vacío cuando no hay tareas", () => {
      const result = groupTasksByList([]);
      expect(Object.keys(result)).toHaveLength(0);
    });

    it("Agrupa todas las tareas en un solo grupo si tienen el mismo listId", () => {
      const tasks = [
        createTask({ id: "1", listId: "same-list" }),
        createTask({ id: "2", listId: "same-list" }),
        createTask({ id: "3", listId: "same-list" }),
      ];

      const result = groupTasksByList(tasks);
      expect(Object.keys(result)).toHaveLength(1);
      expect(result["same-list"]).toHaveLength(3);
    });
  });

  describe("getPendingTasksThisWeek", () => {
    it("Cuenta tareas pendientes con dueDate en esta semana", () => {
      const today = new Date();
      const in3Days = new Date();
      in3Days.setDate(today.getDate() + 3);

      const tasks = [
        createTask({ status: "PENDING", dueDate: in3Days.toISOString() }),
        createTask({ status: "COMPLETED", dueDate: in3Days.toISOString() }),
        createTask({ status: "PENDING", dueDate: undefined }),
      ];

      const result = getPendingTasksThisWeek(tasks);
      expect(result).toBeGreaterThanOrEqual(1);
    });

    it("No cuenta tareas que no son PENDING", () => {
      const in3Days = new Date();
      in3Days.setDate(in3Days.getDate() + 3);

      const tasks = [
        createTask({ status: "IN_PROGRESS", dueDate: in3Days.toISOString() }),
        createTask({ status: "COMPLETED", dueDate: in3Days.toISOString() }),
      ];

      const result = getPendingTasksThisWeek(tasks);
      expect(result).toBe(0);
    });
  });

  describe("getCompletedTasksThisWeek", () => {
    it("Cuenta tareas completadas esta semana", () => {
      const today = new Date();
      const tasks = [
        createTask({
          completed: true,
          completedAt: today.toISOString(),
        }),
        createTask({ completed: false }),
      ];

      const result = getCompletedTasksThisWeek(tasks);
      expect(result).toBeGreaterThanOrEqual(1);
    });

    it("No cuenta tareas completadas hace más de una semana", () => {
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

      const tasks = [
        createTask({
          completed: true,
          completedAt: twoWeeksAgo.toISOString(),
        }),
      ];

      const result = getCompletedTasksThisWeek(tasks);
      expect(result).toBe(0);
    });
  });

  describe("getRecentTasksThisWeek", () => {
    it("Devuelve tareas creadas esta semana ordenadas por fecha", () => {
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(today.getDate() - 14);

      const tasks = [
        createTask({ id: "1", createdAt: yesterday.toISOString() }),
        createTask({ id: "2", createdAt: today.toISOString() }),
        createTask({ id: "3", createdAt: twoWeeksAgo.toISOString() }),
      ];

      const result = getRecentTasksThisWeek(tasks, 5);
      expect(result.length).toBeGreaterThanOrEqual(1);
      if (result.length >= 2) {
        expect(result[0].id).toBe("2");
        expect(result[1].id).toBe("1");
      }
    });

    it("Limita los resultados según el parámetro limit", () => {
      const tasks = Array.from({ length: 10 }, (_, i) =>
        createTask({ id: `task-${i}`, createdAt: new Date().toISOString() }),
      );

      expect(getRecentTasksThisWeek(tasks, 3)).toHaveLength(3);
    });
  });

  describe("getNextDueTasksThisWeek", () => {
    it("Devuelve tareas que vencen esta semana sin completar", () => {
      const in2Days = new Date();
      in2Days.setDate(in2Days.getDate() + 2);
      const in5Days = new Date();
      in5Days.setDate(in5Days.getDate() + 5);

      const tasks = [
        createTask({
          id: "1",
          status: "PENDING",
          dueDate: in2Days.toISOString(),
        }),
        createTask({
          id: "2",
          status: "COMPLETED",
          dueDate: in5Days.toISOString(),
        }),
        createTask({
          id: "3",
          status: "IN_PROGRESS",
          dueDate: in5Days.toISOString(),
        }),
      ];

      const result = getNextDueTasksThisWeek(tasks);
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result[0].id).toBe("1");
    });

    it("Limita los resultados si se proporciona limit", () => {
      const tasks = Array.from({ length: 10 }, (_, i) => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 1 + i);
        return createTask({
          id: `task-${i}`,
          status: "PENDING",
          dueDate: futureDate.toISOString(),
        });
      });

      expect(getNextDueTasksThisWeek(tasks, 3)).toHaveLength(3);
    });

    it("Devuelve todas las tareas si no se proporciona limit", () => {
      const in1Day = new Date();
      in1Day.setDate(in1Day.getDate() + 1);
      const in2Days = new Date();
      in2Days.setDate(in2Days.getDate() + 2);

      const tasks = [
        createTask({
          id: "1",
          status: "PENDING",
          dueDate: in1Day.toISOString(),
        }),
        createTask({
          id: "2",
          status: "PENDING",
          dueDate: in2Days.toISOString(),
        }),
      ];

      const result = getNextDueTasksThisWeek(tasks);
      expect(result.length).toBe(2);
    });

    it("No incluye tareas pasadas", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const tasks = [
        createTask({
          status: "PENDING",
          dueDate: yesterday.toISOString(),
        }),
      ];

      expect(getNextDueTasksThisWeek(tasks)).toHaveLength(0);
    });
  });
});
