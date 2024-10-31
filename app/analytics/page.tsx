"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Overview } from "@/components/analytics/overview";
import { AppInsightsChart } from "@/components/analytics/app-insights-chart";
import { BrowserAnalytics } from "@/components/analytics/browser-analytics";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

export interface AnalyticsData {
  date: string;
  views: number;
}

export interface CountryData {
  id: string;
  value: number;
}

export interface CountryInsight {
  data: number[];
  label: string;
  count: number;
  breakdown_value: string[];
}

export interface PostHogResponse {
  pageviews: {
    result: Array<{
      data: number[];
      days: string[];
    }>;
  };
  countryInsights: CountryInsight[];
  appInsights: Array<{
    data: number[];
    labels: string[];
    days: string[];
    count: number;
    label: string;
    breakdown_value: string[];
  }>;
  browserInsights: Array<{
    count: number;
    label: string;
    breakdown_value: string[];
  }>;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData[]>([]);
  const [countryData, setCountryData] = useState<CountryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appInsights, setAppInsights] = useState<
    PostHogResponse["appInsights"]
  >([]);
  const [browserInsights, setBrowserInsights] = useState<
    PostHogResponse["browserInsights"]
  >([]);

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
        setAppInsights(result.appInsights);
        setBrowserInsights(result.browserInsights);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  return (
    <>
      <Dialog open={isLoading} modal>
        <DialogContent className="sm:max-w-md flex flex-col items-center p-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-lg font-semibold">
            Loading Analytics Data...
          </p>
        </DialogContent>
      </Dialog>

      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Channel Analytics</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <Overview formattedData={data} countryData={countryData} />
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Browser & Device Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <BrowserAnalytics insights={browserInsights} />
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <AppInsightsChart insights={appInsights} />
        </div>
      </div>
    </>
  );
}
