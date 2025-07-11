import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
    const body = await request.json();

    // Extract user data from Clerk webhook body
    const clerk_id = body.data?.id;
    const name = body.data?.first_name && body.data?.last_name
        ? `${body.data.first_name} ${body.data.last_name}`
        : body.data?.username || null;
    const email = body.data?.email_addresses?.[0]?.email_address || null;

    // Insert into Supabase users table
    const { error } = await supabase.from('users').insert([
        { clerk_id, name, email }
    ]);

    if (error) {
        console.error('Supabase insert error:', error);
        return new Response('Error saving user', { status: 500 });
    }

    return new Response('User saved', { status: 200 });
}
