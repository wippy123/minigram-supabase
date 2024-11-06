"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { AnalyticsData, CountryData } from "@/app/analytics/page";

interface OverviewProps {
  formattedData: AnalyticsData[];
  countryData: CountryData[];
}

export function Overview({ formattedData, countryData }: OverviewProps) {
  return (
    <div className="h-full flex flex-col gap-4">
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={formattedData}
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
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        <div className="h-[200px] w-full">
          <ComposableMap projectionConfig={{ scale: 100 }}>
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
        <div className="mt-2 space-y-1 flex-1 overflow-y-auto">
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
      </div>
    </div>
  );
}
