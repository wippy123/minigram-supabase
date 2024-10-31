"use client";

import { useEffect, useState } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";

interface AnalyticsData {
  date: string;
  views: number;
}

interface CountryData {
  id: string;
  value: number;
}

interface CountryInsight {
  data: number[];
  label: string;
  count: number;
  breakdown_value: string[];
}

interface PostHogResponse {
  pageviews: {
    result: Array<{
      data: number[];
      days: string[];
    }>;
  };
  countryInsights: CountryInsight[];
}

export function Overview() {
  const [data, setData] = useState<AnalyticsData[]>([]);
  const [countryData, setCountryData] = useState<CountryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await fetch("/api/analytics/overview");
        if (!response.ok) {
          throw new Error("Failed to fetch analytics data");
        }

        const result: PostHogResponse = await response.json();

        // Transform pageview data
        const pageviewData = result.pageviews.result[0];
        const formattedData = pageviewData.data.map((value, index) => ({
          date: format(new Date(pageviewData.days[index]), "MMM d"),
          views: value,
        }));

        // Transform country data from new format
        const countryData = result.countryInsights.map((insight) => ({
          id: insight.label,
          value: insight.count,
        }));

        setData(formattedData);
        setCountryData(countryData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  if (error) {
    return (
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Analytics Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[350px] text-red-500">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Analytics Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Total Views</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart
              data={data}
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

      <Card className="col-span-4">
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
    </>
  );
}
