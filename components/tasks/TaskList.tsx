"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  created_at: string;
  due_date?: string;
  assigned_user_id?: string;
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
      setLoading(true);
      let query = supabase.from("tasks").select("*");

      if (teamId !== "all") {
        query = query.eq("team_id", teamId);
      }

      const { data, error } = await query;
      if (error) {
        console.error("Error fetching tasks:", error);
        setError("Failed to fetch tasks");
      } else {
        setTasks(data as Task[]);
        setError(null);
      }
      setLoading(false);
    };

    fetchTasks();
  }, [teamId]);

  if (loading) return <p>Loading tasks...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tasks.map((task) => (
        <Card key={task.id} className={task.completed ? "opacity-50" : ""}>
          <CardHeader>
            <CardTitle className={task.completed ? "line-through" : ""}>
              {task.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {task.description && (
              <p className="text-sm text-gray-600 mb-2">{task.description}</p>
            )}
            {task.due_date && (
              <p className="text-sm">
                Due: {new Date(task.due_date).toLocaleDateString()}
              </p>
            )}
            {task.assigned_user_id && (
              <p className="text-sm">Assigned to: {task.assigned_user_id}</p>
            )}
            <div className="mt-4 flex justify-between items-center">
              <button
                className={`px-2 py-1 rounded ${
                  task.completed ? "bg-gray-300" : "bg-green-500 text-white"
                }`}
                onClick={() => {
                  /* Toggle completion status */
                }}
              >
                {task.completed ? "Completed" : "Mark Complete"}
              </button>
              <button
                className="text-red-500 hover:text-red-700"
                onClick={() => {
                  /* Delete task */
                }}
              >
                Delete
              </button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
