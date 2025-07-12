import { createClient } from '@supabase/supabase-js';

// Create a singleton client for server-side operations
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default supabase; 