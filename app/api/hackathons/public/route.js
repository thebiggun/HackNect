import supabase from '@/lib/supabase';

export async function GET(req) {
    try {
        // Fetch all hackathons for public viewing
        const { data: hackathons, error: hackathonsError } = await supabase
            .from('hackathons')
            .select(`
                *,
                creator:users!hackathons_creator_id_fkey(
                    id,
                    name,
                    email
                )
            `)
            .order('created_at', { ascending: false });

        if (hackathonsError) {
            console.error('Error fetching hackathons:', hackathonsError);
            return new Response(JSON.stringify({ success: false, error: 'Failed to fetch hackathons' }), { status: 500 });
        }

        return new Response(JSON.stringify({ success: true, data: hackathons }), { status: 200 });
    } catch (err) {
        console.error('Error fetching hackathons:', err);
        return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
    }
} 