"use client";

import { useEffect, useRef, useState } from "react";
import {
  listConversations,
  getMessages as fetchMessages,
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
function fmtTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

interface LiMessage {
  from: "me" | "them";
  text: string;
  time: string;
}

interface LiConversation {
  id: string;
  name: string;
  role: string;
  initials: string;
  color: string;
  online: boolean;
  lastActive?: string;
  tab: "focused" | "other";
  time: string;
  unread: number;
  messages: LiMessage[];
}

const initialConversations: LiConversation[] = [
  {
    id: "c1", name: "Sarah Whitfield", role: "Senior Broker · Gulfstream Desk", initials: "SW",
    color: "#5b8def", online: true, tab: "focused", time: "2m", unread: 2,
    messages: [
      { from: "them", text: "Morning — logbooks for the G700 just came back from the maintenance facility.", time: "9:02 AM" },
      { from: "them", text: "Everything checks out clean, no damage history, no AD items outstanding.", time: "9:02 AM" },
      { from: "me", text: "Great news. Can you send the full binder over today?", time: "9:14 AM" },
      { from: "them", text: "Sending it within the hour, along with the updated appraisal.", time: "9:16 AM" },
    ],
  },
  {
    id: "c2", name: "Marcus Lindqvist", role: "Feadship Yacht Sales", initials: "ML",
    color: "#e0a458", online: false, lastActive: "Active 3h ago", tab: "focused", time: "1h", unread: 0,
    messages: [
      { from: "them", text: "Sea trial for the Sabrewing is confirmed for next Thursday out of Rotterdam.", time: "Yesterday 4:40 PM" },
      { from: "me", text: "Perfect, I'll have the buyer's captain fly in Wednesday night.", time: "Yesterday 5:02 PM" },
      { from: "them", text: "Sounds good — I'll send the marina access details shortly.", time: "Yesterday 5:10 PM" },
    ],
  },
  {
    id: "c3", name: "Priya Nair", role: "M1 Concierge", initials: "PN",
    color: "#57b894", online: true, tab: "focused", time: "Yesterday", unread: 0,
    messages: [
      { from: "them", text: "Your appraisal report for the Falcon 8X is ready to view in your dashboard.", time: "Mon 11:20 AM" },
      { from: "me", text: "Thank you, taking a look now.", time: "Mon 11:45 AM" },
    ],
  },
  {
    id: "c4", name: "Antoine Dubreuil", role: "Falcon 10X Owner Rep", initials: "AD",
    color: "#c15b6c", online: false, lastActive: "Active yesterday", tab: "focused", time: "2d", unread: 1,
    messages: [
      { from: "them", text: "Happy to schedule the pre-purchase inspection whenever suits your team.", time: "2d ago" },
    ],
  },
  {
    id: "c5", name: "M1 Partner Circle", role: "Market intelligence digest", initials: "PC",
    color: "#8a7dd9", online: false, tab: "other", time: "3d", unread: 0,
    messages: [
      { from: "them", text: "This week's brief: long-range jet demand up 6% quarter over quarter.", time: "3d ago" },
    ],
  },
];

interface OpenWindow {
  id: string;
  minimized: boolean;
}

export interface ChatDockHandle {
  toggleList: () => void;
}

export default function ChatDock({ registerToggle }: { registerToggle: (fn: () => void) => void }) {
  const [conversations, setConversations] = useState<LiConversation[]>(initialConversations);
  const [listOpen, setListOpen] = useState(false);
  const [listCollapsed, setListCollapsed] = useState(false);
  const [tab, setTab] = useState<"focused" | "other">("focused");
  const [search, setSearch] = useState("");
  const [openWindows, setOpenWindows] = useState<OpenWindow[]>([]);
  const composeRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});
  const bodyRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [usingLiveData, setUsingLiveData] = useState(false);

  useEffect(() => {
    registerToggle(() => {
      setListOpen((prev) => !prev);
      setListCollapsed(false);
    });
  }, [registerToggle]);

  // ---- Backend integration: GET /conversations ----
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const myUserId = typeof window !== "undefined" ? localStorage.getItem("user_id") : null;
        const rows: ConversationRead[] = await listConversations();
        if (cancelled || !rows.length) return;
        const mapped: LiConversation[] = rows.map((c) => {
          const otherId = myUserId && c.buyer_id === myUserId ? c.seller_id : c.buyer_id;
          return {
            id: c.id,
            name: `User ${otherId.slice(0, 6)}`,
            role: "M1 Marketplace contact",
            initials: otherId.slice(0, 2).toUpperCase(),
            color: colorForId(otherId),
            online: false,
            tab: "focused",
            time: fmtTime(c.updated_at),
            unread: c.unread_count ?? 0,
            messages: c.last_message
              ? [{ from: "them", text: c.last_message.content, time: fmtTime(c.last_message.created_at) }]
              : [],
          };
        });
        setConversations(mapped);
        setUsingLiveData(true);
      } catch (err) {
        console.error(err);
        // keep the demo conversations as fallback
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    openWindows.forEach((w) => {
      if (!w.minimized) {
        const el = bodyRefs.current[w.id];
        if (el) el.scrollTop = el.scrollHeight;
      }
    });
  }, [openWindows, conversations]);

  const liById = (id: string) => conversations.find((c) => c.id === id);

  const openConversation = (id: string) => {
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c)));
    setOpenWindows((prev) => {
      const existing = prev.find((w) => w.id === id);
      if (existing) {
        return prev.map((w) => (w.id === id ? { ...w, minimized: false } : w));
      }
      const next = prev.length >= 3 ? prev.slice(1) : prev;
      return [...next, { id, minimized: false }];
    });

    if (!usingLiveData) return;

    // POST /conversations/{id}/read
    markConversationRead(id).catch((err) => console.error(err));

    // GET /conversations/{id}/messages
    (async () => {
      try {
        const myUserId = typeof window !== "undefined" ? localStorage.getItem("user_id") : null;
        const rows: MessageRead[] = await fetchMessages(id);
        const ordered: LiMessage[] = [...rows].reverse().map((m) => ({
          from: myUserId && m.sender_id === myUserId ? "me" : "them",
          text: m.content,
          time: fmtTime(m.created_at),
        }));
        setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, messages: ordered } : c)));
      } catch (err) {
        console.error(err);
      }
    })();
  };

  const closeConversation = (id: string) => {
    setOpenWindows((prev) => prev.filter((w) => w.id !== id));
  };

  const toggleMinimize = (id: string) => {
    setOpenWindows((prev) => prev.map((w) => (w.id === id ? { ...w, minimized: !w.minimized } : w)));
  };

  // NOTE: no POST send-message endpoint exists in the current backend spec —
  // appended locally (optimistic) until one is added.
  const sendMessage = (id: string) => {
    const textarea = composeRefs.current[id];
    if (!textarea) return;
    const value = textarea.value.trim();
    if (!value) return;
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, messages: [...c.messages, { from: "me", text: value, time }] } : c))
    );
    textarea.value = "";
    textarea.style.height = "auto";
  };

  const windowRight = (index: number) => 24 + 300 + 8 + index * (300 + 8);

  const visibleConvos = conversations.filter(
    (c) => c.tab === tab && (!search.trim() || c.name.toLowerCase().includes(search.trim().toLowerCase()))
  );

  const renderMessages = (c: LiConversation) => {
    const groups: { from: "me" | "them"; items: LiMessage[] }[] = [];
    c.messages.forEach((m) => {
      const last = groups[groups.length - 1];
      if (last && last.from === m.from) last.items.push(m);
      else groups.push({ from: m.from, items: [m] });
    });
    return (
      <>
        <div className="li-date-chip">Today</div>
        {groups.map((g, gi) => (
          <div key={gi} className={`li-msg-group ${g.from === "me" ? "me" : ""}`}>
            {g.from !== "me" && (
              <div className="li-avatar xs" style={{ background: c.color }}>
                {c.initials}
              </div>
            )}
            <div className="li-msg-bubbles">
              {g.items.map((m, mi) => (
                <div key={mi} className="li-bubble">{m.text}</div>
              ))}
              <div className="li-msg-time">{g.items[g.items.length - 1].time}</div>
            </div>
          </div>
        ))}
      </>
    );
  };

  return (
    <div className="li-dock">
      <div className={`li-chat-list ${listOpen ? "" : "hidden"} ${listCollapsed ? "collapsed" : ""}`}>
        <div
          className="li-chat-list-header"
          onClick={() => setListCollapsed((v) => !v)}
        >
          <h4>Messaging</h4>
          <div className="li-chat-list-actions">
            <button
              className="li-icon-btn"
              title="Compose a new message"
              aria-label="Compose a new message"
              onClick={(e) => {
                e.stopPropagation();
                if (conversations.length) openConversation(conversations[0].id);
              }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
              </svg>
            </button>
            <button
              className="li-icon-btn"
              title="Minimize messaging"
              aria-label="Minimize messaging"
              onClick={(e) => {
                e.stopPropagation();
                setListCollapsed((v) => !v);
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <polyline points="18 15 12 9 6 15"></polyline>
              </svg>
            </button>
          </div>
        </div>

        <div className="li-chat-list-body">
          <div className="li-chat-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Search messages"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="li-chat-tabs">
            <button className={`li-tab ${tab === "focused" ? "active" : ""}`} onClick={() => setTab("focused")}>
              Focused
            </button>
            <button className={`li-tab ${tab === "other" ? "active" : ""}`} onClick={() => setTab("other")}>
              Other
            </button>
          </div>
          <div className="li-chat-conversations">
            {visibleConvos.length === 0 ? (
              <div className="li-empty">No messages here yet.</div>
            ) : (
              visibleConvos.map((c) => {
                const last = c.messages[c.messages.length - 1];
                const unread = c.unread > 0;
                return (
                  <div key={c.id} className={`li-convo ${unread ? "unread" : ""}`} onClick={() => openConversation(c.id)}>
                    <div className="li-avatar" style={{ background: c.color }}>
                      {c.initials}
                      {c.online && <span className="li-online-dot"></span>}
                    </div>
                    <div className="li-convo-main">
                      <div className="li-convo-top">
                        <span className="li-convo-name">{c.name}</span>
                        <span className="li-convo-time">{c.time}</span>
                      </div>
                      <div className="li-convo-preview">{last.text}</div>
                    </div>
                    {unread && <span className="li-unread-dot"></span>}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="li-windows">
        {openWindows.map((w, idx) => {
          const c = liById(w.id);
          if (!c) return null;
          const right = windowRight(idx);
          return (
            <div key={c.id} className={`li-chat-window ${w.minimized ? "minimized" : ""}`} style={{ right }}>
              <div className="li-window-header" onClick={() => toggleMinimize(c.id)}>
                <div className="li-window-who">
                  <div className="li-avatar sm" style={{ background: c.color }}>
                    {c.initials}
                    {c.online && <span className="li-online-dot"></span>}
                  </div>
                  <div className="li-window-name-wrap">
                    <span className="li-window-name">{c.name}</span>
                    {!w.minimized && (
                      <span className="li-window-status">{c.online ? "Active now" : c.lastActive || ""}</span>
                    )}
                  </div>
                </div>
                <div className="li-window-actions">
                  <button
                    className="li-icon-btn sm"
                    title={w.minimized ? "Expand" : "Minimize"}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMinimize(c.id);
                    }}
                  >
                    {w.minimized ? (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                        <polyline points="18 15 12 9 6 15"></polyline>
                      </svg>
                    ) : (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    )}
                  </button>
                  <button
                    className="li-icon-btn sm"
                    title="Close conversation"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeConversation(c.id);
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>

              {!w.minimized && (
                <>
                  <div className="li-window-body" ref={(el) => { bodyRefs.current[c.id] = el; }}>
                    {renderMessages(c)}
                  </div>
                  <div className="li-window-compose">
                    <button className="li-icon-btn sm" title="Attach a file">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21.44 11.05l-9.19 9.19a5 5 0 0 1-7.07-7.07l9.19-9.19a3.5 3.5 0 0 1 4.95 4.95l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                      </svg>
                    </button>
                    <textarea
                      rows={1}
                      placeholder="Write a message…"
                      ref={(el) => { composeRefs.current[c.id] = el; }}
                      onInput={(e) => {
                        const el = e.currentTarget;
                        el.style.height = "auto";
                        el.style.height = Math.min(80, el.scrollHeight) + "px";
                        const btn = el.parentElement?.querySelector(".li-send-btn");
                        if (btn) btn.classList.toggle("active", el.value.trim().length > 0);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage(c.id);
                        }
                      }}
                    />
                    <button className="li-icon-btn sm" title="Emoji">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                        <line x1="9" y1="9" x2="9.01" y2="9"></line>
                        <line x1="15" y1="9" x2="15.01" y2="9"></line>
                      </svg>
                    </button>
                    <button className="li-send-btn" onClick={() => sendMessage(c.id)}>
                      Send
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
