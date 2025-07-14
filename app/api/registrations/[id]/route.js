import supabase from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

export async function GET(req, context) {
    try {
        const { params } = await context;
        // Get the current user from Clerk
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
            console.error('Error finding user in Supabase:', userError);
            return new Response(JSON.stringify({ success: false, error: 'User not found in database' }), { status: 404 });
        }

        // Fetch the registration with hackathon details
        const { data: registration, error: registrationError } = await supabase
            .from('registrations')
            .select(`
                *,
                hackathons (
                    id,
                    title
                )
            `)
            .eq('id', params.id)
            .single();

        if (registrationError || !registration) {
            console.error('Error fetching registration:', registrationError);
            return new Response(JSON.stringify({ success: false, error: 'Registration not found' }), { status: 404 });
        }

        // Check if the user has access to this registration (either team leader or teammate)
        const isTeamLeader = registration.team_leader_id === userData.id;
        const isTeammate = registration.teammates && registration.teammates.includes(userData.id);
        
        if (!isTeamLeader && !isTeammate) {
            return new Response(JSON.stringify({ success: false, error: 'Access denied' }), { status: 403 });
        }

        // Fetch teammate details
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

        return new Response(JSON.stringify({ 
            success: true, 
            data: { 
                registration,
                teammates 
            } 
        }), { status: 200 });

    } catch (err) {
        console.error('Error fetching registration details:', err);
        return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
    }
} 