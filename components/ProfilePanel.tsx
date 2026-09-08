"use client";

import { useEffect, useRef, useState } from "react";
import { getMe, UserRead } from "@/lib/api/auth";
import {
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
  uploadMyProfilePhoto,
  UserProfileRead,
  UserProfileUpdate,
} from "@/lib/api/profile";
import { ApiError } from "@/lib/api/client";

interface CombinedProfile {
  fullName: string;
  companyName: string;
  location: string;
  phoneNumber: string;
  bio: string;
  profilePictureUrl: string | null;
  // read-only, not editable via any endpoint
  username: string;
  email: string;
  joinedAt: string;
}

function toCombined(user: UserRead, profile: UserProfileRead): CombinedProfile {
  return {
    fullName: profile.full_name ?? "",
    companyName: profile.company_name ?? "",
    location: profile.location ?? "",
    phoneNumber: profile.phone_number ?? "",
    bio: profile.bio ?? "",
    profilePictureUrl: profile.profile_picture_url,
    username: user.username,
    email: user.email,
    joinedAt: user.created_at as unknown as string,
  };
}

/* ─── Edit Profile Modal ──────────────────────────────────── */
function EditProfileModal({
  profile,
  onClose,
  onSave,
}: {
  profile: CombinedProfile;
  onClose: () => void;
  onSave: (updates: UserProfileUpdate) => Promise<void>;
}) {
  const [form, setForm] = useState({
    fullName: profile.fullName,
    companyName: profile.companyName,
    location: profile.location,
    phoneNumber: profile.phoneNumber,
    bio: profile.bio,
  });
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pwError, setPwError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"account" | "security" | "danger">("account");

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaveError("");
    setSaving(true);
    try {
      await onSave({
        full_name: form.fullName,
        company_name: form.companyName,
        location: form.location,
        phone_number: form.phoneNumber,
        bio: form.bio,
      });
      onClose();
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword) {
      setPwError("Enter your current password.");
      return;
    }
    if (password.length < 8) {
      setPwError("New password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setPwError("Passwords do not match.");
      return;
    }
    setPwError("");
    setChangingPw(true);
    try {
      await changeMyPassword({ current_password: currentPassword, new_password: password });
      setPwSuccess(true);
      setCurrentPassword("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPwError(err instanceof ApiError ? err.message : "Failed to change password.");
    } finally {
      setChangingPw(false);
    }
  };

  const handleDeleteAccount = () => {
    // No account-deletion endpoint exists in the backend yet.
    alert("Account deletion isn't available yet. Please contact support.");
    onClose();
  };

  return (
    <>
      <div className="ep-backdrop" onClick={onClose} aria-hidden="true" />
      <div className="ep-modal" role="dialog" aria-modal="true" aria-label="Edit Profile">
        <div className="ep-header">
          <div className="ep-header-avatar">
            <img
              src={profile.profilePictureUrl || "https://randomuser.me/api/portraits/men/32.jpg"}
              alt="Profile"
            />
          </div>
          <div className="ep-header-info">
            <h2>{profile.fullName || profile.username}</h2>
            <span>@{profile.username}</span>
          </div>
          <button className="ep-close-btn" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="ep-tabs">
          <button className={`ep-tab ${activeTab === "account" ? "active" : ""}`} onClick={() => setActiveTab("account")}>Account</button>
          <button className={`ep-tab ${activeTab === "security" ? "active" : ""}`} onClick={() => setActiveTab("security")}>Security</button>
          <button className={`ep-tab ep-tab-danger ${activeTab === "danger" ? "active" : ""}`} onClick={() => setActiveTab("danger")}>Danger Zone</button>
        </div>

        <div className="ep-body">
          {activeTab === "account" && (
            <div className="ep-section">
              <div className="ep-field">
                <label>Full Name</label>
                <input type="text" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} />
              </div>
              <div className="ep-field">
                <label>Company Name</label>
                <input type="text" value={form.companyName} onChange={(e) => set("companyName", e.target.value)} />
              </div>
              <div className="ep-field">
                <label>Location</label>
                <input type="text" value={form.location} onChange={(e) => set("location", e.target.value)} />
              </div>
              <div className="ep-field">
                <label>Phone Number</label>
                <input type="tel" value={form.phoneNumber} onChange={(e) => set("phoneNumber", e.target.value)} />
              </div>
              <div className="ep-field">
                <label>Bio</label>
                <input type="text" value={form.bio} onChange={(e) => set("bio", e.target.value)} />
              </div>
              {saveError && <p className="ep-error">{saveError}</p>}
            </div>
          )}

          {activeTab === "security" && (
            <div className="ep-section">
              <p className="ep-section-desc">Update your password. Choose a strong password of at least 8 characters.</p>
              <div className="ep-field">
                <label>Current Password</label>
                <input type="password" value={currentPassword} onChange={(e) => { setCurrentPassword(e.target.value); setPwError(""); setPwSuccess(false); }} placeholder="Enter current password" />
              </div>
              <div className="ep-field">
                <label>New Password</label>
                <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setPwError(""); setPwSuccess(false); }} placeholder="Enter new password" />
              </div>
              <div className="ep-field">
                <label>Confirm New Password</label>
                <input type="password" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setPwError(""); setPwSuccess(false); }} placeholder="Repeat new password" />
              </div>
              {pwError && <p className="ep-error">{pwError}</p>}
              {pwSuccess && <p className="ep-success">Password updated.</p>}
              <div className="ep-footer" style={{ position: "static", marginTop: 12 }}>
                <button className="ep-btn-save" onClick={handleChangePassword} disabled={changingPw}>
                  {changingPw ? "Updating..." : "Update Password"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "danger" && (
            <div className="ep-section">
              <div className="ep-danger-card">
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

        {activeTab === "account" && (
          <div className="ep-footer">
            <button className="ep-btn-cancel" onClick={onClose}>Cancel</button>
            <button className="ep-btn-save" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

/* ─── Profile Panel ─────────────────────────────────────── */
export default function ProfilePanel({ onClose }: { onClose: () => void }) {
  const [profile, setProfile] = useState<CombinedProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [user, prof] = await Promise.all([getMe(), getMyProfile()]);
        if (!cancelled) setProfile(toCombined(user, prof));
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Failed to load profile.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleSave = async (updates: Parameters<typeof updateMyProfile>[0]) => {
    const updated = await updateMyProfile(updates);
    setProfile((p) => (p ? { ...p, ...toCombinedFromUpdate(updated) } : p));
  };

  function toCombinedFromUpdate(updated: UserProfileRead) {
    return {
      fullName: updated.full_name ?? "",
      companyName: updated.company_name ?? "",
      location: updated.location ?? "",
      phoneNumber: updated.phone_number ?? "",
      bio: updated.bio ?? "",
      profilePictureUrl: updated.profile_picture_url,
    };
  }

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const updated = await uploadMyProfilePhoto(file);
      setProfile((p) => (p ? { ...p, profilePictureUrl: updated.profile_picture_url } : p));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to upload photo.");
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (loading) {
    return (
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
        <p style={{ padding: 16 }}>Loading...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
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
        <p style={{ padding: 16 }} className="ep-error">{error || "Could not load profile."}</p>
      </div>
    );
  }

  const infoRows = [
    { label: "Full Name", value: profile.fullName || "—" },
    { label: "Username", value: `@${profile.username}` },
    { label: "Company Name", value: profile.companyName || "—" },
    { label: "Location", value: profile.location || "—" },
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
            <img
              src={profile.profilePictureUrl || "https://randomuser.me/api/portraits/men/32.jpg"}
              alt={profile.fullName || profile.username}
              className="pp-avatar"
            />
            <button
              className="ep-avatar-change"
              title="Change photo"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handlePhotoChange}
            />
            <span className="pp-status-dot" />
          </div>
          <div className="pp-hero-info">
            <h3>{profile.fullName || profile.username}</h3>
            <span className="pp-hero-user">@{profile.username}</span>
          </div>
        </div>

        <div className="pp-divider" />

        <div className="pp-info-list">
          {infoRows.map((row) => (
            <div className="pp-info-row" key={row.label}>
              <div className="pp-info-text">
                <span className="pp-info-label">{row.label}</span>
                <span className="pp-info-value">{row.value}</span>
              </div>
            </div>
          ))}
        </div>

        <button className="pp-edit-btn" onClick={() => setEditOpen(true)}>
          Edit Profile
        </button>
      </div>

      {editOpen && (
        <EditProfileModal
          profile={profile}
          onClose={() => setEditOpen(false)}
          onSave={handleSave}
        />
      )}
    </>
  );
}