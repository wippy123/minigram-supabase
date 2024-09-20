import { PresenceContext } from "@/app/components/PresenceContext";
import { createClientComponentClient, User } from "@supabase/auth-helpers-nextjs";
import { useContext, useEffect, useState } from "react";

export function usePresence() {
    const context = useContext(PresenceContext);
    const supabase = createClientComponentClient();
    const [users, setUsers] = useState<User[]>([]);
  
    useEffect(() => {
      const fetchUsers = async () => {
        const { data, error } = await supabase
          .from("profile_settings")
          .select("*");
        if (error) {
          console.error("Error fetching users:", error);
        } else {
          setUsers(data);
        }
      };
      fetchUsers();
    }, [supabase]);
  
    if (!context) {
      throw new Error("usePresence must be used within a PresenceProvider");
    }
    return context;
  }