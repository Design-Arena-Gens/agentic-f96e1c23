import { NextResponse } from 'next/server';
import { getAccounts, getLeads, saveLeads } from '@/lib/db';
import { getGmailClientForAccount } from '@/lib/google';

export const dynamic = 'force-dynamic';

export async function GET() {
  const [accounts, leads] = await Promise.all([getAccounts(), getLeads()]);
  const byEmail = new Map(leads.map(l => [l.email.toLowerCase(), l] as const));
  let matches = 0;
  for (const account of accounts) {
    const gmail = await getGmailClientForAccount(account);
    // Search last day's replies in inbox to our sent items
    const q = 'newer_than:7d -from:me';
    const list = await gmail.users.messages.list({ userId: 'me', q, maxResults: 50 });
    const msgs = list.data.messages || [];
    for (const m of msgs) {
      const full = await gmail.users.messages.get({ userId: 'me', id: m.id! });
      const headers = full.data.payload?.headers || [];
      const from = headers.find(h => h.name?.toLowerCase() === 'from')?.value || '';
      const emailMatch = from.match(/<([^>]+)>/) || from.match(/([^\s@]+@[^\s@]+\.[^\s@]+)/);
      const email = (emailMatch ? emailMatch[1] || emailMatch[0] : '').toLowerCase();
      if (email && byEmail.has(email)) {
        const lead = byEmail.get(email)!;
        if (lead.status !== 'replied') {
          lead.status = 'replied';
          matches += 1;
        }
      }
    }
  }
  await saveLeads(leads);
  return NextResponse.json({ matched: matches });
}
