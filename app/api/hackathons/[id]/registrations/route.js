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

        // Check if user is the creator of this hackathon
        const { data: hackathon, error: hackathonError } = await supabase
            .from('hackathons')
            .select('creator_id')
            .eq('id', id)
            .single();

        if (hackathonError || !hackathon) {
            return new Response(JSON.stringify({ success: false, error: 'Hackathon not found' }), { status: 404 });
        }

        if (hackathon.creator_id !== userData.id) {
            return new Response(JSON.stringify({ success: false, error: 'Unauthorized to view registrations' }), { status: 403 });
        }

        // Fetch all registrations for this hackathon with team leader and teammate details
        const { data: registrations, error: registrationsError } = await supabase
            .from('registrations')
            .select(`
                *,
                team_leader:users!registrations_team_leader_id_fkey(
                    id,
                    name,
                    email
                )
            `)
            .eq('hackathon_id', id)
            .order('submitted_at', { ascending: false });

        if (registrationsError) {
            console.error('Error fetching registrations:', registrationsError);
            return new Response(JSON.stringify({ success: false, error: 'Failed to fetch registrations' }), { status: 500 });
        }

        // For each registration, fetch teammate details
        const registrationsWithTeammates = await Promise.all(
            registrations.map(async (registration) => {
                let teammates = [];
                if (registration.teammates && registration.teammates.length > 0) {
                    const { data: teammatesData, error: teammatesError } = await supabase
                        .from('users')
                        .select('id, name, email')
                        .in('id', registration.teammates);

                    if (!teammatesError && teammatesData) {
                        teammates = teammatesData;
                    }
                }
                return {
                    ...registration,
                    teammates
                };
            })
        );

        return new Response(JSON.stringify({ 
            success: true, 
            data: registrationsWithTeammates
        }), { status: 200 });
    } catch (err) {
        console.error('Error fetching hackathon registrations:', err);
        return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
    }
} 