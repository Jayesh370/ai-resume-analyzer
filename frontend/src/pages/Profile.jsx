/**
 * pages/Profile.jsx — View & edit profile, change password
 */

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { User, Lock, Save, Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function Profile() {
  const { user, login, token } = useAuth();

  /* ── Profile form ─────────────────────────────────────────────── */
  const [profile, setProfile]   = useState({ name: user?.name || "", email: user?.email || "" });
  const [profErrors, setProfErrors] = useState({});
  const [profLoading, setProfLoading] = useState(false);

  /* ── Password form ────────────────────────────────────────────── */
  const [pw, setPw]             = useState({ currentPassword: "", newPassword: "" });
  const [pwErrors, setPwErrors] = useState({});
  const [pwLoading, setPwLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew,     setShowNew]     = useState(false);

  /* ── Profile handlers ─────────────────────────────────────────── */
  const validateProfile = () => {
    const e = {};
    if (!profile.name.trim() || profile.name.trim().length < 2) e.name = "Name must be at least 2 characters.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email))      e.email = "Enter a valid email.";
    setProfErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!validateProfile()) return;
    setProfLoading(true);
    try {
      const res = await api.put("/users/profile", profile);
      // Re-sync auth context so navbar shows updated name
      login(res.data.user, token);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.displayMessage || "Update failed.");
    } finally {
      setProfLoading(false);
    }
  };

  /* ── Password handlers ────────────────────────────────────────── */
  const validatePw = () => {
    const e = {};
    if (!pw.currentPassword)               e.currentPassword = "Current password is required.";
    if (pw.newPassword.length < 8)         e.newPassword = "Min. 8 characters.";
    if (!/[A-Z]/.test(pw.newPassword))     e.newPassword = "Include an uppercase letter.";
    if (!/[0-9]/.test(pw.newPassword))     e.newPassword = "Include a number.";
    setPwErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (!validatePw()) return;
    setPwLoading(true);
    try {
      await api.put("/users/change-password", pw);
      toast.success("Password changed successfully!");
      setPw({ currentPassword: "", newPassword: "" });
    } catch (err) {
      toast.error(err.displayMessage || "Password change failed.");
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="page-title">My Profile</h1>
          <p className="text-secondary mt-1">Manage your account details and security</p>
        </div>

        {/* ── Avatar placeholder ────────────────────────────────── */}
        <div className="card mb-6 flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center flex-shrink-0">
            <span className="font-display font-bold text-brand-400 text-xl">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </span>
          </div>
          <div>
            <p className="font-medium text-primary">{user?.name}</p>
            <p className="text-sm text-muted">{user?.email}</p>
          </div>
        </div>

        {/* ── Profile form ─────────────────────────────────────── */}
        <div className="card mb-6">
          <h2 className="section-title flex items-center gap-2 mb-5">
            <User className="h-5 w-5 text-brand-400" /> Personal Information
          </h2>
          <form onSubmit={handleProfileSave} noValidate className="space-y-4">
            <div>
              <label className="label">Full name</label>
              <input
                type="text"
                className={`input ${profErrors.name ? "input-error" : ""}`}
                value={profile.name}
                onChange={(e) => { setProfile((p) => ({ ...p, name: e.target.value })); setProfErrors((p) => ({ ...p, name: "" })); }}
              />
              {profErrors.name && <p className="error-msg">{profErrors.name}</p>}
            </div>
            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                className={`input ${profErrors.email ? "input-error" : ""}`}
                value={profile.email}
                onChange={(e) => { setProfile((p) => ({ ...p, email: e.target.value })); setProfErrors((p) => ({ ...p, email: "" })); }}
              />
              {profErrors.email && <p className="error-msg">{profErrors.email}</p>}
            </div>
            <button type="submit" disabled={profLoading} className="btn-primary">
              {profLoading
                ? <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                : <Save className="h-4 w-4" />
              }
              {profLoading ? "Saving…" : "Save Changes"}
            </button>
          </form>
        </div>

        {/* ── Password form ─────────────────────────────────────── */}
        <div className="card">
          <h2 className="section-title flex items-center gap-2 mb-5">
            <Lock className="h-5 w-5 text-brand-400" /> Change Password
          </h2>
          <form onSubmit={handlePasswordSave} noValidate className="space-y-4">

            <div>
              <label className="label">Current password</label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  className={`input pr-11 ${pwErrors.currentPassword ? "input-error" : ""}`}
                  placeholder="Your current password"
                  value={pw.currentPassword}
                  onChange={(e) => { setPw((p) => ({ ...p, currentPassword: e.target.value })); setPwErrors((p) => ({ ...p, currentPassword: "" })); }}
                />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary">
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {pwErrors.currentPassword && <p className="error-msg">{pwErrors.currentPassword}</p>}
            </div>

            <div>
              <label className="label">New password</label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  className={`input pr-11 ${pwErrors.newPassword ? "input-error" : ""}`}
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
                  value={pw.newPassword}
                  onChange={(e) => { setPw((p) => ({ ...p, newPassword: e.target.value })); setPwErrors((p) => ({ ...p, newPassword: "" })); }}
                />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary">
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {pwErrors.newPassword && <p className="error-msg">{pwErrors.newPassword}</p>}
            </div>

            <button type="submit" disabled={pwLoading} className="btn-primary">
              {pwLoading
                ? <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                : <ShieldCheck className="h-4 w-4" />
              }
              {pwLoading ? "Updating…" : "Update Password"}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
