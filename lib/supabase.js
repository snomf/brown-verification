import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase URL or Anon Key')
}

// Client for general use (subject to RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Client for server-side admin use (bypasses RLS)
// Note: This only works on the server because SUPABASE_SERVICE_ROLE_KEY is not NEXT_PUBLIC_
export const supabaseAdmin = supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : supabase
