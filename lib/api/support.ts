
import { apiFetch } from './client';

export type ComplaintType = 'technical' | 'customer_support';

export type TicketStatus =
  | 'open'
  | 'pending'
  | 'assigned'
  | 'waiting_for_user'
  | 'in_progress'
  | 'resolved'
  | 'closed'
  | 'rejected'
  | 'reopened'
  | 'archived';

export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';

export interface TicketListItem {
  id: string;
  ticket_number: string;
  user_id: string;
  assigned_admin_id: string | null;
  complaint_type: ComplaintType;
  category: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  is_archived: boolean;
  user_rating: number | null;
  created_at: string;
  updated_at: string;
  last_reply_at: string | null;
}

export interface TicketAttachment {
  id: string;
  ticket_id: string;
  message_id: string | null;
  uploaded_by: string;
  file_url: string;
  file_name: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_role: 'user' | 'admin';
  message: string;
  message_type: 'text' | 'image' | 'file';
  is_internal_note: boolean;
  created_at: string;
  edited_at: string | null;
  deleted_at: string | null;
  attachments: TicketAttachment[];
}

export interface TicketTimelineEvent {
  id: string;
  ticket_id: string;
  actor_id: string | null;
  actor_role: 'user' | 'admin' | null;
  event_type: string;
  metadata_json: Record<string, unknown> | null;
  created_at: string;
}

export interface TicketDetail extends TicketListItem {
  description: string;
  resolution_note: string | null;
  user_rating_comment: string | null;
  closed_at: string | null;
  deleted_at: string | null;
  messages: TicketMessage[];
  attachments: TicketAttachment[];
  timeline: TicketTimelineEvent[];
}

export interface TicketListResponse {
  tickets: TicketListItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface ListTicketsParams {
  status?: TicketStatus;
  priority?: TicketPriority;
  complaint_type?: ComplaintType;
  category?: string;
  assigned_admin_id?: string;
  user_id?: string;
  is_archived?: boolean;
  q?: string;
  limit?: number;
  offset?: number;
}

export function listTickets(
  params: ListTicketsParams = {}
) {
  return apiFetch<TicketListResponse>(
    '/admin/support/tickets',
    {
      query: params,
    }
  );
}
export function getTicket(ticketId: string) {
  return apiFetch<TicketDetail>(`/admin/support/tickets/${ticketId}`);
}

export function assignTicket(ticketId: string, adminId: string) {
  return apiFetch<TicketDetail>(`/admin/support/tickets/${ticketId}/assign`, {
    method: 'PATCH',
    body: { admin_id: adminId },
  });
}

export function transferTicket(ticketId: string, adminId: string, reason?: string) {
  return apiFetch<TicketDetail>(`/admin/support/tickets/${ticketId}/transfer`, {
    method: 'PATCH',
    body: { admin_id: adminId, reason },
  });
}

export function updateTicketPriority(
  ticketId: string,
  priority: TicketPriority,
  reason?: string
) {
  return apiFetch<TicketDetail>(`/admin/support/tickets/${ticketId}/priority`, {
    method: 'PATCH',
    body: { priority, reason },
  });
}

export function updateTicketStatus(
  ticketId: string,
  status: TicketStatus,
  resolution_note?: string
) {
  return apiFetch<TicketDetail>(`/admin/support/tickets/${ticketId}/status`, {
    method: 'PATCH',
    body: { status, resolution_note },
  });
}

export function replyToTicket(ticketId: string, message: string) {
  return apiFetch<TicketMessage>(`/admin/support/tickets/${ticketId}/messages`, {
    method: 'POST',
    body: { message },
  });
}

export function addInternalNote(ticketId: string, note: string) {
  return apiFetch<TicketMessage>(`/admin/support/tickets/${ticketId}/notes`, {
    method: 'POST',
    body: { note },
  });
}

export function archiveTicket(ticketId: string) {
  return apiFetch<TicketDetail>(`/admin/support/tickets/${ticketId}/archive`, {
    method: 'POST',
  });
}

export function restoreTicket(ticketId: string) {
  return apiFetch<TicketDetail>(`/admin/support/tickets/${ticketId}/restore`, {
    method: 'POST',
  });
}

export function getTicketTimeline(ticketId: string) {
  return apiFetch<TicketTimelineEvent[]>(`/admin/support/tickets/${ticketId}/timeline`);
}

export interface BulkUpdatePayload {
  ticket_ids: string[];
  status?: TicketStatus;
  priority?: TicketPriority;
  assigned_admin_id?: string;
}

export function bulkUpdateTickets(payload: BulkUpdatePayload) {
  return apiFetch<unknown>('/admin/support/tickets/bulk-update', {
    method: 'POST',
    body: payload,
  });
}

export interface TicketAnalytics {
  total_tickets: number;
  open_tickets: number;
  pending_tickets: number;
  resolved_tickets: number;
  closed_tickets: number;
  critical_tickets: number;
  reopened_tickets: number;
  archived_tickets: number;
  avg_resolution_hours: number | null;
  avg_first_response_hours: number | null;
  avg_user_rating: number | null;
}

export function getSupportAnalytics() {
  return apiFetch<TicketAnalytics>('/admin/support/analytics');
}

// ---- status groupings used by the Problems module tabs 
export const ACTIVE_STATUSES: TicketStatus[] = [
  'open',
  'pending',
  'assigned',
  'waiting_for_user',
  'in_progress',
  'reopened',
];

export const SOLVED_STATUSES: TicketStatus[] = ['resolved', 'closed', 'rejected'];