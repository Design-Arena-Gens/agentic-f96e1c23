import { NextResponse } from 'next/server';
import { getCampaign, saveCampaign } from '@/lib/db';

export async function POST() {
  const campaign = await getCampaign();
  if (!campaign) return NextResponse.json({ error: 'No campaign' }, { status: 400 });
  campaign.enabled = false;
  await saveCampaign(campaign);
  return NextResponse.json({ ok: true });
}
