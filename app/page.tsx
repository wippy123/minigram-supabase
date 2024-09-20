"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function HomePage() {
  const tasksCompletedData = [
    { name: "Jan", Design: 4, Development: 3, Sales: 2 },
    { name: "Feb", Design: 3, Development: 4, Sales: 4 },
    { name: "Mar", Design: 5, Development: 3, Sales: 3 },
    { name: "Apr", Design: 6, Development: 5, Sales: 4 },
    { name: "May", Design: 4, Development: 4, Sales: 5 },
    { name: "Jun", Design: 7, Development: 6, Sales: 5 },
  ];

  // Updated sample data for Percentage of Tasks by State for each team
  const taskStateData = [
    { name: "Design", Completed: 55, Pending: 30, Overdue: 15 },
    { name: "Development", Completed: 65, Pending: 25, Overdue: 10 },
    { name: "Sales", Completed: 45, Pending: 35, Overdue: 20 },
  ];

  // Updated sample data for Highest Performing Team Members
  const teamMemberPerformanceData = [
    { name: "Alice (Design)", avgCompletionTime: 2.5 },
    { name: "Bob (Development)", avgCompletionTime: 3.2 },
    { name: "Charlie (Sales)", avgCompletionTime: 2.1 },
    { name: "Diana (Design)", avgCompletionTime: 2.8 },
    { name: "Eva (Development)", avgCompletionTime: 1.9 },
  ];

  // New sample data for Overdue Tasks by Team Member
  const overdueTasksData = [
    { name: "Alice", overdueTasks: 3 },
    { name: "Bob", overdueTasks: 5 },
    { name: "Charlie", overdueTasks: 2 },
    { name: "Diana", overdueTasks: 4 },
    { name: "Eva", overdueTasks: 1 },
  ];

  // Custom color palette
  const COLORS = [
    "#E6F3FF", // Lightest blue
    "#CCE7FF",
    "#B3DBFF",
    "#99CFFF",
    "#80C3FF",
    "#66B7FF", // Medium blue
    "#4DABFF",
    "#339FFF",
    "#1A93FF",
    "#0087FF", // Darkest blue
    "#007AE6",
    "#FF8C00", // Dark orange instead of red
    "#4B0082", // Indigo instead of green
    "#FFA500", // Keeping warning (orange)
    "#00BFFF", // Keeping info (light blue)
    "#E6F3FF", // Light blue foreground
    "#0087FF", // Dark blue foreground
    "#CCE7FF", // Light accent foreground
    "#1A93FF", // Dark muted foreground
    "#E6F3FF", // Light popover foreground
    "#0087FF", // Dark card foreground
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tasks Completed by Team</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={tasksCompletedData}>
                <CartesianGrid strokeDasharray="7 7" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Design" stroke={COLORS[7]} />
                <Line type="basis" dataKey="Development" stroke={"#000000"} />
                <Line type="monotone" dataKey="Sales" stroke={"#006400"} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Percentage of Tasks by State (Per Team)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={taskStateData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Completed" stackId="a" fill={COLORS[3]} />{" "}
                {/* Green */}
                <Bar dataKey="Pending" stackId="a" fill={COLORS[4]} />{" "}
                {/* Yellow */}
                <Bar dataKey="Overdue" stackId="a" fill={COLORS[5]} />{" "}
                {/* Red */}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Highest Performing Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={teamMemberPerformanceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip />
                <Bar dataKey="avgCompletionTime" fill={COLORS[6]}>
                  {teamMemberPerformanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index + 6]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Overdue Tasks by Team Member</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={overdueTasksData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="overdueTasks" fill={COLORS[6]}>
                  {overdueTasksData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index + 5]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
