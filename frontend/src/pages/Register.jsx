/**
 * pages/Register.jsx
 */

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";
import toast from "react-hot-toast";
import { BrainCircuit, Eye, EyeOff, UserPlus } from "lucide-react";

export default function Register() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((p) => ({ ...p, [e.target.name]: "" }));
  };

  // Client-side validation mirrors backend rules
  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = "Name must be at least 2 characters.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))  e.email = "Enter a valid email address.";
    if (form.password.length < 8)                          e.password = "Password must be at least 8 characters.";
    if (!/[A-Z]/.test(form.password))                     e.password = "Include at least one uppercase letter.";
    if (!/[0-9]/.test(form.password))                     e.password = "Include at least one number.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await api.post("/auth/register", form);
      login(res.data.user, res.data.token);
      toast.success("Welcome to ResumeAI! 🎉");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.displayMessage || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      {/* Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-brand-600/8 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="p-1.5 bg-brand-600 rounded-lg">
              <BrainCircuit className="h-5 w-5 text-white" />
            </div>
            <span className="font-display font-bold text-primary text-xl">ResumeAI</span>
          </Link>
          <h1 className="font-display text-2xl font-bold text-primary mt-6 mb-1">Create your account</h1>
          <p className="text-sm text-secondary">Start analyzing resumes for free today</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* Name */}
            <div>
              <label className="label" htmlFor="name">Full name</label>
              <input
                id="name" name="name" type="text"
                className={`input ${errors.name ? "input-error" : ""}`}
                placeholder="Jane Doe"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
              />
              {errors.name && <p className="error-msg">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="label" htmlFor="email">Email address</label>
              <input
                id="email" name="email" type="email"
                className={`input ${errors.email ? "input-error" : ""}`}
                placeholder="jane@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
              {errors.email && <p className="error-msg">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="label" htmlFor="password">Password</label>
              <div className="relative">
                <input
                  id="password" name="password" type={showPw ? "text" : "password"}
                  className={`input pr-11 ${errors.password ? "input-error" : ""}`}
                  placeholder="Min. 8 chars, 1 uppercase, 1 number"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="error-msg">{errors.password}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? (
                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="text-center text-sm text-muted mt-5">
            Already have an account?{" "}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
