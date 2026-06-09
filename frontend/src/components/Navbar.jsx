import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import {
  LayoutDashboard, Upload, Clock, User, LogOut,
  BrainCircuit, Menu, X, Sun, Moon, Briefcase, FilePenLine, MessagesSquare, Target,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/upload",    label: "Analyze",   icon: Upload          },
  { to: "/resume-builder", label: "Builder", icon: FilePenLine  },
  { to: "/resume-tailoring", label: "Tailor", icon: Target },
  { to: "/interviews", label: "Interview", icon: MessagesSquare },
  { to: "/job-match", label: "Job Match", icon: Briefcase       },  // ← NEW
  { to: "/history",   label: "History",   icon: Clock           },
  { to: "/profile",   label: "Profile",   icon: User            },
];

export default function Navbar() {
  const { user, logout }   = useAuth();
  const { isDark, toggle } = useTheme();
  const navigate           = useNavigate();
  const [open, setOpen]    = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => { logout(); navigate("/"); };

  const linkClass = ({ isActive }) => `nav-link ${isActive ? "active" : ""}`;

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

            {/* User pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border"
              style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
              <div className="h-6 w-6 rounded-lg bg-gradient-brand flex items-center justify-center text-white text-xs font-bold">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                {user?.name?.split(" ")[0]}
              </span>
            </div>

            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium
                text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </motion.button>
          </div>

          {/* Mobile controls */}
          <div className="lg:hidden flex items-center gap-2">
            <motion.button onClick={toggle} whileTap={{ scale: 0.9 }} className="p-2 rounded-lg">
              {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-brand-400" />}
            </motion.button>
            <motion.button onClick={() => setOpen(!open)} whileTap={{ scale: 0.9 }} className="p-2 rounded-lg"
              style={{ color: "var(--text-secondary)" }}>
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden overflow-hidden border-t"
            style={{ borderColor: "var(--border)", background: "var(--bg-card)", backdropFilter: "blur(24px)" }}
          >
            <div className="px-4 py-3 space-y-1">
              {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} className={linkClass} onClick={() => setOpen(false)}>
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
