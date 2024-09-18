"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import AddTaskForm from "@/components/tasks/AddTaskForm";

type Team = {
  id: string;
  name: string;
};

type Task = {
  id: string;
  title: string;
  description: string;
  team_id: string;
};

type FileUpload = {
  id: string;
  file_name: string;
  file_path: string;
};

type TaskWithFiles = Task & {
  file_uploads: FileUpload[];
};

const STORAGE_BUCKET_NAME = "task-files"; // Make sure this matches the bucket name you created

export default function TasksPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  const [tasks, setTasks] = useState<TaskWithFiles[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchTeams();
      fetchTasks();
    }
  }, [user]);

  const fetchTeams = async () => {
    const { data, error } = await supabase
      .from("teams")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching teams:", error);
    } else {
      setTeams(data || []);
    }
  };

  const fetchTasks = async () => {
    let query = supabase.from("tasks").select(`
        *,
        file_uploads (id, file_name, file_path)
      `);

    if (selectedTeam !== "all") {
      query = query.eq("team_id", selectedTeam);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching tasks:", error);
    } else {
      setTasks((data as TaskWithFiles[]) || []);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [selectedTeam]);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <div className="flex flex-col items-end">
          <label
            htmlFor="team-select"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Select Team
          </label>
          <div className="w-64">
            <Select
              id="team-select"
              value={selectedTeam}
              onValueChange={(value: string) => setSelectedTeam(value)}
            >
              <option value="all">All Teams</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {selectedTeam !== "all" && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Add New Task</h2>
          <AddTaskForm teamId={selectedTeam} onTaskAdded={fetchTasks} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.map((task) => (
          <Card key={task.id}>
            <CardHeader>
              <CardTitle>{task.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{task.description}</p>
              {task.file_uploads && task.file_uploads.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-bold">Attachments:</h4>
                  <ul className="list-disc pl-5">
                    {task.file_uploads.map((file) => (
                      <li key={file.id}>
                        <a
                          href={`${supabase.storage.from(STORAGE_BUCKET_NAME).getPublicUrl(file.file_path).data.publicUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          {file.file_name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
