"use client";
import React, { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';
interface Acquisition {
  id: string;
  listing_id: string;
  buyer_id: string;
  current_stage: number;
  overall_status: string;
  cancel_reason: string | null;
  created_at: string | null;
}

const STAGE_NAMES: Record<number, string> = {
  1: 'Coordinated Meeting',
  2: 'M1 Asset Verification',
  3: 'Letter of Intent',
  4: 'Escrow',
  5: 'M1 Inspection',
  6: 'Final Decision',
  7: 'Transfer of Assets',
};

const STATUS_COLORS: Record<string, string> = {
  active: '#4ADE80',
  cancelled: '#FF5C5C',
  completed: '#4A9EFF',
};

export default function AcquisitionsListPage() {
  const router = useRouter();
  const [acquisitions, setAcquisitions] = useState<Acquisition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetch('http://localhost:8000/admin/acquisitions?limit=50&offset=0', {
      signal: controller.signal,
      headers: {
        'x-admin-id': '00000000-0000-0000-0000-000000000000',
        'x-admin-type': 'general',
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Request failed (' + res.status + ')');
        }
        return res.json();
      })
      .then((data: { count: number; results: Acquisition[] }) => {
        setAcquisitions(data.results);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError('Could not load acquisitions. Try again.');
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  const formatDate = (iso: string | null) => {
    if (!iso) return 'N/A';
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const styleBlock =
    '* { font-family: -apple-system, BlinkMacSystemFont, Inter, sans-serif; box-sizing: border-box; } ' +
    '.row { cursor: pointer; transition: background 0.12s ease; } ' +
    '.row:hover { background: rgba(255,255,255,0.03); }';

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', padding: '32px' }}>
      <style>{styleBlock}</style>

      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '18px', fontWeight: 500, color: '#F5F5DC', margin: '0 0 4px 0' }}>
            E-Acquisition Process
          </h1>
          <p style={{ fontSize: '11px', color: 'rgba(245,245,220,0.35)' }}>
            {loading ? 'Loading...' : acquisitions.length + ' active acquisitions'}
          </p>
        </div>

        {error && (
          <div style={{ padding: '12px 16px', background: 'rgba(255,92,92,0.08)', border: '1px solid rgba(255,92,92,0.25)', borderRadius: '6px', color: '#FF8080', fontSize: '12px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#111', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  {['ID', 'LISTING', 'BUYER', 'STAGE', 'STATUS', 'CREATED'].map((h) => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '10px', fontWeight: 600, letterSpacing: '0.04em', color: 'rgba(245,245,220,0.4)', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'rgba(245,245,220,0.3)', fontSize: '12px' }}>
                      Loading acquisitions...
                    </td>
                  </tr>
                ) : acquisitions.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'rgba(245,245,220,0.3)', fontSize: '12px' }}>
                      No acquisitions found.
                    </td>
                  </tr>
                ) : (
                  acquisitions.map((a) => (
                    <tr key={a.id} className="row" onClick={() => router.push('/acquisition-test/' + a.id)} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '11px 14px', fontSize: '12px', color: '#F5F5DC', fontWeight: 500 }}>
                        {a.id}
                      </td>
                      <td style={{ padding: '11px 14px', fontSize: '12px', color: '#e5e5e5' }}>
                        {a.listing_id}
                      </td>
                      <td style={{ padding: '11px 14px', fontSize: '12px', color: '#e5e5e5' }}>
                        {a.buyer_id}
                      </td>
                      <td style={{ padding: '11px 14px', fontSize: '12px', color: 'rgba(245,245,220,0.7)' }}>
                        {STAGE_NAMES[a.current_stage] || ('Stage ' + a.current_stage)}
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        <span style={{
                          fontSize: '10px', fontWeight: 600, padding: '3px 8px', borderRadius: '4px',
                          background: 'rgba(255,255,255,0.06)',
                          color: STATUS_COLORS[a.overall_status] || '#F5F5DC',
                        }}>
                          {a.overall_status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '11px 14px', fontSize: '12px', color: 'rgba(245,245,220,0.6)', whiteSpace: 'nowrap' }}>
                        {formatDate(a.created_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
