import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export interface FileUploadData {
  task_id: number;
  user_id: string;
  file_name: string;
  file_path: string;
  file_type?: string;
  file_size?: number;
}

export interface TaskData {
  owner_id: string;
  title: string;
  description: string;
  team_id: string;
  due_date: string | null;
  due_time: string | null;
  assigned_user_id: string | null;
  status: 'Pending' | 'Accepted' | 'In Progress' | 'Completed' | 'Cancelled';
  not_urgent: boolean;
}

export async function addUserToTeam(email: string, teamId: string, role: 'admin' | 'contributor') {
  // Check if the user already exists
  const { data: userData } = await supabase.auth.admin.listUsers();

  if (userData.users.length > 0) {
      const foundUser = userData.users.find((user: any) => user.email === email);
      console.log('foundUser', foundUser)
      if (foundUser) {
          const { data: teamMemberData, error: teamMemberError } = await supabase.from("team_members").insert([{ team_id: teamId, member_id: foundUser.id, role }]);
          console.log('teamMemberData', teamMemberData)
          console.log('teamMemberError', teamMemberError)
          return
      }
  }

  // If user does not exist, create a new user
  const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email);
  console.log('inviteData', {inviteData, inviteError})
  if (inviteError) throw inviteError;
  const newUserId = inviteData.user.id;
  // Use the newly created user
  const { data: teamMemberData, error: teamMemberError } = await supabase.from("team_members").insert([{ team_id: teamId, member_id: newUserId, role }]);
  console.log('teamMemberData', teamMemberData)
  console.log('teamMemberError', teamMemberError)
}

export async function deleteTeamMember(memberId: string) {
  const { error } = await supabase
    .from("team_members")
    .delete()
    .eq("member_id", memberId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function getTeamMembers(teamId: string) {
  const { data: teamMembers, error: teamMembersError } = await supabase
    .from('team_members')
    .select('team_id, member_id, role')
    .eq('team_id', teamId);

  if (teamMembersError) throw teamMembersError;

  if (teamMembers && teamMembers.length > 0) {
    const memberIds = teamMembers.map(member => member.member_id);

    const { data: profileData, error: profileError } = await supabase
      .from('profile_settings')
      .select('id, display_name')
      .in('id', memberIds);

    if (profileError) throw profileError;

    const membersWithProfiles = teamMembers.map(member => {
      const profile = profileData?.find(p => p.id === member.member_id);
      console.log("profile", { profile, profileData });
      return {
        ...member,
        display_name: profile?.display_name || 'Unknown',
      };
    });

    return membersWithProfiles;
  }

  return [];
}