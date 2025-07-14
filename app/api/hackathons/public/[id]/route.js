import supabase from '@/lib/supabase';

export async function GET(req, context) {
    try {
        const { params } = await context;
        const { id } = params;
        
        // Fetch the specific hackathon with creator information
        const { data: hackathon, error: hackathonError } = await supabase
            .from('hackathons')
            .select(`
                *,
                creator:users!hackathons_creator_id_fkey(
                    id,
                    name,
                    email
                )
            `)
            .eq('id', id)
            .single();

        if (hackathonError || !hackathon) {
            console.error('Error fetching hackathon:', hackathonError);
            return new Response(JSON.stringify({ success: false, error: 'Hackathon not found' }), { status: 404 });
        }

        return new Response(JSON.stringify({ 
            success: true, 
            data: hackathon
        }), { status: 200 });
    } catch (err) {
        console.error('Error fetching hackathon:', err);
        return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
    }
} 