import React, { useState, useEffect } from "react";
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
import { Task } from "./TaskList";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onSave: (updatedTask: Task) => void;
}

interface FileUpload {
  id: number;
  file_path: string;
  task_id: number;
}

export default function EditTaskModal({
  isOpen,
  onClose,
  task,
  onSave,
}: EditTaskModalProps) {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [files, setFiles] = useState<FileUpload[]>([]);
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (task) {
      setEditingTask({ ...task });
      fetchFiles(task.id);
    }
  }, [task]);

  const fetchFiles = async (taskId: number) => {
    const { data, error } = await supabase
      .from("file_uploads")
      .select("id, file_path")
      .eq("task_id", taskId);

    if (error) {
      console.error("Error fetching files:", error);
    } else {
      setFiles(data as FileUpload[]);
    }
  };

  const handleFileClick = async (filePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from("task-files") // Replace with your actual bucket name
        .createSignedUrl(filePath, 60); // URL valid for 60 seconds

      if (error) throw error;

      if (data?.signedUrl) {
        window.open(data.signedUrl, "_blank");
      }
    } catch (error) {
      console.error("Error opening file:", error);
      alert("Failed to open file. Please try again.");
    }
  };

  if (!isOpen || !editingTask) return null;

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setEditingTask({ ...editingTask, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editingTask);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Edit Task
        </h2>
        <form onSubmit={handleSubmit}>
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
                    target: { name: "not_urgent", value: !e.target.checked },
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

            {/* Updated section for associated files */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Associated Files
              </label>
              {files.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1">
                  {files.map((file) => (
                    <li
                      key={file.id}
                      className="text-sm text-blue-600 dark:text-blue-400 cursor-pointer hover:underline"
                      onClick={() => handleFileClick(file.file_path)}
                    >
                      {file.file_path.split("/").pop()}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No files associated with this task.
                </p>
              )}
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
