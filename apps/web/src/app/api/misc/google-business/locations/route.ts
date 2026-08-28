import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

// GET /api/misc/google-business/locations — listar locations do Google Business
export async function GET(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const supabase = getSupabase();
  const { data: account } = await supabase
    .from('social_accounts')
    .select('access_token, platform_metadata')
    .eq('team_id', user.teamId)
    .eq('platform', 'google_business')
    .eq('status', 'active')
    .maybeSingle();
  if (!account) return NextResponse.json({ error: 'Google Business nao conectado' }, { status: 400 });

  try {
    // Buscar accounts
    const accRes = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
      headers: { Authorization: `Bearer ${account.access_token}` },
    });
    const accData = await accRes.json();

    const locations: any[] = [];
    for (const acc of accData.accounts || []) {
      const locRes = await fetch(
        `https://mybusinessbusinessinformation.googleapis.com/v1/accounts/${acc.name}/locations?readMask=name,title,storefrontAddress,metadata`,
        { headers: { Authorization: `Bearer ${account.access_token}` } }
      );
      const locData = await locRes.json();
      if (locData.locations) {
        locations.push(...locData.locations);
      }
    }

    return NextResponse.json({ locations });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
