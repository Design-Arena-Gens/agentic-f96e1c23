import { NextResponse } from 'next/server';
import { getCampaign } from '@/lib/db';

export async function GET() {
  const campaign = await getCampaign();
  return NextResponse.json({ campaign });
}
