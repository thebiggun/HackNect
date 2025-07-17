import { Webhook } from 'svix';
import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export const config = {
  api: {
    bodyParser: false,
  },
};

export const runtime = 'nodejs'; // To avoid edge function issues

export async function POST(req) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("Missing WEBHOOK_SECRET env var");
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
    console.error("Webhook signature verification failed:", err);
    return new NextResponse("Invalid signature", { status: 400 });
  }

  console.log("✅ Webhook verified:", evt);

  const body = evt;
  const clerk_id = body.data?.id;
  const name = body.data?.first_name && body.data?.last_name
    ? `${body.data.first_name} ${body.data.last_name}`
    : body.data?.username || null;
  const email = body.data?.email_addresses?.[0]?.email_address || null;

  const { error } = await supabase.from('users').insert([
    { clerk_id, name, email }
  ]);

  if (error) {
    console.error('❌ Supabase insert error:', error);
    return new NextResponse('Error saving user', { status: 500 });
  }

  return new NextResponse('User saved', { status: 200 });
}
