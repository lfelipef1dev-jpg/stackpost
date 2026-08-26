import { NextRequest, NextResponse } from 'next/server';
import { publishPost } from '@/lib/publisher';

export async function POST(req: NextRequest) {
  const { postId } = await req.json();
  const result = await publishPost(postId);
  return NextResponse.json(result);
}
