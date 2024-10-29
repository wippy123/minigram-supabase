"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

interface WithAuthProps {
  children: ReactNode;
}

export function WithAuth({ children }: WithAuthProps) {
  const supabase = createClientComponentClient();
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    // Check initial session
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setIsValid(!!session);
      } catch (error) {
        console.error("Error checking session:", error);
        setIsValid(false);
      }
    };

    checkSession();

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        setIsValid(!!session);
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  if (!isValid) {
    return null;
  }

  return <>{children}</>;
}
