"use client";

import { useState, useEffect } from "react";
import AddTeamForm from "@/components/teams/AddTeamForm";
import Modal from "@/components/Modal";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import Card from "@/components/Card";

// Define the Team type
type Team = {
  id: string;
  name: string;
  tasks: {
    id: string;
    title: string;
    assigned_user_id: string;
  }[];
};

export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    const { data, error } = await supabase.from("teams").select(`
        id,
        name,
        tasks (
          id,
          title,
          assigned_user_id
        )
      `);
    if (error) {
      console.error("Error fetching teams:", error);
    } else {
      setTeams(data as Team[]);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Welcome to Minigram</h1>
        <button
          onClick={openModal}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          + Create Team
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <Card key={team.id}>
            <Link href={`/teams/${team.id}`}>
              <h2 className="text-xl font-semibold mb-4">{team.name}</h2>
            </Link>
            <h3 className="text-lg font-medium mb-2">Tasks:</h3>
            <ul className="space-y-2">
              {team.tasks.map((task) => (
                <li key={task.id} className="bg-gray-100 p-2 rounded">
                  {task.title}
                </li>
              ))}
            </ul>
            {team.tasks.length === 0 && (
              <p className="text-gray-500">No tasks for this team.</p>
            )}
          </Card>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <AddTeamForm
          onTeamAdded={() => {
            closeModal();
            fetchTeams();
          }}
        />
      </Modal>
    </div>
  );
}
