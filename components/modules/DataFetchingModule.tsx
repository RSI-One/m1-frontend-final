'use client';

import { useState, useEffect } from 'react';
import { authService } from '@/lib/admin-auth';
import Table from '@/components/ui/Table';
import Modal from '@/components/modals/Modal';

interface MarketNews {
  id: string;
  heading: string;
  body_text: string;
  image_url?: string;
  link?: string;
  created_at?: string;
}

function getApiBase(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
  if (envUrl) return envUrl.replace(/\/$/, '');
  if (typeof window !== 'undefined') return '/backend';
  return 'http://127.0.0.1:8000';
}

async function apiCall(path: string, options: RequestInit = {}) {
  const token = authService.getAccessToken();
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const base = getApiBase();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = base && cleanPath.startsWith(base) ? cleanPath : `${base}${cleanPath}`;

  const res = await fetch(url, { ...options, headers, credentials: 'include' });
  const raw = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(raw?.detail ?? raw?.message ?? `Request failed (${res.status})`);
  }
  return raw && typeof raw === 'object' && 'data' in raw && raw.data !== undefined ? raw.data : raw;
}

export default function DataFetchingModule({ showToast }: { showToast?: (msg: string) => void }) {
  const [tab, setTab] = useState<'intel' | 'news'>('intel');
  const [intelData, setIntelData] = useState<any>(null);
  const [newsList, setNewsList] = useState<MarketNews[]>([]);
  const [loading, setLoading] = useState(false);

  // Add news modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [heading, setHeading] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      if (tab === 'intel') {
        const intel = await apiCall('/admin/data-fetching/asset-intelligence');
        setIntelData(intel);
      } else {
        const res = await apiCall('/admin/data-fetching/market-news');
        setNewsList(res?.results ?? (Array.isArray(res) ? res : []));
      }
    } catch (err: any) {
      showToast?.(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [tab]);

  async function handleAddNews(e: React.FormEvent) {
    e.preventDefault();
    if (!heading.trim() || !bodyText.trim()) return;
    try {
      setSubmitting(true);
      await apiCall('/admin/data-fetching/market-news', {
        method: 'POST',
        body: JSON.stringify({
          heading: heading.trim(),
          body_text: bodyText.trim(),
          image_url: imageUrl.trim() || undefined,
          link: linkUrl.trim() || undefined,
        }),
      });
      showToast?.('Market news published successfully.');
      setShowAddModal(false);
      setHeading('');
      setBodyText('');
      setImageUrl('');
      setLinkUrl('');
      loadData();
    } catch (err: any) {
      showToast?.(err.message || 'Failed to add news');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteNews(id: string) {
    try {
      await apiCall(`/admin/data-fetching/market-news/${id}`, { method: 'DELETE' });
      showToast?.('News article removed.');
      loadData();
    } catch (err: any) {
      showToast?.(err.message || 'Failed to delete news');
    }
  }

  return (
    <div style={{ padding: '0 8px' }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <button
          className={`btn ${tab === 'intel' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setTab('intel')}
        >
          Asset Intelligence
        </button>
        <button
          className={`btn ${tab === 'news' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setTab('news')}
        >
          Market News
        </button>
      </div>

      {tab === 'intel' ? (
        <div>
          <div className="panel-head" style={{ marginBottom: 16 }}>
            <h3>Global Asset Intelligence</h3>
            <span className="meta">{loading ? 'Fetching live intelligence…' : 'Market metrics'}</span>
          </div>

          {loading ? (
            <div style={{ color: '#888', padding: 24 }}>Analyzing market feeds…</div>
          ) : intelData ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
              {Object.entries(intelData).map(([key, val]: any) => (
                <div key={key} className="panel" style={{ padding: 18, border: '1px solid #222', borderRadius: 8, background: '#111' }}>
                  <div style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', marginBottom: 6 }}>
                    {key.replace(/_/g, ' ')}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 'bold', color: '#fff' }}>
                    {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: '#888', padding: 24 }}>No intelligence feed available currently.</div>
          )}
        </div>
      ) : (
        <div>
          <div className="panel-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3 style={{ margin: 0 }}>Market News Feed</h3>
              <span className="meta">{loading ? 'Loading…' : `${newsList.length} articles published`}</span>
            </div>
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              + Add News Article
            </button>
          </div>

          <Table
            columns={[
              { key: 'heading', label: 'Headline' },
              { key: 'body', label: 'Preview', muted: true },
              { key: 'link', label: 'Reference Link', muted: true },
              { key: 'created', label: 'Date', muted: true },
              { key: 'actions', label: 'Actions' },
            ]}
            rows={newsList.map((item) => ({
              heading: <strong>{item.heading}</strong>,
              body: <span style={{ maxWidth: 300, display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.body_text}</span>,
              link: item.link ? <a href={item.link} target="_blank" rel="noreferrer" style={{ color: '#3b82f6' }}>View</a> : '—',
              created: item.created_at ? new Date(item.created_at).toLocaleDateString() : '—',
              actions: (
                <button
                  className="btn btn-ghost"
                  style={{ color: '#ff4d4f', padding: '4px 8px', fontSize: 12 }}
                  onClick={() => handleDeleteNews(item.id)}
                >
                  Delete
                </button>
              ),
            }))}
          />

          {showAddModal && (
            <Modal title="Add Market News Article" onClose={() => setShowAddModal(false)}>
              <form onSubmit={handleAddNews} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Headline</label>
                  <input
                    type="text"
                    required
                    className="input"
                    style={{ width: '100%', padding: '8px 12px', background: '#111', border: '1px solid #333', color: '#fff', borderRadius: 4 }}
                    placeholder="Headline title"
                    value={heading}
                    onChange={(e) => setHeading(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Content / Body</label>
                  <textarea
                    required
                    rows={4}
                    className="input"
                    style={{ width: '100%', padding: '8px 12px', background: '#111', border: '1px solid #333', color: '#fff', borderRadius: 4 }}
                    placeholder="Article text"
                    value={bodyText}
                    onChange={(e) => setBodyText(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Image URL (Optional)</label>
                  <input
                    type="url"
                    className="input"
                    style={{ width: '100%', padding: '8px 12px', background: '#111', border: '1px solid #333', color: '#fff', borderRadius: 4 }}
                    placeholder="https://images.unsplash.com/..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>External Link (Optional)</label>
                  <input
                    type="url"
                    className="input"
                    style={{ width: '100%', padding: '8px 12px', background: '#111', border: '1px solid #333', color: '#fff', borderRadius: 4 }}
                    placeholder="https://..."
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Publishing…' : 'Publish Article'}
                  </button>
                </div>
              </form>
            </Modal>
          )}
        </div>
      )}
    </div>
  );
}
