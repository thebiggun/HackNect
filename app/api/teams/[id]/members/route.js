import supabase from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

export async function GET(req, context) {
    try {
        const { params } = await context;
        const { id } = params;
        
        // Get the current user from Clerk
        const { userId } = await auth();
        
        if (!userId) {
            return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401 });
        }

        // Get the user from Supabase using the Clerk ID
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('clerk_id', userId)
            .single();

        if (userError || !userData) {
            console.error('Error finding user in Supabase:', userError);
            return new Response(JSON.stringify({ success: false, error: 'User not found in database' }), { status: 404 });
        }

        // Check if user is a member of this team
        const { data: membership, error: membershipError } = await supabase
            .from('team_members')
            .select('*')
            .eq('team_id', id)
            .eq('user_id', userData.id)
            .single();

        if (membershipError || !membership) {
            return new Response(JSON.stringify({ success: false, error: 'Not a member of this team' }), { status: 403 });
        }

        // Fetch team information
        const { data: teamData, error: teamError } = await supabase
            .from('teams')
            .select(`
                *,
                hackathons (
                    id,
                    title
                )
            `)
            .eq('id', id)
            .single();

        if (teamError) {
            console.error('Error fetching team:', teamError);
            return new Response(JSON.stringify({ success: false, error: 'Failed to fetch team' }), { status: 500 });
        }

        // Fetch team members
        const { data: members, error: membersError } = await supabase
            .from('team_members')
            .select(`
                role,
                joined_at,
                users (
                    id,
                    name,
                    email
                )
            `)
            .eq('team_id', id)
            .order('joined_at', { ascending: true });

        if (membersError) {
            console.error('Error fetching team members:', membersError);
            return new Response(JSON.stringify({ success: false, error: 'Failed to fetch team members' }), { status: 500 });
        }

        return new Response(JSON.stringify({ 
            success: true, 
            data: {
                team: teamData,
                members: members
            }
        }), { status: 200 });
    } catch (err) {
        console.error('Error fetching team members:', err);
        return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
    }
} 