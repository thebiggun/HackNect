import { v4 as uuidv4 } from 'uuid';
import supabase from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

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

        // Fetch hackathons created by the user
        const { data: hackathons, error: hackathonsError } = await supabase
            .from('hackathons')
            .select('*')
            .eq('creator_id', userData.id)
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
            .select('id')
            .eq('clerk_id', userId)
            .single();

        if (userError || !userData) {
            console.error('Error finding user in Supabase:', userError);
            return new Response(JSON.stringify({ success: false, error: 'User not found in database' }), { status: 404 });
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
        let banner_url = null;
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
        let pfp_url = null;
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

        // Insert into hackathons table
        const { error: insertError, data: insertData } = await supabase
            .from('hackathons')
            .insert([{
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
                creator_id: userData.id, // Set the creator_id to the user's Supabase ID
            }]);

        if (insertError) throw insertError;

        return new Response(JSON.stringify({ success: true, data: insertData }), { status: 201 });
    } catch (err) {
        console.error('Error creating hackathon:', err);
        return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
    }
}