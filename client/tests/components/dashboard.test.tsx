import DashboardPage from "@/pages/authenticated/dashboardPage";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { I18nTestProvider } from "../testUtils/i18nTestProvider";

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: { name: "Tomás" } }),
}));
vi.mock("@/hooks/useTasks", () => ({
  useTasks: () => ({ accessibleTasks: [], fetchAllTasks: vi.fn() }),
}));
vi.mock("@/hooks/useLists", () => ({
  useLists: () => ({ accessibleLists: [], fetchAllLists: vi.fn() }),
}));
vi.mock("@/hooks/useDashboardCharts", () => ({
  useDashboardCharts: () => ({
    priorityChartData: [],
    priorityChartConfig: {},
    progressChartData: [],
    progressChartConfig: {},
    weeklyTasksData: [],
    weeklyTasksConfig: {},
    weekStats: {
      pendingTasks: 2,
      completedTasks: 1,
      upcomingTasks: 3,
      weekNumber: "Semana 48",
      tasksPerList: [
        { listName: "Personal", count: 2 },
        { listName: "Trabajo", count: 1 },
      ],
    },
  }),
}));

describe("DashboardPage", () => {
  it("Muestra el nombre del usuario en el dashboard", () => {
    render(
      <I18nTestProvider>
        <DashboardPage />
      </I18nTestProvider>,
    );
    expect(screen.getByText(/¡Bienvenido, Tomás/i)).toBeInTheDocument();
  });

  it("Muestra las tarjetas de tareas con los datos correctos", () => {
    render(
      <I18nTestProvider>
        <DashboardPage />
      </I18nTestProvider>,
    );
    expect(screen.getByText(/Próximas Tareas/i)).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText(/Tareas Completadas/i)).toBeInTheDocument();
  });

  it("Muestra el detalle de tareas por lista", () => {
    render(
      <I18nTestProvider>
        <DashboardPage />
      </I18nTestProvider>,
    );
    expect(screen.getByText(/Personal/i)).toBeInTheDocument();
    expect(screen.getByText(/Trabajo/i)).toBeInTheDocument();
  });

  it("Muestra el número de semana", () => {
    render(
      <I18nTestProvider>
        <DashboardPage />
      </I18nTestProvider>,
    );
    expect(screen.getByText(/Semana 48/i)).toBeInTheDocument();
  });
});
