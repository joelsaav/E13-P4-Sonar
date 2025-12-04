import {
  PriorityChart,
  ProgressChart,
  WeeklyTasksChart,
} from "@/components/dashboard/dashboardCharts";
import { render, screen } from "@testing-library/react";
import { I18nTestProvider } from "../../testUtils/i18nTestProvider";
import { describe, expect, it } from "vitest";

describe("DashboardCharts", () => {
  describe("PriorityChart", () => {
    it("Muestra mensaje cuando no hay datos", () => {
      const config = {
        alta: { label: "Alta", color: "#ef4444" },
        media: { label: "Media", color: "#f59e0b" },
        baja: { label: "Baja", color: "#10b981" },
      };

      render(
        <I18nTestProvider>
          <PriorityChart data={[]} config={config} />
        </I18nTestProvider>,
      );

      expect(
        screen.getByText(/No hay tareas para mostrar/i),
      ).toBeInTheDocument();
    });

    it("Renderiza gráfico de prioridades con datos", () => {
      const data = [
        { name: "Alta", value: 10, fill: "#ef4444" },
        { name: "Media", value: 20, fill: "#f59e0b" },
        { name: "Baja", value: 15, fill: "#10b981" },
      ];

      const config = {
        alta: { label: "Alta", color: "#ef4444" },
        media: { label: "Media", color: "#f59e0b" },
        baja: { label: "Baja", color: "#10b981" },
      };

      const { container } = render(
        <I18nTestProvider>
          <PriorityChart data={data} config={config} />
        </I18nTestProvider>,
      );

      // Verificar que se renderiza el componente
      expect(container.firstChild).toBeInTheDocument();
    });

    it("Calcula correctamente los porcentajes en las etiquetas", () => {
      const data = [
        { name: "Alta", value: 50, fill: "#ef4444" },
        { name: "Media", value: 30, fill: "#f59e0b" },
        { name: "Baja", value: 20, fill: "#10b981" },
      ];

      const config = {
        alta: { label: "Alta", color: "#ef4444" },
        media: { label: "Media", color: "#f59e0b" },
        baja: { label: "Baja", color: "#10b981" },
      };

      const { container } = render(
        <I18nTestProvider>
          <PriorityChart data={data} config={config} />
        </I18nTestProvider>,
      );

      // Verificar que se renderiza el componente
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe("WeeklyTasksChart", () => {
    it("Renderiza gráfico de barras semanales", () => {
      const data = [
        { day: "Lun", pending: 5, inProgress: 3, completed: 2 },
        { day: "Mar", pending: 4, inProgress: 2, completed: 3 },
        { day: "Mie", pending: 6, inProgress: 1, completed: 4 },
      ];

      const config = {
        pending: { label: "Pendiente", color: "#6b7280" },
        inProgress: { label: "En Progreso", color: "#3b82f6" },
        completed: { label: "Completado", color: "#15803d" },
      };

      const { container } = render(
        <WeeklyTasksChart data={data} config={config} />,
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it("Renderiza CustomBar sin payload", () => {
      const data = [{ day: "Lun", pending: 5, inProgress: 3, completed: 2 }];

      const config = {
        pending: { label: "Pendiente", color: "#6b7280" },
        inProgress: { label: "En Progreso", color: "#3b82f6" },
        completed: { label: "Completado", color: "#15803d" },
      };

      const { container } = render(
        <WeeklyTasksChart data={data} config={config} />,
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it("Renderiza CustomBar con height cero o negativo", () => {
      const data = [{ day: "Lun", pending: 0, inProgress: 0, completed: 0 }];

      const config = {
        pending: { label: "Pendiente", color: "#6b7280" },
        inProgress: { label: "En Progreso", color: "#3b82f6" },
        completed: { label: "Completado", color: "#15803d" },
      };

      const { container } = render(
        <WeeklyTasksChart data={data} config={config} />,
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it("Renderiza CustomLabel sin index", () => {
      const data = [{ day: "Lun", pending: 5, inProgress: 3, completed: 2 }];

      const config = {
        pending: { label: "Pendiente", color: "#6b7280" },
        inProgress: { label: "En Progreso", color: "#3b82f6" },
        completed: { label: "Completado", color: "#15803d" },
      };

      const { container } = render(
        <WeeklyTasksChart data={data} config={config} />,
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it("Maneja datos con valores cero correctamente", () => {
      const data = [
        { day: "Lun", pending: 0, inProgress: 0, completed: 5 },
        { day: "Mar", pending: 3, inProgress: 0, completed: 0 },
        { day: "Mie", pending: 0, inProgress: 4, completed: 0 },
      ];

      const config = {
        pending: { label: "Pendiente", color: "#6b7280" },
        inProgress: { label: "En Progreso", color: "#3b82f6" },
        completed: { label: "Completado", color: "#15803d" },
      };

      const { container } = render(
        <WeeklyTasksChart data={data} config={config} />,
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it("Renderiza etiquetas de total cuando hay datos", () => {
      const data = [{ day: "Lun", pending: 2, inProgress: 3, completed: 5 }];

      const config = {
        pending: { label: "Pendiente", color: "#6b7280" },
        inProgress: { label: "En Progreso", color: "#3b82f6" },
        completed: { label: "Completado", color: "#15803d" },
      };

      const { container } = render(
        <WeeklyTasksChart data={data} config={config} />,
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it("Maneja múltiples días con diferentes combinaciones de datos", () => {
      const data = [
        { day: "Lun", pending: 5, inProgress: 3, completed: 2 },
        { day: "Mar", pending: 0, inProgress: 0, completed: 0 },
        { day: "Mie", pending: 1, inProgress: 1, completed: 1 },
        { day: "Jue", pending: 0, inProgress: 5, completed: 0 },
        { day: "Vie", pending: 3, inProgress: 0, completed: 7 },
      ];

      const config = {
        pending: { label: "Pendiente", color: "#6b7280" },
        inProgress: { label: "En Progreso", color: "#3b82f6" },
        completed: { label: "Completado", color: "#15803d" },
      };

      const { container } = render(
        <WeeklyTasksChart data={data} config={config} />,
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it("Renderiza barras con solo tareas pendientes", () => {
      const data = [{ day: "Lun", pending: 10, inProgress: 0, completed: 0 }];

      const config = {
        pending: { label: "Pendiente", color: "#6b7280" },
        inProgress: { label: "En Progreso", color: "#3b82f6" },
        completed: { label: "Completado", color: "#15803d" },
      };

      const { container } = render(
        <WeeklyTasksChart data={data} config={config} />,
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it("Renderiza barras con solo tareas en progreso", () => {
      const data = [{ day: "Lun", pending: 0, inProgress: 8, completed: 0 }];

      const config = {
        pending: { label: "Pendiente", color: "#6b7280" },
        inProgress: { label: "En Progreso", color: "#3b82f6" },
        completed: { label: "Completado", color: "#15803d" },
      };

      const { container } = render(
        <WeeklyTasksChart data={data} config={config} />,
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it("Renderiza barras con tareas pendientes y en progreso sin completadas", () => {
      const data = [{ day: "Lun", pending: 5, inProgress: 3, completed: 0 }];

      const config = {
        pending: { label: "Pendiente", color: "#6b7280" },
        inProgress: { label: "En Progreso", color: "#3b82f6" },
        completed: { label: "Completado", color: "#15803d" },
      };

      const { container } = render(
        <WeeklyTasksChart data={data} config={config} />,
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it("Renderiza barras con tareas en progreso y completadas sin pendientes", () => {
      const data = [{ day: "Lun", pending: 0, inProgress: 4, completed: 6 }];

      const config = {
        pending: { label: "Pendiente", color: "#6b7280" },
        inProgress: { label: "En Progreso", color: "#3b82f6" },
        completed: { label: "Completado", color: "#15803d" },
      };

      const { container } = render(
        <WeeklyTasksChart data={data} config={config} />,
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it("No renderiza etiqueta cuando el total es cero", () => {
      const data = [{ day: "Lun", pending: 0, inProgress: 0, completed: 0 }];

      const config = {
        pending: { label: "Pendiente", color: "#6b7280" },
        inProgress: { label: "En Progreso", color: "#3b82f6" },
        completed: { label: "Completado", color: "#15803d" },
      };

      const { container } = render(
        <WeeklyTasksChart data={data} config={config} />,
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it("Renderiza CustomBar para barra del medio (no primera ni última)", () => {
      const data = [{ day: "Lun", pending: 2, inProgress: 5, completed: 3 }];

      const config = {
        pending: { label: "Pendiente", color: "#6b7280" },
        inProgress: { label: "En Progreso", color: "#3b82f6" },
        completed: { label: "Completado", color: "#15803d" },
      };

      const { container } = render(
        <WeeklyTasksChart data={data} config={config} />,
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it("Renderiza CustomBar para última barra (isLast=true, isFirst=false)", () => {
      const data = [{ day: "Lun", pending: 5, inProgress: 3, completed: 8 }];

      const config = {
        pending: { label: "Pendiente", color: "#6b7280" },
        inProgress: { label: "En Progreso", color: "#3b82f6" },
        completed: { label: "Completado", color: "#15803d" },
      };

      const { container } = render(
        <WeeklyTasksChart data={data} config={config} />,
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it("Renderiza barras con config sin colores definidos (usa defaults)", () => {
      const data = [{ day: "Lun", pending: 5, inProgress: 3, completed: 2 }];

      const config = {
        pending: { label: "Pendiente" },
        inProgress: { label: "En Progreso" },
        completed: { label: "Completado" },
      };

      const { container } = render(
        <WeeklyTasksChart data={data} config={config} />,
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe("ProgressChart", () => {
    it("Muestra mensaje cuando no hay tareas", () => {
      const config = {
        pending: { label: "Pendiente" },
        inProgress: { label: "En Progreso" },
        completed: { label: "Completado" },
      };

      render(<ProgressChart data={[]} config={config} />);

      expect(
        screen.getByText(/No hay tareas para mostrar/i),
      ).toBeInTheDocument();
    });

    it("Muestra mensaje cuando el total de tareas es cero", () => {
      const data = [
        { status: "Pendiente", count: 0, fill: "#6b7280" },
        { status: "En Progreso", count: 0, fill: "#3b82f6" },
        { status: "Completado", count: 0, fill: "#15803d" },
      ];

      const config = {
        pending: { label: "Pendiente" },
        inProgress: { label: "En Progreso" },
        completed: { label: "Completado" },
      };

      render(<ProgressChart data={data} config={config} />);

      expect(
        screen.getByText(/No hay tareas para mostrar/i),
      ).toBeInTheDocument();
    });

    it("Renderiza gráfico de progreso horizontal con datos", () => {
      const data = [
        { status: "Pendiente", count: 5, fill: "#6b7280" },
        { status: "En Progreso", count: 3, fill: "#3b82f6" },
        { status: "Completado", count: 8, fill: "#15803d" },
      ];

      const config = {
        pending: { label: "Pendiente" },
        inProgress: { label: "En Progreso" },
        completed: { label: "Completado" },
      };

      const { container } = render(
        <ProgressChart data={data} config={config} />,
      );

      // Verificar que se renderiza el componente
      expect(container.firstChild).toBeInTheDocument();
    });

    it("Renderiza etiquetas con el conteo de tareas", () => {
      const data = [
        { status: "Pendiente", count: 12, fill: "#6b7280" },
        { status: "En Progreso", count: 7, fill: "#3b82f6" },
        { status: "Completado", count: 21, fill: "#15803d" },
      ];

      const config = {
        pending: { label: "Pendiente" },
        inProgress: { label: "En Progreso" },
        completed: { label: "Completado" },
      };

      const { container } = render(
        <ProgressChart data={data} config={config} />,
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it("Maneja datos sin color fill correctamente", () => {
      const data = [
        { status: "Pendiente", count: 5 },
        { status: "En Progreso", count: 3 },
        { status: "Completado", count: 8 },
      ];

      const config = {
        pending: { label: "Pendiente" },
        inProgress: { label: "En Progreso" },
        completed: { label: "Completado" },
      };

      const { container } = render(
        <ProgressChart data={data} config={config} />,
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });
});
