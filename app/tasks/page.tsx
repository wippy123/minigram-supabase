"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import AddTaskForm from "@/components/tasks/AddTaskForm";
import TaskList from "@/components/tasks/TaskList";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

interface Team {
  id: string;
  name: string;
}

export default function TasksPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchTeams();
    }
  }, [user]);

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase.from("teams").select("*");
      if (error) throw error;

      const allTeamsOption: Team = { id: "all", name: "All Teams" };
      const teamsWithAllOption = [allTeamsOption, ...(data as Team[])];

      setTeams(teamsWithAllOption);
      if (teamsWithAllOption.length > 0) {
        setSelectedTeamId(teamsWithAllOption[0].id);
      }
    } catch (error) {
      console.error("Error fetching teams:", error);
    }
  };

  const handleTeamChange = (teamId: string) => {
    setSelectedTeamId(teamId);
  };

  const handleTaskAdded = () => {
    setIsAddTaskModalOpen(false);
    // Refresh the task list or update the UI as needed
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <Button onClick={() => setIsAddTaskModalOpen(true)}>Add Task</Button>
      </div>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Select Team</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            onValueChange={handleTeamChange}
            value={selectedTeamId || undefined}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a team" />
            </SelectTrigger>
            <SelectContent>
              {teams.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      {selectedTeamId && (
        <Card>
          <CardHeader>
            <CardTitle>Task List</CardTitle>
          </CardHeader>
          <CardContent>
            <TaskList teamId={selectedTeamId} />
          </CardContent>
        </Card>
      )}
      <Modal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        title="Add New Task"
      >
        {selectedTeamId && (
          <AddTaskForm teamId={selectedTeamId} onTaskAdded={handleTaskAdded} />
        )}
      </Modal>
    </div>
  );
}
