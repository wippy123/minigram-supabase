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
  const [refreshTaskList, setRefreshTaskList] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useAuth(); // Assuming useAuth provides the user object

  useEffect(() => {
    if (user) {
      fetchTeams();
      checkAdminStatus();
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

  const checkAdminStatus = async () => {
    try {
      const response = await fetch("/api/teams/isAdmin");
      const data = await response.json();
      setIsAdmin(data.isAdmin);
    } catch (error) {
      console.error("Error checking admin status:", error);
      setIsAdmin(false);
    }
  };

  const handleTeamChange = (teamId: string) => {
    setSelectedTeamId(teamId);
  };

  const handleTaskAdded = () => {
    setIsAddTaskModalOpen(false);
    setRefreshTaskList((prev) => prev + 1); // Increment to trigger TaskList refresh
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <div className="flex items-center space-x-4">
          <Select
            onValueChange={handleTeamChange}
            value={selectedTeamId || undefined}
          >
            <SelectTrigger className="w-48">
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
          <Button
            onClick={() => setIsAddTaskModalOpen(true)}
            disabled={selectedTeamId === "all"}
            className={selectedTeamId === "all" ? "bg-gray-400" : ""}
          >
            Add Task
          </Button>
        </div>
      </div>
      {selectedTeamId && (
        <TaskList
          teamId={selectedTeamId}
          refreshTrigger={refreshTaskList}
          isAdmin={isAdmin}
        />
      )}
      <Modal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        title="Add New Task"
      >
        {selectedTeamId && selectedTeamId !== "all" && (
          <AddTaskForm teamId={selectedTeamId} onTaskAdded={handleTaskAdded} />
        )}
      </Modal>
    </div>
  );
}
