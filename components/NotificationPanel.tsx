"use client";



import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  MessageCircle,
  Heart,
  Sparkles,
  CalendarClock,
  FileCheck2,
  PlusCircle,
  Users,
  ArrowDownRight,
  ArrowUpRight,
  EyeOff,
  Eye,
  Check,
} from "lucide-react";


const tokens = {
  champagne: "#F6F1E4", 
  silverIcon: "#B9BEC4",
  silverIconHover: "#8C9198",
  warmBeige: "#D8C7A1", 
  gold: "#C6A15B", 
  emerald: "#50C878", 
  ink: "#111213", 
  inkMuted: "#6B6D71",
  panelBorder: "rgba(17,18,19,0.08)",
};
export type NotificationType =
  | "chat"
  | "saved_asset"
  | "recommended_listing"
  | "meeting"
  | "acquisition_update"
  | "listing_view" 
  | "new_listing" 
  | "competitor_listing"
  | "price_drop"
  | "price_surge"
  | "off_market_listing";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  detail?: string;
  timestamp: string; 
  read?: boolean;
}

interface NotificationPanelProps {
  notifications: NotificationItem[];
  
  variant?: "general" | "partner";
  onMarkAllRead?: () => void;
  onSelect?: (notification: NotificationItem) => void;
}

const typeMeta: Record<
  NotificationType,
  { icon: React.ElementType; accent: string }
> = {
  chat: { icon: MessageCircle, accent: tokens.ink },
  saved_asset: { icon: Heart, accent: "#B23A48" },
  recommended_listing: { icon: Sparkles, accent: tokens.gold },
  meeting: { icon: CalendarClock, accent: tokens.ink },
  acquisition_update: { icon: FileCheck2, accent: tokens.emerald },
  listing_view: { icon: Eye, accent: tokens.inkMuted },
  new_listing: { icon: PlusCircle, accent: tokens.gold },
  competitor_listing: { icon: Users, accent: tokens.inkMuted },
  price_drop: { icon: ArrowDownRight, accent: "#B23A48" },
  price_surge: { icon: ArrowUpRight, accent: tokens.emerald },
  off_market_listing: { icon: EyeOff, accent: tokens.ink },
};

export default function NotificationPanel({
  notifications,
  variant = "general",
  onMarkAllRead,
  onSelect,
}: NotificationPanelProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div ref={containerRef} className="relative inline-block">
      {/* Bell trigger — silver, subtle */}
      <button
        type="button"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full
                   text-[#B9BEC4] transition-colors duration-200
                   hover:text-[#8C9198] focus:outline-none focus-visible:ring-2
                   focus-visible:ring-[#C6A15B]/60"
      >
        <Bell size={20} strokeWidth={1.6} />
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px]
                       items-center justify-center rounded-full px-1 text-[10px]
                       font-medium text-white"
            style={{ backgroundColor: tokens.gold }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Popup panel — small, white, centered under the icon */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute left-1/2 top-full z-50 mt-3 w-80 -translate-x-1/2
                       overflow-hidden rounded-2xl bg-white shadow-[0_12px_40px_rgba(17,18,19,0.14)]"
            style={{ border: `1px solid ${tokens.panelBorder}` }}
            role="menu"
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: `1px solid ${tokens.panelBorder}` }}
            >
              <span
                className="text-[13px] font-semibold tracking-wide"
                style={{ color: tokens.ink }}
              >
                Notifications
                {variant === "partner" && (
                  <span
                    className="ml-2 rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
                    style={{ backgroundColor: tokens.emerald }}
                  >
                    Circle
                  </span>
                )}
              </span>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={onMarkAllRead}
                  className="flex items-center gap-1 text-[11px] font-medium"
                  style={{ color: tokens.inkMuted }}
                >
                  <Check size={12} /> Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-[360px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div
                  className="px-4 py-8 text-center text-[13px]"
                  style={{ color: tokens.inkMuted }}
                >
                  Nothing new yet. We’ll let you know the moment something
                  moves.
                </div>
              ) : (
                notifications.map((n) => {
                  const meta = typeMeta[n.type];
                  const Icon = meta.icon;
                  return (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => {
                        onSelect?.(n);
                        setOpen(false);
                      }}
                      className="flex w-full items-start gap-3 px-4 py-3 text-left
                                 transition-colors duration-150 hover:bg-[#F6F1E4]/60"
                      style={{
                        borderBottom: `1px solid ${tokens.panelBorder}`,
                        backgroundColor: n.read ? "transparent" : "#FAF8F2",
                      }}
                    >
                      <span
                        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                        style={{ backgroundColor: `${meta.accent}1A` }}
                      >
                        <Icon size={14} strokeWidth={1.8} color={meta.accent} />
                      </span>
                      <span className="flex-1">
                        <span
                          className="block text-[13px] font-medium leading-snug"
                          style={{ color: tokens.ink }}
                        >
                          {n.title}
                        </span>
                        {n.detail && (
                          <span
                            className="mt-0.5 block text-[12px] leading-snug"
                            style={{ color: tokens.inkMuted }}
                          >
                            {n.detail}
                          </span>
                        )}
                        <span
                          className="mt-1 block text-[11px]"
                          style={{ color: tokens.inkMuted }}
                        >
                          {n.timestamp}
                        </span>
                      </span>
                      {!n.read && (
                        <span
                          className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ backgroundColor: tokens.gold }}
                        />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
