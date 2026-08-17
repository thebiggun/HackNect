import supabase from '@/lib/supabase';

export async function GET(req) {
    try {
        // Fetch all hackathons along with registrations to count teams
        let { data: hackathons, error: hackathonsError } = await supabase
            .from('hackathons')
            .select(`
                *,
                creator:users!hackathons_creator_id_fkey(
                    id,
                    name,
                    email
                ),
                registrations:registrations!registrations_hackathon_id_fkey(
                    id
                )
            `)
            .order('created_at', { ascending: false });

        if (hackathonsError) {
            // Fallback query without explicit constraint name
            const fallbackResult = await supabase
                .from('hackathons')
                .select(`
                    *,
                    creator:users!hackathons_creator_id_fkey(
                        id,
                        name,
                        email
                    ),
                    registrations(
                        id
                    )
                `)
                .order('created_at', { ascending: false });

            if (fallbackResult.error) {
                console.error('Error fetching hackathons:', fallbackResult.error);
                return new Response(JSON.stringify({ success: false, error: 'Failed to fetch hackathons' }), { status: 500 });
            }
            hackathons = fallbackResult.data;
        }

        const formattedHackathons = (hackathons || []).map(hack => {
            const teamsCount = hack.registrations?.length || 0;
            return {
                ...hack,
                teamsCount,
                teams_count: teamsCount
            };
        });

        return new Response(JSON.stringify({ success: true, data: formattedHackathons }), { status: 200 });
    } catch (err) {
        console.error('Error fetching hackathons:', err);
        return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
    }
} 