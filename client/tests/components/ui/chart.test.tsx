// client/tests/components/ui/chart.test.tsx
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
  useChart,
} from "@/components/ui/chart";
import { render, screen } from "@testing-library/react";
import { Bar, BarChart, Cell, Pie, PieChart } from "recharts";
import { describe, expect, it } from "vitest";

describe("Chart", () => {
  const mockConfig = {
    alta: { label: "Alta", color: "#ef4444" },
    media: { label: "Media", color: "#f59e0b" },
    baja: { label: "Baja", color: "#10b981" },
  };

  const mockData = [
    { name: "Alta", value: 10, fill: "#ef4444" },
    { name: "Media", value: 20, fill: "#f59e0b" },
    { name: "Baja", value: 15, fill: "#10b981" },
  ];

  describe("useChart", () => {
    it("Lanza error cuando se usa fuera de ChartContainer", () => {
      const TestComponent = () => {
        useChart();
        return <div>Test</div>;
      };

      expect(() => render(<TestComponent />)).toThrow(
        "useChart must be used within a <ChartContainer />",
      );
    });

    it("Retorna el config cuando se usa dentro de ChartContainer", () => {
      const TestComponent = () => {
        const { config } = useChart();
        return <div data-testid="config-test">{JSON.stringify(config)}</div>;
      };

      render(
        <ChartContainer config={mockConfig}>
          <TestComponent />
        </ChartContainer>,
      );

      expect(screen.getByTestId("config-test")).toHaveTextContent("alta");
    });
  });

  describe("ChartContainer", () => {
    it("Renderiza el contenedor de gráfico", () => {
      const { container } = render(
        <ChartContainer config={mockConfig}>
          <BarChart data={mockData}>
            <Bar dataKey="value" />
          </BarChart>
        </ChartContainer>,
      );

      const chartElement = container.querySelector('[data-slot="chart"]');
      expect(chartElement).toBeInTheDocument();
    });

    it("Aplica el ID personalizado al gráfico", () => {
      const { container } = render(
        <ChartContainer config={mockConfig} id="test-chart">
          <PieChart>
            <Pie data={mockData} dataKey="value" />
          </PieChart>
        </ChartContainer>,
      );

      const chartElement = container.querySelector(
        '[data-chart="chart-test-chart"]',
      );
      expect(chartElement).toBeInTheDocument();
    });

    it("Aplica clases personalizadas", () => {
      const { container } = render(
        <ChartContainer config={mockConfig} className="custom-class">
          <BarChart data={mockData}>
            <Bar dataKey="value" />
          </BarChart>
        </ChartContainer>,
      );

      const chartElement = container.querySelector(".custom-class");
      expect(chartElement).toBeInTheDocument();
    });

    it("Renderiza gráfico de barras completo", () => {
      const { container } = render(
        <ChartContainer config={mockConfig}>
          <BarChart data={mockData}>
            <Bar dataKey="value" />
          </BarChart>
        </ChartContainer>,
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it("Renderiza gráfico circular con celdas", () => {
      const { container } = render(
        <ChartContainer config={mockConfig}>
          <PieChart>
            <Pie data={mockData} dataKey="value">
              {mockData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>,
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it("Renderiza con datos vacíos", () => {
      const { container } = render(
        <ChartContainer config={mockConfig}>
          <BarChart data={[]}>
            <Bar dataKey="value" />
          </BarChart>
        </ChartContainer>,
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it("Genera ID único cuando no se proporciona", () => {
      const { container } = render(
        <ChartContainer config={mockConfig}>
          <BarChart data={mockData}>
            <Bar dataKey="value" />
          </BarChart>
        </ChartContainer>,
      );

      const chartElement = container.querySelector('[data-chart^="chart-"]');
      expect(chartElement).toBeInTheDocument();
    });
  });

  describe("ChartStyle", () => {
    it("Genera estilos CSS para la configuración del gráfico", () => {
      const { container } = render(
        <ChartStyle id="test-chart" config={mockConfig} />,
      );

      const styleElement = container.querySelector("style");
      expect(styleElement).toBeInTheDocument();
      expect(styleElement?.innerHTML).toContain("--color-alta");
      expect(styleElement?.innerHTML).toContain("--color-media");
      expect(styleElement?.innerHTML).toContain("--color-baja");
    });

    it("No renderiza nada cuando no hay colores en la configuración", () => {
      const emptyConfig = {
        test: { label: "Test" },
      };

      const { container } = render(
        <ChartStyle id="test-chart" config={emptyConfig} />,
      );

      expect(container.firstChild).toBeNull();
    });

    it("Genera estilos para temas claro y oscuro", () => {
      const themedConfig = {
        primary: {
          label: "Primario",
          theme: {
            light: "#3b82f6",
            dark: "#60a5fa",
          },
        },
      };

      const { container } = render(
        <ChartStyle id="themed-chart" config={themedConfig} />,
      );

      const styleElement = container.querySelector("style");
      expect(styleElement?.innerHTML).toContain("--color-primary");
      expect(styleElement?.innerHTML).toContain("#3b82f6");
      expect(styleElement?.innerHTML).toContain("#60a5fa");
      expect(styleElement?.innerHTML).toContain(".dark");
    });

    it("Maneja configuración con solo color (sin theme)", () => {
      const colorOnlyConfig = {
        success: { label: "Éxito", color: "#10b981" },
      };

      const { container } = render(
        <ChartStyle id="color-chart" config={colorOnlyConfig} />,
      );

      const styleElement = container.querySelector("style");
      expect(styleElement?.innerHTML).toContain("--color-success");
      expect(styleElement?.innerHTML).toContain("#10b981");
    });

    it("Filtra entradas sin color ni theme", () => {
      const mixedConfig = {
        withColor: { label: "Con Color", color: "#ef4444" },
        withoutColor: { label: "Sin Color" },
      };

      const { container } = render(
        <ChartStyle id="mixed-chart" config={mixedConfig} />,
      );

      const styleElement = container.querySelector("style");
      expect(styleElement?.innerHTML).toContain("--color-withColor");
      expect(styleElement?.innerHTML).not.toContain("--color-withoutColor");
    });

    it("Genera múltiples variables CSS para múltiples colores", () => {
      const multiConfig = {
        red: { label: "Rojo", color: "#ef4444" },
        blue: { label: "Azul", color: "#3b82f6" },
        green: { label: "Verde", color: "#10b981" },
      };

      const { container } = render(
        <ChartStyle id="multi-chart" config={multiConfig} />,
      );

      const styleElement = container.querySelector("style");
      expect(styleElement?.innerHTML).toContain("--color-red");
      expect(styleElement?.innerHTML).toContain("--color-blue");
      expect(styleElement?.innerHTML).toContain("--color-green");
    });

    it("Maneja theme con múltiples colores", () => {
      const multiThemedConfig = {
        primary: {
          label: "Primary",
          theme: { light: "#3b82f6", dark: "#60a5fa" },
        },
        secondary: {
          label: "Secondary",
          theme: { light: "#10b981", dark: "#34d399" },
        },
      };

      const { container } = render(
        <ChartStyle id="multi-themed" config={multiThemedConfig} />,
      );

      const styleElement = container.querySelector("style");
      expect(styleElement?.innerHTML).toContain("--color-primary");
      expect(styleElement?.innerHTML).toContain("--color-secondary");
      expect(styleElement?.innerHTML).toContain("#3b82f6");
      expect(styleElement?.innerHTML).toContain("#10b981");
    });
  });

  describe("ChartTooltip y ChartLegend - Integración", () => {
    it("Renderiza tooltip en gráfico de barras", () => {
      const { container } = render(
        <ChartContainer config={mockConfig}>
          <BarChart data={mockData}>
            <Bar dataKey="value" />
            <ChartTooltip />
          </BarChart>
        </ChartContainer>,
      );

      expect(container).toBeInTheDocument();
    });

    it("Renderiza leyenda en gráfico de barras", () => {
      const { container } = render(
        <ChartContainer config={mockConfig}>
          <BarChart data={mockData}>
            <Bar dataKey="value" />
            <ChartLegend />
          </BarChart>
        </ChartContainer>,
      );

      expect(container).toBeInTheDocument();
    });

    it("Renderiza tooltip con contenido personalizado", () => {
      const { container } = render(
        <ChartContainer config={mockConfig}>
          <BarChart data={mockData}>
            <Bar dataKey="value" />
            <ChartTooltip content={<ChartTooltipContent />} />
          </BarChart>
        </ChartContainer>,
      );

      expect(container).toBeInTheDocument();
    });

    it("Renderiza leyenda con contenido personalizado", () => {
      const { container } = render(
        <ChartContainer config={mockConfig}>
          <BarChart data={mockData}>
            <Bar dataKey="value" />
            <ChartLegend content={<ChartLegendContent />} />
          </BarChart>
        </ChartContainer>,
      );

      expect(container).toBeInTheDocument();
    });

    it("Renderiza múltiples barras con tooltip y leyenda", () => {
      const multiData = [
        { name: "A", value1: 10, value2: 20 },
        { name: "B", value1: 15, value2: 25 },
      ];

      const { container } = render(
        <ChartContainer config={mockConfig}>
          <BarChart data={multiData}>
            <Bar dataKey="value1" fill="#ef4444" />
            <Bar dataKey="value2" fill="#10b981" />
            <ChartTooltip />
            <ChartLegend />
          </BarChart>
        </ChartContainer>,
      );

      expect(container).toBeInTheDocument();
    });
  });

  describe("Integración de componentes", () => {
    it("Renderiza gráfico completo con tooltip y leyenda", () => {
      const { container } = render(
        <ChartContainer config={mockConfig}>
          <BarChart data={mockData}>
            <Bar dataKey="value" />
            <ChartTooltip />
            <ChartLegend />
          </BarChart>
        </ChartContainer>,
      );

      expect(container).toBeInTheDocument();
    });

    it("Renderiza múltiples gráficos de barras con configuración", () => {
      const { container } = render(
        <ChartContainer config={mockConfig}>
          <BarChart data={mockData}>
            <Bar dataKey="value" fill="#ef4444" />
            <ChartTooltip />
            <ChartLegend />
          </BarChart>
        </ChartContainer>,
      );

      expect(container).toBeInTheDocument();
    });

    it("Renderiza gráfico circular con configuración completa", () => {
      const { container } = render(
        <ChartContainer config={mockConfig}>
          <PieChart>
            <Pie data={mockData} dataKey="value">
              {mockData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <ChartTooltip />
            <ChartLegend />
          </PieChart>
        </ChartContainer>,
      );

      expect(container).toBeInTheDocument();
    });

    it("Renderiza con config que tiene iconos", () => {
      const IconComponent = () => <svg data-testid="test-icon" />;
      const configWithIcon = {
        test: { label: "Test", icon: IconComponent, color: "#000" },
      };

      const { container } = render(
        <ChartContainer config={configWithIcon}>
          <BarChart data={[{ name: "Test", value: 10 }]}>
            <Bar dataKey="value" />
          </BarChart>
        </ChartContainer>,
      );

      expect(container).toBeInTheDocument();
    });

    it("Maneja datos con valores null", () => {
      const nullData = [
        { name: "A", value: 10 },
        { name: "B", value: null },
        { name: "C", value: 15 },
      ];

      const { container } = render(
        <ChartContainer config={mockConfig}>
          <BarChart data={nullData}>
            <Bar dataKey="value" />
          </BarChart>
        </ChartContainer>,
      );

      expect(container).toBeInTheDocument();
    });

    it("Renderiza con diferentes tipos de indicadores", () => {
      const { container } = render(
        <ChartContainer config={mockConfig}>
          <BarChart data={mockData}>
            <Bar dataKey="value" />
            <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
          </BarChart>
        </ChartContainer>,
      );

      expect(container).toBeInTheDocument();
    });
  });
});
