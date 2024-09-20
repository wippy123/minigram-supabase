"use client";

import { useState, useEffect } from "react";
import { TaskData, getTeamMembers } from "@/lib/supabaseClient";
import { UserDropdown } from "@/components/UserDropdown";
import { toast } from "react-hot-toast";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

type AddTaskFormProps = {
  teamId: string;
  onTaskAdded: () => void;
};

export interface TeamMember {
  display_name: string;
  team_id: string;
  member_id: string;
  role: string;
}

export default function AddTaskForm({ teamId, onTaskAdded }: AddTaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignedUserId, setAssignedUserId] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [status, setStatus] = useState<TaskData["status"]>("Pending");
  const [urgent, setUrgent] = useState(false);
  const [dueTime, setDueTime] = useState("");
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const members = await getTeamMembers(teamId);
        console.log("Members:", members);
        setTeamMembers(members as unknown as TeamMember[]);
      } catch (error) {
        console.error("Error fetching team members:", error);
      }
    };

    fetchTeamMembers();
  }, [teamId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = await supabase.auth.getUser();
    if (!user) return;

    try {
      const newTaskData: TaskData = {
        title,
        description,
        owner_id: user.data.user?.id as string,
        team_id: teamId,
        due_date: dueDate || null,
        due_time: dueTime || null,
        assigned_user_id: assignedUserId,
        status,
        not_urgent: !urgent,
      };

      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newTaskData,
          files,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create task");
      }

      const result = await response.json();

      // Reset form fields
      setTitle("");
      setDescription("");
      setDueDate("");
      setDueTime("");
      setAssignedUserId(null);
      setFiles([]);

      // Show success toast
      toast.success("Task added successfully!");

      onTaskAdded();
    } catch (error) {
      console.error("Error adding task:", error);
      toast.error("Failed to add task. Please try again.");
    }
  };

  return (
    <form
      onSubmit={addTask}
      className="space-y-4 bg-white dark:bg-gray-800 p-4 rounded-lg"
    >
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task Title"
        className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        required
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Task Description"
        className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        rows={3}
      />
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
      />
      <input
        type="time"
        value={dueTime}
        onChange={(e) => setDueTime(e.target.value)}
        className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
      />
      <UserDropdown
        users={teamMembers}
        value={assignedUserId}
        onChange={setAssignedUserId}
      />
      <input
        type="file"
        onChange={handleFileChange}
        multiple
        className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
      />
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as TaskData["status"])}
        className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
      >
        <option value="Pending">Pending</option>
        <option value="Accepted">Accepted</option>
        <option value="In Progress">In Progress</option>
        <option value="Completed">Completed</option>
        <option value="Cancelled">Cancelled</option>
      </select>
      <label className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
        <input
          type="checkbox"
          checked={urgent}
          onChange={(e) => setUrgent(e.target.checked)}
          className="form-checkbox h-5 w-5 text-blue-600 dark:text-blue-400"
        />
        <span>Urgent</span>
      </label>
      <button
        type="submit"
        className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
      >
        Add Task
      </button>
    </form>
  );
}
