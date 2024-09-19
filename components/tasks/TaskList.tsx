"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent } from "@/components/ui/card";
import useDeleteTask from "./useDeleteTask";
import { toast } from "react-hot-toast";
import { Task } from "@/lib/types";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, Edit, Trash2, Bell, AlertTriangle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  created_at: string;
  due_date?: string;
  due_time?: string; // Add this line
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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

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

  const openDeleteModal = (taskId: number) => {
    setTaskToDelete(taskId);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setTaskToDelete(null);
  };

  const confirmDelete = () => {
    if (taskToDelete !== null) {
      handleDeleteTask(taskToDelete);
      closeDeleteModal();
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    const { success, error } = await deleteTask(taskId);
    if (success) {
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
      toast.success("Task deleted successfully");
    } else {
      toast.error(`Failed to delete task: ${error?.message}`);
    }
  };

  const formatDateTime = (date?: string, time?: string) => {
    if (!date) return "No due date";
    const dateObj = new Date(`${date}T${time || "00:00:00"}`);
    return dateObj.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  };

  const openEditModal = (task: Task) => {
    setEditingTask({ ...task });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingTask(null);
  };

  const handleEditTask = async () => {
    if (!editingTask) return;

    const { data, error } = await supabase
      .from("tasks")
      .update(editingTask)
      .eq("id", editingTask.id);

    if (error) {
      toast.error(`Failed to update task: ${error.message}`);
    } else {
      setTasks(
        tasks.map((task) => (task.id === editingTask.id ? editingTask : task))
      );
      toast.success("Task updated successfully");
      closeEditModal();
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    if (editingTask) {
      setEditingTask({ ...editingTask, [e.target.name]: e.target.value });
    }
  };

  if (loading) return <p>Loading tasks...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-gray-100 p-4 rounded-lg">
        {tasks.map((task) => (
          <Card key={task.id} className="flex flex-col">
            <CardContent className="p-4 flex-grow flex flex-col">
              <div className="flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold">{task.title}</h3>
                  {task.due_date &&
                    new Date(
                      `${task.due_date}T${task.due_time || "00:00:00"}`
                    ) < new Date() && (
                      <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        Overdue
                      </span>
                    )}
                </div>
                <Avatar className="h-8 w-8 mb-2">
                  <AvatarImage
                    src={`https://avatar.vercel.sh/${task.assigned_user_id || "user"}.png`}
                    alt="User avatar"
                  />
                  <AvatarFallback>
                    {task.assigned_user_id
                      ? task.assigned_user_id[0].toUpperCase()
                      : "U"}
                  </AvatarFallback>
                </Avatar>
                {task.description && (
                  <p className="text-sm text-gray-500 mb-2">
                    {task.description}
                  </p>
                )}
                <div className="flex justify-between items-center mb-2">
                  <span
                    className={`text-xs px-2 py-1 rounded ${getStatusColor(task.status)}`}
                  >
                    {task.status}
                  </span>
                  {!task.not_urgent && (
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                      Urgent
                    </span>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-1">
                Due: {formatDateTime(task.due_date, task.due_time)}
              </p>
              {task.assigned_user_id && (
                <p className="text-xs text-gray-500 mb-2">
                  Assigned to: {task.assigned_user_id}
                </p>
              )}

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
                  onClick={() => openEditModal(task)}
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
                <button
                  className="text-gray-500 hover:text-red-500 transition-colors"
                  onClick={() => openDeleteModal(task.id)}
                  title="Delete"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
            <p className="mb-4">Are you sure you want to delete this task?</p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={closeDeleteModal}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Edit Task</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleEditTask();
              }}
            >
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Title
                  </label>
                  <Input
                    id="title"
                    name="title"
                    value={editingTask.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Description
                  </label>
                  <Textarea
                    id="description"
                    name="description"
                    value={editingTask.description || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label
                    htmlFor="status"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Status
                  </label>
                  <Select
                    name="status"
                    value={editingTask.status}
                    onValueChange={(value) =>
                      handleInputChange({
                        target: { name: "status", value },
                      } as any)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Accepted">Accepted</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label
                    htmlFor="due_date"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Due Date
                  </label>
                  <Input
                    id="due_date"
                    name="due_date"
                    type="date"
                    value={editingTask.due_date || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label
                    htmlFor="due_time"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Due Time
                  </label>
                  <Input
                    id="due_time"
                    name="due_time"
                    type="time"
                    value={editingTask.due_time || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="flex items-center">
                  <input
                    id="not_urgent"
                    name="not_urgent"
                    type="checkbox"
                    checked={editingTask.not_urgent}
                    onChange={(e) =>
                      handleInputChange({
                        target: { name: "not_urgent", value: e.target.checked },
                      } as any)
                    }
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="not_urgent"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Not Urgent
                  </label>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-2">
                <Button variant="outline" onClick={closeEditModal}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
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
