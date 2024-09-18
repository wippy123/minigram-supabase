"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  supabase,
  insertFileUpload,
  FileUploadData,
} from "@/lib/supabaseClient";

const STORAGE_BUCKET_NAME = "task-files";

type AddTaskFormProps = {
  teamId: string;
  onTaskAdded: () => void;
};

export default function AddTaskForm({ teamId, onTaskAdded }: AddTaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const { user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      // Insert task
      const { data: taskData, error: taskError } = await supabase
        .from("tasks")
        .insert({ title, description, team_id: teamId })
        .select()
        .single();

      if (taskError) throw taskError;

      // Upload files
      for (const file of files) {
        const filePath = `${teamId}/${taskData.id}/${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from(STORAGE_BUCKET_NAME)
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Insert file record
        const fileUploadData: FileUploadData = {
          task_id: taskData.id,
          user_id: user.id,
          file_name: file.name,
          file_path: filePath,
          file_type: file.type,
          file_size: file.size,
        };

        await insertFileUpload(fileUploadData);
      }

      setTitle("");
      setDescription("");
      setFiles([]);
      onTaskAdded();
    } catch (error) {
      console.error("Error adding task:", error);
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
        type="file"
        onChange={handleFileChange}
        multiple
        className="w-full p-2 border rounded"
      />
      <button
        type="submit"
        className="w-full p-2 bg-blue-500 text-white rounded"
      >
        Add Task
      </button>
    </form>
  );
}
