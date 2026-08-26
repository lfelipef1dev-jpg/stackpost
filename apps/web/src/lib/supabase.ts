import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Singleton — uma unica instancia reutilizada em todas as chamadas
// Segue o mesmo padrao do NEXUS-IA (compativel com Cloudflare Workers)
let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (_client) return _client;

  const url = (process as any).env?.NEXT_PUBLIC_SUPABASE_URL as string;
  const key = (process as any).env?.SUPABASE_SERVICE_ROLE_KEY as string;

  if (!url || !key) {
    throw new Error('Supabase env vars nao configuradas: NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY');
  }

  _client = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      fetch: fetch.bind(globalThis),
    },
  });

  return _client;
}

export default getSupabase;
