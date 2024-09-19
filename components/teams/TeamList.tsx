import Link from "next/link";
import Card from "@/components/Card";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import * as HeroIcons from "@heroicons/react/24/solid";
import {
  UserGroupIcon,
  PencilIcon,
  TrashIcon,
  UserPlusIcon,
} from "@heroicons/react/24/solid";
import { getTeamMembers } from "@/lib/supabaseClient"; // Import the existing function
import Modal from "@/components/Modal";

type Team = {
  id: string;
  name: string;
  icon?: string;
};

type TeamListProps = {
  teams: Team[];
  onDelete: (id: string) => void;
};

type TeamMember = {
  id: string;
  team_id: string;
  display_name: string;
  role: string;
};

const getHeroIcon = (iconName: string) => {
  if (!iconName) return null;

  // Convert the icon name to PascalCase and add "Icon" suffix if not present
  const formattedIconName =
    iconName
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("") + (iconName.endsWith("Icon") ? "" : "Icon");

  const IconComponent = (HeroIcons as any)[formattedIconName];

  if (IconComponent) {
    return <IconComponent className="w-8 h-8 mr-3 text-gray-600" />;
  } else {
    console.warn(`Icon not found: ${iconName}`);
    return <UserGroupIcon className="w-8 h-8 mr-3 text-gray-400" />;
  }
};

export default function TeamList({ teams, onDelete }: TeamListProps) {
  const [teamMembers, setTeamMembers] = useState<Record<string, TeamMember[]>>(
    {}
  );
  const { user } = useAuth();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (user && teams.length > 0) {
      const teamIds = teams.map((team) => team.id);
      Promise.all(teamIds.map((teamId) => getTeamMembers(teamId)))
        .then((results) => {
          const newTeamMembers = results.reduce(
            (acc, members, index) => {
              acc[teamIds[index]] = members.map((member) => ({
                id: member.member_id,
                team_id: member.team_id,
                display_name: member.display_name,
                role: member.role,
              }));
              return acc;
            },
            {} as Record<string, TeamMember[]>
          );
          console.log("newTeamMembers", newTeamMembers);
          setTeamMembers(newTeamMembers);
        })
        .catch((error) => console.error("Error fetching team members:", error));
    }
  }, [teams, user]);

  const handleDeleteClick = (teamId: string) => {
    setTeamToDelete(teamId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (teamToDelete) {
      onDelete(teamToDelete);
      setIsDeleteModalOpen(false);
      setTeamToDelete(null);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {teams.map((team) => (
          <Card
            key={team.id}
            className="hover:shadow-lg transition-shadow duration-300"
          >
            <Link href={`/teams/${team.id}`} className="block">
              <div className="flex items-center mb-2">
                {getHeroIcon(team.icon || "")}
                <h3 className="text-xl font-semibold">{team.name}</h3>
              </div>
            </Link>
            <div className="flex justify-between items-center mb-4">
              <Link
                href={`/teams/${team.id}/edit`}
                className="flex items-center border border-gray-300 text-black px-4 py-2 rounded hover:bg-gray-100 transition-colors duration-300"
              >
                <PencilIcon className="w-4 h-4 mr-2" />
                Edit
              </Link>
              <button
                onClick={() => handleDeleteClick(team.id)}
                className="flex items-center border border-gray-300 text-black px-4 py-2 rounded hover:bg-gray-100 transition-colors duration-300"
              >
                <TrashIcon className="w-4 h-4 mr-2" />
                Delete
              </button>
            </div>
            <div className="flex justify-between items-center mt-4">
              <h4 className="text-lg font-medium">Members</h4>
              <Link
                href={`/teams/${team.id}/add-members`}
                className="flex items-center border border-gray-300 text-black px-3 py-1 rounded hover:bg-gray-100 transition-colors duration-300 text-sm"
              >
                <UserPlusIcon className="w-4 h-4 mr-1" />
                Add Members
              </Link>
            </div>
            <ul className="mt-2 space-y-1">
              {teamMembers[team.id]?.map((member) => (
                <li key={member.id} className="text-sm">
                  {member.display_name}
                </li>
              )) || <li className="text-sm text-gray-500">No members found</li>}
            </ul>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete"
      >
        <p>Are you sure you want to delete this team?</p>
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={() => setIsDeleteModalOpen(false)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </Modal>
    </>
  );
}
