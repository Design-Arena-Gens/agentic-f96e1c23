import { NextResponse } from 'next/server';
import { getLeads, saveEvents, getEvents } from '@/lib/db';
import { randomUUID } from 'crypto';

const pixel = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==',
  'base64'
);

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const leads = await getLeads();
  const lead = leads.find(l => l.trackingId === id);
  if (lead) {
    const events = await getEvents();
    events.push({ id: randomUUID(), type: 'open', leadId: lead.id, campaignId: lead.campaignId || 'default', at: new Date().toISOString() });
    await saveEvents(events);
  }
  return new NextResponse(pixel, {
    headers: {
      'Content-Type': 'image/gif',
      'Content-Length': pixel.length.toString(),
      'Cache-Control': 'no-store, must-revalidate',
    },
  } as any);
}
