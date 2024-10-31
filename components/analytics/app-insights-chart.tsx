"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
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

function processData(insights: AppInsight[]) {
  // Get top 5 apps by total count
  const topApps = [...insights]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((app) => ({
      name: app.label.replace(/^https?:\/\//, "").replace(/\..*$/, ""),
      value: app.count,
      fullUrl: app.label,
    }));

  return topApps;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border">
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
  if (!insights) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top App Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full flex items-center justify-center">
            <p className="text-muted-foreground">Loading analytics data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Apps Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full flex items-center justify-center">
            <p className="text-muted-foreground">No data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const data = processData(insights);
  const colors = ["#2563eb", "#16a34a", "#dc2626", "#9333ea", "#ea580c"];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Apps Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index % colors.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
