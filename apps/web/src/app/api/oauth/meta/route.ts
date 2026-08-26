import { NextRequest, NextResponse } from 'next/server';
import { getInstagramAuthUrl } from '@/lib/adapters/instagram-api';

export async function GET() {
  return NextResponse.redirect(getInstagramAuthUrl());
}
