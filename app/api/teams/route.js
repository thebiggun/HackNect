import { v4 as uuidv4 } from 'uuid';
import supabase from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

// Function to generate a unique 8-character invite code
const generateInviteCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

export async function GET(req) {
    try {
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

        // Fetch registrations where the user is either team leader or teammate
        const { data: registrations, error: registrationsError } = await supabase
            .from('registrations')
            .select(`
                *,
                hackathons (
                    id,
                    title
                )
            `)
            .or(`team_leader_id.eq.${userData.id},teammates.cs.{${userData.id}}`);

        if (registrationsError) {
            console.error('Error fetching registrations:', registrationsError);
            return new Response(JSON.stringify({ success: false, error: 'Failed to fetch registrations' }), { status: 500 });
        }

        return new Response(JSON.stringify({ success: true, data: registrations }), { status: 200 });
    } catch (err) {
        console.error('Error fetching registrations:', err);
        return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
    }
}

export async function POST(req) {
    try {
        // Get the current user from Clerk
        const { userId } = await auth();
        
        if (!userId) {
            return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401 });
        }

        // Get the user from Supabase using the Clerk ID
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id, name')
            .eq('clerk_id', userId)
            .single();

        if (userError || !userData) {
            console.error('Error finding user in Supabase:', userError);
            return new Response(JSON.stringify({ success: false, error: 'User not found in database' }), { status: 404 });
        }

        const body = await req.json();
        const { action, teamName, hackathonId, inviteCode } = body;

        if (action === 'create') {
            // Check if user already has a registration for this hackathon
            const { data: existingRegistration, error: checkError } = await supabase
                .from('registrations')
                .select('*')
                .eq('hackathon_id', hackathonId)
                .or(`team_leader_id.eq.${userData.id},teammates.cs.{${userData.id}}`)
                .single();

            if (existingRegistration) {
                return new Response(JSON.stringify({ success: false, error: 'You are already registered for this hackathon' }), { status: 400 });
            }

            // Generate a unique invite code
            let inviteCode;
            let isUnique = false;
            let attempts = 0;
            
            while (!isUnique && attempts < 10) {
                inviteCode = generateInviteCode();
                const { data: existingCode, error: codeError } = await supabase
                    .from('registrations')
                    .select('id')
                    .eq('invite_code', inviteCode)
                    .single();
                
                if (!existingCode) {
                    isUnique = true;
                }
                attempts++;
            }

            if (!isUnique) {
                return new Response(JSON.stringify({ success: false, error: 'Failed to generate unique invite code' }), { status: 500 });
            }

            // Create a new registration with invite code
            const { data: registrationData, error: registrationError } = await supabase
                .from('registrations')
                .insert([{
                    hackathon_id: hackathonId,
                    team_leader_id: userData.id,
                    team_name: teamName,
                    teammates: [userData.id], // Include team leader in teammates array
                    invite_code: inviteCode
                }])
                .select()
                .single();

            if (registrationError) {
                console.error('Error creating registration:', registrationError);
                return new Response(JSON.stringify({ success: false, error: 'Failed to create registration' }), { status: 500 });
            }

            return new Response(JSON.stringify({ 
                success: true, 
                data: { 
                    registration: registrationData,
                    inviteCode: inviteCode
                } 
            }), { status: 201 });

        } else if (action === 'join') {
            if (!inviteCode) {
                return new Response(JSON.stringify({ success: false, error: 'Invite code is required' }), { status: 400 });
            }

            // Find the registration with the given invite code
            const { data: registration, error: registrationError } = await supabase
                .from('registrations')
                .select('*')
                .eq('invite_code', inviteCode.toUpperCase())
                .single();

            if (registrationError || !registration) {
                return new Response(JSON.stringify({ success: false, error: 'Invalid invite code' }), { status: 404 });
            }

            // Check if user is already a member of this team
            if (registration.team_leader_id === userData.id || 
                (registration.teammates && registration.teammates.includes(userData.id))) {
                return new Response(JSON.stringify({ success: false, error: 'You are already a member of this team' }), { status: 400 });
            }

            // Check if user is already registered for this hackathon with another team
            const { data: existingRegistration, error: checkError } = await supabase
                .from('registrations')
                .select('*')
                .eq('hackathon_id', registration.hackathon_id)
                .or(`team_leader_id.eq.${userData.id},teammates.cs.{${userData.id}}`)
                .single();

            if (existingRegistration) {
                return new Response(JSON.stringify({ success: false, error: 'You are already registered for this hackathon with another team' }), { status: 400 });
            }

            // Check team size limits
            const currentTeamSize = registration.teammates ? registration.teammates.length + 1 : 1;
            
            // Get hackathon details to check team size limits
            const { data: hackathon, error: hackathonError } = await supabase
                .from('hackathons')
                .select('team_min, team_max')
                .eq('id', registration.hackathon_id)
                .single();

            if (!hackathonError && hackathon) {
                if (hackathon.team_max && currentTeamSize > hackathon.team_max) {
                    return new Response(JSON.stringify({ success: false, error: `Team is full. Maximum ${hackathon.team_max} members allowed.` }), { status: 400 });
                }
            }

            // Add user to the team by updating the teammates array
            const updatedTeammates = registration.teammates ? [...registration.teammates, userData.id] : [userData.id];
            
            const { data: updatedRegistration, error: updateError } = await supabase
                .from('registrations')
                .update({ teammates: updatedTeammates })
                .eq('id', registration.id)
                .select()
                .single();

            if (updateError) {
                console.error('Error joining team:', updateError);
                return new Response(JSON.stringify({ success: false, error: 'Failed to join team' }), { status: 500 });
            }

            return new Response(JSON.stringify({ 
                success: true, 
                data: { 
                    registration: updatedRegistration,
                    message: `Successfully joined team "${registration.team_name}"`
                } 
            }), { status: 200 });

        } else {
            return new Response(JSON.stringify({ success: false, error: 'Invalid action' }), { status: 400 });
        }

    } catch (err) {
        console.error('Error with registration operation:', err);
        return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
    }
} 