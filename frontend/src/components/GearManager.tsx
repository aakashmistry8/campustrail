import React, { useEffect, useState } from 'react';
import { useToast } from './ToastProvider';
import { cn } from '../lib/utils';

interface GearItem {
  id: string;
  title: string;
  description: string;
  dailyRate: number;
  depositAmount: number;
  condition: string;
  status: string;
  photos: { id: string; url: string }[];
  rentals?: { id: string; status: string; depositStatus?: string; startDate: string; endDate: string; renterId: string }[];
}

interface GearManagerProps {
  apiBase: string;
  userEmail: string;
  onBack: () => void;
  onSelectGear: (id: string) => void;
}

const emptyForm = { title: '', description: '', dailyRate: 0, depositAmount: 0, condition: '', photos: '' };

const GearManager: React.FC<GearManagerProps> = ({ apiBase, userEmail, onBack, onSelectGear }) => {
  const [gear, setGear] = useState<GearItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const { push } = useToast();

  async function fetchGear() {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/gear`, { headers: { 'x-user-email': userEmail } });
      const data = await res.json();
      const items: GearItem[] = Array.isArray(data) ? data : [];
      // fetch review stats for each in parallel (best effort)
      const withRatings = await Promise.all(items.map(async g => {
        try {
          const r = await fetch(`${apiBase}/reviews?gearItemId=${g.id}&pageSize=50`);
            const json = await r.json();
            const list = Array.isArray(json.data) ? json.data : [];
            if (list.length) {
              const avg = list.reduce((s: number, r: any)=> s + (r.rating||0), 0)/list.length;
              return { ...g, avgRating: avg, reviewCount: list.length } as GearItem & { avgRating: number; reviewCount: number };
            }
        } catch {}
        return g;
      }));
      setGear(withRatings as any);
    } catch (e: any) {
      setError(e.message);
    } finally { setLoading(false); }
  }

  useEffect(() => { if (userEmail) fetchGear(); }, [userEmail]);

  async function createGear(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreating(true);
    try {
      const body = { ...form, dailyRate: Number(form.dailyRate), depositAmount: Number(form.depositAmount), photos: form.photos.split(/\s+/).filter(Boolean) };
      const res = await fetch(`${apiBase}/gear`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-user-email': userEmail }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error('Failed to create');
  await fetchGear();
  push({ title: 'Gear draft created', type: 'success' });
      setForm(emptyForm);
    } catch (e: any) { setError(e.message); } finally { setCreating(false); }
  }

  async function publish(id: string) {
  const res = await fetch(`${apiBase}/gear/${id}/publish`, { method: 'POST', headers: { 'x-user-email': userEmail } });
  if (res.ok) push({ title: 'Gear published', type: 'success' }); else push({ title: 'Publish failed', type: 'error' });
  fetchGear();
  }
  async function archive(id: string) {
  const res = await fetch(`${apiBase}/gear/${id}/archive`, { method: 'POST', headers: { 'x-user-email': userEmail } });
  if (res.ok) push({ title: 'Gear archived', type: 'success' }); else push({ title: 'Archive failed', type: 'error' });
  fetchGear();
  }

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-4">
        <button className="btn" onClick={onBack}>Back</button>
        <h3 className="text-lg font-semibold">Manage Gear</h3>
      </div>
      <form onSubmit={createGear} className="card space-y-4">
        <h4 className="font-medium text-sm">Create New Gear (Draft)</h4>
        {error && <div className="callout bg-rose-500/10 text-rose-600 dark:text-rose-400">{error}</div>}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Title</label>
            <input className="input" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} required />
          </div>
          <div>
            <label className="label">Daily Rate (₹)</label>
            <input className="input" type="number" value={form.dailyRate} onChange={e=>setForm(f=>({...f,dailyRate:Number(e.target.value)||0}))} required />
          </div>
          <div>
            <label className="label">Deposit (₹)</label>
            <input className="input" type="number" value={form.depositAmount} onChange={e=>setForm(f=>({...f,depositAmount:Number(e.target.value)||0}))} required />
          </div>
          <div>
            <label className="label">Condition</label>
            <input className="input" value={form.condition} onChange={e=>setForm(f=>({...f,condition:e.target.value}))} required />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Description</label>
            <textarea className="input min-h-[80px]" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} required />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Photo URLs (space separated)</label>
            <input className="input" value={form.photos} onChange={e=>setForm(f=>({...f,photos:e.target.value}))} placeholder="https://... https://..." />
          </div>
        </div>
  <button className="btn-brand" disabled={creating}>{creating? 'Creating...' : 'Create Draft'}</button>
      </form>
  <div>
        <h4 className="font-medium text-sm mb-4">Your Gear Items</h4>
        {loading && <p className="text-sm text-muted">Loading...</p>}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {gear.map(g => (
            <div key={g.id} className="glass-card flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <h5 className="font-semibold text-sm flex items-center gap-2">{g.title}{(g as any).avgRating!=null && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-700 dark:text-amber-300 border border-amber-400/30">{(g as any).avgRating.toFixed(1)}</span>}</h5>
                <span className={cn('text-[10px] px-2 py-0.5 rounded-full border', g.status==='PUBLISHED' ? 'bg-emerald-500/12 text-emerald-600 border-emerald-500/25 dark:text-emerald-400':'bg-brand-faint/30 text-soft border-brand-border/60')}>{g.status}</span>
              </div>
              <p className="text-xs text-muted mt-1 line-clamp-3">{g.description}</p>
              <div className="mt-2 text-[11px] flex flex-wrap gap-2 text-muted">
                <span>₹{g.dailyRate}/day</span>
                <span>Deposit ₹{g.depositAmount}</span>
              </div>
              <div className="mt-3 flex gap-2 flex-wrap">
                {g.photos.slice(0,3).map(p => <img key={p.id} src={p.url} alt="gear" className="h-12 w-12 object-cover rounded-md border border-slate-200/60 dark:border-slate-800/60" />)}
              </div>
              <div className="mt-4 flex gap-2 flex-wrap">
                {g.status !== 'PUBLISHED' && <button type="button" className="btn-brand h-8 px-4" onClick={()=>publish(g.id)}>Publish</button>}
                {g.status === 'PUBLISHED' && <button type="button" className="btn-outline h-8 px-4" onClick={()=>archive(g.id)}>Archive</button>}
                <button type="button" className="btn-ghost h-8 px-3" onClick={()=> onSelectGear(g.id)}>Reviews</button>
              </div>
              {g.rentals && g.rentals.slice(0,1).map(r => (
                <div key={r.id} className="mt-4 border-t border-slate-200 dark:border-slate-800 pt-3 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-muted">
                    <span>Rental {r.status}</span>
                    <span>{new Date(r.startDate).toLocaleDateString()} – {new Date(r.endDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button type="button" className="btn-outline h-7 px-3 text-[11px]" onClick={async ()=>{ const res = await fetch(`${apiBase}/rentals/${r.id}/hold-deposit`, { method: 'POST', headers: { 'x-user-email': userEmail } }); push({ title: res.ok? 'Deposit Held':'Hold Failed', type: res.ok? 'success':'error' }); fetchGear(); }}>Hold</button>
                    <button type="button" className="btn-brand h-7 px-3 text-[11px]" onClick={async ()=>{ const res = await fetch(`${apiBase}/rentals/${r.id}/capture-deposit`, { method: 'POST', headers: { 'x-user-email': userEmail } }); push({ title: res.ok? 'Deposit Captured':'Capture Failed', type: res.ok? 'success':'error' }); fetchGear(); }}>Capture</button>
                    <button type="button" className="btn-ghost h-7 px-3 text-[11px]" onClick={async ()=>{ const res = await fetch(`${apiBase}/rentals/${r.id}/release-deposit`, { method: 'POST', headers: { 'x-user-email': userEmail } }); push({ title: res.ok? 'Deposit Released':'Release Failed', type: res.ok? 'success':'error' }); fetchGear(); }}>Release</button>
                  </div>
                </div>
              ))}
            </div>
          ))}
          {gear.length===0 && !loading && <div className="text-sm text-muted">No gear yet.</div>}
        </div>
      </div>
    </div>
  );
};

export default GearManager;
