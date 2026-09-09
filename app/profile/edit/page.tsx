"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe, UserRead } from "@/lib/api/auth";
import {
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
  uploadMyProfilePhoto,
  UserProfileRead,
} from "@/lib/api/profile";
import { ApiError } from "@/lib/api/client";

interface CombinedProfile {
  fullName: string;
  companyName: string;
  location: string;
  phoneNumber: string;
  bio: string;
  profilePictureUrl: string | null;
  username: string;
  email: string;
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
  };
}

export default function EditProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<CombinedProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [activeTab, setActiveTab] = useState<"account" | "security" | "danger">("account");

  const [form, setForm] = useState({
    fullName: "",
    companyName: "",
    location: "",
    phoneNumber: "",
    bio: "",
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [user, prof] = await Promise.all([getMe(), getMyProfile()]);
        if (cancelled) return;
        const combined = toCombined(user, prof);
        setProfile(combined);
        setForm({
          fullName: combined.fullName,
          companyName: combined.companyName,
          location: combined.location,
          phoneNumber: combined.phoneNumber,
          bio: combined.bio,
        });
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof ApiError ? err.message : "Failed to load profile.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const set = (k: keyof typeof form, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setSaved(false);
  };

  const goBack = () => router.push("/");

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError("");
    setUploadingPhoto(true);
    try {
      const updated = await uploadMyProfilePhoto(file);
      setProfile((p) => (p ? { ...p, profilePictureUrl: updated.profile_picture_url } : p));
    } catch (err) {
      setPhotoError(err instanceof ApiError ? err.message : "Failed to upload photo.");
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    setSaveError("");
    setSaving(true);
    try {
      const updated = await updateMyProfile({
        full_name: form.fullName,
        company_name: form.companyName,
        location: form.location,
        phone_number: form.phoneNumber,
        bio: form.bio,
      });
      setProfile((p) =>
        p
          ? {
              ...p,
              fullName: updated.full_name ?? "",
              companyName: updated.company_name ?? "",
              location: updated.location ?? "",
              phoneNumber: updated.phone_number ?? "",
              bio: updated.bio ?? "",
            }
          : p
      );
      setSaved(true);
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
    alert("Account deletion isn't available yet. Please contact support.");
  };

  if (loading) {
    return (
      <div className="epp-page">
        <div className="epp-card">
          <p style={{ padding: 24 }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (loadError || !profile) {
    return (
      <div className="epp-page">
        <div className="epp-card">
          <p style={{ padding: 24 }} className="ep-error">{loadError || "Could not load profile."}</p>
          <button className="ep-btn-cancel" style={{ margin: 24 }} onClick={goBack}>
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="epp-page">
      <div className="epp-card">
        <div className="epp-topbar">
          <button className="epp-back-btn" onClick={goBack} aria-label="Back">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            <span>Back</span>
          </button>
        </div>

        <div className="ep-header">
          <div className="ep-header-avatar">
            <img
              src={profile.profilePictureUrl || "https://randomuser.me/api/portraits/men/32.jpg"}
              alt="Profile"
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
          </div>
          <div className="ep-header-info">
            <h2>{profile.fullName || profile.username}</h2>
            <span>@{profile.username}</span>
            {uploadingPhoto && <span className="epp-uploading">Uploading photo...</span>}
            {photoError && <p className="ep-error" style={{ marginTop: 6 }}>{photoError}</p>}
          </div>
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
              {saved && !saveError && <p className="ep-success">Changes saved.</p>}
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
          <div className="ep-footer" style={{ position: "static" }}>
            <button className="ep-btn-cancel" onClick={goBack}>Cancel</button>
            <button className="ep-btn-save" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}