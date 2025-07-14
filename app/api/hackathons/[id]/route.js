import { v4 as uuidv4 } from 'uuid';
import supabase from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

export async function GET(req, context) {
    try {
        const { params } = await context;
        const { id } = params;
        
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

        // Fetch the specific hackathon
        const { data: hackathon, error: hackathonError } = await supabase
            .from('hackathons')
            .select('*')
            .eq('id', id)
            .single();

        if (hackathonError || !hackathon) {
            console.error('Error fetching hackathon:', hackathonError);
            return new Response(JSON.stringify({ success: false, error: 'Hackathon not found' }), { status: 404 });
        }

        // Check if user is the creator
        const isCreator = hackathon.creator_id === userData.id;

        return new Response(JSON.stringify({ 
            success: true, 
            data: hackathon,
            isCreator 
        }), { status: 200 });
    } catch (err) {
        console.error('Error fetching hackathon:', err);
        return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
    }
}

export async function PUT(req, context) {
    try {
        const { params } = await context;
        const { id } = params;
        
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

        // Check if user is the creator of this hackathon
        const { data: existingHackathon, error: checkError } = await supabase
            .from('hackathons')
            .select('creator_id')
            .eq('id', id)
            .single();

        if (checkError || !existingHackathon) {
            return new Response(JSON.stringify({ success: false, error: 'Hackathon not found' }), { status: 404 });
        }

        if (existingHackathon.creator_id !== userData.id) {
            return new Response(JSON.stringify({ success: false, error: 'Unauthorized to edit this hackathon' }), { status: 403 });
        }

        const formData = await req.formData();
        
        // Extract form fields
        const title = formData.get('title');
        const description = formData.get('description');
        const team_min = formData.get('team_min');
        const team_max = formData.get('team_max');
        const top_n_selections = formData.get('top_n_selections');
        const registration_deadline = formData.get('registration_deadline');
        const venue = formData.get('venue');
        const prizes = formData.get('prizes');
        const timeline = formData.get('timeline');
        
        // Handle banner upload
        let banner_url = existingHackathon.banner_url;
        const bannerFile = formData.get('banner_url');
        if (bannerFile && bannerFile instanceof File) {
            const bannerExt = bannerFile.name.split('.').pop();
            const bannerPath = `banners/${uuidv4()}.${bannerExt}`;
            const { data, error } = await supabase.storage
                .from('hackathons')
                .upload(bannerPath, bannerFile, {
                    contentType: bannerFile.type,
                });
            if (error) throw error;
            banner_url = supabase.storage.from('hackathons').getPublicUrl(bannerPath).data.publicUrl;
        }

        // Handle pfp upload
        let pfp_url = existingHackathon.pfp_url;
        const pfpFile = formData.get('pfp_url');
        if (pfpFile && pfpFile instanceof File) {
            const pfpExt = pfpFile.name.split('.').pop();
            const pfpPath = `pfps/${uuidv4()}.${pfpExt}`;
            const { data, error } = await supabase.storage
                .from('hackathons')
                .upload(pfpPath, pfpFile, {
                    contentType: pfpFile.type,
                });
            if (error) throw error;
            pfp_url = supabase.storage.from('hackathons').getPublicUrl(pfpPath).data.publicUrl;
        }

        // Update the hackathon
        const { error: updateError, data: updateData } = await supabase
            .from('hackathons')
            .update({
                title,
                description,
                team_min: team_min ? parseInt(team_min) : null,
                team_max: team_max ? parseInt(team_max) : null,
                top_n_selections: top_n_selections ? parseInt(top_n_selections) : null,
                registration_deadline,
                venue,
                prizes,
                timeline,
                banner_url,
                pfp_url,
            })
            .eq('id', id)
            .select()
            .single();

        if (updateError) throw updateError;

        return new Response(JSON.stringify({ success: true, data: updateData }), { status: 200 });
    } catch (err) {
        console.error('Error updating hackathon:', err);
        return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
    }
} 