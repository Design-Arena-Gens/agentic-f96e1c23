import { NextResponse } from 'next/server';
import { handleOAuthCallback } from '@/lib/google';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  if (!code) return NextResponse.json({ error: 'Missing code' }, { status: 400 });
  await handleOAuthCallback(code);
  const redirectTo = process.env.NEXT_PUBLIC_BASE_URL || '/';
  return NextResponse.redirect(`${redirectTo}`);
}
