import { cookies } from 'next/headers';
import { supabase } from './supabase';
import { gateCookieValid } from './gate';

export async function getData() {
  const { data, error } = await supabase.rpc('taldan_get_homepage');
  if (error) {
    console.error('homepage fetch failed', error);
    return { profile: null, services: [], projects: [], partners: [], meta: null, copy: {} as Record<string, string> };
  }
  return {
    profile: data?.profile ?? null,
    services: data?.services ?? [],
    projects: data?.projects ?? [],
    partners: data?.partners ?? [],
    meta: data?.meta ?? null,
    copy: (data?.copy ?? {}) as Record<string, string>,
  };
}

/** Text from the site_copy table, with a baked-in fallback for empty slots. */
export function makeT(copy: Record<string, string> | undefined) {
  return (key: string, fallback = '') => (copy?.[key]?.trim() ? copy[key] : fallback);
}

/** True while the pre-launch gate is up and this visitor has no valid cookie. */
export async function isGated(): Promise<boolean> {
  const unlocked = gateCookieValid(cookies().get('taldan_gate')?.value);
  if (unlocked) return false;
  const { data: gateEnabled } = await supabase.rpc('taldan_gate_status');
  return !!gateEnabled;
}

/** The about page and its links only exist once someone has written something. */
export function aboutFilled(copy: Record<string, string> | undefined) {
  const t = makeT(copy);
  return !!(t('about_body') || t('about_founder_text') || t('about_teaser'));
}
