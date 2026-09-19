"use client";

import { useEffect, useRef, useState } from "react";
import { initialConversations, MpConversation, MpMessage } from "../lib/messaging-data";
import {
  listConversations,
  getMessages,
  markConversationRead,
  sendMessage as sendMessageApi,
  ConversationRead,
  MessageRead,
} from "../lib/api/messaging";
import axios from "axios";
import "./whatsapp-messaging.css"; // The new WhatsApp styling

function unauthorized(err: unknown): boolean {
  return axios.isAxiosError(err) && err.response?.status === 401;
}

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
  if (hrs < 24) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  return d.toLocaleDateString();
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

// Mock contacts for "New Chat" flow
const mockContacts = [
  { id: "mc1", name: "Sarah Whitfield", username: "sarahw", email: "sarah@m1.com", phone: "1234567890", avatar: "#5b8def", initials: "SW" },
  { id: "mc2", name: "Marcus Lindqvist", username: "marcusl", email: "marcus@m1.com", phone: "0987654321", avatar: "#e0a458", initials: "ML" },
  { id: "mc3", name: "Priya Nair", username: "priyan", email: "priya@m1.com", phone: "5551234567", avatar: "#57b894", initials: "PN" },
  { id: "mc4", name: "Antoine Dubreuil", username: "antoined", email: "antoine@m1.com", phone: "2223334444", avatar: "#c15b6c", initials: "AD" },
];

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
  const [isGuest, setIsGuest] = useState(false);
  
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [newChatSearch, setNewChatSearch] = useState("");

  const composeRef = useRef<HTMLTextAreaElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  // Backend integration: GET /conversations
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      setLoadError(null);
      try {
        const myUserId = typeof window !== "undefined" ? localStorage.getItem("user_id") : null;
        const rows = await listConversations();
        if (cancelled) return;
        setConversations(rows.length ? rows.map((c) => mapConversation(c, myUserId)) : []);
        setUsingLiveData(true);
        setIsGuest(false);
      } catch (err) {
        if (cancelled) return;
        if (unauthorized(err)) {
          setUsingLiveData(false);
          setIsGuest(true);
        } else {
          setLoadError("Doesn't load the conversation from backend.");
        }
      }
    })();
    return () => { cancelled = true; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isNewChatOpen) onClose();
      if (e.key === "Escape" && isNewChatOpen) setIsNewChatOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, isNewChatOpen]);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [activeId, conversations]);

  useEffect(() => {
    if (!activeId || !usingLiveData) return;
    let cancelled = false;
    (async () => {
      try {
        const myUserId = typeof window !== "undefined" ? localStorage.getItem("user_id") : null;
        const rows = await getMessages(activeId);
        if (cancelled) return;
        const ordered = [...rows].reverse().map((m) => mapMessage(m, myUserId));
        setConversations((prev) => prev.map((c) => (c.id === activeId ? { ...c, messages: ordered } : c)));
      } catch (err) {
        console.error(err);
      }
    })();
    return () => { cancelled = true; };
  }, [activeId, usingLiveData]);

  const selectConversation = (id: string) => {
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c)));
    setActiveId(id);
    if (usingLiveData) markConversationRead(id).catch(console.error);
  };

  const startNewChat = (contact: typeof mockContacts[0]) => {
    // Check if conversation already exists
    const existing = conversations.find(c => c.name === contact.name);
    if (existing) {
      selectConversation(existing.id);
    } else {
      // Create a mock conversation locally
      const newConvo: MpConversation = {
        id: `mock-${Date.now()}`,
        name: contact.name,
        role: "Contact",
        initials: contact.initials,
        color: contact.avatar,
        online: true,
        tab: "focused",
        time: "Just now",
        unread: 0,
        messages: []
      };
      setConversations([newConvo, ...conversations]);
      setActiveId(newConvo.id);
    }
    setIsNewChatOpen(false);
    setNewChatSearch("");
  };

  const sendMessage = async () => {
    const textarea = composeRef.current;
    if (!textarea || !activeId || sending) return;
    const value = textarea.value.trim();
    if (!value) return;

    const optimisticTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Optimistic append
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? { ...c, messages: [...c.messages, { from: "me", text: value, time: optimisticTime }] }
          : c
      )
    );
    textarea.value = "";

    if (!usingLiveData || activeId.startsWith('mock-')) return;

    setSending(true);
    try {
      const saved = await sendMessageApi(activeId, { content: value, message_type: "text" });
      const myUserId = typeof window !== "undefined" ? localStorage.getItem("user_id") : null;
      const confirmed = mapMessage(saved, myUserId);

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== activeId) return c;
          const withoutOptimistic = c.messages.slice(0, -1);
          return { ...c, messages: [...withoutOptimistic, confirmed] };
        })
      );
    } catch (err) {
      // Rollback
      setConversations((prev) =>
        prev.map((c) => (c.id === activeId ? { ...c, messages: c.messages.slice(0, -1) } : c))
      );
    } finally {
      setSending(false);
    }
  };

  const term = search.trim().toLowerCase();
  const filteredConversations = conversations.filter((c) => !term || c.name.toLowerCase().includes(term));
  const active = conversations.find((c) => c.id === activeId) || null;

  const newChatTerm = newChatSearch.trim().toLowerCase();
  const filteredContacts = mockContacts.filter(c => 
    c.name.toLowerCase().includes(newChatTerm) || 
    c.username.toLowerCase().includes(newChatTerm) || 
    c.email.toLowerCase().includes(newChatTerm) || 
    c.phone.includes(newChatTerm)
  );

  if (!open) return null;

  return (
    <div className="wa-container wa-dark">
      <div className="wa-sidebar">
        
        {/* Default Sidebar View */}
        <div style={{ display: isNewChatOpen ? 'none' : 'flex', flexDirection: 'column', height: '100%' }}>
          <div className="wa-sidebar-header">
            <div className="wa-avatar">Me</div>
            <div className="wa-header-actions">
              <button className="wa-icon-btn" title="New chat" onClick={() => setIsNewChatOpen(true)}>
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path d="M19.005 3.175H4.674C3.642 3.175 3 3.789 3 4.821V21.02l3.544-3.514h12.461c1.033 0 2.064-.106 2.064-1.138V4.821c-.001-1.032-1.032-1.646-2.064-1.646zm-4.989 9.869H7.041V11.1h6.975v1.944zm3-4H7.041V7.1h9.975v1.944z"></path>
                </svg>
              </button>
              <button className="wa-icon-btn" title="Close" onClick={onClose}>
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
          
          <div className="wa-search-container">
            <div className="wa-search-inner">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" style={{marginRight: '12px', color: '#8696a0'}}>
                <path d="M15.009 13.805h-.636l-.22-.219a5.184 5.184 0 0 0 1.256-3.386 5.207 5.207 0 1 0-5.207 5.208 5.183 5.183 0 0 0 3.385-1.255l.221.22v.635l4.004 3.999 1.194-1.195-3.997-4.007zm-4.808 0a3.605 3.605 0 1 1 0-7.21 3.605 3.605 0 0 1 0 7.21z"></path>
              </svg>
              <input 
                type="text" 
                placeholder="Search or start new chat" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="wa-chat-list">
            {filteredConversations.map((c) => (
              <div 
                key={c.id} 
                className={`wa-chat-item ${c.id === activeId ? 'active' : ''}`}
                onClick={() => selectConversation(c.id)}
              >
                <div className="wa-avatar" style={{ backgroundColor: c.color }}>{c.initials}</div>
                <div className="wa-chat-info">
                  <div className="wa-chat-top">
                    <span className="wa-chat-name">{c.name}</span>
                    <span className="wa-chat-time" style={{ color: c.unread > 0 ? '#25d366' : '' }}>{c.time}</span>
                  </div>
                  <div className="wa-chat-bottom">
                    <span className="wa-chat-preview">{c.messages[c.messages.length - 1]?.text || "No messages yet"}</span>
                    {c.unread > 0 && <span className="wa-unread-badge">{c.unread}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* New Chat Panel */}
        <div className={`wa-new-chat-panel ${isNewChatOpen ? 'open' : ''}`}>
          <div className="wa-new-chat-header">
            <button className="wa-icon-btn" style={{color: 'white', marginRight: '20px'}} onClick={() => setIsNewChatOpen(false)}>
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M12 4l1.4 1.4L7.8 11H20v2H7.8l5.6 5.6L12 20l-8-8 8-8z"></path>
              </svg>
            </button>
            <div className="wa-new-chat-title">New chat</div>
          </div>
          <div className="wa-search-container">
            <div className="wa-search-inner">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" style={{marginRight: '12px', color: '#8696a0'}}>
                <path d="M15.009 13.805h-.636l-.22-.219a5.184 5.184 0 0 0 1.256-3.386 5.207 5.207 0 1 0-5.207 5.208 5.183 5.183 0 0 0 3.385-1.255l.221.22v.635l4.004 3.999 1.194-1.195-3.997-4.007zm-4.808 0a3.605 3.605 0 1 1 0-7.21 3.605 3.605 0 0 1 0 7.21z"></path>
              </svg>
              <input 
                type="text" 
                placeholder="Search name, username, email, or phone" 
                value={newChatSearch}
                onChange={(e) => setNewChatSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="wa-chat-list">
            {filteredContacts.map(contact => (
              <div key={contact.id} className="wa-contact-item" onClick={() => startNewChat(contact)}>
                <div className="wa-avatar" style={{ backgroundColor: contact.avatar }}>{contact.initials}</div>
                <div className="wa-chat-info">
                  <div className="wa-chat-name" style={{ marginBottom: '2px' }}>{contact.name}</div>
                  <div className="wa-contact-details">{contact.username} • {contact.email}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="wa-main">
        <div className="wa-main-bg"></div>
        
        {!active ? (
          <div className="wa-empty-state">
            <svg width="250" height="150" viewBox="0 0 359 196" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path opacity="0.6" fillRule="evenodd" clipRule="evenodd" d="M179.5 196C278.635 196 359 152.124 359 98C359 43.8761 278.635 0 179.5 0C80.3648 0 0 43.8761 0 98C0 152.124 80.3648 196 179.5 196ZM179.5 186.2C272.535 186.2 348 146.713 348 98C348 49.2872 272.535 9.8 179.5 9.8C86.4654 9.8 11 49.2872 11 98C11 146.713 86.4654 186.2 179.5 186.2Z" fill="currentColor"/>
              <path d="M192 104V116H184V104H172V96H184V84H192V96H204V104H192Z" fill="currentColor"/>
            </svg>
            <div className="wa-empty-title">WhatsApp for Web</div>
            <div className="wa-empty-desc">Send and receive messages without keeping your phone online.<br/>Use WhatsApp on up to 4 linked devices and 1 phone at the same time.</div>
          </div>
        ) : (
          <>
            <div className="wa-main-header">
              <div className="wa-chat-header-info">
                <div className="wa-avatar" style={{ backgroundColor: active.color }}>{active.initials}</div>
                <div className="wa-chat-header-text">
                  <div className="wa-chat-name">{active.name}</div>
                  <div className="wa-chat-header-status">{active.online ? "online" : "last seen today"}</div>
                </div>
              </div>
              <div className="wa-header-actions">
                <button className="wa-icon-btn"><svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M15.9 14.3H15l-.3-.3c1-1.1 1.6-2.7 1.6-4.3 0-3.7-3-6.7-6.7-6.7S3 6 3 9.7s3 6.7 6.7 6.7c1.6 0 3.2-.6 4.3-1.6l.3.3v.8l5.1 5.1 1.5-1.5-5-5.2zm-6.2 0c-2.6 0-4.6-2.1-4.6-4.6s2.1-4.6 4.6-4.6 4.6 2.1 4.6 4.6-2 4.6-4.6 4.6z"></path></svg></button>
              </div>
            </div>

            <div className="wa-chat-body" ref={bodyRef}>
              {active.messages.map((m, idx) => (
                <div key={idx} className={`wa-message-row ${m.from === "me" ? "me" : ""}`}>
                  <div className="wa-message-bubble">
                    {m.text}
                    <span className="wa-message-time">{m.time}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="wa-compose">
              <button className="wa-icon-btn">
                <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
                  <path d="M9.153 11.603c.795 0 1.439-.879 1.439-1.962s-.644-1.962-1.439-1.962-1.439.879-1.439 1.962.644 1.962 1.439 1.962zm-3.204 1.362c-.026-.307-.131 5.218 6.063 5.551 6.066-.25 6.066-5.551 6.066-5.551-6.078 1.416-12.129 0-12.129 0zm11.363 1.108s-.669 1.959-5.051 1.959c-3.379 0-4.782-1.99-5.051-1.99-1.052 0-2.046.44-2.813 1.162-.767.722-1.198 1.77-1.198 2.827 0 .504.228 1.959 1.25 2.822l.235.187.352.059c1.921.307 4.19.467 6.425.467 2.235 0 4.505-.16 6.425-.467l.352-.059.235-.187c1.022-.863 1.25-2.318 1.25-2.822 0-1.057-.431-2.105-1.198-2.827-.767-.722-1.761-1.162-2.813-1.162zM14.847 11.603c.795 0 1.439-.879 1.439-1.962s-.644-1.962-1.439-1.962-1.439.879-1.439 1.962.644 1.962 1.439 1.962z"></path>
                </svg>
              </button>
              <button className="wa-icon-btn">
                <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
                  <path d="M1.816 15.556v.002c0 1.502.584 2.912 1.646 3.972s2.472 1.647 3.974 1.647a5.58 5.58 0 0 0 3.972-1.645l9.547-9.548c.769-.768 1.147-1.767 1.058-2.817-.079-.968-.548-1.927-1.319-2.698-1.594-1.592-4.068-1.711-5.517-.262l-7.916 7.915c-.881.881-.792 2.25.214 3.261.959.958 2.423 1.053 3.263.215l5.511-5.512c.28-.28.267-.722.053-.936l-.244-.244c-.191-.191-.567-.349-.957.04l-5.506 5.506c-.18.18-.635.127-.976-.214-.098-.097-.576-.613-.213-.973l7.915-7.917c.818-.817 2.267-.699 3.23.262.5.501.802 1.1.849 1.685.051.573-.156 1.111-.589 1.543l-9.547 9.549a3.97 3.97 0 0 1-2.829 1.171 3.975 3.975 0 0 1-2.83-1.173 3.973 3.973 0 0 1-1.172-2.828c0-1.071.415-2.076 1.172-2.83l7.209-7.211c.157-.157.264-.579.028-.814L11.5 4.36a.57.57 0 0 0-.834.018l-7.205 7.207a5.577 5.577 0 0 0-1.645 3.971z"></path>
                </svg>
              </button>
              <textarea 
                className="wa-compose-input" 
                placeholder="Type a message" 
                rows={1}
                ref={composeRef}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <button className="wa-icon-btn" onClick={sendMessage}>
                <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
                  <path d="M1.101 21.757L23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z"></path>
                </svg>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}