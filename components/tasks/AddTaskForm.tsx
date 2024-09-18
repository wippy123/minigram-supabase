"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  supabase,
  insertFileUpload,
  FileUploadData,
  TaskData,
  getTeamMembers,
} from "@/lib/supabaseClient";
import { UserDropdown } from "@/components/UserDropdown";
import { toast } from "react-hot-toast"; // Add this import

const STORAGE_BUCKET_NAME = "task-files";

type AddTaskFormProps = {
  teamId: string;
  onTaskAdded: () => void;
};

interface TeamMember {
  id: string;
  user_id: string;
  users: {
    id: string;
    email: string;
  };
}

export default function AddTaskForm({ teamId, onTaskAdded }: AddTaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignedUserId, setAssignedUserId] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const { user } = useAuth();
  const [status, setStatus] = useState<TaskData["status"]>("Pending");
  const [notUrgent, setNotUrgent] = useState(false);
  const [dueTime, setDueTime] = useState("");

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const members = await getTeamMembers(teamId);
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
    if (!user) return;

    try {
      const newTaskData: TaskData = {
        title,
        description,
        team_id: teamId,
        due_date: dueDate || null,
        due_time: dueTime || null, // Add this line
        assigned_user_id: assignedUserId,
        status,
        not_urgent: notUrgent,
      };

      // Insert task
      const { data: insertedTask, error: taskError } = await supabase
        .from("tasks")
        .insert(newTaskData)
        .select()
        .single();

      if (taskError) throw taskError;

      // Upload files
      for (const file of files) {
        const filePath = `${teamId}/${insertedTask.id}/${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from(STORAGE_BUCKET_NAME)
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Insert file record
        const fileUploadData: FileUploadData = {
          task_id: insertedTask.id,
          user_id: user.id,
          file_name: file.name,
          file_path: filePath,
          file_type: file.type,
          file_size: file.size,
        };

        await insertFileUpload(fileUploadData);
      }

      // Reset form fields
      setTitle("");
      setDescription("");
      setDueDate("");
      setDueTime(""); // Add this line
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
    <form onSubmit={addTask} className="space-y-4">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task Title"
        className="w-full p-2 border rounded"
        required
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Task Description"
        className="w-full p-2 border rounded"
        rows={3}
      />
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        className="w-full p-2 border rounded"
      />
      <input
        type="time"
        value={dueTime}
        onChange={(e) => setDueTime(e.target.value)}
        className="w-full p-2 border rounded"
      />
      <UserDropdown
        users={teamMembers.map((m) => m.users)}
        value={assignedUserId}
        onChange={setAssignedUserId}
      />
      <input
        type="file"
        onChange={handleFileChange}
        multiple
        className="w-full p-2 border rounded"
      />
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as TaskData["status"])}
        className="w-full p-2 border rounded"
      >
        <option value="Pending">Pending</option>
        <option value="Accepted">Accepted</option>
        <option value="In Progress">In Progress</option>
        <option value="Completed">Completed</option>
        <option value="Cancelled">Cancelled</option>
      </select>
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={notUrgent}
          onChange={(e) => setNotUrgent(e.target.checked)}
        />
        <span>Not Urgent</span>
      </label>
      <button
        type="submit"
        className="w-full p-2 bg-blue-500 text-white rounded"
      >
        Add Task
      </button>
    </form>
  );
}
