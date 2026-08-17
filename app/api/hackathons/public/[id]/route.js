import supabase from '@/lib/supabase';

export async function GET(req, { params }) {
    try {
        const { id } = await params;
        
        // Fetch the specific hackathon with creator information and registrations to count teams
        let { data: hackathon, error: hackathonError } = await supabase
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
            .eq('id', id)
            .single();

        if (hackathonError) {
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
                .eq('id', id)
                .single();

            if (fallbackResult.error || !fallbackResult.data) {
                console.error('Error fetching hackathon:', fallbackResult.error || hackathonError);
                return new Response(JSON.stringify({ success: false, error: 'Hackathon not found' }), { status: 404 });
            }
            hackathon = fallbackResult.data;
        }

        if (!hackathon) {
            return new Response(JSON.stringify({ success: false, error: 'Hackathon not found' }), { status: 404 });
        }

        const teamsCount = hackathon.registrations?.length || 0;

        return new Response(JSON.stringify({ 
            success: true, 
            data: {
                ...hackathon,
                teamsCount,
                teams_count: teamsCount
            }
        }), { status: 200 });
    } catch (err) {
        console.error('Error fetching hackathon:', err);
        return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
    }
} 