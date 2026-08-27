"use client";
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Stage {
  id: string;
  stage_number: number;
  stage_name: string;
  draft_data: Record<string, any> | null;
  live_data: Record<string, any> | null;
}

interface AcquisitionDetail {
  id: string;
  listing_id: string;
  buyer_id: string;
  current_stage: number;
  overall_status: string;
  stages: Stage[];
}

const STAGE_NAMES: Record<number, string> = {
  1: 'Meeting', 2: 'Verification', 3: 'LOI', 4: 'Escrow',
  5: 'Inspection', 6: 'Decision', 7: 'Transfer',
};

const STAGE_FIELDS: Record<number, string[]> = {
  1: ['meeting_time', 'm1_agent_name', 'notes'],
  2: ['notes', 'verification_reports'],
  3: ['loi_url'],
  4: ['receipt_url', 'escrow_status', 'amount', 'ongoing_notes'],
  5: ['inspection_reports', 'inspection_summary'],
  6: ['decision'],
  7: ['transfer_status'],
};

const ADMIN_HEADERS = {
  'x-admin-id': '00000000-0000-0000-0000-000000000000',
  'x-admin-type': 'general',
};

export default function AcquisitionDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [acq, setAcq] = useState<AcquisitionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadAcquisition = () => {
    setLoading(true);
    fetch('http://localhost:8000/admin/acquisitions/' + id, { headers: ADMIN_HEADERS })
      .then((res) => {
        if (!res.ok) throw new Error('Request failed (' + res.status + ')');
        return res.json();
      })
      .then((data: AcquisitionDetail) => {
        setAcq(data);
      })
      .catch(() => setError('Could not load acquisition.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAcquisition();
  }, [id]);

  const currentStageNumber = acq ? acq.current_stage : 1;
  const fields = STAGE_FIELDS[currentStageNumber] || [];

  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const submitAction = (action: 'next-step' | 'update') => {
    setSaving(true);
    setMessage(null);
    fetch(
      'http://localhost:8000/admin/acquisitions/' + id + '/stage/' + currentStageNumber + '/' + action,
      {
        method: 'PATCH',
        headers: { ...ADMIN_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: formData }),
      }
    )
      .then((res) => {
        if (!res.ok) throw new Error('Request failed (' + res.status + ')');
        return res.json();
      })
      .then(() => {
        setMessage(action === 'update' ? 'Published live.' : 'Draft saved.');
        loadAcquisition();
      })
      .catch(() => setMessage('Action failed. Try again.'))
      .finally(() => setSaving(false));
  };

  if (loading) {
    return <div style={{ padding: '40px', color: '#fff', background: '#0a0a0a', minHeight: '100vh' }}>Loading...</div>;
  }

  if (error || !acq) {
    return <div style={{ padding: '40px', color: '#FF8080', background: '#0a0a0a', minHeight: '100vh' }}>{error || 'Not found.'}</div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', padding: '32px' }}>
      <style>{'* { font-family: -apple-system, BlinkMacSystemFont, Inter, sans-serif; box-sizing: border-box; }'}</style>

      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '18px', fontWeight: 500, color: '#F5F5DC', marginBottom: '20px' }}>
          Acquisition {acq.id}
        </h1>

        <div style={{ display: 'flex', gap: '6px', marginBottom: '32px', flexWrap: 'wrap' }}>
          {[1, 2, 3, 4, 5, 6, 7].map((n) => (
            <div
              key={n}
              style={{
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: 600,
                background: n === currentStageNumber ? '#F5F5DC' : n < currentStageNumber ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.06)',
                color: n === currentStageNumber ? '#000' : n < currentStageNumber ? '#4ADE80' : 'rgba(245,245,220,0.4)',
              }}
            >
              {n}. {STAGE_NAMES[n]}
            </div>
          ))}
        </div>

        <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '24px' }}>
          <h2 style={{ fontSize: '14px', color: '#F5F5DC', marginBottom: '16px' }}>
            Stage {currentStageNumber}: {STAGE_NAMES[currentStageNumber]}
          </h2>

          {fields.map((field) => (
                          <div key={field} style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: 'rgba(245,245,220,0.5)', marginBottom: '4px', textTransform: 'uppercase' }}>
                {field.replace(/_/g, ' ')}
              </label>
              <input
                type="text"
                value={formData[field] || ''}
                onChange={(e) => handleFieldChange(field, e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  background: '#111',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '6px',
                  color: '#F5F5DC',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>
          ))}

          {message && (
            <div style={{ fontSize: '12px', color: message.includes('failed') ? '#FF8080' : '#4ADE80', marginBottom: '12px' }}>
              {message}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <button
              onClick={() => submitAction('next-step')}
              disabled={saving}
              style={{ padding: '8px 16px', background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#F5F5DC', fontSize: '12px', cursor: 'pointer' }}
            >
              Next Step
            </button>
            <button
              onClick={() => submitAction('update')}
              disabled={saving}
              style={{ padding: '8px 16px', background: '#F5F5DC', border: 'none', borderRadius: '6px', color: '#000', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
            >
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}