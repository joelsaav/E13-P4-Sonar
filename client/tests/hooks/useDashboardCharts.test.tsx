import { useDashboardCharts } from "@/hooks/useDashboardCharts";
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Task } from "@/types/tasks-system/task";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("useDashboardCharts", () => {
  const mockTasks: Task[] = [
    {
      id: "task-1",
      title: "Task 1",
      description: "Description 1",
      listId: "list-1",
      userId: "user-1",
      status: "PENDING",
      priority: "HIGH",
      favorite: false,
      dueDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      shares: [],
    },
    {
      id: "task-2",
      title: "Task 2",
      description: "Description 2",
      listId: "list-1",
      userId: "user-1",
      status: "IN_PROGRESS",
      priority: "MEDIUM",
      favorite: true,
      dueDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      shares: [],
    },
    {
      id: "task-3",
      title: "Task 3",
      description: "Description 3",
      listId: "list-2",
      userId: "user-1",
      status: "COMPLETED",
      priority: "LOW",
      favorite: false,
      dueDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      shares: [],
    },
  ];

  const mockLists = [
    { id: "list-1", name: "List 1" },
    { id: "list-2", name: "List 2" },
  ];

  it("returns priority chart data", () => {
    const { result } = renderHook(() =>
      useDashboardCharts({
        accessibleTasks: mockTasks,
        accessibleLists: mockLists,
      }),
    );

    expect(result.current.priorityChartData).toBeDefined();
    expect(Array.isArray(result.current.priorityChartData)).toBe(true);
  });

  it("returns priority chart config", () => {
    const { result } = renderHook(() =>
      useDashboardCharts({
        accessibleTasks: mockTasks,
        accessibleLists: mockLists,
      }),
    );

    expect(result.current.priorityChartConfig).toBeDefined();
    expect(typeof result.current.priorityChartConfig).toBe("object");
  });

  it("returns progress chart data with status counts", () => {
    const { result } = renderHook(() =>
      useDashboardCharts({
        accessibleTasks: mockTasks,
        accessibleLists: mockLists,
      }),
    );

    expect(result.current.progressChartData).toBeDefined();
    expect(Array.isArray(result.current.progressChartData)).toBe(true);
  });

  it("returns progress chart config", () => {
    const { result } = renderHook(() =>
      useDashboardCharts({
        accessibleTasks: mockTasks,
        accessibleLists: mockLists,
      }),
    );

    expect(result.current.progressChartConfig).toBeDefined();
  });

  it("returns weekly tasks data with 7 days", () => {
    const { result } = renderHook(() =>
      useDashboardCharts({
        accessibleTasks: mockTasks,
        accessibleLists: mockLists,
      }),
    );

    expect(result.current.weeklyTasksData).toHaveLength(7);
    expect(result.current.weeklyTasksData[0]).toHaveProperty("day");
    expect(result.current.weeklyTasksData[0]).toHaveProperty("pending");
    expect(result.current.weeklyTasksData[0]).toHaveProperty("inProgress");
    expect(result.current.weeklyTasksData[0]).toHaveProperty("completed");
  });

  it("returns weekly tasks config", () => {
    const { result } = renderHook(() =>
      useDashboardCharts({
        accessibleTasks: mockTasks,
        accessibleLists: mockLists,
      }),
    );

    expect(result.current.weeklyTasksConfig).toBeDefined();
    expect(result.current.weeklyTasksConfig).toHaveProperty("pending");
    expect(result.current.weeklyTasksConfig).toHaveProperty("inProgress");
    expect(result.current.weeklyTasksConfig).toHaveProperty("completed");
  });

  it("returns tasks per list data", () => {
    const { result } = renderHook(() =>
      useDashboardCharts({
        accessibleTasks: mockTasks,
        accessibleLists: mockLists,
      }),
    );

    expect(result.current.tasksPerListData).toBeDefined();
    expect(Array.isArray(result.current.tasksPerListData)).toBe(true);
  });

  it("returns tasks per list config", () => {
    const { result } = renderHook(() =>
      useDashboardCharts({
        accessibleTasks: mockTasks,
        accessibleLists: mockLists,
      }),
    );

    expect(result.current.tasksPerListConfig).toBeDefined();
  });

  it("returns week stats", () => {
    const { result } = renderHook(() =>
      useDashboardCharts({
        accessibleTasks: mockTasks,
        accessibleLists: mockLists,
      }),
    );

    expect(result.current.weekStats).toBeDefined();
    expect(result.current.weekStats).toHaveProperty("upcomingTasks");
    expect(result.current.weekStats).toHaveProperty("pendingTasks");
    expect(result.current.weekStats).toHaveProperty("completedTasks");
    expect(result.current.weekStats).toHaveProperty("weekNumber");
    expect(result.current.weekStats).toHaveProperty("tasksPerList");
  });

  it("handles empty tasks array", () => {
    const { result } = renderHook(() =>
      useDashboardCharts({
        accessibleTasks: [],
        accessibleLists: mockLists,
      }),
    );

    expect(result.current.priorityChartData).toEqual([]);
    expect(result.current.progressChartData).toEqual([]);
    expect(result.current.weekStats.upcomingTasks).toBe(0);
  });

  it("handles empty lists array", () => {
    const { result } = renderHook(() =>
      useDashboardCharts({
        accessibleTasks: mockTasks,
        accessibleLists: [],
      }),
    );

    expect(result.current.tasksPerListData).toEqual([]);
  });

  it("counts tasks by priority correctly", () => {
    const { result } = renderHook(() =>
      useDashboardCharts({
        accessibleTasks: mockTasks,
        accessibleLists: mockLists,
      }),
    );

    const highPriority = result.current.priorityChartData.find(
      (d) => d.name === "tasks.priority.HIGH",
    );
    expect(highPriority?.value).toBe(1);
  });

  it("groups tasks by list correctly", () => {
    const { result } = renderHook(() =>
      useDashboardCharts({
        accessibleTasks: mockTasks,
        accessibleLists: mockLists,
      }),
    );

    const list1Data = result.current.tasksPerListData.find(
      (d) => d.status === "List 1",
    );
    expect(list1Data?.count).toBe(2);
  });
});
