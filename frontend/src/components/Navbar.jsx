/**
 * components/Navbar.jsx  ← UPDATED
 * History and Profile moved out of the main nav and into a dropdown
 * under the user's name, freeing up horizontal space in the navbar.
 */

import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import {
  LayoutDashboard, Upload, Clock, User, LogOut,
  BrainCircuit, Menu, X, Sun, Moon, Briefcase, FilePenLine,
  MessagesSquare, Target, ChevronDown,
} from "lucide-react";

// Primary nav — stays visible at all times
const NAV_ITEMS = [
  { to: "/dashboard",        label: "Dashboard", icon: LayoutDashboard },
  { to: "/upload",           label: "Analyze",   icon: Upload          },
  { to: "/resume-builder",   label: "Builder",   icon: FilePenLine     },
  { to: "/resume-tailoring", label: "Tailor",    icon: Target          },
  { to: "/interviews",       label: "Interview", icon: MessagesSquare  },
  { to: "/job-match",        label: "Job Match", icon: Briefcase       },
];

// Secondary nav — lives inside the user dropdown
const USER_MENU_ITEMS = [
  { to: "/history", label: "History", icon: Clock },
  { to: "/profile", label: "Profile", icon: User  },
];

export default function Navbar() {
  const { user, logout }   = useAuth();
  const { isDark, toggle } = useTheme();
  const navigate           = useNavigate();
  const location           = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const userMenuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the user dropdown whenever the route changes
  useEffect(() => {
    setUserMenuOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  // Close the user dropdown on outside click
  useEffect(() => {
    if (!userMenuOpen) return;
    const onClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [userMenuOpen]);

  // Close the user dropdown on Escape
  useEffect(() => {
    if (!userMenuOpen) return;
    const onKeyDown = (e) => { if (e.key === "Escape") setUserMenuOpen(false); };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [userMenuOpen]);

  const handleLogout = () => { logout(); navigate("/"); };

  const linkClass = ({ isActive }) => `nav-link ${isActive ? "active" : ""}`;

  // Highlight the user pill itself when on History or Profile
  const isOnUserMenuRoute = USER_MENU_ITEMS.some((item) => location.pathname === item.to);

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        scrolled ? "shadow-glass backdrop-blur-2xl" : "backdrop-blur-xl"
      }`}
      style={{
        background: scrolled ? "var(--bg-card)" : "transparent",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5 flex-shrink-0">
            <motion.div
              whileHover={{ rotate: 5, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
              className="p-2 rounded-xl bg-gradient-brand shadow-glow-sm"
            >
              <BrainCircuit className="h-4 w-4 text-white" />
            </motion.div>
            <span className="font-display font-bold text-lg" style={{ color: "var(--text-primary)" }}>
              Resume<span className="gradient-text">AI</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={linkClass}>
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop right */}
          <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
            {/* Theme toggle */}
            <motion.button
              onClick={toggle}
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              className="p-2 rounded-xl border transition-all hover:border-brand-500/40"
              style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
              title={isDark ? "Light mode" : "Dark mode"}
            >
              <AnimatePresence mode="wait">
                {isDark
                  ? <motion.div key="sun"  initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}><Sun  className="h-4 w-4 text-amber-400" /></motion.div>
                  : <motion.div key="moon" initial={{ rotate:  90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate:-90, opacity: 0 }} transition={{ duration: 0.2 }}><Moon className="h-4 w-4 text-brand-400" /></motion.div>
                }
              </AnimatePresence>
            </motion.button>

            {/* User pill + dropdown */}
            <div className="relative" ref={userMenuRef}>
              <motion.button
                onClick={() => setUserMenuOpen((v) => !v)}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all"
                style={{
                  background: isOnUserMenuRoute ? "rgba(124,58,237,0.12)" : "var(--bg-card)",
                  borderColor: isOnUserMenuRoute ? "rgba(124,58,237,0.35)" : "var(--border)",
                }}
              >
                <div className="h-6 w-6 rounded-lg bg-gradient-brand flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                  {user?.name?.split(" ")[0]}
                </span>
                <motion.div animate={{ rotate: userMenuOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="h-3.5 w-3.5" style={{ color: "var(--text-muted)" }} />
                </motion.div>
              </motion.button>

              {/* Dropdown panel */}
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute right-0 top-full mt-2 w-52 rounded-xl border overflow-hidden shadow-2xl z-50"
                    style={{
  background: isDark ? "#111827" : "#ffffff",
  borderColor: "rgba(255,255,255,0.08)",
}}
                  >
                    {/* User info header */}
                    <div className="px-3.5 py-3 border-b" style={{ borderColor: "var(--border)" }}>
                      <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                        {user?.name}
                      </p>
                      <p className="text-xs truncate mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {user?.email}
                      </p>
                    </div>

                    {/* Menu items */}
                    <div className="p-1.5">
                      {USER_MENU_ITEMS.map(({ to, label, icon: Icon }) => (
                        <NavLink
                          key={to}
                          to={to}
                          onClick={() => setUserMenuOpen(false)}
                          className={({ isActive }) =>
                            `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              isActive ? "bg-brand-500/15 text-brand-300" : ""
                            }`
                          }
                          style={({ isActive }) =>
                            !isActive ? { color: "var(--text-secondary)" } : {}
                          }
                        >
                          <Icon className="h-4 w-4" />
                          {label}
                        </NavLink>
                      ))}
                    </div>

                    {/* Logout */}
                    <div className="p-1.5 border-t" style={{ borderColor: "var(--border)" }}>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium
                          text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile controls */}
          <div className="lg:hidden flex items-center gap-2">
            <motion.button onClick={toggle} whileTap={{ scale: 0.9 }} className="p-2 rounded-lg">
              {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-brand-400" />}
            </motion.button>
            <motion.button onClick={() => setMobileOpen(!mobileOpen)} whileTap={{ scale: 0.9 }} className="p-2 rounded-lg"
              style={{ color: "var(--text-secondary)" }}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile drawer — keeps everything in one flat list since there's no
          room for a nested dropdown pattern on small screens */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden overflow-hidden border-t"
            style={{ borderColor: "var(--border)", background: "var(--bg-card)", backdropFilter: "blur(24px)" }}
          >
            <div className="px-4 py-3 space-y-1">
              {/* User info */}
              <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
                <div className="h-7 w-7 rounded-lg bg-gradient-brand flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                    {user?.name}
                  </p>
                  <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                    {user?.email}
                  </p>
                </div>
              </div>

              {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} className={linkClass} onClick={() => setMobileOpen(false)}>
                  <Icon className="h-4 w-4" /> {label}
                </NavLink>
              ))}

              {/* Divider before account-related items */}
              <div className="h-px my-2" style={{ background: "var(--border)" }} />

              {USER_MENU_ITEMS.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} className={linkClass} onClick={() => setMobileOpen(false)}>
                  <Icon className="h-4 w-4" /> {label}
                </NavLink>
              ))}

              <button onClick={handleLogout}
                className="nav-link w-full text-red-400/80 hover:text-red-400 hover:bg-red-500/10">
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}