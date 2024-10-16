import React from "react";
import { Home, BarChart2, Users, Settings } from "lucide-react";

const menuItems = [
  { icon: Home, label: "Dashboard" },
  { icon: BarChart2, label: "Analytics" },
  { icon: Users, label: "Team" },
  { icon: Settings, label: "Settings" },
];

export function Sidebar() {
  return (
    <aside className="bg-gray-800 text-white w-64 min-h-screen p-4">
      <nav className="space-y-2">
        {menuItems.map((item, index) => (
          <a
            key={index}
            href="#"
            className="flex items-center space-x-2 p-2 hover:bg-gray-700 rounded"
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </a>
        ))}
      </nav>
    </aside>
  );
}
