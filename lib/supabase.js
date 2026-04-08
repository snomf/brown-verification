const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || (!supabaseAnonKey && !supabaseServiceKey)) {
    throw new Error('Missing Supabase URL or Keys');
}

// Client for general use (subject to RLS)
const supabase = createClient(supabaseUrl, supabaseAnonKey || supabaseServiceKey);

// Client for server-side admin use (bypasses RLS)
const supabaseAdmin = supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : supabase;

module.exports = { supabase, supabaseAdmin };
