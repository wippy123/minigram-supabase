import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  MessageCircle,
  Edit,
  Trash2,
  Bell,
  FileIcon,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Task } from "./TaskList";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
  onNotify: (taskId: number) => void;
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

export function TaskCard({ task, onEdit, onDelete, onNotify }: TaskCardProps) {
  const [hasChatMessages, setHasChatMessages] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function checkChatMessages() {
      const { data, error } = await supabase
        .from("chats")
        .select("id")
        .eq("task_id", task.id)
        .limit(1);

      if (error) {
        console.error("Error checking chat messages:", error);
      } else {
        setHasChatMessages(data.length > 0);
      }
    }

    checkChatMessages();
  }, [task.id, supabase]);

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

  return (
    <Card className="flex flex-col bg-white dark:bg-gray-700">
      <CardContent className="p-4 flex-grow flex flex-col">
        <div className="flex-grow">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center justify-between w-full">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {task.title}
              </h3>
              <Avatar className="h-8 w-8">
                <AvatarImage src={task.assigned_avatar_url} alt="User avatar" />
                <AvatarFallback className="bg-gray-200 dark:bg-gray-700">
                  {""}
                </AvatarFallback>
              </Avatar>
            </div>
            {task.due_date &&
              new Date(`${task.due_date}T${task.due_time || "00:00:00"}`) <
                new Date() && (
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded ml-2">
                  Overdue
                </span>
              )}
          </div>
          {task.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
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
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
          Due: {formatDateTime(task.due_date, task.due_time)}
        </p>

        {/* File count section */}
        {task.file_count > 0 && (
          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
            <FileIcon size={12} />
            <span>
              {task.file_count} file{task.file_count > 1 ? "s" : ""} attached
            </span>
          </div>
        )}

        {/* New follower count section */}
        {task.followers && task.followers.length > 0 && (
          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
            <Users size={12} />
            <span>
              {task.followers.length} follower
              {task.followers.length > 1 ? "s" : ""}
            </span>
          </div>
        )}

        <Separator className="my-4" />
        <div className="flex justify-end space-x-4">
          {hasChatMessages && (
            <Link
              href={`/tasks/${task.id}/chat`}
              className="text-gray-500 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
              title="Chat"
            >
              <MessageCircle size={20} />
            </Link>
          )}
          <button
            className="text-gray-500 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-400 transition-colors"
            onClick={() => onEdit(task)}
            title="Edit"
          >
            <Edit size={20} />
          </button>
          <button
            className="text-gray-500 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-yellow-400 transition-colors"
            onClick={() => onNotify(task.id)}
            title="Notify Me"
          >
            <Bell size={20} />
          </button>
          <button
            className="text-gray-500 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition-colors"
            onClick={() => onDelete(task.id)}
            title="Delete"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
