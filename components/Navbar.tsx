'use client';
import { ROLE_LABELS } from '@/lib/admin-data';

type NavbarProps = {
  currentAdmin?: { name?: string; role?: string } | null;
  notifications?: unknown[];
  onNotifClick?: () => void;
  onProfileClick?: () => void;
};

export default function Navbar({ currentAdmin, notifications, onNotifClick, onProfileClick }: NavbarProps) {
  return (
    <header className="navbar" id="adminNavbar">
      <div className="nav-brand">
        <div className="brand-mark">
          <img src="/m1-logo.jpeg" alt="M1 logo" />
        </div>
        <div className="brand-copy">
          <strong>Marketplace</strong>
          <span>Admin Console</span>
        </div>
      </div>

      <div className="navbar-search">
        <div className="search-bar">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input type="search" placeholder="Search listings, users…" aria-label="Search" />
        </div>
      </div>

      <div className="role-switch" id="currentAdminDisplay">
        <div className="auth-copy">
          <strong>{currentAdmin?.name || 'Admin'}</strong>
          <span>{ROLE_LABELS[currentAdmin?.role as keyof typeof ROLE_LABELS] || currentAdmin?.role || 'Admin'}</span>
        </div>
      </div>

      <div className="nav-utility">
        <button
          className="icon-btn"
          title="Notifications"
          aria-label="Notifications"
          onClick={() => onNotifClick?.()}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="dot" />
        </button>
        <button
          className="avatar-btn"
          title="Profile"
          aria-label="Profile"
          onClick={() => onProfileClick?.()}
        >
          <img src="https://randomuser.me/api/portraits/men/54.jpg" alt="Admin" />
        </button>
      </div>
    </header>
  );
}
