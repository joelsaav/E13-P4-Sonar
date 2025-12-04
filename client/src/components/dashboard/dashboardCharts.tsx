import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Bar, BarChart, Pie, PieChart, Cell, XAxis, YAxis } from "recharts";
import { useTranslation } from "react-i18next";

// Constante para el radio de las barras
const BAR_RADIUS = 8;

interface ChartDataItem {
  [key: string]: string | number;
}

interface PriorityChartProps {
  data: ChartDataItem[];
  config: Record<string, { label?: string; color?: string }>;
}

export function PriorityChart({ data, config }: PriorityChartProps) {
  const { t } = useTranslation();

  if (data.length === 0) {
    return (
      <div className="h-[250px] w-full flex items-center justify-center">
        <p className="text-sm text-muted-foreground">
          {t("dashboard.noTasks")}
        </p>
      </div>
    );
  }

  return (
    <ChartContainer config={config} className="h-[250px] w-full">
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          strokeWidth={2}
          label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {data.map((entry, idx) => (
            <Cell key={`cell-${idx}`} fill={entry.fill as string} />
          ))}
        </Pie>
        <ChartLegend content={<ChartLegendContent />} />
      </PieChart>
    </ChartContainer>
  );
}

interface WeeklyTasksChartProps {
  data: ChartDataItem[];
  config: Record<string, { label?: string; color?: string }>;
}

export function WeeklyTasksChart({ data, config }: WeeklyTasksChartProps) {
  const CustomBar = (props: {
    fill?: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    payload?: ChartDataItem;
    dataKey?: string;
  }) => {
    const {
      fill,
      x = 0,
      y = 0,
      width = 0,
      height = 0,
      payload,
      dataKey,
    } = props;

    if (height <= 0 || !payload || !dataKey) return null;

    const values = {
      pending: (payload.pending as number) || 0,
      inProgress: (payload.inProgress as number) || 0,
      completed: (payload.completed as number) || 0,
    };

    const keysWithValue = (
      Object.keys(values) as Array<keyof typeof values>
    ).filter((k) => values[k] > 0);

    const isOnly = keysWithValue.length === 1;
    const isFirst = keysWithValue[0] === dataKey;
    const isLast = keysWithValue[keysWithValue.length - 1] === dataKey;

    // Determinar tipo de radius
    if (!isFirst && !isLast) {
      return <rect x={x} y={y} width={width} height={height} fill={fill} />;
    }

    if (isOnly) {
      return (
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={fill}
          rx={BAR_RADIUS}
        />
      );
    }

    const r = BAR_RADIUS;
    if (isFirst) {
      return (
        <path
          d={`M${x},${y} L${x + width},${y} L${x + width},${y + height - r} 
              Q${x + width},${y + height} ${x + width - r},${y + height} 
              L${x + r},${y + height} Q${x},${y + height} ${x},${y + height - r} Z`}
          fill={fill}
        />
      );
    }

    return (
      <path
        d={`M${x},${y + r} Q${x},${y} ${x + r},${y} L${x + width - r},${y} 
            Q${x + width},${y} ${x + width},${y + r} L${x + width},${y + height} 
            L${x},${y + height} Z`}
        fill={fill}
      />
    );
  };

  const CustomLabel = (props: {
    x?: number;
    y?: number;
    width?: number;
    index?: number;
  }) => {
    const { x = 0, y = 0, width = 0, index } = props;
    if (index === undefined || !data[index]) return null;

    const total = ["pending", "inProgress", "completed"].reduce(
      (sum, key) => sum + ((data[index][key] as number) || 0),
      0,
    );

    return total > 0 ? (
      <text
        x={x + width / 2}
        y={y - 5}
        fill="currentColor"
        textAnchor="middle"
        fontSize={12}
        fontWeight="bold"
      >
        {total}
      </text>
    ) : null;
  };

  return (
    <ChartContainer config={config} className="h-[250px] w-full">
      <BarChart
        data={data}
        margin={{ top: 20, right: 20, left: 20, bottom: 5 }}
      >
        <XAxis
          dataKey="day"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          fontSize={12}
        />
        <ChartTooltip
          content={<ChartTooltipContent />}
          cursor={{ fill: "rgba(255, 255, 255, 0.1)" }}
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar
          dataKey="pending"
          stackId="a"
          fill={config.pending?.color || "#6b7280"}
          shape={<CustomBar dataKey="pending" />}
          maxBarSize={60}
        />
        <Bar
          dataKey="inProgress"
          stackId="a"
          fill={config.inProgress?.color || "#3b82f6"}
          shape={<CustomBar dataKey="inProgress" />}
          maxBarSize={60}
        />
        <Bar
          dataKey="completed"
          stackId="a"
          fill={config.completed?.color || "#15803d"}
          shape={<CustomBar dataKey="completed" />}
          label={<CustomLabel />}
          maxBarSize={60}
        />
      </BarChart>
    </ChartContainer>
  );
}
interface ProgressChartProps {
  data: ChartDataItem[];
  config: Record<string, { label?: string }>;
}

export function ProgressChart({ data, config }: ProgressChartProps) {
  const { t } = useTranslation();
  const totalTasks = data.reduce(
    (sum, item) => sum + (item.count as number),
    0,
  );

  if (totalTasks === 0) {
    return (
      <div className="h-[250px] w-full flex items-center justify-center">
        <p className="text-sm text-muted-foreground">
          {t("dashboard.noTasks")}
        </p>
      </div>
    );
  }

  return (
    <ChartContainer config={config} className="h-[250px] w-full">
      <BarChart data={data} layout="vertical">
        <XAxis type="number" hide />
        <YAxis
          dataKey="status"
          type="category"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          width={120}
          fontSize={12}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar
          dataKey="count"
          radius={BAR_RADIUS}
          label={{ position: "right", fontSize: 12, fontWeight: "bold" }}
        >
          {data.map((entry, idx) => (
            <Cell
              key={`cell-${idx}`}
              fill={entry.fill ? (entry.fill as string) : "#fff"}
            />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
