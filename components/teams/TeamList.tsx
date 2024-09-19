import Link from "next/link";
import Card from "@/components/Card";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import * as HeroIcons from "@heroicons/react/24/solid";
import {
  UserGroupIcon,
  PencilIcon,
  TrashIcon,
  UserPlusIcon,
} from "@heroicons/react/24/solid";

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
  const [userRoles, setUserRoles] = useState<Record<string, string>>({});
  const [teamMembers, setTeamMembers] = useState<Record<string, TeamMember[]>>(
    {}
  );
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUserRoles();
      //   fetchTeamMembers();
    }
  }, [teams, user]);

  const fetchUserRoles = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("team_members")
      .select(
        `
        team_id,
        role,
        member_id
      `
      )
      .eq("member_id", user.id);

    if (!error && data) {
      const memberIds = data.map((member) => member.member_id);
      const { data: profileData, error: profileError } = await supabase
        .from("profile_settings")
        .select("id, display_name")
        .in("id", memberIds);

      if (!profileError && profileData) {
        const profileMap = profileData.reduce<Record<string, string>>(
          (acc, profile) => {
            acc[profile.id] = profile.display_name;
            return acc;
          },
          {}
        );
        const membersWithDisplayNames = data.map((member) => ({
          ...member,
          display_name: profileMap[member.member_id] || "Unknown",
        }));

        const teamMembersMap = membersWithDisplayNames.reduce(
          (acc, member) => {
            if (!acc[member.team_id]) {
              acc[member.team_id] = [];
            }
            acc[member.team_id].push({
              team_id: member.team_id,
              id: member.member_id,
              display_name: member.display_name,
              role: member.role,
            });
            return acc;
          },
          {} as Record<string, TeamMember[]>
        );

        setTeamMembers(teamMembersMap);

        console.log("teamMembersMap", teamMembersMap);

        setUserRoles(
          membersWithDisplayNames.reduce(
            (acc: Record<string, string>, { team_id, role }) => {
              acc[team_id] = role;
              return acc;
            },
            {}
          )
        );
      } else {
        console.error("Error fetching profile data:", profileError);
      }
    }

    if (error) {
      console.error("Error fetching user roles:", error);
    } else {
      const roles = data.reduce(
        (acc: Record<string, string>, { team_id, role }) => {
          acc[team_id] = role;
          return acc;
        },
        {}
      );
      setUserRoles(roles);
    }
  };

  return (
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
              onClick={() => onDelete(team.id)}
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
                {member.display_name} ({member.role})
              </li>
            )) || <li className="text-sm text-gray-500">No members found</li>}
          </ul>
        </Card>
      ))}
    </div>
  );
}
