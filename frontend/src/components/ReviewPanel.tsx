import React, { useEffect, useState } from 'react';
import { useToast } from './ToastProvider';

interface Review {
  id: string;
  rating: number;
  title?: string;
  body: string;
  createdAt: string;
}

interface ReviewPanelProps {
  apiBase: string;
  userEmail: string;
  gearItemId?: string;
  itineraryId?: string;
  companionRequestId?: string;
  targetUserId?: string;
  onBack: () => void;
}

const ReviewPanel: React.FC<ReviewPanelProps> = ({ apiBase, userEmail, gearItemId, itineraryId, companionRequestId, targetUserId, onBack }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const queryParams = new URLSearchParams();
  if (gearItemId) queryParams.set('gearItemId', gearItemId);
  if (itineraryId) queryParams.set('itineraryId', itineraryId);
  if (targetUserId) queryParams.set('targetUserId', targetUserId);
  if (companionRequestId) queryParams.set('companionRequestId', companionRequestId);

  async function fetchReviews() {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${apiBase}/reviews?${queryParams.toString()}`);
      const json = await res.json();
      setReviews(Array.isArray(json.data) ? json.data : []);
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }
  useEffect(()=>{ fetchReviews(); }, [gearItemId, itineraryId, targetUserId]);

  const { push } = useToast();

  async function submitReview(e: React.FormEvent) {
    e.preventDefault(); if (!userEmail) return;
    setSubmitting(true); setError(null);
    try {
      const payload: any = { rating, body }; if (title) payload.title = title; if (gearItemId) payload.gearItemId = gearItemId; if (itineraryId) payload.itineraryId = itineraryId; if (targetUserId) payload.targetUserId = targetUserId;
      const res = await fetch(`${apiBase}/reviews`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-user-email': userEmail }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error('Failed to submit review');
      setTitle(''); setBody(''); setRating(5);
      fetchReviews();
      push({ title: 'Review submitted', type: 'success' });
    } catch (e: any) { setError(e.message); } finally { setSubmitting(false); }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <button className="btn" onClick={onBack}>Back</button>
        <h3 className="text-lg font-semibold">Reviews</h3>
        {gearItemId && <span className="badge">Gear</span>}
        {itineraryId && <span className="badge">Itinerary</span>}
        {companionRequestId && <span className="badge">Companion Req.</span>}
        {targetUserId && <span className="badge">User</span>}
      </div>
      <form onSubmit={submitReview} className="card space-y-4">
        <h4 className="text-sm font-medium">Write a Review</h4>
        {error && <div className="callout bg-rose-500/10 text-rose-600 dark:text-rose-400">{error}</div>}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Context</label>
            <select className="input" onChange={e=> {/* placeholder context switch */}} value={gearItemId? 'gear': itineraryId? 'itinerary': companionRequestId? 'companionRequest': targetUserId? 'user': 'gear'}>
              <option value="gear">Gear</option>
              <option value="itinerary">Itinerary</option>
              <option value="companionRequest">Companion Request</option>
              <option value="user">User</option>
            </select>
          </div>
          <div>
            <label className="label">Rating</label>
            <select className="input" value={rating} onChange={e=> setRating(Number(e.target.value))}>
              {[5,4,3,2,1].map(r=> <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Title (optional)</label>
            <input className="input" value={title} onChange={e=> setTitle(e.target.value)} placeholder="Great quality!" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Body</label>
            <textarea className="input min-h-[100px]" value={body} onChange={e=> setBody(e.target.value)} placeholder="Share your experience" required />
          </div>
        </div>
  <button className="btn-brand" disabled={submitting || !userEmail}>{submitting ? 'Submitting...' : 'Submit Review'}</button>
      </form>
      <div>
        <h4 className="font-medium text-sm mb-4">Existing Reviews</h4>
        {loading && <p className="text-sm text-muted">Loading...</p>}
        <div className="space-y-4">
          {reviews.map(r => (
            <div key={r.id} className="glass-card p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">Rating: {r.rating}</span>
                <span className="text-[10px] text-muted">{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
              {r.title && <h5 className="font-semibold text-sm mt-1">{r.title}</h5>}
              <p className="text-xs text-muted mt-1 leading-relaxed whitespace-pre-line">{r.body}</p>
            </div>
          ))}
          {reviews.length===0 && !loading && <div className="text-sm text-muted">No reviews yet.</div>}
        </div>
      </div>
    </div>
  );
};

export default ReviewPanel;
