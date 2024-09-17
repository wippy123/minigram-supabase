"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AddTaskForm() {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [teamId, setTeamId] = useState<string | null>(null);
  const [assignedUserId, setAssignedUserId] = useState<string | null>(null);
  const [followers, setFollowers] = useState<string[]>([]); // Array of user IDs
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
  const [users, setUsers] = useState<{ id: string; email: string }[]>([]);

  useEffect(() => {
    fetchTeams();
    fetchUsers();
  }, []);

  const fetchTeams = async () => {
    const { data, error } = await supabase.from("teams").select("*");
    if (error) console.error("Error fetching teams:", error);
    else setTeams(data);
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase.from("users").select("*");
    if (error) console.error("Error fetching users:", error);
    else setUsers(data);
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("tasks").insert([
      {
        title,
        description,
        team_id: teamId,
        assigned_user_id: assignedUserId,
        followers,
      },
    ]);
    if (error) {
      console.error("Error adding task:", error);
    } else {
      // Optionally, trigger a re-fetch or update state
      window.location.reload();
    }
  };

  return (
    <form onSubmit={addTask} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium">
          Title
        </label>
        <input
          id="title"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          placeholder="Task title"
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          placeholder="Task description (optional)"
        ></textarea>
      </div>
      <div>
        <label htmlFor="team" className="block text-sm font-medium">
          Select Team
        </label>
        <select
          id="team"
          value={teamId || ""}
          onChange={(e) => setTeamId(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
        >
          <option value="">Select a team</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="assignedUser" className="block text-sm font-medium">
          Assign User
        </label>
        <select
          id="assignedUser"
          value={assignedUserId || ""}
          onChange={(e) => setAssignedUserId(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
        >
          <option value="">Select a user</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.email}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="followers" className="block text-sm font-medium">
          Add Followers (User Emails)
        </label>
        <input
          type="text"
          value={followers.join(", ")}
          onChange={(e) =>
            setFollowers(e.target.value.split(",").map((email) => email.trim()))
          }
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          placeholder="Comma-separated emails"
        />
      </div>
      <button
        type="submit"
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      >
        Add Task
      </button>
    </form>
  );
}
