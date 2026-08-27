import React, { useEffect, useState } from 'react';
import { Search, X, ExternalLink } from 'lucide-react';

interface ActiveListing {
  id: string;
  asset_id: string;
  listing_code: string | null;
  status: string;
  listing_type: string;
  price: number | null;
  flag_color: string | null;
  is_verified: boolean;
  is_featured: boolean;
  view_count: number;
  click_count: number;
  created_at: string | null;
  owner_name: string | null;
  owner_phone: string | null;
  owner_email: string | null;
}

const FLAG_COLORS: Record<string, string> = {
  blue: '#4A9EFF',
  red: '#FF5C5C',
  pink: '#FF7EB6',
  yellow: '#F5C542',
  green: '#4ADE80',
};

const PER_PAGE = 15;

export default function ActiveListingsPage() {
  const [listings, setListings] = useState<ActiveListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<ActiveListing | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      limit: '50',
      offset: '0',
      ...(search ? { search } : {}),
    });

    fetch('http://localhost:8000/admin/listings/active?' + params.toString(), {
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
      .then((data: { count: number; results: ActiveListing[] }) => {
        setListings(data.results);
        setPage(1);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError('Could not load listings. Try again.');
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(listings.length / PER_PAGE));
  const paginated = listings.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const formatPrice = (price: number | null) => {
    if (price == null) return 'N/A';
    return '$' + price.toLocaleString();
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return 'N/A';
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const styleBlock =
    '* { font-family: -apple-system, BlinkMacSystemFont, Inter, sans-serif; box-sizing: border-box; } ' +
    '.row { cursor: pointer; transition: background 0.12s ease; } ' +
    '.row:hover { background: rgba(255,255,255,0.03); } ' +
    '.modal-backdrop { animation: fadeIn 0.15s ease; } ' +
    '@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }';

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', padding: '32px' }}>
      <style>{styleBlock}</style>

      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 500, color: '#F5F5DC', margin: '0 0 4px 0' }}>
              Active Listings
            </h1>
            <p style={{ fontSize: '11px', color: 'rgba(245,245,220,0.35)' }}>
              {loading ? 'Loading...' : listings.length + ' published listings'}
            </p>
          </div>
        </div>

        <div style={{ position: 'relative', marginBottom: '20px', maxWidth: '360px' }}>
          <Search
            size={13}
            style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(245,245,220,0.3)' }}
          />
          <input
            type="text"
            placeholder="Search by description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 10px 8px 30px',
              background: '#111',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '6px',
              color: '#F5F5DC',
              fontSize: '12px',
              outline: 'none',
            }}
          />
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
                  {['CODE', 'OWNER', 'PHONE', 'PRICE', 'STATUS', 'FLAG', 'VIEWS', 'CLICKS', 'LISTED'].map((h) => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '10px', fontWeight: 600, letterSpacing: '0.04em', color: 'rgba(245,245,220,0.4)', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} style={{ padding: '40px', textAlign: 'center', color: 'rgba(245,245,220,0.3)', fontSize: '12px' }}>
                      Loading listings...
                    </td>
                  </tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ padding: '40px', textAlign: 'center', color: 'rgba(245,245,220,0.3)', fontSize: '12px' }}>
                      No active listings found.
                    </td>
                  </tr>
                ) : (
                  paginated.map((l) => (
                    <tr key={l.id} className="row" onClick={() => setSelected(l)} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '11px 14px', fontSize: '12px', color: '#F5F5DC', fontWeight: 500 }}>
                        {l.listing_code ?? 'N/A'}
                      </td>
                      <td style={{ padding: '11px 14px', fontSize: '12px', color: '#e5e5e5' }}>
                        {l.owner_name ?? 'N/A'}
                      </td>
                      <td style={{ padding: '11px 14px', fontSize: '12px', color: 'rgba(245,245,220,0.6)' }}>
                        {l.owner_phone ?? 'N/A'}
                      </td>
                      <td style={{ padding: '11px 14px', fontSize: '12px', color: '#e5e5e5' }}>
                        {formatPrice(l.price)}
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        <span style={{
                          fontSize: '10px', fontWeight: 600, padding: '3px 8px', borderRadius: '4px',
                          background: l.is_featured ? 'rgba(245,197,66,0.12)' : l.is_verified ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.06)',
                          color: l.is_featured ? '#F5C542' : l.is_verified ? '#4ADE80' : 'rgba(245,245,220,0.5)',
                        }}>
                          {l.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        {l.flag_color ? (
                          <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: FLAG_COLORS[l.flag_color] ?? '#888' }} />
                        ) : (
                          <span style={{ color: 'rgba(245,245,220,0.2)', fontSize: '11px' }}>N/A</span>
                        )}
                      </td>
                      <td style={{ padding: '11px 14px', fontSize: '12px', color: 'rgba(245,245,220,0.6)' }}>
                        {l.view_count}
                      </td>
                      <td style={{ padding: '11px 14px', fontSize: '12px', color: 'rgba(245,245,220,0.6)' }}>
                        {l.click_count}
                      </td>
                      <td style={{ padding: '11px 14px', fontSize: '12px', color: 'rgba(245,245,220,0.6)', whiteSpace: 'nowrap' }}>
                        {formatDate(l.created_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {!loading && listings.length > PER_PAGE && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
            <span style={{ fontSize: '11px', color: 'rgba(245,245,220,0.35)' }}>
              Showing {(page - 1) * PER_PAGE + 1} to {Math.min(page * PER_PAGE, listings.length)} of {listings.length}
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{ padding: '5px 10px', background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', color: page === 1 ? 'rgba(245,245,220,0.2)' : '#F5F5DC', fontSize: '12px', cursor: page === 1 ? 'default' : 'pointer' }}
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  style={{
                    padding: '5px 10px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer',
                    background: p === page ? '#F5F5DC' : '#111',
                    color: p === page ? '#000' : '#F5F5DC',
                    border: '1px solid rgba(255,255,255,0.08)',
                    fontWeight: p === page ? 600 : 400,
                  }}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{ padding: '5px 10px', background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', color: page === totalPages ? 'rgba(245,245,220,0.2)' : '#F5F5DC', fontSize: '12px', cursor: page === totalPages ? 'default' : 'pointer' }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {selected && (
        <div
          className="modal-backdrop"
          onClick={() => setSelected(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '20px' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', maxWidth: '560px', width: '100%', maxHeight: '85vh', overflowY: 'auto' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div>
                <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#F5F5DC', margin: 0 }}>
                  {selected.listing_code ?? 'Listing'}
                </h2>
                <p style={{ fontSize: '11px', color: 'rgba(245,245,220,0.4)', margin: '2px 0 0 0' }}>
                  ID: {selected.id}
                </p>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'transparent', border: 'none', color: 'rgba(245,245,220,0.5)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {[
                ['Owner', selected.owner_name ?? 'N/A'],
                ['Phone', selected.owner_phone ?? 'N/A'],
                ['Email', selected.owner_email ?? 'N/A'],
                ['Price', formatPrice(selected.price)],
                ['Status', selected.status],
                ['Listing type', selected.listing_type],
                ['Views', String(selected.view_count)],
                ['Clicks', String(selected.click_count)],
                ['Listed on', formatDate(selected.created_at)],
              ].map(([label, value]) => (
                <div key={label}>
                  <div style={{ fontSize: '10px', color: 'rgba(245,245,220,0.35)', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
                  <div style={{ fontSize: '13px', color: '#F5F5DC' }}>{value}</div>
                </div>
              ))}
            </div>

            <div style={{ padding: '0 20px 20px' }}>
              
                href={'/admin/assets/' + selected.asset_id}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#4A9EFF', textDecoration: 'none' }}
              >
                View asset details <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}