import { Webhook } from 'svix';
import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export const runtime = 'nodejs';

export async function POST(req) {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET?.trim();

    if (!WEBHOOK_SECRET) {
        console.error("❌ Missing CLERK_WEBHOOK_SECRET env var");
        return new NextResponse('Server misconfigured', { status: 500 });
    }

    // Convert to Buffer from raw body
    const payload = Buffer.from(await req.arrayBuffer());
    const headers = Object.fromEntries(req.headers.entries());

    const wh = new Webhook(WEBHOOK_SECRET);

    let evt;
    try {
        evt = wh.verify(payload, headers);
    } catch (err) {
        console.error("❌ Webhook signature verification failed:", err.message);
        return new NextResponse("Invalid signature", { status: 400 });
    }

    console.log(`✅ Webhook verified event: ${evt.type}`);

    if (evt.type === 'user.created' || evt.type === 'user.updated') {
        const clerk_id = evt.data?.id;
        const name = evt.data?.first_name && evt.data?.last_name
            ? `${evt.data.first_name} ${evt.data.last_name}`
            : (evt.data?.first_name || evt.data?.last_name || evt.data?.username || 'User');
        const email = evt.data?.email_addresses?.[0]?.email_address || null;

        const { data, error } = await supabase.from('users').upsert(
            { clerk_id, name, email },
            { onConflict: 'clerk_id' }
        ).select();

        if (error) {
            console.error('❌ Supabase upsert error:', error);
            return new NextResponse('Error saving user', { status: 500 });
        }

        console.log(`🎉 User ${clerk_id} (${email}) successfully saved to Supabase:`, data);
        return new NextResponse('User saved', { status: 200 });
    }

    if (evt.type === 'user.deleted') {
        const clerk_id = evt.data?.id;
        const { error } = await supabase.from('users').delete().eq('clerk_id', clerk_id);
        if (error) {
            console.error('❌ Error deleting user from Supabase:', error);
        }
        return new NextResponse('User deleted', { status: 200 });
    }

    return new NextResponse('Webhook processed', { status: 200 });
}