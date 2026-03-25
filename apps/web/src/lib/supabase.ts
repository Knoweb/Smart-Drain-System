/**
 * SUPABASE CLIENT — src/lib/supabase.ts
 * ---------------------------------------------------------------------------
 * WHY A SINGLE CLIENT INSTANCE?
 * Creating multiple Supabase clients wastes WebSocket connections and can
 * cause auth state inconsistencies. This file exports ONE shared instance
 * that the entire app imports and reuses.
 *
 * HOW ENVIRONMENT VARIABLES WORK IN VITE:
 * Variables prefixed with VITE_ are injected at build time.
 * They are read-only strings, safe to expose in the browser
 * because the anon key is designed for public client use — 
 * actual security is enforced by Supabase Row Level Security (RLS).
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('YOUR_PROJECT_ID')) {
    console.warn(
        '⚠️  Supabase credentials not configured.\n' +
        'Open apps/web/.env.local and replace the placeholder values.\n' +
        'App will load but database calls will fail until configured.'
    )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
