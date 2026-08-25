'use client';

import { useState } from 'react';
import { listings, approvals, incomplete } from '@/lib/admin-data';
import Modal from '@/components/modals/Modal';

const jetImg = (i: number) =>
  `https://images.unsplash.com/${
    [
      'photo-1540962351504-03099e0a754b',
      'photo-1474302770737-173ee21bab63',
      'photo-1635672033263-a19f27eaefa8',
      'photo-1619659085985-f51a00f0160a',
    ][i % 4]
  }?w=600&h=400&fit=crop&auto=format`;

function generateAdminDocs(listingId: string, isVerified: boolean) {
  const templates = [
    {
      name: 'FAA Form 8050-3 Registration Certificate',
      category: 'Ownership & Legal',
      type: 'pdf',
      size: '2.4 MB',
    },
    {
      name: 'Standard Certificate of Airworthiness',
      category: 'Ownership & Legal',
      type: 'pdf',
      size: '1.8 MB',
    },
    {
      name: 'Lien Release & Title Clearance Guarantee',
      category: 'Ownership & Legal',
      type: 'pdf',
      size: '3.1 MB',
    },
    {
      name: 'Engine Logbook #1 (Left Engine)',
      category: 'Engine & APU',
      type: 'pdf',
      size: '15.2 MB',
    },
    {
      name: 'Engine Logbook #2 (Right Engine)',
      category: 'Engine & APU',
      type: 'pdf',
      size: '14.8 MB',
    },
    {
      name: 'Pre-Purchase Inspection Audit Report 2026',
      category: 'Inspection & Financial',
      type: 'pdf',
      size: '18.6 MB',
    },
  ];

  return templates.map((t, idx) => ({
    id: `DOC-${listingId}-${101 + idx}`,
    name: t.name,
    category: t.category,
    uploadDate: `2026-07-${10 + idx}`,
    fileType: t.type,
    fileSize: t.size,
    verificationStatus: isVerified
      ? 'Verified'
      : idx % 2 === 0
        ? 'Pending'
        : 'Verified',
    issuingAuthority: 'Civil Aviation Authority / FAA',
  }));
}

const assetSpecsCatalog: Record<
  string,
  {
    engine: string;
    range: string;
    pax: string;
    launch: string;
    lastProd: string;
    newPrice: string;
    usedPrice: string;
    avgPrice: string;
    variance: string;
  }
> = {
  'Gulfstream G700': {
    engine: 'Rolls-Royce Pearl 700',
    range: '7,500 NM',
    pax: '19 pax',
    launch: '2019',
    lastProd: 'In production',
    newPrice: '$78M – $95M',
    usedPrice: '$68M – $82M',
    avgPrice: '$77.0M',
    variance: '±4%',
  },

  'Falcon 10X': {
    engine: 'Rolls-Royce Pearl',
    range: '7,500 NM',
    pax: '16 pax',
    launch: '2021',
    lastProd: 'In production',
    newPrice: '$75M – $90M',
    usedPrice: '$62M – $78M',
    avgPrice: '$74.5M',
    variance: '±5%',
  },

  'Global 7500': {
    engine: 'GE Passport',
    range: '7,700 NM',
    pax: '19 pax',
    launch: '2018',
    lastProd: 'In production',
    newPrice: '$72M – $78M',
    usedPrice: '$58M – $68M',
    avgPrice: '$62.0M',
    variance: '±3%',
  },

  'Lineage 1000E': {
    engine: 'CFM International CFM56',
    range: '6,426 NM',
    pax: '25 pax',
    launch: '2015',
    lastProd: '2019',
    newPrice: 'No longer in production',
    usedPrice: '$60.1M – $74.7M',
    avgPrice: '$77.0M',
    variance: '±4%',
  },

  'Citation X+': {
    engine: 'Rolls-Royce AE 3007C2',
    range: '3,460 NM',
    pax: '12 pax',
    launch: '2012',
    lastProd: '2018',
    newPrice: 'No longer in production',
    usedPrice: '$18M – $26M',
    avgPrice: '$24.0M',
    variance: '±6%',
  },

  'Falcon 8X': {
    engine: 'Pratt & Whitney PW307D',
    range: '6,450 NM',
    pax: '14 pax',
    launch: '2016',
    lastProd: 'In production',
    newPrice: '$58M – $62M',
    usedPrice: '$42M – $54M',
    avgPrice: '$56.0M',
    variance: '±4%',
  },

  'Challenger 650': {
    engine: 'GE CF34-3B',
    range: '4,000 NM',
    pax: '12 pax',
    launch: '2015',
    lastProd: 'In production',
    newPrice: '$32M – $36M',
    usedPrice: '$14M – $18M',
    avgPrice: '$14.5M',
    variance: '±5%',
  },
};

