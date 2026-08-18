"use client";

import { useEffect, useRef, useState } from "react";
import { initialConversations, MpConversation, MpMessage } from "../lib/messaging-data";
import {
  listConversations,
  getMessages,
  markConversationRead,
  ConversationRead,
  MessageRead,
} from "../lib/api/messaging";
const avatarColors = ["#5b8def", "#e0a458", "#57b894", "#c15b6c", "#8a7dd9", "#4fb0c6"];
function colorForId(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return avatarColors[hash % avatarColors.length];
}
function initialsForId(id: string) {
  return id.slice(0, 2).toUpperCase();
}
function fmtTime(iso: string) {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

function mapConversation(c: ConversationRead, myUserId: string | null): MpConversation {
  const otherId = myUserId && c.buyer_id === myUserId ? c.seller_id : c.buyer_id;
  return {
    id: c.id,
    name: `User ${otherId.slice(0, 6)}`,
    role: "M1 Marketplace contact",
    initials: initialsForId(otherId),
    color: colorForId(otherId),
    online: false,
    tab: "focused",
    time: fmtTime(c.updated_at),
    unread: c.unread_count ?? 0,
    messages: c.last_message
      ? [{ from: "them", text: c.last_message.content, time: fmtTime(c.last_message.created_at) }]
      : [],
  };
}

function mapMessage(m: MessageRead, myUserId: string | null): MpMessage {
  return {
    from: myUserId && m.sender_id === myUserId ? "me" : "them",
    text: m.content,
    time: fmtTime(m.created_at),
  };
}

export default function MessagingPage({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [conversations, setConversations] = useState<MpConversation[]>(initialConversations);
  const [usingLiveData, setUsingLiveData] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tab, setTab] = useState<"focused" | "other">("focused");
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const composeRef = useRef<HTMLTextAreaElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  // Backend integration: GET /conversations 
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      setLoadError(null);
      try {
        const myUserId =
          typeof window !== "undefined" ? localStorage.getItem("user_id") : null;
        const rows = await listConversations();
        if (cancelled) return;
        if (rows.length) {
          setConversations(rows.map((c) => mapConversation(c, myUserId)));
          setUsingLiveData(true);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setLoadError("Doesn't load the conversation from backend.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    if (!activeId) {
      const rows = conversations.filter((c) => c.tab === tab);
      if (rows.length) setActiveId(rows[0].id);
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
    
  }, [open, conversations]);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [activeId, conversations]);

 
  useEffect(() => {
    if (!activeId || !usingLiveData) return;
    let cancelled = false;
    (async () => {
      try {
        const myUserId =
          typeof window !== "undefined" ? localStorage.getItem("user_id") : null;
        const rows = await getMessages(activeId);
        if (cancelled) return;
       
        const ordered = [...rows].reverse().map((m) => mapMessage(m, myUserId));
        setConversations((prev) =>
          prev.map((c) => (c.id === activeId ? { ...c, messages: ordered } : c)),
        );
      } catch (err) {
        console.error(err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeId, usingLiveData]);

  const changeTab = (next: "focused" | "other") => {
    setTab(next);
    const rows = conversations.filter((c) => c.tab === next);
    setActiveId(rows.length ? rows[0].id : null);
  };

  const selectConversation = (id: string) => {
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c)));
    setActiveId(id);
    // POST /conversations/{id}/read
    if (usingLiveData) {
      markConversationRead(id).catch((err) => console.error(err));
    }
  };

  // NOTE: there's no POST send-message endpoint in the current backend spec
  // (only create-conversation, list, get, mark-read, delete). This appends
  // the message locally (optimistic) so the UI stays usable — swap in a
  // real API call here once that endpoint / websocket exists.
  const sendMessage = () => {
    const textarea = composeRef.current;
    if (!textarea || !activeId) return;
    const value = textarea.value.trim();
    if (!value) return;
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    setConversations((prev) =>
      prev.map((c) => (c.id === activeId ? { ...c, messages: [...c.messages, { from: "me", text: value, time }] } : c))
    );
    textarea.value = "";
  };

  const active = conversations.find((c) => c.id === activeId) || null;
  const term = search.trim().toLowerCase();
  const rows = conversations.filter((c) => c.tab === tab && (!term || c.name.toLowerCase().includes(term)));

  const renderMessages = (c: MpConversation) => {
    const groups: { from: "me" | "them"; items: typeof c.messages }[] = [];
    c.messages.forEach((m) => {
      const last = groups[groups.length - 1];
      if (last && last.from === m.from) last.items.push(m);
      else groups.push({ from: m.from, items: [m] });
    });
    return (
      <>
        <div className="mp-date-chip">Today</div>
        {groups.map((g, gi) => (
          <div key={gi} className={`mp-msg-group ${g.from === "me" ? "me" : ""}`}>
            {g.from !== "me" && (
              <div className="mp-avatar" style={{ background: c.color }}>
                {c.initials}
              </div>
            )}
            <div className="mp-msg-bubbles">
              {g.items.map((m, mi) => (
                <div key={mi} className="mp-bubble">{m.text}</div>
              ))}
              <div className="mp-msg-time">{g.items[g.items.length - 1].time}</div>
            </div>
          </div>
        ))}
      </>
    );
  };

  return (
    <div className={`mp-page ${open ? "open" : ""}`}>
      <div className="mp-topbar">
        <button className="mp-back" aria-label="Close messaging" title="Close messaging" onClick={onClose}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <h2>Messaging</h2>
      </div>
      {loadError && (
        <div style={{ padding: "6px 20px", color: "#c0392b", fontSize: 12.5 }}>{loadError}</div>
      )}
      <div className="mp-body">
        <div className="mp-list-col">
          <div className="mp-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Search messages"
              autoComplete="off"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="mp-tabs">
            <button className={`mp-tab ${tab === "focused" ? "active" : ""}`} onClick={() => changeTab("focused")}>
              Focused
            </button>
            <button className={`mp-tab ${tab === "other" ? "active" : ""}`} onClick={() => changeTab("other")}>
              Other
            </button>
          </div>
          <div className="mp-convo-list">
            {rows.length === 0 ? (
              <div className="mp-empty-list">No messages here yet.</div>
            ) : (
              rows.map((c) => {
                const last = c.messages[c.messages.length - 1];
                const unread = c.unread > 0;
                const isActive = c.id === activeId;
                return (
                  <div
                    key={c.id}
                    className={`mp-convo ${unread ? "unread" : ""} ${isActive ? "active" : ""}`}
                    onClick={() => selectConversation(c.id)}
                  >
                    <div className="mp-avatar" style={{ background: c.color }}>
                      {c.initials}
                      {c.online && <span className="mp-online-dot"></span>}
                    </div>
                    <div className="mp-convo-main">
                      <div className="mp-convo-top">
                        <span className="mp-convo-name">{c.name}</span>
                        <span className="mp-convo-time">{c.time}</span>
                      </div>
                      <div className="mp-convo-preview">{last ? last.text : "No messages yet"}</div>
                    </div>
                    {unread && <span className="mp-unread-dot"></span>}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="mp-thread-col">
          {!active ? (
            <div className="mp-thread-empty">Select a conversation to start messaging.</div>
          ) : (
            <>
              <div className="mp-thread-header">
                <div className="mp-avatar" style={{ background: active.color }}>
                  {active.initials}
                  {active.online && <span className="mp-online-dot"></span>}
                </div>
                <div className="mp-thread-name-wrap">
                  <span className="mp-thread-name">{active.name}</span>
                  <span className="mp-thread-role">{active.online ? "Active now" : active.lastActive || active.role || ""}</span>
                </div>
              </div>
              <div className="mp-thread-body" ref={bodyRef}>
                {renderMessages(active)}
              </div>
              <div className="mp-compose">
                <textarea
                  rows={1}
                  placeholder="Write a message…"
                  ref={composeRef}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <button className="mp-send-btn" onClick={sendMessage}>Send</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}