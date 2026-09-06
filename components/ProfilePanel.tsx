"use client";

import { useState } from "react";

interface ProfileData {
  fullName: string;
  username: string;
  companyName: string;
  location: string;
  email: string;
  dateOfJoining: string;
}

const DEFAULT_PROFILE: ProfileData = {
  fullName: "James Harrington",
  username: "@j.harrington",
  companyName: "Harrington Aviation Group",
  location: "Dubai, UAE",
  email: "j.harrington@aviationgroup.ae",
  dateOfJoining: "2023-03-14",
};

/* ─── Edit Profile Modal ──────────────────────────────────── */
function EditProfileModal({
  profile,
  onClose,
  onSave,
}: {
  profile: ProfileData;
  onClose: () => void;
  onSave: (p: ProfileData) => void;
}) {
  const [form, setForm] = useState({ ...profile });
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pwError, setPwError] = useState("");
  const [activeTab, setActiveTab] = useState<"account" | "security" | "danger">("account");

  const set = (k: keyof ProfileData, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (password && password !== confirmPassword) {
      setPwError("Passwords do not match.");
      return;
    }
    setPwError("");
    onSave(form);
    onClose();
  };

  const handleDeleteAccount = () => {
    alert("Account deletion requested. You will receive a confirmation email.");
    onClose();
  };

  return (
    <>
      <div className="ep-backdrop" onClick={onClose} aria-hidden="true" />
      <div className="ep-modal" role="dialog" aria-modal="true" aria-label="Edit Profile">
        {/* Header */}
        <div className="ep-header">
          <div className="ep-header-avatar">
            <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Profile" />
            <button className="ep-avatar-change" title="Change photo">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </button>
          </div>
          <div className="ep-header-info">
            <h2>{form.fullName}</h2>
            <span>{form.username}</span>
          </div>
          <button className="ep-close-btn" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="ep-tabs">
          <button className={`ep-tab ${activeTab === "account" ? "active" : ""}`} onClick={() => setActiveTab("account")}>Account</button>
          <button className={`ep-tab ${activeTab === "security" ? "active" : ""}`} onClick={() => setActiveTab("security")}>Security</button>
          <button className={`ep-tab ep-tab-danger ${activeTab === "danger" ? "active" : ""}`} onClick={() => setActiveTab("danger")}>Danger Zone</button>
        </div>

        {/* Body */}
        <div className="ep-body">
          {activeTab === "account" && (
            <div className="ep-section">
              <div className="ep-field">
                <label>Username</label>
                <input type="text" value={form.username} onChange={(e) => set("username", e.target.value)} placeholder="@username" />
              </div>
              <div className="ep-field">
                <label>Email Address</label>
                <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="email@example.com" />
              </div>
              <div className="ep-field">
                <label>Date of Joining</label>
                <input type="date" value={form.dateOfJoining} onChange={(e) => set("dateOfJoining", e.target.value)} />
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="ep-section">
              <p className="ep-section-desc">Update your password. Choose a strong password of at least 8 characters.</p>
              <div className="ep-field">
                <label>New Password</label>
                <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setPwError(""); }} placeholder="Enter new password" />
              </div>
              <div className="ep-field">
                <label>Confirm New Password</label>
                <input type="password" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setPwError(""); }} placeholder="Repeat new password" />
              </div>
              {pwError && <p className="ep-error">{pwError}</p>}
            </div>
          )}

          {activeTab === "danger" && (
            <div className="ep-section">
              <div className="ep-danger-card">
                <div className="ep-danger-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <h4>Delete Account</h4>
                <p>Permanently delete your M1 Marketplace account and all associated data. This action <strong>cannot be undone</strong>.</p>
                {!showDeleteConfirm ? (
                  <button className="ep-delete-btn" onClick={() => setShowDeleteConfirm(true)}>Delete My Account</button>
                ) : (
                  <div className="ep-delete-confirm">
                    <p className="ep-confirm-text">Are you absolutely sure?</p>
                    <div className="ep-confirm-btns">
                      <button className="ep-btn-cancel" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                      <button className="ep-delete-btn" onClick={handleDeleteAccount}>Yes, Delete Account</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {activeTab !== "danger" && (
          <div className="ep-footer">
            <button className="ep-btn-cancel" onClick={onClose}>Cancel</button>
            <button className="ep-btn-save" onClick={handleSave}>Save Changes</button>
          </div>
        )}
      </div>
    </>
  );
}

/* ─── Profile Panel (silver sidebar) ─────────────────────── */
export default function ProfilePanel({ onClose }: { onClose: () => void }) {
  const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE);
  const [editOpen, setEditOpen] = useState(false);

  const infoRows = [
    {
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
      label: "Full Name",
      value: profile.fullName,
    },
    {
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      label: "Username",
      value: profile.username,
    },
    {
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      ),
      label: "Company Name",
      value: profile.companyName,
    },
    {
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      ),
      label: "Location",
      value: profile.location,
    },
  ];

  return (
    <>
      <div className="profile-panel" role="dialog" aria-modal="true" aria-label="Profile">
        <div className="pp-topbar">
          <span className="pp-label">My Profile</span>
          <button className="pp-close" onClick={onClose} aria-label="Close profile">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="pp-hero">
          <div className="pp-avatar-wrap">
            <img src="https://randomuser.me/api/portraits/men/32.jpg" alt={profile.fullName} className="pp-avatar" />
            <span className="pp-status-dot" />
          </div>
          <div className="pp-hero-info">
            <h3>{profile.fullName}</h3>
            <span className="pp-hero-user">{profile.username}</span>
          </div>
        </div>

        <div className="pp-divider" />

        <div className="pp-info-list">
          {infoRows.map((row) => (
            <div className="pp-info-row" key={row.label}>
              <span className="pp-info-icon">{row.icon}</span>
              <div className="pp-info-text">
                <span className="pp-info-label">{row.label}</span>
                <span className="pp-info-value">{row.value}</span>
              </div>
            </div>
          ))}
        </div>

        <button className="pp-edit-btn" onClick={() => setEditOpen(true)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Edit Profile
        </button>
      </div>

      {editOpen && (
        <EditProfileModal
          profile={profile}
          onClose={() => setEditOpen(false)}
          onSave={(updated) => setProfile(updated)}
        />
      )}
    </>
  );
}
