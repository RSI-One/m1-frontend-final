"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe, logout, UserRead } from "@/lib/api/auth";
import {
  getMyProfile,
  uploadMyProfilePhoto,
  UserProfileRead,
} from "@/lib/api/profile";
import { ApiError } from "@/lib/api/client";
import { useSite } from "@/lib/site-context";

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

function toCombined(
  user: UserRead,
  profile: UserProfileRead
): CombinedProfile {
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
export default function ProfilePanel({
  onClose,
}: {
  onClose: () => void;
}) {
  const router = useRouter();
  const { logoutLocally } = useSite();

  const [profile, setProfile] = useState<CombinedProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [user, prof] = await Promise.all([
          getMe(),
          getMyProfile(),
        ]);

        if (!cancelled) {
          setProfile(toCombined(user, prof));
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError
              ? err.message
              : "Failed to load profile."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handlePhotoChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setUploadingPhoto(true);

    try {
      const updated = await uploadMyProfilePhoto(file);

      setProfile((p) =>
        p
          ? {
              ...p,
              profilePictureUrl: updated.profile_picture_url,
            }
          : p
      );
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to upload photo."
      );
    } finally {
      setUploadingPhoto(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);

    try {
      await logout();
    } catch {
      
    } finally {
      logoutLocally();
      setLoggingOut(false);
      onClose();
      router.push("/");
    }
  };

  if (loading) {
    return (
      <div
        className="profile-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Profile"
      >
        <div className="pp-topbar">
          <span className="pp-label">My Profile</span>

          <button
            className="pp-close"
            onClick={onClose}
            aria-label="Close profile"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
            >
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
      <div
        className="profile-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Profile"
      >
        <div className="pp-topbar">
          <span className="pp-label">My Profile</span>

          <button
            className="pp-close"
            onClick={onClose}
            aria-label="Close profile"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <p style={{ padding: 16 }} className="ep-error">
          {error || "Could not load profile."}
        </p>
      </div>
    );
  }

  const infoRows = [
    {
      label: "Full Name",
      value: profile.fullName || "—",
    },
    {
      label: "Username",
      value: `@${profile.username}`,
    },
    {
      label: "Company Name",
      value: profile.companyName || "—",
    },
    {
      label: "Location",
      value: profile.location || "—",
    },
  ];

  return (
    <div
      className="profile-panel"
      role="dialog"
      aria-modal="true"
      aria-label="Profile"
    >
      {/* Top Bar */}
      <div className="pp-topbar">
        <span className="pp-label">My Profile</span>

        <button
          className="pp-close"
          onClick={onClose}
          aria-label="Close profile"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Profile Hero */}
      <div className="pp-hero">
        <div className="pp-avatar-wrap">
          <img
            src={
              profile.profilePictureUrl ||
              "https://randomuser.me/api/portraits/men/32.jpg"
            }
            alt={profile.fullName || profile.username}
            className="pp-avatar"
          />

          <button
            className="ep-avatar-change"
            title="Change photo"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingPhoto}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
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
          <span className="pp-hero-user">
            @{profile.username}
          </span>
        </div>
      </div>

      <div className="pp-divider" />

      {/* Profile Information */}
      <div className="pp-info-list">
        {infoRows.map((row) => (
          <div className="pp-info-row" key={row.label}>
            <div className="pp-info-text">
              <span className="pp-info-label">
                {row.label}
              </span>

              <span className="pp-info-value">
                {row.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="pp-actions-row">
        <button
          className="pp-edit-btn"
          onClick={() => {
            onClose();
            router.push("/profile/edit");
          }}
        >
          Edit Profile
        </button>

        <button
          className="pp-logout-btn"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>
    </div>
  );
}