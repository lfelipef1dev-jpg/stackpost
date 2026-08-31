import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Cliente Supabase do Nexus para OAuth (compartilha providers Google/Discord)
const GLOBAL = globalThis as any;

export function getNexusSupabase(): SupabaseClient {
  const url = (process as any).env?.NEXT_PUBLIC_NEXUS_SUPABASE_URL as string;
  const key = (process as any).env?.NEXT_PUBLIC_NEXUS_SUPABASE_ANON_KEY as string;

  if (!url || !key) {
    throw new Error('Nexus Supabase env vars nao configuradas: NEXT_PUBLIC_NEXUS_SUPABASE_URL e NEXT_PUBLIC_NEXUS_SUPABASE_ANON_KEY');
  }

  if (!GLOBAL.__nexus_supabase_client__) {
    GLOBAL.__nexus_supabase_client__ = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        fetch: fetch.bind(globalThis),
      },
    });
  }

  return GLOBAL.__nexus_supabase_client__;
}

export default getNexusSupabase;