function getSpecs(name: string) {
  const key = Object.keys(assetSpecsCatalog).find((k) =>
    name.includes(k)
  );

  return (
    assetSpecsCatalog[key || ''] || {
      engine: 'Rolls-Royce',
      range: '6,500 NM',
      pax: '16 pax',
      launch: '2018',
      lastProd: 'In production',
      newPrice: 'N/A',
      usedPrice: 'N/A',
      avgPrice: 'N/A',
      variance: '±4%',
    }
  );
}

function FlagDot({ flag }: { flag?: string }) {
  const colorMap: Record<string, string> = {
    blue: '#70b5f9',
    red: '#ff5c5c',
    pink: '#e88fc4',
    yellow: '#f2c46d',
    green: '#3dd598',
  };

  const color =
    colorMap[flag || ''] || 'rgba(255,255,255,.15)';

  return (
    <span
      style={{
        width: 10,
        height: 10,
        borderRadius: '50%',
        background: color,
        display: 'inline-block',
      }}
      title={`Flag: ${flag || 'none'}`}
    />
  );
}

function ListingDetailModal({
  item,
  onClose,
  showToast,
}: {
  item: any;
  onClose: () => void;
  showToast?: (message: string) => void;
}) {
  const [tab, setTab] = useState('info');
  const [slideIdx, setSlideIdx] = useState(0);

  const docs =
    item.docs ||
    generateAdminDocs(
      item.id,
      item.verificationStatus === 'Verified'
    );

  const specs = getSpecs(item.name);

  const verifyChip =
    item.verificationStatus === 'Verified'
      ? 'ok'
      : item.verificationStatus === 'Unpublished'
        ? 'danger'
        : 'warn';

  const verifyLabel =
    item.verificationStatus === 'Verified'
      ? '✓ Verified Listing'
      : item.verificationStatus === 'Unpublished'
        ? '🚫 Unpublished'
        : '⏳ Pending Verification';

  const offset =
    parseInt(String(item.id).replace(/\D/g, ''), 10) % 4 || 0;

  const galleryImgs = [0, 1, 2, 3].map((i) =>
    jetImg((i + offset) % 4)
  );

  return (
    <div className="listing-modal-shell">
      <div className="listing-modal-top">
        <div className="listing-modal-head">
          <div>
            <span className={`chip ${verifyChip}`}>
              {verifyLabel}
            </span>

            <h3 className="listing-modal-title">
              {item.name}{' '}
              <span>({item.id})</span>
            </h3>
          </div>

          <div className="listing-modal-actions">
            {item.verificationStatus !== 'Verified' && (
              <button
                className="btn-verify"
                onClick={() => {
                  onClose();
                  showToast?.(
                    `✓ ${item.name} declared verified`
                  );
                }}
              >
                Declare Verified
              </button>
            )}

            {item.status !== 'Unpublished' && (
              <button
                className="btn-unpublish"
                onClick={() => {
                  onClose();
                  showToast?.(
                    `${item.id} unpublished`
                  );
                }}
              >
                Unpublish Listing
              </button>
            )}
          </div>
        </div>

        <div className="listing-modal-tabs">
          {['info', 'lister', 'docs'].map((t) => (
            <button
              key={t}
              className={`tab-btn${tab === t ? ' active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t === 'info'
                ? 'Listing Details'
                : t === 'lister'
                  ? 'Lister / User Info'
                  : `Documents (${docs.length})`}
            </button>
          ))}
        </div>
      </div>

      <div className="listing-modal-body">
        {tab === 'info' && (
          <div className="listing-modal-split">
            <div className="listing-spec-panel">
              <div className="listing-spec-label">
                Asset Overview
              </div>

              <h4 className="listing-spec-title">
                {item.name}
              </h4>

              <div className="listing-spec-category">
                {item.category}
              </div>

              <div className="listing-spec-rows">
                {[
                  ['Engine', specs.engine],
                  ['Range', specs.range],
                  ['Passengers', specs.pax],
                  ['Launch Year', specs.launch],
                  ['Last Production', specs.lastProd],
                  ['New Price Range', specs.newPrice],
                  ['Used Price Range', specs.usedPrice],
                  ['Avg Market Price', specs.avgPrice],
                  ['Variance', specs.variance],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="listing-spec-row"
                  >
                    <span>{k}</span>
                    <strong>{v}</strong>
                  </div>
                ))}
              </div>

              <div className="listing-spec-label">
                Listing Overview
              </div>

              <div className="listing-overview-grid">
                {[
                  ['Listing ID', item.id],
                  ['Category', item.category],
                  ['Asking Price', item.ask],
                  ['Status', item.status],
                  [
                    'Verification',
                    item.verificationStatus,
                  ],
                  [
                    'Featured',
                    item.featuredStatus || 'Standard',
                  ],
                  [
                    'Submitted',
                    item.submissionDate || 'N/A',
                  ],
                  [
                    'Verified Date',
                    item.verifiedDate || 'N/A',
                  ],
                ].map(([k, v]) => (
                  <div key={k} className="item">
                    <span>{k}</span>
                    <strong>{v}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="listing-gallery-panel">
              <div
                className="listing-gallery-viewport"
                style={{ minHeight: 400 }}
              >
                <img
                  src={galleryImgs[slideIdx]}
                  alt="Aircraft"
                />

                <button
                  className="listing-gallery-nav prev"
                  onClick={() =>
                    setSlideIdx(
                      (i) =>
                        (i - 1 + galleryImgs.length) %
                        galleryImgs.length
                    )
                  }
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                  >
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>

                <button
                  className="listing-gallery-nav next"
                  onClick={() =>
                    setSlideIdx(
                      (i) =>
                        (i + 1) % galleryImgs.length
                    )
                  }
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>

                <div className="listing-gallery-dots">
                  {galleryImgs.map((_, i) => (
                    <button
                      key={i}
                      className={`listing-gallery-dot${
                        slideIdx === i ? ' active' : ''
                      }`}
                      onClick={() => setSlideIdx(i)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'lister' && (
          <div className="listing-tab-full">
            <div className="listing-spec-label">
              Lister / Account Owner Profile
            </div>

            <div className="listing-lister-grid">
              {[
                ['User Name', item.owner],
                [
                  'Email',
                  item.email ||
                    `${item.owner
                      .toLowerCase()
                      .replace(/\s+/g, '')}@marketplace.com`,
                ],
                [
                  'Phone',
                  item.phone || '+1 305 892 4401',
                ],
                [
                  'Company',
                  item.company ||
                    'Private Aviation Group',
                ],
                [
                  'Account Role',
                  'Registered Aircraft Lister',
                ],
                ['Verification', 'Verified Account'],
                ['Portfolio', '3 Active Listings'],
                [
                  'Security',
                  'KYC Verified • Identity Cleared',
                ],
              ].map(([k, v]) => (
                <div key={k} className="item">
                  <span>{k}</span>
                  <strong>{v}</strong>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'docs' && (
          <div className="listing-tab-full">
            <div
              className="sheet-wrap"
              style={{
                maxHeight: 420,
                overflowY: 'auto',
              }}
            >
              <table className="sheet">
                <thead>
                  <tr>
                    <th>
                      Document Name &amp; Category
                    </th>
                    <th>Upload Date</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {docs.map((d: any) => (
                    <tr key={d.id}>
                      <td>
                        <strong>{d.name}</strong>
                        <br />
                        <span
                          style={{
                            fontSize: '10.5px',
                            color: 'var(--muted-2)',
                          }}
                        >
                          {d.category} • {d.fileSize}
                        </span>
                      </td>

                      <td
                        style={{
                          fontSize: '11.5px',
                          color: 'var(--muted)',
                        }}
                      >
                        {d.uploadDate}
                      </td>

                      <td>
                        <span
                          className={`chip ${
                            d.verificationStatus ===
                            'Verified'
                              ? 'ok'
                              : 'warn'
                          }`}
                        >
                          {d.verificationStatus ===
                          'Verified'
                            ? '✓ Verified'
                            : 'Pending Audit'}
                        </span>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-ghost"
                          style={{
                            padding: '4px 10px',
                            fontSize: 11,
                          }}
                          onClick={() =>
                            showToast?.(
                              `Viewing ${d.name}`
                            )
                          }
                        >
                          View
                        </button>

                        {d.verificationStatus !==
                          'Verified' && (
                          <button
                            className="btn btn-primary"
                            style={{
                              padding: '4px 10px',
                              fontSize: 11,
                              marginLeft: 4,
                              background:
                                'var(--success)',
                              color: '#000',
                              border: 'none',
                            }}
                            onClick={() => {
                              d.verificationStatus =
                                'Verified';
                              showToast?.(
                                'Document verified ✓'
                              );
                            }}
                          >
                            Verify
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ListingsModule({
  initialTab = 'verified',
  showToast,
}: {
  initialTab?: string;
  showToast?: (message: string) => void;
}) {
  const [view, setView] = useState(initialTab);
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] =
    useState<any>(null);

  const term = search.toLowerCase().trim();

  const verifiedRows = listings.filter(
    (l: any) =>
      l.verificationStatus === 'Verified' &&
      l.status !== 'Unpublished' &&
      (!term ||
        l.name.toLowerCase().includes(term) ||
        l.owner.toLowerCase().includes(term) ||
        l.id.toLowerCase().includes(term))
  );

  const approvalRows = approvals.filter(
    (a: any) =>
      !term ||
      a.name.toLowerCase().includes(term) ||
      a.owner.toLowerCase().includes(term) ||
      a.id.toLowerCase().includes(term)
  );

  const incompleteRows = incomplete.filter(
    (i: any) =>
      !term ||
      i.name.toLowerCase().includes(term) ||
      i.owner.toLowerCase().includes(term)
  );

  const views = [
    {
      id: 'verified',
      label: `All Verified (${
        listings.filter(
          (l: any) =>
            l.verificationStatus === 'Verified' &&
            l.status !== 'Unpublished'
        ).length
      })`,
    },
    {
      id: 'approvals',
      label: `Approvals Queue (${approvals.length})`,
    },
    {
      id: 'incomplete',
      label: `Incomplete (${incomplete.length})`,
    },
    {
      id: 'analytics',
      label: 'Analytics',
    },
  ];

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 20,
          flexWrap: 'wrap',
        }}
      >
        <div
          className="period-toggle"
          style={{
            background: 'rgba(255,255,255,.05)',
            padding: 4,
            borderRadius: 12,
            border: '1px solid var(--line-2)',
          }}
        >
          {views.map((v) => (
            <button
              key={v.id}
              data-view={v.id}
              className={
                view === v.id ? 'active' : ''
              }
              style={{
                padding: '9px 16px',
                fontSize: 12,
              }}
              onClick={() => setView(v.id)}
            >
              {v.label}
            </button>
          ))}
        </div>

        {view !== 'analytics' && (
          <div
            className="search-bar"
            style={{
              marginBottom: 0,
              maxWidth: 340,
            }}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <circle cx="11" cy="11" r="8" />
              <line
                x1="21"
                y1="21"
                x2="16.65"
                y2="16.65"
              />
            </svg>

            <input
              placeholder="Search by ID, plane, lister..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>
        )}
      </div>

      {view === 'verified' && (
        <>
          <div className="panel-head">
            <h3>All Verified Listings</h3>
            <span className="meta">
              {verifiedRows.length} verified listings
            </span>
          </div>

          <div className="sheet-wrap">
            <table className="sheet">
              <thead>
                <tr>
                  <th>Flag</th>
                  <th>Listing ID</th>
                  <th>Title &amp; Category</th>
                  <th>Lister</th>
                  <th>Ask</th>
                  <th>Verified Date</th>
                  <th>Docs</th>
                  <th>Status</th>
                  <th>Featured</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {verifiedRows.length === 0 ? (
                  <tr className="row-empty">
                    <td colSpan={10}>
                      No verified listings match your
                      search.
                    </td>
                  </tr>
                ) : (
                  verifiedRows.map((r: any) => (
                    <tr
                      key={r.id}
                      style={{ cursor: 'pointer' }}
                      onClick={() =>
                        setSelectedItem(r)
                      }
                    >
                      <td>
                        <FlagDot flag={r.flag} />
                      </td>

                      <td>
                        <strong>{r.id}</strong>
                      </td>

                      <td>
                        <div>
                          <strong>{r.name}</strong>
                          <br />
                          <span
                            style={{
                              fontSize: 11,
                              color:
                                'var(--muted-2)',
                            }}
                          >
                            {r.category}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div>
                          <strong>{r.owner}</strong>
                          <br />
                          <span
                            style={{
                              fontSize: 11,
                              color:
                                'var(--muted-2)',
                            }}
                          >
                            {r.company}
                          </span>
                        </div>
                      </td>

                      <td>
                        <strong>{r.ask}</strong>
                      </td>

                      <td className="muted-cell">
                        {r.verifiedDate ||
                          r.submissionDate}
                      </td>

                      <td>
                        <span className="chip">
                          📁 {r.docs?.length || 25}{' '}
                          Docs
                        </span>
                      </td>

                      <td>
                        <span className="chip ok">
                          ✓ Verified
                        </span>
                      </td>

                      <td>
                        {r.featuredStatus ===
                        'Featured' ? (
                          <span className="chip warn">
                            ★ Featured
                          </span>
                        ) : (
                          <span className="muted-cell">
                            Standard
                          </span>
                        )}
                      </td>

                      <td
                        onClick={(e) =>
                          e.stopPropagation()
                        }
                      >
                        <button
                          className="btn btn-ghost"
                          style={{
                            fontSize: 11,
                            padding: '5px 10px',
                          }}
                          onClick={() =>
                            setSelectedItem(r)
                          }
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {view === 'approvals' && (
        <>
          <div className="panel-head">
            <h3>Approvals Queue</h3>
            <span className="meta">
              {approvalRows.length} pending
              verification
            </span>
          </div>

          <div className="sheet-wrap">
            <table className="sheet">
              <thead>
                <tr>
                  <th>Listing ID</th>
                  <th>Title &amp; Category</th>
                  <th>Lister</th>
                  <th>Ask</th>
                  <th>Submitted</th>
                  <th>Docs</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {approvalRows.length === 0 ? (
                  <tr className="row-empty">
                    <td colSpan={8}>
                      No pending approval requests.
                    </td>
                  </tr>
                ) : (
                  approvalRows.map((r: any) => (
                    <tr
                      key={r.id}
                      style={{ cursor: 'pointer' }}
                      onClick={() =>
                        setSelectedItem(r)
                      }
                    >
                      <td>
                        <strong>{r.id}</strong>
                      </td>

                      <td>
                        <div>
                          <strong>{r.name}</strong>
                          <br />
                          <span
                            style={{
                              fontSize: 11,
                              color:
                                'var(--muted-2)',
                            }}
                          >
                            {r.category}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div>
                          <strong>{r.owner}</strong>
                          <br />
                          <span
                            style={{
                              fontSize: 11,
                              color:
                                'var(--muted-2)',
                            }}
                          >
                            {r.company}
                          </span>
                        </div>
                      </td>

                      <td>
                        <strong>{r.ask}</strong>
                      </td>

                      <td className="muted-cell">
                        {r.submissionDate ||
                          r.submitted}
                      </td>

                      <td>
                        <span className="chip">
                          📁 {r.docs?.length || 25}{' '}
                          Docs
                        </span>
                      </td>

                      <td>
                        <span className="chip warn">
                          ⏳ Pending
                        </span>
                      </td>

                      <td
                        onClick={(e) =>
                          e.stopPropagation()
                        }
                      >
                        <button
                          className="btn btn-primary"
                          style={{
                            fontSize: 11,
                            padding: '5px 10px',
                            background:
                              'var(--success)',
                            color: '#000',
                            border: 'none',
                          }}
                          onClick={() =>
                            showToast?.(
                              `✓ ${r.name} declared verified`
                            )
                          }
                        >
                          Declare Verified
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {view === 'incomplete' && (
        <>
          <div className="panel-head">
            <h3>Incomplete Listings</h3>
            <span className="meta">
              {incompleteRows.length} stalled drafts
            </span>
          </div>

          <div className="sheet-wrap">
            <table className="sheet">
              <thead>
                <tr>
                  <th>Draft ID</th>
                  <th>Name</th>
                  <th>Owner</th>
                  <th>Contact</th>
                  <th>Stalled</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {incompleteRows.length === 0 ? (
                  <tr className="row-empty">
                    <td colSpan={6}>
                      No incomplete draft listings.
                    </td>
                  </tr>
                ) : (
                  incompleteRows.map((r: any) => (
                    <tr key={r.id}>
                      <td>
                        <strong>{r.id}</strong>
                      </td>

                      <td>
                        <strong>{r.name}</strong>
                      </td>

                      <td>
                        <strong>{r.owner}</strong>
                      </td>

                      <td className="muted-cell">
                        {r.contact}
                      </td>

                      <td className="muted-cell">
                        {r.stalled}
                      </td>

                      <td>
                        <button
                          className="btn btn-ghost"
                          style={{
                            padding: '4px 10px',
                            fontSize: 11,
                          }}
                          onClick={() =>
                            showToast?.(
                              `Email sent to ${r.contact}`
                            )
                          }
                        >
                          Contact Owner
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {view === 'analytics' && (
        <>
          <div className="panel-head">
            <h3>Listing Analytics</h3>
            <span className="meta">
              Traffic, views, clicks, and performance
              metrics
            </span>
          </div>

          <div
            className="grid-cards"
            style={{ marginBottom: 20 }}
          >
            <div className="mini-card">
              <div className="num">14,280</div>
              <div className="lbl">
                Monthly listing views
              </div>
            </div>

            <div className="mini-card">
              <div className="num">3,140</div>
              <div className="lbl">
                Avg. clicks per listing
              </div>
            </div>

            <div className="mini-card">
              <div className="num">4.8%</div>
              <div className="lbl">
                Acquisition conversion rate
              </div>
            </div>

            <div className="mini-card">
              <div className="num">1.2k</div>
              <div className="lbl">
                Unique buyer inquiries
              </div>
            </div>
          </div>

          <div className="modal-grid">
            <div className="modal-card">
              <h4>🏆 Top 3 Best-Performing</h4>

              <div className="deep-link-row">
                <span>
                  1. Gulfstream G700 (LST-9482)
                </span>
                <strong
                  style={{
                    color: 'var(--success)',
                  }}
                >
                  2,410 views • 14 LOIs
                </strong>
              </div>

              <div className="deep-link-row">
                <span>
                  2. Falcon 10X (LST-9483)
                </span>
                <strong
                  style={{
                    color: 'var(--success)',
                  }}
                >
                  1,890 views • 9 LOIs
                </strong>
              </div>

              <div className="deep-link-row">
                <span>
                  3. Lineage 1000E (LST-9485)
                </span>
                <strong
                  style={{
                    color: 'var(--success)',
                  }}
                >
                  1,540 views • 7 LOIs
                </strong>
              </div>
            </div>

            <div className="modal-card">
              <h4>📉 Worst-Performing</h4>

              <div className="deep-link-row">
                <span>
                  1. Citation X+ (LST-9486)
                </span>
                <strong
                  style={{
                    color: 'var(--danger)',
                  }}
                >
                  120 views • 0 LOIs
                </strong>
              </div>

              <div className="deep-link-row">
                <span>
                  2. Challenger 650 (LST-9488)
                </span>
                <strong
                  style={{
                    color: 'var(--danger)',
                  }}
                >
                  140 views • 1 LOI
                </strong>
              </div>

              <div className="deep-link-row">
                <span>
                  3. Global 7500 (LST-9484)
                </span>
                <strong
                  style={{
                    color: 'var(--muted)',
                  }}
                >
                  410 views • 2 LOIs
                </strong>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Listing Detail Modal */}
      {selectedItem && (
        <>
          <div
            className="overlay show"
            onClick={() => setSelectedItem(null)}
          />

          <div
            className="modal modal-listing show"
            style={{ display: 'block' }}
          >
            <button
              className="modal-close"
              onClick={() => setSelectedItem(null)}
              aria-label="Close"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line
                  x1="18"
                  y1="6"
                  x2="6"
                  y2="18"
                />
                <line
                  x1="6"
                  y1="6"
                  x2="18"
                  y2="18"
                />
              </svg>
            </button>

            <ListingDetailModal
              item={selectedItem}
              onClose={() => setSelectedItem(null)}
              showToast={showToast}
            />
          </div>
        </>
      )}
    </div>
  );
}