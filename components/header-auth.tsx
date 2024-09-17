"use client";

import { signOutAction } from "@/app/actions";
import Link from "next/link";
import { Button } from "./ui/button";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";

export function HeaderAuth() {
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await signOutAction();
  };

  const getInitials = (name: string) => {
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("");
    return initials.toUpperCase();
  };

  return (
    <div className="flex items-center gap-4">
      <Link href="/" className="text-primary hover:underline">
        Home
      </Link>
      {user ? (
        <>
          <div className="relative">
            <button className="bg-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center">
              {getInitials(user.user_metadata.full_name || user.email)}
            </button>
            {/* Add a dropdown menu here if needed */}
          </div>
          <Button onClick={handleSignOut} variant="ghost">
            Sign Out
          </Button>
        </>
      ) : (
        <Link href="/login" className="text-primary hover:underline">
          Login
        </Link>
      )}
    </div>
  );
}
