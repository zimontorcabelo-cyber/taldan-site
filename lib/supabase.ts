import { createClient } from '@supabase/supabase-js';

// Taldan lives in its own `taldan_site` Postgres schema inside the shared
// Supabase project. Hosted Supabase only exposes schemas listed in a
// dashboard-only setting, so the app reaches taldan_site through two
// SECURITY DEFINER RPC functions that live in the already-exposed
// `public` schema (taldan_get_homepage / taldan_submit_inquiry).
// The anon key is RLS-gated and safe to ship client-side.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gvrqluwgxupfepfdtqyl.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2cnFsdXdneHVwZmVwZmR0cXlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyODQ1OTksImV4cCI6MjA5NTg2MDU5OX0.6aymT1VglCH83NeC4_t6GwdLoP9vTc18SU8IhpYudoo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
