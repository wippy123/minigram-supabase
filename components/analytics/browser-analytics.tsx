"use client";

import { Card } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface BrowserInsight {
  count: number;
  label: string;
  breakdown_value: string[];
}

interface BrowserAnalyticsProps {
  insights: BrowserInsight[];
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export function BrowserAnalytics({ insights }: BrowserAnalyticsProps) {
  // Aggregate data by browser and device type
  const browserData = insights.reduce(
    (acc, insight) => {
      const [browser, deviceType] = insight.breakdown_value;

      // Add to browser stats
      if (!acc.browsers[browser]) {
        acc.browsers[browser] = 0;
      }
      acc.browsers[browser] += insight.count;

      // Add to device type stats
      if (!acc.devices[deviceType]) {
        acc.devices[deviceType] = 0;
      }
      acc.devices[deviceType] += insight.count;

      return acc;
    },
    { browsers: {}, devices: {} } as {
      browsers: Record<string, number>;
      devices: Record<string, number>;
    }
  );

  // Transform data for charts
  const browserChartData = Object.entries(browserData.browsers).map(
    ([name, value]) => ({
      name,
      value,
    })
  );

  const deviceChartData = Object.entries(browserData.devices).map(
    ([name, value]) => ({
      name,
      value,
    })
  );

  return (
    <div className="w-full space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="h-[300px]">
          <h3 className="text-sm font-medium mb-2">Browsers</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={browserChartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {browserChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="h-[300px]">
          <h3 className="text-sm font-medium mb-2">Device Types</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={deviceChartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {deviceChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
