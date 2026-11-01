import { supabase } from './supabase';

/**
 * Gate secret for the dashboard RPCs. Server-side only — never shipped to the
 * browser. The browser authenticates to /api/admin with the dashboard password;
 * the server is what presents this secret to Postgres. Keeping these separate
 * means a leaked page bundle can't be used to read the database directly, and
 * password guesses have to go through our route rather than straight at Supabase.
 */
export const ADMIN_SECRET = process.env.TALDAN_ADMIN_SECRET || '';

/** What the user types into the dashboard login. Set in the Vercel env;
 *  there is deliberately no fallback, so a missing variable locks the
 *  dashboard instead of silently opening it with a guessable default. */
export const DASHBOARD_PASSWORD = process.env.TALDAN_DASHBOARD_PASSWORD || '';

export async function adminAll() {
  const { data, error } = await supabase.rpc('taldan_admin_all', { p_pass: ADMIN_SECRET });
  if (error) throw error;
  return data;
}

export async function adminSave(table: string, row: any) {
  const { data, error } = await supabase.rpc('taldan_admin_save', {
    p_pass: ADMIN_SECRET,
    p_table: table,
    p_row: row,
  });
  if (error) throw error;
  return data;
}

export async function adminDelete(table: string, id: string) {
  const { error } = await supabase.rpc('taldan_admin_delete', {
    p_pass: ADMIN_SECRET,
    p_table: table,
    p_id: id,
  });
  if (error) throw error;
}

/** Batch-updates site_copy rows (key -> new text). Only touches existing
 *  keys — it can never insert an arbitrary new one, since every key is
 *  wired to a specific spot in the site's markup. */
export async function adminSaveCopyBatch(updates: Record<string, string>) {
  const { error } = await supabase.rpc('taldan_admin_save_copy', {
    p_pass: ADMIN_SECRET,
    p_updates: updates,
  });
  if (error) throw error;
}
