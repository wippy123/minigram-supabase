import Link from "next/link";
import Card from "@/components/Card";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import * as HeroIcons from "@heroicons/react/24/solid";
import { UserGroupIcon } from "@heroicons/react/24/solid";

type Team = {
  id: string;
  name: string;
  icon?: string;
};

type TeamListProps = {
  teams: Team[];
  onDelete: (id: string) => void;
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
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUserRoles();
    }
  }, [teams, user]);

  const fetchUserRoles = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("team_members")
      .select("team_id, role")
      .eq("member_id", user.id);

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
            <p className="text-gray-600 mb-4">Team ID: {team.id}</p>
          </Link>
          {userRoles[team.id] === "admin" && (
            <button
              onClick={() => onDelete(team.id)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors duration-300"
            >
              Delete
            </button>
          )}
        </Card>
      ))}
    </div>
  );
}
