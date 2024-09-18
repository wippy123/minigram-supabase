"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
} from "chart.js";
import { Pie, Line, Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement
);

const generateRandomData = (count: number) =>
  Array.from({ length: count }, () => Math.floor(Math.random() * 100));
const generateRandomColors = (count: number) =>
  Array.from(
    { length: count },
    () =>
      `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.6)`
  );

export default function HomePage() {
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    const labels = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
    ];
    const datasets = [
      {
        label: "Dataset 1",
        data: generateRandomData(7),
        backgroundColor: generateRandomColors(7),
        borderColor: "rgba(255, 255, 255, 1)",
        borderWidth: 1,
      },
    ];

    setChartData({
      labels,
      datasets,
    });
  }, []);

  if (!chartData) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pie Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <Pie data={chartData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Line Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <Line data={chartData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bar Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <Bar data={chartData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Doughnut Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <Doughnut data={chartData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
