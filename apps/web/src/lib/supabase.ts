import { createClient, SupabaseClient } from '@supabase/supabase-js';

export function getSupabase(): SupabaseClient {
  const url = (process as any).env?.NEXT_PUBLIC_SUPABASE_URL as string;
  const key = (process as any).env?.SUPABASE_SERVICE_ROLE_KEY as string;

  if (!url || !key) {
    throw new Error('Supabase env vars nao configuradas: NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      fetch: fetch.bind(globalThis),
    },
  });
}

export default getSupabase;
