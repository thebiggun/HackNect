import supabase from '@/lib/supabase';

export async function POST(req) {
    try {
        const { registrationIds } = await req.json();

        if (!registrationIds || !Array.isArray(registrationIds) || registrationIds.length === 0) {
            return new Response(JSON.stringify({ count: 0 }), { status: 200 });
        }

        const { data, count, error } = await supabase
            .from('shortlists')
            .select('registration_id', { count: 'exact', head: false })  // fix here
            .in('registration_id', registrationIds);

        if (error) throw error;

        return new Response(JSON.stringify({ count }), { status: 200 });

    } catch (err) {
        return new Response(JSON.stringify({ count: 0, error: err.message }), { status: 500 });
    }
}
