import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function deleteTeamMember(memberId: string) {
  const { error } = await supabase
    .from("team_members")
    .delete()
    .eq("member_id", memberId);

  if (error) {
    throw new Error(error.message);
  }
}
