"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface AppInsight {
  data: number[];
  labels: string[];
  days: string[];
  count: number;
  label: string;
  breakdown_value: string[];
}

interface AppInsightsChartProps {
  insights: AppInsight[];
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

function processData(insights: AppInsight[]) {
  return insights
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((app) => ({
      name: app.label.replace(/^https?:\/\//, "").replace(/\..*$/, ""),
      value: app.count,
      fullUrl: app.label,
    }));
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border p-2 rounded-lg shadow-sm">
        <p className="text-sm font-medium">{payload[0].payload.fullUrl}</p>
        <p className="text-sm">
          Views: <span className="font-bold">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

export function AppInsightsChart({ insights }: AppInsightsChartProps) {
  const data = processData(insights);

  if (data.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <p className="text-muted-foreground">No app insights data available</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <XAxis
            type="number"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            width={100}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
