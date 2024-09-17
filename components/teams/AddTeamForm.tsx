import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";

type AddTeamFormProps = {
  onTeamAdded: () => void;
};

export default function AddTeamForm({ onTeamAdded }: AddTeamFormProps) {
  const [step, setStep] = useState(1);
  const [teamName, setTeamName] = useState("");
  const [users, setUsers] = useState<string[]>([""]);

  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      checkUserTeamStatus();
    }
  }, [user]);

  const checkUserTeamStatus = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("team_members")
      .select("team_id")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error checking user team status:", error);
    }
  };

  const addTeam = async () => {
    if (!user) {
      console.error("User cannot create a team");
      return;
    }

    try {
      const response = await fetch("/api/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teamName,
          users: users.filter((user) => user.trim() !== ""),
          userId: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create team");
      }

      const data = await response.json();
      console.log("Team created:", data);
      onTeamAdded();
    } catch (error) {
      console.error("Error adding team:", error);
    }
  };

  const handleNextStep = () => {
    if (step === 1) {
      setStep(2);
    } else {
      addTeam();
    }
  };

  const handleUserChange = (index: number, value: string) => {
    const newUsers = [...users];
    newUsers[index] = value;
    setUsers(newUsers);
  };

  const addUserField = () => {
    setUsers([...users, ""]);
  };

  return (
    <div>
      <div>
        {step === 1 && (
          <div>
            <h2 className="text-lg font-bold">Step 1: Enter Team Name</h2>
            <p>Please enter the name of the team you want to create.</p>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Team Name"
              className="border p-2 rounded w-full mt-2"
            />
            <button
              onClick={handleNextStep}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
            >
              Next
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-lg font-bold">Step 2: Add Users to Team</h2>
            <p>Please enter the email addresses of users to add to the team.</p>
            {users.map((user, index) => (
              <div key={index} className="flex items-center mt-2">
                <input
                  type="email"
                  value={user}
                  onChange={(e) => handleUserChange(index, e.target.value)}
                  placeholder="User Email"
                  className="border p-2 rounded w-full"
                />
              </div>
            ))}
            <button onClick={addUserField} className="mt-2 text-blue-500">
              + Add Another User
            </button>
            <button
              onClick={handleNextStep}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
            >
              Create Team
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
