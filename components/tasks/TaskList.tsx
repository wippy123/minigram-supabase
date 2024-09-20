"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent } from "@/components/ui/card";
import useDeleteTask from "./useDeleteTask";
import { toast } from "react-hot-toast";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, Edit, Trash2, Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getAvatarUrl } from "@/utils/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Modal } from "@/components/ui/modal";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { TaskCard } from "./TaskCard";

export interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  created_at: string;
  due_date?: string;
  due_time?: string;
  assigned_user_id?: string;
  assigned_avatar_url?: string;
  status: "Pending" | "Accepted" | "In Progress" | "Completed" | "Cancelled";
  not_urgent: boolean;
}

interface TaskListProps {
  teamId: string;
  refreshTrigger: number;
}

export default function TaskList({ teamId, refreshTrigger }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { deleteTask } = useDeleteTask();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const pathname = usePathname();

  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [notifyTaskId, setNotifyTaskId] = useState<number | null>(null);
  const [notifyMessage, setNotifyMessage] = useState("");

  const supabase = createClientComponentClient();

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
        const tasksWithAvatars = await Promise.all(
          data.map(async (task) => {
            const avatarUrl = await getAvatarUrl(
              task.assigned_user_id as string
            );
            return { ...task, assigned_avatar_url: avatarUrl };
          })
        );
        setTasks(tasksWithAvatars as Task[]);
        setError(null);
      }
      setLoading(false);
    };

    fetchTasks();
  }, [teamId, refreshTrigger]);

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

    const { assigned_avatar_url, ...taskWithoutAvatar } = editingTask;

    const { data, error } = await supabase
      .from("tasks")
      .update(taskWithoutAvatar)
      .eq("id", taskWithoutAvatar.id);

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

  const openNotifyModal = (taskId: number) => {
    setNotifyTaskId(taskId);
    setIsNotifyModalOpen(true);
  };

  const closeNotifyModal = () => {
    setIsNotifyModalOpen(false);
    setNotifyTaskId(null);
    setNotifyMessage("");
  };

  const handleNotify = async () => {
    if (!notifyTaskId) return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("User not authenticated");
        return;
      }

      const taskInfo = tasks.find((task) => task.id === notifyTaskId);

      const { data, error } = await supabase.from("notifications").insert({
        user_id: taskInfo?.assigned_user_id,
        message: notifyMessage,
      });

      if (error) throw error;

      toast.success("Notification sent successfully");
      closeNotifyModal();
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error("Failed to send notification. Please try again.");
    }
  };

  if (loading) return <p>Loading tasks...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={openEditModal}
            onDelete={openDeleteModal}
            onNotify={openNotifyModal}
          />
        ))}
      </div>

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Confirm Deletion
            </h2>
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              Are you sure you want to delete this task?
            </p>
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
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Edit Task
            </h2>
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
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Title
                  </label>
                  <Input
                    id="title"
                    name="title"
                    value={editingTask.title}
                    onChange={handleInputChange}
                    required
                    className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Description
                  </label>
                  <Textarea
                    id="description"
                    name="description"
                    value={editingTask.description || ""}
                    onChange={handleInputChange}
                    className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label
                    htmlFor="status"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
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
                    <SelectTrigger className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
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
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Due Date
                  </label>
                  <Input
                    id="due_date"
                    name="due_date"
                    type="date"
                    value={editingTask.due_date || ""}
                    onChange={handleInputChange}
                    className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label
                    htmlFor="due_time"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Due Time
                  </label>
                  <Input
                    id="due_time"
                    name="due_time"
                    type="time"
                    value={editingTask.due_time || ""}
                    onChange={handleInputChange}
                    className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    id="not_urgent"
                    name="not_urgent"
                    type="checkbox"
                    checked={!editingTask.not_urgent}
                    onChange={(e) =>
                      handleInputChange({
                        target: {
                          name: "not_urgent",
                          value: !e.target.checked,
                        },
                      } as any)
                    }
                    className="h-4 w-4 text-blue-600 dark:text-blue-400 form-checkbox"
                  />
                  <label
                    htmlFor="not_urgent"
                    className="ml-2 block text-sm text-gray-900 dark:text-gray-100"
                  >
                    Urgent
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

      <Modal
        isOpen={isNotifyModalOpen}
        onClose={closeNotifyModal}
        title="Request an Update"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            Enter your message to request an update for this task:
          </p>
          <Textarea
            value={notifyMessage}
            onChange={(e) => setNotifyMessage(e.target.value)}
            placeholder="Type your message here..."
            rows={4}
            className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={closeNotifyModal}>
              Cancel
            </Button>
            <Button onClick={handleNotify}>Send Notification</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
