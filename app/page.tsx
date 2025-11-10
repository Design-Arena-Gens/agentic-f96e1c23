"use client";
import React, { useEffect, useState } from 'react';

export default function HomePage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [campaign, setCampaign] = useState<any | null>(null);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const [accRes, leadsRes, campRes] = await Promise.all([
      fetch('/api/accounts/list').then(r => r.json()),
      fetch('/api/leads/list').then(r => r.json()),
      fetch('/api/campaign/get').then(r => r.json())
    ]);
    setAccounts(accRes.accounts || []);
    setLeads(leadsRes.leads || []);
    setCampaign(campRes.campaign || null);
  }

  useEffect(() => { refresh(); }, []);

  function googleConnect() {
    window.location.href = '/api/auth/google/start';
  }

  async function uploadCsv(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    setBusy(true);
    await fetch('/api/leads/upload', { method: 'POST', body: fd });
    await refresh();
    setBusy(false);
  }

  async function createOrUpdateCampaign(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const fd = new FormData(ev.currentTarget);
    setBusy(true);
    await fetch('/api/campaign/save', { method: 'POST', body: fd });
    await refresh();
    setBusy(false);
  }

  async function startCampaign() {
    setBusy(true);
    await fetch('/api/campaign/start', { method: 'POST' });
    await refresh();
    setBusy(false);
  }
  async function pauseCampaign() {
    setBusy(true);
    await fetch('/api/campaign/pause', { method: 'POST' });
    await refresh();
    setBusy(false);
  }
  async function checkReplies() {
    setBusy(true);
    await fetch('/api/replies/check');
    await refresh();
    setBusy(false);
  }

  return (
    <div className="space-y-8">
      <section className="card">
        <h2 className="text-lg font-semibold">Accounts</h2>
        <p className="text-sm text-gray-600">Connect one or more Gmail accounts.</p>
        <div className="mt-3 flex items-center gap-3">
          <button onClick={googleConnect} className="rounded bg-black px-3 py-1.5 text-white">Connect Gmail</button>
          <span className="text-sm">Connected: {accounts.length}</span>
        </div>
        <ul className="mt-3 list-disc pl-6 text-sm">
          {accounts.map(a => (
            <li key={a.id}>{a.email} <span className="badge">sent today: {a.dailySent||0}</span></li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold">Leads</h2>
        <input type="file" accept=".csv" onChange={uploadCsv} />
        <p className="text-sm text-gray-600 mt-2">Total leads: {leads.length}</p>
        <div className="mt-2 max-h-48 overflow-auto">
          <table className="table text-sm">
            <thead><tr><th>Name</th><th>Email</th><th>Company</th><th>Niche</th><th>Status</th></tr></thead>
            <tbody>
              {leads.slice(0,50).map(l => (
                <tr key={l.id}><td>{l.name}</td><td>{l.email}</td><td>{l.company}</td><td>{l.niche}</td><td>{l.status}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold">Campaign</h2>
        <form onSubmit={createOrUpdateCampaign} className="grid grid-cols-2 gap-4 mt-3">
          <label className="text-sm">Daily send limit (all accounts)
            <input name="dailyLimit" type="number" defaultValue={campaign?.dailyLimit||200} className="mt-1 w-full rounded border p-2" />
          </label>
          <label className="text-sm">Tone
            <select name="tone" defaultValue={campaign?.tone||'friendly'} className="mt-1 w-full rounded border p-2">
              <option value="friendly">friendly</option>
              <option value="professional">professional</option>
              <option value="casual">casual</option>
            </select>
          </label>
          <label className="text-sm col-span-2">Follow-up days (comma-separated)
            <input name="followups" type="text" defaultValue={(campaign?.followups||[3,7]).join(',')} className="mt-1 w-full rounded border p-2" />
          </label>
          <label className="text-sm col-span-2">Niche context (optional)
            <input name="niche" type="text" defaultValue={campaign?.niche||''} className="mt-1 w-full rounded border p-2" />
          </label>
          <div className="col-span-2 flex items-center gap-3">
            <button disabled={busy} className="rounded bg-blue-600 px-3 py-1.5 text-white">Save</button>
            <button type="button" disabled={busy} onClick={startCampaign} className="rounded bg-green-600 px-3 py-1.5 text-white">Start</button>
            <button type="button" disabled={busy} onClick={pauseCampaign} className="rounded bg-yellow-600 px-3 py-1.5 text-white">Pause</button>
            <button type="button" disabled={busy} onClick={checkReplies} className="rounded bg-gray-800 px-3 py-1.5 text-white">Check Replies</button>
            <span className="text-sm">Status: {campaign?.enabled ? 'running' : 'paused'}</span>
          </div>
        </form>
      </section>
    </div>
  );
}
