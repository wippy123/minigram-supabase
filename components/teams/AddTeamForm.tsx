"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPlusIcon } from "@heroicons/react/24/outline";
import IconSelector from "@/components/teams/IconSelector";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

type AddTeamFormProps = {
  onTeamAdded: () => void;
};

export default function AddTeamForm({ onTeamAdded }: AddTeamFormProps) {
  const [step, setStep] = useState(1);
  const [teamName, setTeamName] = useState("");
  const [users, setUsers] = useState<string[]>([""]);
  const [selectedIcon, setSelectedIcon] = useState("");
  const supabase = createClientComponentClient();

  const addTeam = async () => {
    const data = await supabase.auth.getUser();
    if (!data.data.user) {
      console.error("User cannot create a team");
      return;
    }

    const userId = data.data.user.id;

    try {
      const response = await fetch("/api/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teamName,
          users: users.filter((user) => user.trim() !== ""),
          userId: userId,
          icon: selectedIcon,
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
    } else if (step === 2) {
      setStep(3);
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
            <Button onClick={handleNextStep} className="mt-4">
              Next
            </Button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-lg font-bold">Step 2: Choose Team Icon</h2>
            <p>Select an icon to represent your team.</p>
            <IconSelector
              selectedIcon={selectedIcon}
              onSelectIcon={setSelectedIcon}
            />
            <Button onClick={handleNextStep} className="mt-4">
              Next
            </Button>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-lg font-bold">Step 3: Add Users to Team</h2>
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
            <div className="flex justify-end mt-4 mb-4">
              <Button onClick={addUserField} variant="outline">
                <UserPlusIcon className="h-5 w-5 mr-2" />
                Add Another User
              </Button>
            </div>
            <Button onClick={handleNextStep} className="w-full">
              Create Team
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
