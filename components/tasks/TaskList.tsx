"use client";

import { useEffect, useState } from "react";
import useDeleteTask from "./useDeleteTask";
import { toast } from "react-hot-toast";
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
import { Modal } from "@/components/ui/modal";
import {
  createClientComponentClient,
  User,
} from "@supabase/auth-helpers-nextjs";
import { TaskCard } from "./TaskCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EditTaskModal from "./EditTaskModal";
import { ListIcon, GridIcon } from "lucide-react";

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
  followers: string[];
  owner_id: string;
  file_count: number;
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
  const [user, setUser] = useState<User | null>(null);
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [notifyTaskId, setNotifyTaskId] = useState<number | null>(null);
  const [notifyMessage, setNotifyMessage] = useState("");
  const [viewMode, setViewMode] = useState<"card" | "list">("card");

  const supabase = createClientComponentClient();

  const [activeTab, setActiveTab] = useState("todo");

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

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

  const handleEditTask = async (updatedTask: Task) => {
    const { assigned_avatar_url, ...taskWithoutAvatar } = updatedTask;

    const { data, error } = await supabase
      .from("tasks")
      .update(taskWithoutAvatar)
      .eq("id", taskWithoutAvatar.id);

    if (error) {
      toast.error(`Failed to update task: ${error.message}`);
    } else {
      setTasks(
        tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
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

  const filterTasks = (tasks: Task[]) => {
    const currentUserId = user?.id;
    switch (activeTab) {
      case "delegated":
        return tasks.filter(
          (task) =>
            task.assigned_user_id && task.assigned_user_id !== currentUserId
        );
      case "todo":
        return tasks.filter(
          (task) =>
            !task.completed &&
            (!task.assigned_user_id || task.assigned_user_id === currentUserId)
        );
      case "following":
        return tasks.filter(
          (task) =>
            !task.completed && task.followers?.includes(currentUserId as string)
        );
        return tasks;
      case "assigned":
        return tasks.filter(
          (task) =>
            task.assigned_user_id === currentUserId &&
            task.owner_id !== currentUserId
        );
      default:
        return tasks;
    }
  };

  const filteredTasks = filterTasks(tasks);

  const pendingTasks = filteredTasks.filter(
    (task) => task.status === "Pending"
  );
  const acceptedTasks = filteredTasks.filter(
    (task) => task.status === "Accepted"
  );
  const inProgressTasks = filteredTasks.filter(
    (task) => task.status === "In Progress"
  );
  const completedTasks = filteredTasks.filter(
    (task) => task.status === "Completed"
  );

  const renderTasks = (taskList: Task[]) => {
    if (viewMode === "card") {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {taskList.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={openEditModal}
              onDelete={openDeleteModal}
              onNotify={openNotifyModal}
            />
          ))}
        </div>
      );
    } else {
      return (
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Due Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
            {taskList.map((task) => (
              <tr key={task.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                  {task.title}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {task.status}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {task.due_date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => openEditModal(task)}
                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => openDeleteModal(task.id)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 mr-2"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => openNotifyModal(task.id)}
                    className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                  >
                    Notify
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
  };

  if (loading) return <p>Loading tasks...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setViewMode(viewMode === "card" ? "list" : "card")}
        >
          {viewMode === "card" ? (
            <ListIcon className="mr-2 h-4 w-4" />
          ) : (
            <GridIcon className="mr-2 h-4 w-4" />
          )}
          {viewMode === "card" ? "List View" : "Card View"}
        </Button>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="delegated">Delegated</TabsTrigger>
          <TabsTrigger value="todo">Todo</TabsTrigger>
          <TabsTrigger value="following">Following</TabsTrigger>
          <TabsTrigger value="assigned">Assigned to Me</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab} className="mt-4">
          <div className="w-full bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
            {renderTasks(filteredTasks)}
          </div>
        </TabsContent>
      </Tabs>

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

      <EditTaskModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        task={editingTask}
        onSave={handleEditTask}
      />

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
