import { NextRequest, NextResponse } from 'next/server';
import { getLinkedInAuthUrl } from '@/lib/adapters/linkedin-api';

export async function GET() {
  return NextResponse.redirect(getLinkedInAuthUrl());
}
