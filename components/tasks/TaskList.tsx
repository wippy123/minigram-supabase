"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent } from "@/components/ui/card";
import useDeleteTask from "./useDeleteTask";
import { toast } from "react-hot-toast";
import { Task } from "@/lib/types";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, Edit, Trash2, Bell } from "lucide-react";

interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  created_at: string;
  due_date?: string;
  assigned_user_id?: string;
  status: "Pending" | "Accepted" | "In Progress" | "Completed" | "Cancelled";
  not_urgent: boolean;
}

interface TaskListProps {
  teamId: string;
  refreshTrigger: number;
  isAdmin: boolean; // Add this prop
}

export default function TaskList({
  teamId,
  refreshTrigger,
  isAdmin,
}: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { deleteTask } = useDeleteTask();

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      let query = supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

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
  }, [teamId, refreshTrigger]); // Add refreshTrigger to the dependency array

  const handleDeleteTask = async (taskId: number) => {
    const { success, error } = await deleteTask(taskId);
    if (success) {
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
      toast.success("Task deleted successfully");
    } else {
      toast.error(`Failed to delete task: ${error?.message}`);
    }
  };

  if (loading) return <p>Loading tasks...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {tasks.map((task) => (
        <Card key={task.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold">{task.title}</h3>
              {task.due_date && new Date(task.due_date) < new Date() && (
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  Overdue
                </span>
              )}
            </div>
            <div className="flex items-center mb-2">
              <span
                className={`text-xs px-2 py-1 rounded ${getStatusColor(task.status)}`}
              >
                {task.status}
              </span>
              {!task.not_urgent && (
                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded ml-2.5">
                  Urgent
                </span>
              )}
            </div>
            {task.due_date && (
              <p className="text-xs text-gray-500 mb-1">
                Due: {new Date(task.due_date).toLocaleDateString()}
              </p>
            )}
            {task.assigned_user_id && (
              <p className="text-xs text-gray-500 mb-2">
                Assigned to: {task.assigned_user_id}
              </p>
            )}
            <div className="mt-2 flex justify-between items-center">
              <button
                className={`px-2 py-1 rounded text-xs ${
                  task.completed ? "bg-gray-300" : "bg-green-500 text-white"
                }`}
                onClick={() => {
                  /* Toggle completion status */
                }}
              >
                {task.completed ? "Completed" : "Mark Complete"}
              </button>
              {isAdmin && (
                <button
                  className="text-red-500 hover:text-red-700 text-xs"
                  onClick={() => handleDeleteTask(task.id)}
                >
                  Delete
                </button>
              )}
            </div>
            <Separator className="my-4" />
            <div className="flex justify-end space-x-4">
              <button
                className="text-gray-500 hover:text-blue-500 transition-colors"
                onClick={() => {
                  /* Handle chat */
                }}
                title="Chat"
              >
                <MessageCircle size={20} />
              </button>
              <button
                className="text-gray-500 hover:text-green-500 transition-colors"
                onClick={() => {
                  /* Handle edit */
                }}
                title="Edit"
              >
                <Edit size={20} />
              </button>
              <button
                className="text-gray-500 hover:text-yellow-500 transition-colors"
                onClick={() => {
                  /* Handle notification */
                }}
                title="Notify Me"
              >
                <Bell size={20} />
              </button>
              {isAdmin && (
                <button
                  className="text-gray-500 hover:text-red-500 transition-colors"
                  onClick={() => handleDeleteTask(task.id)}
                  title="Delete"
                >
                  <Trash2 size={20} />
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function getStatusColor(status: Task["status"]) {
  switch (status) {
    case "Pending":
      return "bg-yellow-100 text-yellow-800";
    case "Accepted":
      return "bg-blue-100 text-blue-800";
    case "In Progress":
      return "bg-purple-100 text-purple-800";
    case "Completed":
      return "bg-green-100 text-green-800";
    case "Cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}
