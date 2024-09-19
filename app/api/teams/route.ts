import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;

    switch (method) {
        case 'GET':
            // Fetch all teams
            const { data: teams, error } = await supabase.from('teams').select('*');
            if (error) return res.status(500).json({ error: error.message });
            return res.status(200).json(teams);

        case 'POST':
            // Create a new team
            const { name } = req.body;
            const { data, error: insertError } = await supabase.from('teams').insert([{ name }]);
            if (insertError) return res.status(500).json({ error: insertError.message });
            return res.status(201).json(data);

        case 'PUT':
            // Update a team
            const { id, newName } = req.body;
            const { data: updatedData, error: updateError } = await supabase.from('teams').update({ name: newName }).eq('id', id);
            if (updateError) return res.status(500).json({ error: updateError.message });
            return res.status(200).json(updatedData);

        case 'DELETE':
            // Delete a team
            const { teamId } = req.body;
            const { data: deletedData, error: deleteError } = await supabase.from('teams').delete().eq('id', teamId);
            if (deleteError) return res.status(500).json({ error: deleteError.message });
            return res.status(200).json(deletedData);

        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            return res.status(405).end(`Method ${method} Not Allowed`);
    }
}

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

async function addUserToTeam(email: string, teamId: string, role: 'admin' | 'contributor') {
    // Check if the user already exists
    const { data: userData } = await supabase.auth.admin.listUsers();
      

    if (userData.users.length > 0) {
        const foundUser = userData.users.find((user: any) => user.email === email);
        console.log('foundUser', foundUser)
        if (foundUser) {
            await supabase.from("team_members").insert([{ team_id: teamId, member_id: foundUser.id, role }]);
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

function generateRandomPassword() {
    // Implement a secure random password generation logic
    return Math.random().toString(36).slice(-8);
}