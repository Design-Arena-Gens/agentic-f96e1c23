import { NextResponse } from 'next/server';
import { getCampaign, saveCampaign } from '@/lib/db';
import { scheduleInitialTasks } from '@/lib/scheduler';

export async function POST() {
  const campaign = await getCampaign();
  if (!campaign) return NextResponse.json({ error: 'No campaign' }, { status: 400 });
  campaign.enabled = true;
  await saveCampaign(campaign);
  await scheduleInitialTasks();
  return NextResponse.json({ ok: true });
}
