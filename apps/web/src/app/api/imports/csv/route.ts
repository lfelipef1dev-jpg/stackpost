import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

// POST /api/imports/csv — importar posts via CSV
// CSV format: content,platforms,imageUrl,videoUrl,scheduledAt,firstComment
export async function POST(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { csv, teamId } = body;
  if (!csv || typeof csv !== 'string') {
    return NextResponse.json({ error: 'CSV obrigatorio (string)' }, { status: 400 });
  }

  const supabase = getSupabase();
  const lines = csv.split('\n').filter((l: string) => l.trim());
  if (lines.length < 2) return NextResponse.json({ error: 'CSV vazio ou sem header' }, { status: 400 });

  const headers = lines[0].split(',').map((h: string) => h.trim());
  let imported = 0;
  let failed = 0;

  for (let i = 1; i < lines.length; i++) {
    try {
      const values = lines[i].split(',').map((v: string) => v.trim());
      const row: Record<string, string> = {};
      headers.forEach((h: string, idx: number) => {
        row[h] = values[idx] || '';
      });

      const platforms = (row.platforms || '').split('|').filter(Boolean);
      if (!row.content || platforms.length === 0) { failed++; continue; }

      const { error } = await supabase.from('posts').insert({
        team_id: user.teamId,
        content: row.content,
        platforms,
        upload_ids: row.imageUrl ? [row.imageUrl] : row.videoUrl ? [row.videoUrl] : null,
        scheduled_at: row.scheduledAt || null,
        first_comment: row.firstComment || null,
        status: row.scheduledAt ? 'scheduled' : 'draft',
      });
      if (error) { failed++; continue; }
      imported++;
    } catch {
      failed++;
    }
  }

  return NextResponse.json({ imported, failed, total: lines.length - 1 });
}
