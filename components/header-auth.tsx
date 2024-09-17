import { signOutAction } from "@/app/actions";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function HeaderAuth() {
  const supabase = createClient(cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex items-center gap-4">
      <Link href="/tasks" className="text-primary hover:underline">
        Tasks
      </Link>
      <Link href="/notifications" className="text-primary hover:underline">
        Notifications
      </Link>
      {user ? (
        <Button onClick={signOutAction} variant="ghost">
          Sign Out
        </Button>
      ) : (
        <Link href="/login" className="text-primary hover:underline">
          Login
        </Link>
      )}
    </div>
  );
}
