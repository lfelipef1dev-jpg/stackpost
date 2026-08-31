import { NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';

export async function GET(request: Request) {
  const user = await getUserFromToken(request as any);
  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({
    authenticated: true,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
}
