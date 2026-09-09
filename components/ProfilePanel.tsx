"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe, logout, UserRead } from "@/lib/api/auth";
import {
  getMyProfile,
  uploadMyProfilePhoto,
  deleteMyAccount,
  UserProfileRead,
} from "@/lib/api/profile";
import { ApiError } from "@/lib/api/client";
import { s } from "framer-motion/client";

interface CombinedProfile {
  fullName: string;
  companyName: string;
  location: string;
  phoneNumber: string;
  bio: string;
  profilePictureUrl: string | null;
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

/* ─── Profile Panel ─────────────────────────────────────── */
export default function ProfilePanel({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [profile, setProfile] = useState<CombinedProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

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

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } catch {
      // even if the call fails, still redirect
    } finally {
      setLoggingOut(false);
      onClose();
      router.push("/login");
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteError("Password is required.");
      return;
    }
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteMyAccount(deletePassword);
      onClose();
      router.push("/login");
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : "Failed to delete account.");
    } finally {
      setDeleting(false);
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

      <div className="pp-actions-row" style={{ display: "flex", gap: 8 }}>
        <button
          className="pp-edit-btn"
          onClick={() => {
            onClose();
            router.push("/profile/edit");
          }}
        >
          Edit Profile
        </button>

        <button className="pp-logout-btn" onClick={handleLogout} disabled={loggingOut}>
          {loggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>

      <button
        className="pp-delete-btn"
        onClick={() => setShowDeleteModal(true)}
        style={{ marginTop: 10, color: "#c0392b" }}
      >
        Delete Account
      </button>

      {showDeleteModal && (
        <div className="pp-delete-overlay" role="dialog" aria-modal="true">
          <div className="pp-delete-modal">
            <h4>Delete Account</h4>
            <p>This action is permanent. Enter your password to confirm.</p>
            <input
              type="password"
              placeholder="Password"
              value={deletePassword}
              onChange={(e) => {
                setDeletePassword(e.target.value);
                setDeleteError("");
              }}
              className="pp-delete-input"
            />
            {deleteError && <p className="ep-error">{deleteError}</p>}
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletePassword("");
                  setDeleteError("");
                }}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                style={{ background: "#c0392b", color: "#fff" }}
              >
                {deleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}