import Link from "next/link";
import Card from "@/components/Card";
import { useState, useEffect } from "react";
import * as HeroIcons from "@heroicons/react/24/solid";
import {
  UserGroupIcon,
  PencilIcon,
  TrashIcon,
  UserPlusIcon,
} from "@heroicons/react/24/solid";
import {
  addUserToTeam,
  deleteTeamMember,
  getTeamMembers,
} from "@/lib/supabaseClient";
import Modal from "@/components/Modal";
import {
  createClientComponentClient,
  User,
} from "@supabase/auth-helpers-nextjs";

import { TrashIcon as MemberTrashIcon } from "@heroicons/react/24/solid";
import { toast } from "react-hot-toast";

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

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [teamToDelete, setTeamToDelete] = useState<string | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);
  const [teamToAddMember, setTeamToAddMember] = useState<string | null>(null);
  const [newMemberEmail, setNewMemberEmail] = useState<string>("");
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) console.error("Error fetching user:", error);
      else setUser(data as unknown as User);
    };
    fetchUser();
  }, []);

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
          setTeamMembers(newTeamMembers);
        })
        .catch((error) => console.error("Error fetching team members:", error));
    }
  }, [teams, user]);

  const handleDeleteClick = (teamId: string) => {
    setTeamToDelete(teamId);
    setIsDeleteModalOpen(true);
  };

  const handleMemberDeleteClick = (member: TeamMember) => {
    setMemberToDelete(member);
    setIsDeleteModalOpen(true);
  };

  const handleAddMemberClick = (teamId: string) => {
    setTeamToAddMember(teamId);
    setIsAddMemberModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (teamToDelete) {
      try {
        await onDelete(teamToDelete);
        toast.success("Team deleted successfully");
      } catch (error) {
        console.error("Error deleting team:", error);
        toast.error("Failed to delete team");
      } finally {
        setIsDeleteModalOpen(false);
        setTeamToDelete(null);
      }
    }
  };

  const handleConfirmMemberDelete = async () => {
    if (memberToDelete) {
      try {
        await deleteTeamMember(memberToDelete.id);
        setTeamMembers((prev) => {
          const updatedMembers = { ...prev };
          updatedMembers[memberToDelete.team_id] = updatedMembers[
            memberToDelete.team_id
          ].filter((member) => member.id !== memberToDelete.id);
          return updatedMembers;
        });
        toast.success("Member deleted successfully");
        setIsDeleteModalOpen(false);
        setMemberToDelete(null);
      } catch (error) {
        console.error("Error deleting member:", error);
        toast.error("Failed to delete member");
      }
    }
  };

  const handleConfirmAddMember = async () => {
    if (teamToAddMember && newMemberEmail) {
      try {
        await addUserToTeam(newMemberEmail, teamToAddMember, "contributor");
        setTeamMembers((prev) => ({
          ...prev,
          [teamToAddMember]: [
            ...(prev[teamToAddMember] || []),
            {
              id: new Date().toISOString(),
              team_id: teamToAddMember,
              display_name: newMemberEmail,
              role: "member",
            },
          ],
        }));
        toast.success("Member added successfully");
        setIsAddMemberModalOpen(false);
        setNewMemberEmail("");
        setTeamToAddMember(null);
      } catch (error) {
        console.error("Error adding member:", error);
        toast.error("Failed to add member");
      }
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
        {teams.map((team) => (
          <Card
            key={team.id}
            className="hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-gray-800"
          >
            <Link href={`/teams/${team.id}`} className="block">
              <div className="flex items-center mb-2">
                {getHeroIcon(team.icon || "")}
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {team.name}
                </h3>
              </div>
            </Link>
            <div className="flex justify-between items-center mb-4 mt-8">
              <Link
                href={`/teams/${team.id}/edit`}
                className="flex items-center border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
              >
                <PencilIcon className="w-4 h-4 mr-2" />
                Edit
              </Link>
              <button
                onClick={() => handleDeleteClick(team.id)}
                className="flex items-center border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
              >
                <TrashIcon className="w-4 h-4 mr-2" />
                Delete
              </button>
            </div>
            <div className="flex justify-between items-center mt-8">
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Members
              </h4>
              <button
                onClick={() => handleAddMemberClick(team.id)}
                className="flex items-center border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300 text-sm"
              >
                <UserPlusIcon className="w-4 h-4 mr-1" />
                Add Members
              </button>
            </div>
            <ul className="mt-8 space-y-2">
              {teamMembers[team.id]?.map((member) => (
                <li
                  key={member.id}
                  className="flex justify-between items-center text-sm text-gray-700 dark:text-gray-300"
                >
                  {member.display_name}
                  <button
                    onClick={() => handleMemberDeleteClick(member)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <MemberTrashIcon className="w-4 h-4" />
                  </button>
                </li>
              )) || (
                <li className="text-sm text-gray-500 dark:text-gray-400">
                  No members found
                </li>
              )}
            </ul>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      >
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Confirm Deletion
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Are you sure you want to delete{" "}
            {memberToDelete ? memberToDelete.display_name : "this team"}?
          </p>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={
                memberToDelete ? handleConfirmMemberDelete : handleConfirmDelete
              }
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 transition-colors duration-200"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
      >
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Add Team Member
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Enter the email of the member you want to add:
          </p>
          <input
            type="email"
            value={newMemberEmail}
            onChange={(e) => setNewMemberEmail(e.target.value)}
            className="w-full p-2 mb-4 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            placeholder="member@example.com"
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setIsAddMemberModalOpen(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmAddMember}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200"
            >
              Add
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
