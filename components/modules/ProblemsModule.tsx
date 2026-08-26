'use client';

import { useEffect, useState } from 'react';
import Table from '@/components/ui/Table';
import Modal from '@/components/modals/Modal';
import {
  listTickets,
  getTicket,
  replyToTicket,
  addInternalNote,
  updateTicketStatus,
  updateTicketPriority,
  ACTIVE_STATUSES,
  SOLVED_STATUSES,
  type TicketListItem,
  type TicketDetail,
  type TicketStatus,
  type TicketPriority,
} from '@/lib/api/support';
import { ApiError } from '@/lib/api/client';

function shortId(id: string) {
  return id.slice(0, 8);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString();
}

export default function ProblemsModule({
  showToast,
}: {
  showToast?: (message: string) => void;
}) {
  const [tab, setTab] = useState<'active' | 'solved' | 'support'>('active');

  const [tickets, setTickets] = useState<TicketListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [ticketDetail, setTicketDetail] = useState<TicketDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [replyText, setReplyText] = useState('');
  const [noteText, setNoteText] = useState('');
  const [savingAction, setSavingAction] = useState(false);

  // Fetch tickets whenever the tab changes.
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        if (tab === 'support') {
          // NOTE: the backend has no separate "logged support contact" concept
          // (no name/contact/help fields) — the old mock data invented one.
          // The closest real equivalent is tickets with complaint_type =
          // "customer_support", so that's what this tab shows now.
          const res = await listTickets({
            complaint_type: 'customer_support',
            is_archived: false,
            limit: 100,
          });
          if (!cancelled) setTickets(res.tickets);
        } else {
          const res = await listTickets({ is_archived: false, limit: 100 });
          if (!cancelled) {
            const statuses = tab === 'active' ? ACTIVE_STATUSES : SOLVED_STATUSES;
            setTickets(res.tickets.filter((t) => statuses.includes(t.status)));
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Failed to load tickets.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [tab]);

  // Fetch full detail when a ticket is opened.
  useEffect(() => {
    if (!selectedId) {
      setTicketDetail(null);
      return;
    }
    let cancelled = false;

    async function loadDetail() {
      setDetailLoading(true);
      try {
        const detail = await getTicket(selectedId as string);
        if (!cancelled) setTicketDetail(detail);
      } catch (err) {
        if (!cancelled) {
          showToast?.(err instanceof ApiError ? err.message : 'Failed to load ticket.');
          setSelectedId(null);
        }
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    }

    loadDetail();
    return () => {
      cancelled = true;
    };
  }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  const refreshList = async () => {
    if (tab === 'support') {
      const res = await listTickets({
        complaint_type: 'customer_support',
        is_archived: false,
        limit: 100,
      });
      setTickets(res.tickets);
    } else {
      const res = await listTickets({ is_archived: false, limit: 100 });
      const statuses = tab === 'active' ? ACTIVE_STATUSES : SOLVED_STATUSES;
      setTickets(res.tickets.filter((t) => statuses.includes(t.status)));
    }
  };

  const sendReply = async () => {
    if (!selectedId || !replyText.trim()) return;
    setSavingAction(true);
    try {
      await replyToTicket(selectedId, replyText.trim());
      setReplyText('');
      const detail = await getTicket(selectedId);
      setTicketDetail(detail);
      showToast?.('Reply sent.');
    } catch (err) {
      showToast?.(err instanceof ApiError ? err.message : 'Failed to send reply.');
    } finally {
      setSavingAction(false);
    }
  };

  const sendNote = async () => {
    if (!selectedId || !noteText.trim()) return;
    setSavingAction(true);
    try {
      await addInternalNote(selectedId, noteText.trim());
      setNoteText('');
      const detail = await getTicket(selectedId);
      setTicketDetail(detail);
      showToast?.('Internal note added.');
    } catch (err) {
      showToast?.(err instanceof ApiError ? err.message : 'Failed to add note.');
    } finally {
      setSavingAction(false);
    }
  };

  const changeStatus = async (status: TicketStatus) => {
    if (!selectedId) return;
    setSavingAction(true);
    try {
      const detail = await updateTicketStatus(selectedId, status);
      setTicketDetail(detail);
      await refreshList();
      showToast?.(`Status updated to ${status}.`);
    } catch (err) {
      showToast?.(err instanceof ApiError ? err.message : 'Failed to update status.');
    } finally {
      setSavingAction(false);
    }
  };

  const changePriority = async (priority: TicketPriority) => {
    if (!selectedId) return;
    setSavingAction(true);
    try {
      const detail = await updateTicketPriority(selectedId, priority);
      setTicketDetail(detail);
      showToast?.(`Priority updated to ${priority}.`);
    } catch (err) {
      showToast?.(err instanceof ApiError ? err.message : 'Failed to update priority.');
    } finally {
      setSavingAction(false);
    }
  };

  const columns = [
    { key: 'ticket_number', label: 'Ticket #' },
    { key: 'subject', label: 'Subject' },
    { key: 'reporter', label: 'Reporter', muted: true },
    { key: 'priority', label: 'Priority', muted: true },
    { key: 'opened', label: 'Opened', muted: true },
  ];

  const rows = tickets.map((t) => ({
    ...t,
    reporter: shortId(t.user_id),
    opened: formatDate(t.created_at),
  }));

  return (
    <div>
      {/* Tabs */}
      <div className="tab-row">
        {(['active', 'solved', 'support'] as const).map((t) => (
          <button
            key={t}
            className={`tab-btn${tab === t ? ' active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'active' ? 'Active' : t === 'solved' ? 'Solved' : 'Support'}
          </button>
        ))}
      </div>

      <div className="panel-head">
        <h3>
          {tab === 'active'
            ? 'Active reports'
            : tab === 'solved'
              ? 'Solved reports'
              : 'Customer support tickets'}
        </h3>
        <span className="meta">
          {loading ? 'Loading…' : `${tickets.length} ${tab === 'active' ? 'open' : tab === 'solved' ? 'solved' : 'tickets'}`}
        </span>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <Table
        columns={columns}
        rows={rows}
        onRowClick={(row) => setSelectedId(row.id)}
        emptyText={
          loading
            ? 'Loading…'
            : tab === 'active'
              ? 'No active reports.'
              : tab === 'solved'
                ? 'No solved reports.'
                : 'No customer support tickets.'
        }
      />

      {/* TICKET DETAIL MODAL */}
      <Modal show={!!selectedId} onClose={() => setSelectedId(null)}>
        {detailLoading && <div>Loading ticket…</div>}

        {!detailLoading && ticketDetail && (
          <>
            <h3>
              {ticketDetail.ticket_number} — {ticketDetail.subject}
            </h3>

            <div className="sub">
              Reporter {shortId(ticketDetail.user_id)}
              {' · '}
              {ticketDetail.category}
              {' · '}
              opened {formatDate(ticketDetail.created_at)}
            </div>

            <p style={{ marginTop: 10 }}>{ticketDetail.description}</p>

            <div className="field-row" style={{ marginTop: 14 }}>
              <label>Status</label>
              <select
                className="field-input"
                value={ticketDetail.status}
                disabled={savingAction}
                onChange={(e) => changeStatus(e.target.value as TicketStatus)}
              >
                {[
                  'open',
                  'pending',
                  'assigned',
                  'waiting_for_user',
                  'in_progress',
                  'resolved',
                  'closed',
                  'rejected',
                  'reopened',
                ].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="field-row" style={{ marginTop: 10 }}>
              <label>Priority</label>
              <select
                className="field-input"
                value={ticketDetail.priority}
                disabled={savingAction}
                onChange={(e) => changePriority(e.target.value as TicketPriority)}
              >
                {['low', 'medium', 'high', 'critical'].map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginTop: 16 }}>
              <h4>Messages</h4>
              {ticketDetail.messages.length === 0 && (
                <div className="meta">No messages yet.</div>
              )}
              {ticketDetail.messages.map((m) => (
                <div
                  key={m.id}
                  style={{
                    marginBottom: 8,
                    padding: 8,
                    borderRadius: 6,
                    background: m.is_internal_note
                      ? 'var(--note-bg, #fff8e1)'
                      : 'var(--msg-bg, #f5f5f5)',
                  }}
                >
                  <div className="meta">
                    {m.sender_role}
                    {m.is_internal_note ? ' · internal note' : ''}
                    {' · '}
                    {formatDate(m.created_at)}
                  </div>
                  <div>{m.message}</div>
                </div>
              ))}
            </div>

            <div className="field-row" style={{ marginTop: 14 }}>
              <label>Reply to reporter</label>
              <textarea
                className="field-textarea"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply the user will see..."
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
                <button
                  className="btn btn-primary"
                  disabled={savingAction || !replyText.trim()}
                  onClick={sendReply}
                >
                  Send reply
                </button>
              </div>
            </div>

            <div className="field-row" style={{ marginTop: 10 }}>
              <label>Internal note (not visible to user)</label>
              <textarea
                className="field-textarea"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add a note for other admins..."
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
                <button
                  className="btn btn-ghost"
                  disabled={savingAction || !noteText.trim()}
                  onClick={sendNote}
                >
                  Add note
                </button>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                gap: 8,
                justifyContent: 'flex-end',
                marginTop: 14,
              }}
            >
              <button className="btn btn-ghost" onClick={() => setSelectedId(null)}>
                Close
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}