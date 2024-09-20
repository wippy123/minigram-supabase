"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Card from "@/components/Card";
import Modal from "@/components/Modal";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
type Team = {
  id: string;
  name: string;
};

type User = {
  id: string;
  email: string;
};

export default function TeamDetailsPage() {
  const { id } = useParams();
  const [team, setTeam] = useState<Team | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const supabase = createClientComponentClient();
  useEffect(() => {
    if (!user) {
      const fetchUser = async () => {
        const { data, error } = await supabase.auth.getUser();
        if (error) console.error("Error fetching user:", error);
        else setUser(data as unknown as User);
      };
      fetchUser();
    }
    if (user && id) {
      fetchTeamDetails();
      fetchTeamUsers();
      checkAdminStatus();
    }
  }, [id, user]);

  const fetchTeamDetails = async () => {
    const { data, error } = await supabase
      .from("teams")
      .select("*")
      .eq("id", id)
      .single();
    if (error) console.error("Error fetching team details:", error);
    else setTeam(data);
  };

  const fetchTeamUsers = async () => {
    const { data, error } = await supabase
      .from("team_members")
      .select(
        `
        member_id,
        users:auth.users!member_id(id, email)
      `
      )
      .eq("team_id", id);

    if (error) {
      console.error("Error fetching team users:", error);
    } else {
      //   const formattedUsers = data.map((item) => ({
      //     id: item.users.id,
      //     email: item.users.email
      //   }));
      //   setUsers(formattedUsers);
    }
  };

  const checkAdminStatus = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("team_members")
      .select("role")
      .eq("member_id", user.id)
      .eq("team_id", id)
      .single();

    if (error) {
      console.error("Error checking admin status:", error);
    } else {
      setIsAdmin(data?.role === "admin");
    }
  };

  const addUser = async () => {
    if (!isAdmin || !team) return;

    try {
      const { data, error } = await supabase
        .from("team_members")
        .insert([
          { team_id: team.id, user_id: newUserEmail, role: "contributor" },
        ]);

      if (error) throw error;

      fetchTeamUsers();
      setIsModalOpen(false);
      setNewUserEmail("");
    } catch (error) {
      console.error("Error adding user to team:", error);
    }
  };

  const removeUser = async (userId: string) => {
    if (!isAdmin || !team) return;

    try {
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("team_id", team.id)
        .eq("member_id", userId);

      if (error) throw error;

      fetchTeamUsers();
    } catch (error) {
      console.error("Error removing user from team:", error);
    }
  };

  if (!team) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <h1 className="text-3xl font-bold mb-6">{team.name}</h1>
        <p className="text-gray-600 mb-4">Team ID: {team.id}</p>
        <h2 className="text-2xl font-semibold mb-4">Team Members</h2>
        <ul className="space-y-2">
          {users.map((user) => (
            <li key={user.id}>
              <Card className="p-4 flex justify-between items-center">
                <span>{user.email}</span>
                {isAdmin && (
                  <button
                    onClick={() => removeUser(user.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Remove
                  </button>
                )}
              </Card>
            </li>
          ))}
        </ul>
        {isAdmin && (
          <div className="mt-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Add User
            </button>
          </div>
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2 className="text-xl font-semibold mb-4">Add User to Team</h2>
        <input
          type="email"
          value={newUserEmail}
          onChange={(e) => setNewUserEmail(e.target.value)}
          placeholder="User email"
          className="border p-2 rounded w-full mb-4"
        />
        <button
          onClick={addUser}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add User
        </button>
      </Modal>
    </div>
  );
}
