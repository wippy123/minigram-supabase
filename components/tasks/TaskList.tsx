"use client";

import { useEffect, useState } from "react";

interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  created_at: string;
}

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/tasks");
      const data = await response.json();
      if (response.ok) {
        setTasks(data.tasks);
      } else {
        setError(data.error || "Failed to fetch tasks.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (id: number) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (response.ok) {
        // Remove the deleted task from the state
        setTasks(tasks.filter((task) => task.id !== id));
      } else {
        setError(data.error || "Failed to delete task.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

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
            onClick={() => deleteTask(task.id)}
            className="text-red-500 hover:text-red-700"
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}
