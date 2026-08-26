import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';
import { writeFile, mkdir, copyFile, readdir, rm } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { v4 as uuid } from 'uuid';
import { spawn } from 'child_process';

const UPLOAD_DIR = 'C:/Users/lfeli/Desktop/StackPost/videos';
const PUBLIC_UPLOADS = 'C:/Users/lfeli/Desktop/StackPost/apps/web/public/uploads';
const CONVERTER = 'C:/Users/lfeli/Desktop/StackPost/converter_upload.py';

function runPython(args: string[]): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const child = spawn('python', [CONVERTER, ...args]);
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (data) => { stdout += data; });
    child.stderr.on('data', (data) => { stderr += data; });
    child.on('close', (code) => resolve({ code: code ?? 0, stdout, stderr }));
  });
}

async function processAndSave(file: File, teamId: string): Promise<{ id: string; url: string; derivatives: Record<string, string> }> {
  await mkdir(UPLOAD_DIR, { recursive: true });
  await mkdir(PUBLIC_UPLOADS, { recursive: true });

  const bytes = await file.arrayBuffer();
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const id = uuid();
  const originalName = `${id}.${ext}`;
  const originalPath = path.join(UPLOAD_DIR, originalName);

  await writeFile(originalPath, Buffer.from(bytes));

  const derivatives: Record<string, string> = {};
  const publicOriginal = path.join(PUBLIC_UPLOADS, originalName);
  await copyFile(originalPath, publicOriginal);

  if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
    const tempDir = path.join(UPLOAD_DIR, `convert_${id}`);
    await mkdir(tempDir, { recursive: true });

    const { code } = await runPython([originalPath, tempDir]);
    if (code === 0) {
      const files = await readdir(tempDir);
      for (const name of files) {
        if (name.endsWith('.jpg')) {
          const key = name.replace('.jpg', '');
          const dest = path.join(PUBLIC_UPLOADS, `${id}_${key}.jpg`);
          await copyFile(path.join(tempDir, name), dest);
          derivatives[key] = `/uploads/${id}_${key}.jpg`;
        }
      }
    }

    try { await rm(tempDir, { recursive: true, force: true }); } catch {}
  }

  const url = `/uploads/${originalName}`;

  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('uploads')
      .insert({ team_id: teamId, file_name: file.name, mime_type: file.type, size: file.size, url });
    if (error) throw error;
  } catch {}

  return { id: originalName, url, derivatives };
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);
    if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File;
      if (!file) return NextResponse.json({ error: 'Arquivo nao enviado' }, { status: 400 });
      const result = await processAndSave(file, user.teamId);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Content-type nao suportado' }, { status: 400 });
  } catch (err: any) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: err.message || 'Erro no upload' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('uploads')
      .select('id, file_name, mime_type, size, url, created_at')
      .eq('team_id', user.teamId)
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
