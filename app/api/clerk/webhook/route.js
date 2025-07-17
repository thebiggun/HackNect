import { buffer } from 'micro';
import { Webhook } from 'svix';
import supabase from '@/lib/supabase';

export const config = {
    api: {
        bodyParser: false,
    },
};

export async function POST(req) {
    // Get raw body for verification
    const payload = await buffer(req);
    const headers = req.headers;

    const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
    if (!WEBHOOK_SECRET) {
        console.error("Missing WEBHOOK_SECRET env var");
        return new Response('Server misconfigured', { status: 500 });
    }

    const wh = new Webhook(WEBHOOK_SECRET);

    let evt;
    try {
        evt = wh.verify(payload, headers);
    } catch (err) {
        console.error("Webhook signature verification failed:", err);
        return new Response("Invalid signature", { status: 400 });
    }

    // Extract user data
    const body = evt;
    const clerk_id = body.data?.id;
    const name = body.data?.first_name && body.data?.last_name
        ? `${body.data.first_name} ${body.data.last_name}`
        : body.data?.username || null;
    const email = body.data?.email_addresses?.[0]?.email_address || null;

    // Insert into Supabase
    const { error } = await supabase.from('users').insert([
        { clerk_id, name, email }
    ]);

    if (error) {
        console.error('Supabase insert error:', error);
        return new Response('Error saving user', { status: 500 });
    }

    return new Response('User saved', { status: 200 });
}
