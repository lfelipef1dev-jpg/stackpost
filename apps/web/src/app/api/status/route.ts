import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// Status endpoint - returns real system health
export async function GET(req: NextRequest) {
  const checks: { service: string; status: string; latency?: number }[] = [];

  // Check Supabase
  try {
    const start = Date.now();
    const supabase = getSupabase();
    const { error } = await supabase.from('teams').select('id').limit(1);
    const latency = Date.now() - start;
    checks.push({ service: 'Supabase', status: error ? 'degraded' : 'operational', latency });
  } catch {
    checks.push({ service: 'Supabase', status: 'down' });
  }

  // Check Cloudflare R2 (if configured)
  const r2Configured = !!process.env.R2_ACCESS_KEY_ID;
  checks.push({ service: 'Cloudflare R2', status: r2Configured ? 'operational' : 'not_configured' });

  // Check OAuth providers
  const oauthProviders = ['META_APP_ID', 'LINKEDIN_CLIENT_ID', 'TWITTER_CLIENT_ID', 'TIKTOK_CLIENT_KEY', 'GOOGLE_CLIENT_ID'];
  for (const p of oauthProviders) {
    checks.push({ service: `OAuth ${p.replace('_ID', '').replace('_KEY', '')}`, status: process.env[p] ? 'configured' : 'not_configured' });
  }

  const allOperational = checks.every(c => c.status === 'operational' || c.status === 'configured' || c.status === 'not_configured');
  
  return NextResponse.json({
    status: allOperational ? 'operational' : 'degraded',
    timestamp: new Date().toISOString(),
    services: checks,
    version: '1.0.0',
  });
}
