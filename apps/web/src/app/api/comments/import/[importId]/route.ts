import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

// GET /api/comments/import/[importId] — status de um import de comentarios
export async function GET(req: NextRequest, { params }: { params: Promise<{ importId: string }> }) {
  const { importId } = await params;
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const supabase = getSupabase();

  try {
    // Buscar imports table
    const { data: importRow, error } = await supabase
      .from('imports')
      .select('*')
      .eq('id', importId)
      .eq('team_id', user.teamId)
      .maybeSingle();

    if (error || !importRow) {
      // Fallback: buscar comentarios importados com esse external_id pattern
      return NextResponse.json({ importId, status: 'not_found' });
    }

    return NextResponse.json(importRow);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/comments/import/[importId] — cancelar/remover import
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ importId: string }> }) {
  const { importId } = await params;
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const supabase = getSupabase();

  try {
    const { error } = await supabase
      .from('imports')
      .delete()
      .eq('id', importId)
      .eq('team_id', user.teamId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
