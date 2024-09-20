"use client";

import React, { createContext, useEffect, useState } from "react";
import {
  createClientComponentClient,
  User,
} from "@supabase/auth-helpers-nextjs";

interface OnlineUser {
  id: string;
}

interface PresenceContextType {
  onlineUsers: OnlineUser[];
}

export const PresenceContext = createContext<PresenceContextType | null>(null);

export function PresenceProvider({ children }: { children: React.ReactNode }) {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const channel = supabase.channel("online-users");

    channel
      .on("presence", { event: "sync" }, () => {
        const newState = channel.presenceState();
        console.log("newState", newState);
        const onlineUsers = Object.values(newState).map((state) => ({
          id: (state[0] as unknown as { userId: string }).userId,
        }));
        setOnlineUsers(onlineUsers);
      })
      .subscribe(async (status) => {
        const user = await supabase.auth.getUser();

        if (status === "SUBSCRIBED") {
          await channel.track({
            online_at: new Date().toISOString(),
            userId: user?.data.user?.id || undefined,
          });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return (
    <PresenceContext.Provider value={{ onlineUsers }}>
      {children}
    </PresenceContext.Provider>
  );
}
