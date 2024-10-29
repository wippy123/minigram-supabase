"use client";

import { signOutAction } from "@/app/actions";
import Link from "next/link";
import { Button } from "./ui/button";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import Image from "next/image";

export function HeaderAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  const fetchUserAndAvatar = async (userId: string) => {
    let id = userId;
    if (!userId) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      id = user?.id as string;
    }

    const { data, error } = await supabase
      .from("profile_settings")
      .select("avatar_url")
      .eq("id", id)
      .single();

    if (data && !error) {
      setAvatarUrl(data.avatar_url);
    }
  };

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);

        if (session?.user) {
          fetchUserAndAvatar(session.user.id);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  const handleSignOut = async () => {
    await signOutAction();
    supabase.auth.signOut();
    setUser(null);
  };

  const getInitials = (name: string) => {
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("");
    return initials.toUpperCase();
  };

  useEffect(() => {
    const handleProfileUpdate = (event: CustomEvent) => {
      fetchUserAndAvatar(user?.id as string);
    };

    window.addEventListener(
      "profileUpdated",
      handleProfileUpdate as EventListener
    );

    return () => {
      window.removeEventListener(
        "profileUpdated",
        handleProfileUpdate as EventListener
      );
    };
  }, [supabase]);

  return (
    <div className="flex items-center gap-4">
      <Link href="/" className="text-primary hover:underline">
        Home
      </Link>
      {user ? (
        <>
          <div className="relative">
            {avatarUrl ? (
              <Image
                style={{ maxWidth: "40px", maxHeight: "40px" }}
                src={avatarUrl}
                alt="User avatar"
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <button className="bg-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center">
                {getInitials(user.user_metadata.full_name || user.email)}
              </button>
            )}
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
