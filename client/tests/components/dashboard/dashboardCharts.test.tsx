import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  PriorityChart,
  WeeklyTasksChart,
} from "@/components/dashboard/DashboardCharts";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  PieChart: ({ children }: any) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: ({ children }: any) => <div data-testid="pie">{children}</div>,
  Cell: () => <div data-testid="cell" />,
  BarChart: ({ children }: any) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="xaxis" />,
  YAxis: () => <div data-testid="yaxis" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  CartesianGrid: () => <div data-testid="grid" />,
}));

vi.mock("@/components/ui/chart", () => ({
  ChartContainer: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
  ChartTooltip: () => <div />,
  ChartTooltipContent: () => <div />,
  ChartLegend: () => <div />,
  ChartLegendContent: () => <div />,
}));

describe("DashboardCharts", () => {
  const mockConfig = {
    pending: { label: "Pending", color: "yellow" },
    inProgress: { label: "In Progress", color: "blue" },
    completed: { label: "Completed", color: "green" },
  };

  describe("PriorityChart", () => {
    it("renders no tasks message when data is empty", () => {
      render(<PriorityChart data={[]} config={mockConfig} />);
      expect(screen.getByText("dashboard.noTasks")).toBeInTheDocument();
    });

    it("renders chart when data is present", () => {
      const data = [
        { name: "pending", value: 10, fill: "yellow" },
        { name: "completed", value: 5, fill: "green" },
      ];
      render(<PriorityChart data={data} config={mockConfig} />);
      expect(screen.getByTestId("pie-chart")).toBeInTheDocument();
      expect(screen.getByTestId("pie")).toBeInTheDocument();
      expect(screen.getAllByTestId("cell")).toHaveLength(2);
    });
  });

  describe("WeeklyTasksChart", () => {
    it("renders bar chart", () => {
      const data = [
        { day: "Mon", pending: 2, inProgress: 1, completed: 3 },
        { day: "Tue", pending: 0, inProgress: 4, completed: 1 },
      ];
      render(<WeeklyTasksChart data={data} config={mockConfig} />);
      expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
      expect(screen.getAllByTestId("bar")).toHaveLength(3);
      expect(screen.getByTestId("xaxis")).toBeInTheDocument();
    });
  });
});
