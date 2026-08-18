import api from "@/lib/axios";

export interface MessageRead {
  id: string;
  conversation_id: string;
  sender_id: string;
  message_type: "text" | "image" | "file" | "voice";
  content: string;
  metadata_json?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface ConversationRead {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  metadata_json?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  last_message?: MessageRead | null;
  unread_count: number;
}

export interface ConversationStats {
  total_conversations: number;
  total_messages_sent: number;
  total_messages_received: number;
  unread_conversations_count: number;
}

// GET /conversations — current user's conversation list.
export async function listConversations(limit = 50, offset = 0): Promise<ConversationRead[]> {
  const { data } = await api.get<ConversationRead[]>("/conversations", { params: { limit, offset } });
  return data;
}

// GET /conversations/{conversation_id} — single conversation details.
export async function getConversation(conversationId: string): Promise<ConversationRead> {
  const { data } = await api.get<ConversationRead>(`/conversations/${conversationId}`);
  return data;
}

// POST /conversations — start a conversation tied to a listing.
export async function createConversation(listingId: string): Promise<ConversationRead> {
  const { data } = await api.post<ConversationRead>("/conversations", { listing_id: listingId });
  return data;
}

// GET /conversations/{conversation_id}/messages — newest first.
export async function getMessages(
  conversationId: string,
  limit = 50,
  offset = 0,
): Promise<MessageRead[]> {
  const { data } = await api.get<MessageRead[]>(`/conversations/${conversationId}/messages`, {
    params: { limit, offset },
  });
  return data;
}

// POST /conversations/{conversation_id}/read — mark all messages as read.
export async function markConversationRead(conversationId: string): Promise<void> {
  await api.post(`/conversations/${conversationId}/read`);
}

// DELETE /messages/{message_id} — soft delete (sender only).
export async function deleteMessage(messageId: string): Promise<MessageRead> {
  const { data } = await api.delete<MessageRead>(`/messages/${messageId}`);
  return data;
}

// GET /unread/count
export async function getUnreadCount(): Promise<number> {
  const { data } = await api.get<{ unread_count: number }>("/unread/count");
  return data.unread_count;
}

// GET /conversations/stats
export async function getConversationStats(): Promise<ConversationStats> {
  const { data } = await api.get<ConversationStats>("/conversations/stats");
  return data;
}

// GET /conversations/search?q=
export async function searchConversations(q: string): Promise<ConversationRead[]> {
  const { data } = await api.get<ConversationRead[]>("/conversations/search", { params: { q } });
  return data;
}

// GET /messages/search?q=
export async function searchMessages(q: string): Promise<MessageRead[]> {
  const { data } = await api.get<MessageRead[]>("/messages/search", { params: { q } });
  return data;
}

// NOTE: the current OpenAPI spec has no "send message" REST endpoint — only
// create-conversation, list/get, mark-read, and delete. Real-time sending is
// presumably handled elsewhere (websocket / not yet built). Until that
// exists, sendMessage below is a local-only optimistic append; swap this out
// once a POST /conversations/{id}/messages (or websocket) endpoint exists.