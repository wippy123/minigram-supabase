"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  created_at: string;
}

interface TaskListProps {
  teamId: string;
}

export default function TaskList({ teamId }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      let query = supabase.from("tasks").select("*");

      if (teamId !== "all") {
        query = query.eq("team_id", teamId);
      }

      const { data, error } = await query;
      if (error) {
        console.error("Error fetching tasks:", error);
      } else {
        setTasks(data as Task[]);
      }
    };

    fetchTasks();
  }, [teamId]);

  if (loading) return <p>Loading tasks...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <ul className="space-y-4">
      {tasks.map((task) => (
        <li key={task.id} className="flex justify-between items-center">
          <div>
            <h3 className={`text-lg ${task.completed ? "line-through" : ""}`}>
              {task.title}
            </h3>
            {task.description && (
              <p className="text-sm text-gray-600">{task.description}</p>
            )}
          </div>
          <button
            // onClick={() => deleteTask(task.id)}
            className="text-red-500 hover:text-red-700"
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}
