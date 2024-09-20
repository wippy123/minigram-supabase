
import { addUserToTeam, supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';


export async function POST(request: Request) {
    const { teamName, users, userId, icon } = await request.json();

    try {
        // Create the team with the new icon field
        const { data: team, error: teamError } = await supabase
            .from("teams")
            .insert({ name: teamName, icon: icon })
            .select()
            .single();

        if (teamError) throw teamError;

        // Add creator as admin
        const { data: teamMemberData, error: teamMemberError } = await supabase.from("team_members").insert([
            { team_id: team.id, member_id: userId, role: 'admin' }
        ]);

        // Add users to team as contributors
        for (const email of users) {
            await addUserToTeam(email, team.id, 'contributor');
        }

        return NextResponse.json({ message: "Team created successfully", team: team });
    } catch (error) {
        console.error("Error in team creation:", error);
        return NextResponse.json({ error: "Failed to create team" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const { teamId, userId } = await request.json();

    if (!(await isAdmin(userId, teamId))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { error } = await supabase.from("teams").delete().eq("id", teamId);

    if (error) {
        console.error("Error deleting team:", error);
        return NextResponse.json({ error: "Failed to delete team" }, { status: 500 });
    }

    return NextResponse.json({ message: "Team deleted successfully" });
}

async function isAdmin(userId: string, teamId: string) {
    const { data, error } = await supabase
        .from('team_members')
        .select('role')
        .eq('user_id', userId)
        .eq('team_id', teamId)
        .single();

    if (error) {
        console.error('Error checking admin status:', error);
        return false;
    }

    return data?.role === 'admin';
}