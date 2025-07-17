import supabase from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

export async function GET(req, context) {
    try {
        const { params } = await context;
        const { id: hackathonId } = params;

        // Get the current user from Clerk (optional: restrict to creator)
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
            return new Response(JSON.stringify({ success: false, error: 'User not found in database' }), { status: 404 });
        }

        // Check if user is the creator of this hackathon
        const { data: hackathon, error: hackathonError } = await supabase
            .from('hackathons')
            .select('creator_id')
            .eq('id', hackathonId)
            .single();
        if (hackathonError || !hackathon) {
            return new Response(JSON.stringify({ success: false, error: 'Hackathon not found' }), { status: 404 });
        }
        if (hackathon.creator_id !== userData.id) {
            return new Response(JSON.stringify({ success: false, error: 'Unauthorized to view shortlisted teams' }), { status: 403 });
        }

        // Get all registration_ids from shortlists for this hackathon
        const { data: shortlists, error: shortlistError } = await supabase
            .from('shortlists')
            .select('registration_id')
            .eq('hackathon_id', hackathonId);
        if (shortlistError) {
            return new Response(JSON.stringify({ success: false, error: 'Failed to fetch shortlists' }), { status: 500 });
        }
        const registrationIds = shortlists.map(s => s.registration_id);
        if (!registrationIds.length) {
            return new Response(JSON.stringify({ success: true, data: [] }), { status: 200 });
        }

        // Fetch full registration info for these IDs
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
            .in('id', registrationIds);
        if (registrationsError) {
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

        return new Response(JSON.stringify({ success: true, data: registrationsWithTeammates }), { status: 200 });
    } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
    }
} 