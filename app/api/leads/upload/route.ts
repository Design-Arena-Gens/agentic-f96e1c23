import { NextResponse } from 'next/server';
import Papa from 'papaparse';
import { getLeads, saveLeads, newId } from '@/lib/db';
import { validateEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const form = await req.formData();
  const url = form.get('url') as string | null;
  let text = '';
  if (url) {
    const res = await fetch(url);
    text = await res.text();
  } else {
    const file = form.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });
    text = await file.text();
  }

  const parsed = Papa.parse(text, { header: true });
  const rows = parsed.data as any[];
  const leads = await getLeads();
  const existingEmails = new Set(leads.map(l => l.email.toLowerCase()));

  let added = 0;
  for (const r of rows) {
    const name = (r.name || r.Name || '').toString().trim();
    const email = (r.email || r.Email || '').toString().trim();
    if (!validateEmail(email)) continue;
    if (existingEmails.has(email.toLowerCase())) continue;
    const lead = {
      id: newId(),
      name,
      email,
      company: (r.company || r.Company || '').toString().trim(),
      niche: (r.niche || r.Niche || '').toString().trim(),
      website: (r.website || r.Website || '').toString().trim(),
      tags: [],
      status: 'pending' as const,
    };
    leads.push(lead);
    existingEmails.add(email.toLowerCase());
    added += 1;
  }
  await saveLeads(leads);
  return NextResponse.json({ added, total: leads.length });
}
