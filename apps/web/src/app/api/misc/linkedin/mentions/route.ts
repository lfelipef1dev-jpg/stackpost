import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

// GET /api/misc/linkedin/mentions?q=texto — buscar pessoas/empresas para mention
export async function GET(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');
  if (!query) return NextResponse.json({ error: 'q (query) obrigatorio' }, { status: 400 });

  const supabase = getSupabase();
  const { data: account } = await supabase
    .from('social_accounts')
    .select('access_token')
    .eq('team_id', user.teamId)
    .eq('platform', 'linkedin')
    .eq('status', 'active')
    .maybeSingle();
  if (!account) return NextResponse.json({ error: 'LinkedIn nao conectado' }, { status: 400 });

  try {
    // LinkedIn people search
    const peopleRes = await fetch(
      `https://api.linkedin.com/v2/people-search?q=${encodeURIComponent(query)}&count=10`,
      { headers: { Authorization: `Bearer ${account.access_token}`, 'X-Restli-Protocol-Version': '2.0.0' } }
    );
    const people = await peopleRes.json();

    // LinkedIn company search
    const companyRes = await fetch(
      `https://api.linkedin.com/v2/companySearch?q=${encodeURIComponent(query)}&count=10`,
      { headers: { Authorization: `Bearer ${account.access_token}`, 'X-Restli-Protocol-Version': '2.0.0' } }
    );
    const companies = await companyRes.json();

    const results: any[] = [];
    for (const p of people.elements || []) {
      results.push({ type: 'person', id: p.id, name: p.fullName, urn: `urn:li:person:${p.id}` });
    }
    for (const c of companies.elements || []) {
      results.push({ type: 'company', id: c.id, name: c.localizedName, urn: `urn:li:organization:${c.id}` });
    }

    return NextResponse.json({ query, results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
