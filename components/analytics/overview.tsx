"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { AnalyticsData } from "@/app/analytics/page";
import { CountryData } from "@/app/analytics/page";

interface OverviewProps {
  formattedData: AnalyticsData[];
  countryData: CountryData[];
}

function formatUTCDate(dateStr: string) {
  const date = new Date(dateStr);
  // Add one day to correct the UTC offset
  date.setDate(date.getDate() + 1);
  return date.toISOString().split("T")[0];
}

export function Overview({ formattedData, countryData }: OverviewProps) {
  // Transform the data to correct UTC dates
  const correctedData = formattedData.map((item) => ({
    ...item,
    date: formatUTCDate(item.date),
  }));

  return (
    <div className="bg-transparent p-0">
      <Card className="col-span-4 border-none p-0">
        <CardHeader>
          <CardTitle>Total Views</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart
              data={correctedData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis
                dataKey="date"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickMargin={10}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
                tickMargin={10}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                  padding: "8px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
                formatter={(value: number) => [`${value} views`, "Page Views"]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="views"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
                activeDot={{
                  r: 6,
                  fill: "hsl(var(--primary))",
                  strokeWidth: 0,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="col-span-4 mt-4 border-none p-0">
        <CardHeader>
          <CardTitle>Geographic Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full">
            <ComposableMap projectionConfig={{ scale: 140 }}>
              <ZoomableGroup>
                <Geographies geography="/world-110m.json">
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      const countryViews = countryData.find(
                        (d) => d.id === geo.properties.name
                      );
                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill={
                            countryViews
                              ? `hsl(var(--primary) / ${Math.min(
                                  0.2 + (countryViews.value / 20) * 0.8,
                                  1
                                )})`
                              : "hsl(var(--muted))"
                          }
                          style={{
                            default: {
                              outline: "none",
                            },
                            hover: {
                              fill: countryViews
                                ? "hsl(var(--primary))"
                                : "hsl(var(--muted))",
                              outline: "none",
                            },
                            pressed: {
                              outline: "none",
                            },
                          }}
                        />
                      );
                    })
                  }
                </Geographies>
              </ZoomableGroup>
            </ComposableMap>
          </div>
          <div className="mt-4 space-y-1">
            {countryData.map((country) => (
              <div
                key={country.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="font-medium">{country.id}</span>
                <span className="text-muted-foreground">
                  {country.value} users
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
