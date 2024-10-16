import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
}

export function MetricCard({ title, value, change }: MetricCardProps) {
  const isPositive = change.startsWith("+");

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {isPositive ? (
          <ArrowUpIcon className="h-4 w-4 text-green-500" />
        ) : (
          <ArrowDownIcon className="h-4 w-4 text-red-500" />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p
          className={`text-xs ${isPositive ? "text-green-500" : "text-red-500"}`}
        >
          {change}
        </p>
      </CardContent>
    </Card>
  );
}
