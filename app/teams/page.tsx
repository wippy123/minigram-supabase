"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import AddTeamForm from "@/components/teams/AddTeamForm";
import TeamList from "@/components/teams/TeamList";

// Define the Team type
type Team = {
  id: string;
  name: string;
};

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);

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
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Teams</h1>
      <AddTeamForm onTeamAdded={fetchTeams} />
      <TeamList teams={teams} onDelete={deleteTeam} />
    </div>
  );
}
