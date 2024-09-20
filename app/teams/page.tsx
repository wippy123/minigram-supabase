"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import TeamList from "@/components/teams/TeamList";
import AddTeamForm from "@/components/teams/AddTeamForm";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";

// Define the Team type
type Team = {
  id: string;
  name: string;
};

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    const { data, error } = await supabase.from("teams").select("*");
    if (error) console.error("Error fetching teams:", error);
    else setTeams(data as Team[]);
  };

  const deleteTeam = async (id: string) => {
    const { error } = await supabase.from("teams").delete().eq("id", id);
    if (error) console.error("Error deleting team:", error);
    else setTeams(teams.filter((team) => team.id !== id));
    await fetchTeams(); // Refetch teams after deletion
  };

  const handleTeamAdded = () => {
    fetchTeams();
    setIsModalOpen(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleTeamUpdate = async () => {
    await fetchTeams(); // Refetch teams after update
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Teams</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Team
        </Button>
      </div>
      <TeamList
        teams={teams}
        onDelete={deleteTeam}
        onTeamUpdate={handleTeamUpdate}
      />

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add New Team</h2>
          <Button variant="ghost" onClick={closeModal}>
            <XMarkIcon className="h-5 w-5" />
          </Button>
        </div>
        <AddTeamForm onTeamAdded={handleTeamAdded} />
      </Modal>
    </div>
  );
}
