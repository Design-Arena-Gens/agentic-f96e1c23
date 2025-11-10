import { NextResponse } from 'next/server';
import { getCampaign, saveCampaign } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function POST(req: Request) {
  const form = await req.formData();
  const dailyLimit = parseInt(String(form.get('dailyLimit') || '200'), 10);
  const tone = String(form.get('tone') || 'friendly') as any;
  const followups = String(form.get('followups') || '3,7').split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
  const niche = String(form.get('niche') || '');

  const prev = await getCampaign();
  const campaign = {
    id: prev?.id || randomUUID(),
    dailyLimit: dailyLimit > 0 ? dailyLimit : 200,
    tone,
    followups: followups.length ? followups : [3,7],
    niche: niche || undefined,
    enabled: prev?.enabled ?? false,
  };
  await saveCampaign(campaign);
  return NextResponse.json({ ok: true, campaign });
}
