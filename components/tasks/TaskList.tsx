"use client";

import { useEffect, useState } from "react";
import useDeleteTask from "./useDeleteTask";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getAvatarUrl } from "@/utils/utils";
import { Modal } from "@/components/ui/modal";
import {
  createClientComponentClient,
  User,
} from "@supabase/auth-helpers-nextjs";
import { TaskCard } from "./TaskCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EditTaskModal from "./EditTaskModal";
import {
  ListIcon,
  GridIcon,
  CalendarIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "lucide-react";
import { parseISO, format, startOfDay, endOfDay, addDays } from "date-fns";
import { useMediaQuery } from "@/hooks/useMediaQuery"; // Add this import

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
  assigned_user_name?: string; // New field for display name or email
}

interface TaskListProps {
  teamId: string;
  refreshTrigger: number;
  teamName: string; // Add this new prop
}

export default function TaskList({
  teamId,
  refreshTrigger,
  teamName,
}: TaskListProps) {
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
  const [viewMode, setViewMode] = useState<"card" | "list" | "calendar">(
    "card"
  );
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const supabase = createClientComponentClient();

  const [activeTab, setActiveTab] = useState("todo");
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isLargeScreen = useMediaQuery("(min-width: 1024px)");

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
        const tasksWithUserInfo = await Promise.all(
          data.map(async (task) => {
            const avatarUrl = await getAvatarUrl(
              task.assigned_user_id as string
            );
            const userName = await getUserDisplayNameOrEmail(
              task.assigned_user_id
            );
            return {
              ...task,
              assigned_avatar_url: avatarUrl,
              assigned_user_name: userName,
            };
          })
        );
        setTasks(tasksWithUserInfo as Task[]);
        setError(null);
      }
      setLoading(false);
    };

    fetchTasks();
  }, [teamId, refreshTrigger]);

  const getUserDisplayNameOrEmail = async (
    userId: string | undefined
  ): Promise<string> => {
    if (!userId) return "Unassigned";

    // First, try to get the display name from profile_settings
    const { data: profileData, error: profileError } = await supabase
      .from("profile_settings")
      .select("display_name")
      .eq("id", userId)
      .single();

    if (profileData?.display_name) {
      return profileData.display_name;
    }

    // If no display name, fetch email from auth.users
    const { data: userData } = await supabase.auth.admin.listUsers();

    if (userData.users.length > 0) {
      const foundUser = userData.users.find((user: any) => user.id === userId);
      console.log("foundUser", foundUser);
      if (foundUser) {
        return foundUser.email as string;
      }
    }

    return "Unknown User";
  };

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
    const {
      assigned_avatar_url,
      assigned_user_name,
      ...taskWithoutExtraFields
    } = updatedTask;

    const { data, error } = await supabase
      .from("tasks")
      .update(taskWithoutExtraFields)
      .eq("id", taskWithoutExtraFields.id);

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
      console.log("taskInfo:", taskInfo);
      const { data, error } = await supabase.from("notifications").insert({
        user_id: taskInfo?.assigned_user_id || taskInfo?.owner_id,
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
            task.owner_id === currentUserId &&
            task.assigned_user_id !== currentUserId
        );
      case "todo":
        return tasks.filter(
          (task) => !task.completed && task.owner_id === task.assigned_user_id
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

  const sortTasks = (tasks: Task[]) => {
    if (!sortField) return tasks;

    return [...tasks].sort((a, b) => {
      if (sortField === "assigned_to") {
        const aName = a.assigned_user_name || "";
        const bName = b.assigned_user_name || "";
        return sortDirection === "asc"
          ? aName.localeCompare(bName)
          : bName.localeCompare(aName);
      }
      if (sortField === "status" || sortField === "due_date") {
        const aValue = a[sortField] || "";
        const bValue = b[sortField] || "";
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      return 0;
    });
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const renderSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUpIcon className="inline w-4 h-4" />
    ) : (
      <ChevronDownIcon className="inline w-4 h-4" />
    );
  };

  const renderCalendar = (taskList: Task[]) => {
    const daysInMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    ).getDate();
    const firstDayOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    ).getDay();
    const weeks = Math.ceil((daysInMonth + firstDayOfMonth) / 7);

    const calendarDays = Array.from({ length: weeks * 7 }, (_, i) => {
      const day = i - firstDayOfMonth + 1;
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day
      );
      return { date, day };
    });

    const tasksForDay = (date: Date) => {
      return taskList.filter((task) => {
        const taskDate = new Date(task.due_date as string);
        taskDate.setDate(taskDate.getDate() + 1); // Add a day to taskDate
        return taskDate.toDateString() === date.toDateString();
      });
    };

    const getTaskColor = (task: Task) => {
      const today = new Date();
      const dueDate = new Date(task.due_date as string);

      if (task.status === "Completed") {
        return "bg-green-200 dark:bg-green-800 hover:bg-green-300 dark:hover:bg-green-700";
      } else if (dueDate < today) {
        return "bg-red-200 dark:bg-red-800 hover:bg-red-300 dark:hover:bg-red-700";
      } else {
        return "bg-yellow-500 dark:bg-yellow-500 hover:bg-yellow-300 dark:hover:bg-yellow-700";
      }
    };

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-700">
          <button
            onClick={() =>
              setCurrentMonth(
                new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth() - 1,
                  1
                )
              )
            }
          >
            &lt;
          </button>
          <h2 className="text-lg font-semibold">
            {currentMonth.toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </h2>
          <button
            onClick={() =>
              setCurrentMonth(
                new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth() + 1,
                  1
                )
              )
            }
          >
            &gt;
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 p-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center font-semibold p-2">
              {day}
            </div>
          ))}
          {calendarDays.map(({ date, day }, index) => (
            <div
              key={index}
              className={`p-2 ${
                day > 0 && day <= daysInMonth
                  ? "bg-gray-50 dark:bg-gray-700"
                  : "bg-gray-200 dark:bg-gray-600"
              } min-h-[100px] overflow-y-auto`}
            >
              {day > 0 && day <= daysInMonth && (
                <>
                  <div className="font-semibold">{day}</div>
                  {tasksForDay(date).map((task) => (
                    <div
                      key={task.id}
                      onClick={() => openEditModal(task)}
                      className={`text-xs p-1 mb-1 rounded cursor-pointer transition-colors duration-200 ${getTaskColor(task)}`}
                    >
                      {task.title}
                    </div>
                  ))}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTasks = (taskList: Task[]) => {
    switch (viewMode) {
      case "card":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 w-full">
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
      case "list":
        const sortedTasks = sortTasks(taskList);
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-3 py-3 md:px-6 md:py-4 text-left text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Title
                  </th>
                  {!isMobile && (
                    <>
                      <th
                        className="px-3 py-3 md:px-6 md:py-4 text-left text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("status")}
                      >
                        Status {renderSortIcon("status")}
                      </th>
                      <th
                        className="px-3 py-3 md:px-6 md:py-4 text-left text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("due_date")}
                      >
                        Due Date {renderSortIcon("due_date")}
                      </th>
                      <th
                        className="px-3 py-3 md:px-6 md:py-4 text-left text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("assigned_to")}
                      >
                        Assigned To {renderSortIcon("assigned_to")}
                      </th>
                    </>
                  )}
                  <th className="px-3 py-3 md:px-6 md:py-4 text-left text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                {sortedTasks.map((task) => (
                  <tr key={task.id}>
                    <td className="px-3 py-3 md:px-6 md:py-4 whitespace-nowrap text-sm md:text-base font-medium text-gray-900 dark:text-gray-100">
                      {task.title}
                    </td>
                    {!isMobile && (
                      <>
                        <td className="px-3 py-3 md:px-6 md:py-4 whitespace-nowrap text-sm md:text-base text-gray-500 dark:text-gray-400">
                          {task.status}
                        </td>
                        <td className="px-3 py-3 md:px-6 md:py-4 whitespace-nowrap text-sm md:text-base text-gray-500 dark:text-gray-400">
                          {task.due_date}
                        </td>
                        <td className="px-3 py-3 md:px-6 md:py-4 whitespace-nowrap text-sm md:text-base text-gray-500 dark:text-gray-400">
                          {task.assigned_user_name || "Unassigned"}
                        </td>
                      </>
                    )}
                    <td className="px-3 py-3 md:px-6 md:py-4 whitespace-nowrap text-sm md:text-base font-medium">
                      <button
                        onClick={() => openEditModal(task)}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-2 md:mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openDeleteModal(task.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 mr-2 md:mr-4"
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
          </div>
        );
      case "calendar":
        return renderCalendar(taskList);
      default:
        return null;
    }
  };

  if (loading) return <p>Loading tasks...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-wrap justify-end mb-4 space-x-2 space-y-2 sm:space-y-0">
        <Button
          variant="outline"
          size={isLargeScreen ? "default" : "sm"}
          onClick={() => setViewMode("card")}
          className={`w-full sm:w-auto ${viewMode === "card" ? "bg-gray-200 dark:bg-gray-700" : ""}`}
        >
          <GridIcon className="mr-2 h-4 w-4" />
          Card View
        </Button>
        <Button
          variant="outline"
          size={isLargeScreen ? "default" : "sm"}
          onClick={() => setViewMode("list")}
          className={`w-full sm:w-auto ${viewMode === "list" ? "bg-gray-200 dark:bg-gray-700" : ""}`}
        >
          <ListIcon className="mr-2 h-4 w-4" />
          List View
        </Button>
        <Button
          variant="outline"
          size={isLargeScreen ? "default" : "sm"}
          onClick={() => setViewMode("calendar")}
          className={`w-full sm:w-auto ${viewMode === "calendar" ? "bg-gray-200 dark:bg-gray-700" : ""}`}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          Calendar View
        </Button>
      </div>

      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        {teamName}
      </h2>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-6">
          <TabsTrigger value="delegated">Delegated</TabsTrigger>
          <TabsTrigger value="todo">Todo</TabsTrigger>
          <TabsTrigger value="following">Following</TabsTrigger>
          <TabsTrigger value="assigned">Assigned to Me</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab} className="mt-6">
          <div className="w-full bg-gray-100 dark:bg-gray-800 p-4 md:p-6 rounded-lg">
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
    </div>
  );
}
