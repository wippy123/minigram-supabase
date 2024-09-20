"use client";

import { useEffect, useState } from "react";
import {
  createClientComponentClient,
  User,
} from "@supabase/auth-helpers-nextjs";
import { usePresence } from "@/hooks/usePresence";

interface ProfileSettings extends User {
  display_name: string;
}

export function OnlineUsers() {
  const { onlineUsers } = usePresence();
  const supabase = createClientComponentClient();
  const [users, setUsers] = useState<ProfileSettings[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from("profile_settings")
        .select("*");
      if (error) {
        console.error("Error fetching users:", error);
      } else {
        const onlineUserIds = onlineUsers.map((user) => user.id);
        const filteredUsers = data.filter((user) =>
          onlineUserIds.includes(user.id)
        );
        setUsers(filteredUsers);
      }
    };
    fetchUsers();
  }, [onlineUsers, supabase]);

  if (users.length === 0) return null;

  return (
    <div className="flex items-center rounded-md bg-gray-100 dark:bg-gray-800">
      <h2 className="p-2 mr-4 text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
        Online Users:
      </h2>
      <ul className="flex flex-wrap items-center mt-1">
        {users.map((user) => (
          <li key={user.id} className="flex items-center mr-3 mb-1">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {user.display_name}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
