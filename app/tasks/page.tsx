"use client";

import { useState, useEffect } from "react";
import AddTaskForm from "@/components/tasks/AddTaskForm";
import TaskList from "@/components/tasks/TaskList";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { OnlineUsers } from "../components/OnlineUsers";

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
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchData = async () => {
      const user = await supabase.auth.getUser();
      if (user) {
        fetchTeams();
        checkAdminStatus();
      }
    };
    fetchData();
  }, []);

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
    <div className="container mx-auto p-4 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Tasks
        </h1>
        <div className="flex items-center space-x-4">
          <Select
            onValueChange={handleTeamChange}
            value={selectedTeamId || undefined}
          >
            <SelectTrigger className="w-48 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700">
              <SelectValue placeholder="Select a team" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              {teams.map((team) => (
                <SelectItem
                  key={team.id}
                  value={team.id}
                  className="text-gray-900 dark:text-white"
                >
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={() => setIsAddTaskModalOpen(true)}
            disabled={selectedTeamId === "all"}
            className={`${
              selectedTeamId === "all"
                ? "bg-gray-400 dark:bg-gray-600"
                : "bg-blue-500 dark:bg-blue-600"
            } text-white hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors`}
          >
            Add Task
          </Button>
        </div>
      </div>
      <div className="mb-4">
        <OnlineUsers />
      </div>
      {selectedTeamId && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
          <TaskList
            teamId={selectedTeamId}
            refreshTrigger={refreshTaskList}
            teamName={
              selectedTeamId === "all"
                ? "All Teams"
                : teams.find((team) => team.id === selectedTeamId)?.name || ""
            }
          />
        </div>
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
