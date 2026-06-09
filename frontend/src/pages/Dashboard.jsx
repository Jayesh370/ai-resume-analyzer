/**
 * pages/Dashboard.jsx  ← UPDATED
 * Full redesign: analytics grid, recent analyses, welcome banner, charts.
 */

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import StatsCard from "../components/StatsCard.jsx";
import ScoreCard from "../components/ScoreCard.jsx";
import GlassCard from "../components/GlassCard.jsx";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid,
} from "recharts";
import {
  Upload, Clock, FileText, ArrowRight,
  TrendingUp, Sparkles, ChevronRight, Target,
  Zap, Award, MessagesSquare, Wand2, Briefcase,
} from "lucide-react";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity:0, y:20 },
  show:   { opacity:1, y:0, transition:{ duration:0.45, ease:[0.25,0.46,0.45,0.94] } },
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-xl text-xs font-medium backdrop-blur-xl border"
      style={{ background:"var(--bg-card)", borderColor:"var(--border)", color:"var(--text-primary)" }}>
      {payload[0].payload.role}: <span className="text-brand-300">{payload[0].value}%</span>
    </div>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/analyses/dashboard")
      .then((r) => setStats(r.data.stats))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const radarData = (stats?.latestAnalysis?.job_roles || []).map((r) => ({
    role: r.role?.split(" ")[0] || r.role,
    score: r.matchScore,
    fullMark: 100,
  }));
  const atsTrend = (stats?.atsImprovementTrend || []).map((entry, index) => ({
    name: entry.company_name || entry.job_title || `Tailor ${index + 1}`,
    before: entry.ats_before || 0,
    after: entry.ats_after || 0,
  }));
  const jobMatchTrend = stats?.jobMatchTrend || [];

  return (
    <div className="min-h-screen flex flex-col" style={{ background:"var(--bg-primary)" }}>
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner text="Loading your dashboard…" />
          </div>
        ) : (
          <motion.div variants={container} initial="hidden" animate="show">

            {/* ── Welcome Banner ────────────────────────────────────── */}
            <motion.div variants={item} className="relative overflow-hidden rounded-2xl p-6 md:p-8 mb-8"
              style={{
                background:"linear-gradient(135deg, rgba(124,58,237,0.2) 0%, rgba(79,70,229,0.1) 50%, rgba(15,15,26,0) 100%)",
                border:"1px solid rgba(124,58,237,0.2)",
              }}
            >
              {/* Glow orbs */}
              <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-[80px] opacity-20 pointer-events-none"
                style={{ background:"radial-gradient(circle, #7c3aed, transparent)" }} />
              <div className="absolute -bottom-10 left-20 w-40 h-40 rounded-full blur-[60px] opacity-15 pointer-events-none"
                style={{ background:"radial-gradient(circle, #4f46e5, transparent)" }} />

              <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-brand-300 mb-1">{greeting} 👋</p>
                  <h1 className="font-display text-2xl md:text-3xl font-bold mb-2" style={{ color:"var(--text-primary)" }}>
                    Welcome back, <span className="gradient-text">{user?.name?.split(" ")[0]}</span>
                  </h1>
                  <p className="text-sm" style={{ color:"var(--text-secondary)" }}>
                    {stats?.totalAnalyses > 0
                      ? `You've run ${stats.totalAnalyses} ${stats.totalAnalyses === 1 ? "analysis" : "analyses"}. Keep improving your resume!`
                      : "Upload your first resume to get AI-powered insights."}
                  </p>
                </div>
                <Link to="/upload" className="btn-primary flex-shrink-0">
                  <Zap className="h-4 w-4" />
                  New Analysis
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>

            {/* ── Stats Row ─────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatsCard icon={FileText} label="Resumes Uploaded" value={stats?.totalResumes ?? 0} color="brand" delay={0.05} />
              <StatsCard icon={TrendingUp} label="Average ATS" value={stats?.avgAtsScore != null ? stats.avgAtsScore : "N/A"} color="emerald" delay={0.10} />
              <StatsCard icon={Target} label="Tailored Resumes" value={stats?.totalTailoredResumes ?? 0} color="blue" delay={0.15} />
              <StatsCard icon={Wand2} label="Total Rewrites" value={stats?.totalRewrites ?? 0} color="brand" delay={0.20} />
              <StatsCard icon={MessagesSquare} label="Total Interviews" value={stats?.totalInterviews ?? 0} color="emerald" delay={0.25} />
              <StatsCard
                icon={Award}
                label="Avg Interview"
                value={stats?.averageInterviewScore ?? "N/A"}
                sub={stats?.bestInterviewScore ? `Best ${stats.bestInterviewScore}` : "No score yet"}
                color="amber"
                delay={0.30}
              />
              <StatsCard
                icon={Award}
                label="Latest ATS Score"
                value={stats?.latestAnalysis?.ats_score != null ? `${stats.latestAnalysis.ats_score}` : "—"}
                sub={stats?.latestAnalysis ? "out of 100" : "No analysis yet"}
                color="amber"
                delay={0.35}
              />
              <StatsCard icon={Sparkles} label="Analyses Run" value={stats?.totalAnalyses ?? 0} sub="AI reports" color="blue" delay={0.40} />
            </div>

            {/* ── Main Grid ─────────────────────────────────────────── */}
            <div className="grid lg:grid-cols-3 gap-6 mb-6">

              {/* Latest analysis — spans 2 cols */}
              <motion.div variants={item} className="lg:col-span-2">
                {stats?.latestAnalysis ? (
                  <GlassCard className="h-full" animate={false}>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="section-title flex items-center gap-2">
                        <Target className="h-5 w-5 text-brand-400" />
                        Latest Analysis
                      </h2>
                      <Link to={`/analysis/${stats.latestAnalysis.id}`}
                        className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors">
                        Full report <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                      <ScoreCard score={stats.latestAnalysis.ats_score} size={150} />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold mb-1 truncate" style={{ color:"var(--text-primary)" }}>
                          {stats.latestAnalysis.resume_name}
                        </p>
                        <p className="text-xs mb-3" style={{ color:"var(--text-muted)" }}>
                          {new Date(stats.latestAnalysis.created_at).toLocaleDateString("en-US",
                            { year:"numeric", month:"long", day:"numeric" })}
                        </p>
                        <p className="text-sm leading-relaxed line-clamp-3" style={{ color:"var(--text-secondary)" }}>
                          {stats.latestAnalysis.summary}
                        </p>
                        <Link to={`/analysis/${stats.latestAnalysis.id}`} className="btn-primary mt-5 text-sm inline-flex">
                          View Full Report <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </GlassCard>
                ) : (
                  <GlassCard className="h-full flex flex-col items-center justify-center text-center gap-4 py-16" animate={false}>
                    <motion.div
                      animate={{ y:[0,-8,0] }}
                      transition={{ duration:3, repeat:Infinity, ease:"easeInOut" }}
                      className="p-5 rounded-2xl bg-brand-500/10 border border-brand-500/20"
                    >
                      <FileText className="h-10 w-10 text-brand-400" />
                    </motion.div>
                    <div>
                      <h3 className="font-display font-semibold text-lg mb-1" style={{ color:"var(--text-primary)" }}>
                        No analyses yet
                      </h3>
                      <p className="text-sm max-w-xs" style={{ color:"var(--text-muted)" }}>
                        Upload your resume and get AI-powered insights in seconds.
                      </p>
                    </div>
                    <Link to="/upload" className="btn-primary">
                      <Upload className="h-4 w-4" /> Upload Resume
                    </Link>
                  </GlassCard>
                )}
              </motion.div>

              {/* Radar chart + Quick actions */}
              <motion.div variants={item} className="flex flex-col gap-4">

                {/* Job role radar */}
                {radarData.length > 0 ? (
                  <GlassCard className="flex-1" animate={false}>
                    <h3 className="section-title text-sm mb-4">Role Match Radar</h3>
                    <ResponsiveContainer width="100%" height={180}>
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="rgba(255,255,255,0.06)" />
                        <PolarAngleAxis dataKey="role" tick={{ fill:"var(--text-muted)", fontSize:11 }} />
                        <PolarRadiusAxis domain={[0,100]} tick={false} axisLine={false} />
                        <Radar name="Match" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2}
                          strokeWidth={2} dot={{ fill:"#8b5cf6", r:3 }} />
                        <Tooltip content={<CustomTooltip />} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </GlassCard>
                ) : (
                  <GlassCard className="flex-1 flex items-center justify-center" animate={false}>
                    <p className="text-xs text-center" style={{ color:"var(--text-muted)" }}>
                      Role radar appears after first analysis
                    </p>
                  </GlassCard>
                )}

                {/* Quick actions */}
                <GlassCard padding="p-4" animate={false}>
                  <h3 className="text-sm font-semibold mb-3" style={{ color:"var(--text-secondary)" }}>
                    Quick Actions
                  </h3>
                  <div className="space-y-2">
                    {[
                      { to:"/upload",  icon:Upload, label:"New Analysis",  sub:"Analyze a resume",    color:"text-brand-400",   bg:"bg-brand-500/10 border-brand-500/20"   },
                      { to:"/resume-tailoring", icon:Briefcase, label:"Tailor Resume", sub:"Target a role", color:"text-blue-400", bg:"bg-blue-500/10 border-blue-500/20" },
                      { to:"/interviews", icon:MessagesSquare, label:"Mock Interview", sub:"Practice answers", color:"text-brand-400", bg:"bg-brand-500/10 border-brand-500/20" },
                      { to:"/history", icon:Clock,  label:"View History",  sub:"Past analyses",       color:"text-emerald-400", bg:"bg-emerald-500/10 border-emerald-500/20" },
                      { to:"/profile", icon:FileText,label:"My Profile",  sub:"Update your info",    color:"text-amber-400",   bg:"bg-amber-500/10 border-amber-500/20"   },
                    ].map(({ to, icon:Icon, label, sub, color, bg }) => (
                      <Link key={to} to={to}
                        className="flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-200 hover:border-brand-500/30 group"
                        style={{ borderColor:"var(--border)" }}>
                        <div className={`p-2 rounded-lg border ${bg} flex-shrink-0`}>
                          <Icon className={`h-3.5 w-3.5 ${color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium" style={{ color:"var(--text-primary)" }}>{label}</p>
                          <p className="text-[11px]" style={{ color:"var(--text-muted)" }}>{sub}</p>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 text-brand-400 transition-opacity" />
                      </Link>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              <motion.div variants={item}>
                <GlassCard animate={false}>
                  <h2 className="section-title flex items-center gap-2 mb-5">
                    <TrendingUp className="h-5 w-5 text-emerald-400" />
                    ATS Improvement Trend
                  </h2>
                  {atsTrend.length ? (
                    <ResponsiveContainer width="100%" height={240}>
                      <LineChart data={atsTrend}>
                        <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                        <XAxis dataKey="name" tick={{ fill:"var(--text-muted)", fontSize:11 }} tickLine={false} axisLine={false} />
                        <YAxis domain={[0,100]} tick={{ fill:"var(--text-muted)", fontSize:11 }} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12 }} />
                        <Line type="monotone" dataKey="before" stroke="#f59e0b" strokeWidth={2} dot={{ r:3 }} />
                        <Line type="monotone" dataKey="after" stroke="#10b981" strokeWidth={2} dot={{ r:3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-sm" style={{ color:"var(--text-muted)" }}>Tailored resume score improvements appear here.</p>
                  )}
                </GlassCard>
              </motion.div>

              <motion.div variants={item}>
                <GlassCard animate={false}>
                  <h2 className="section-title flex items-center gap-2 mb-5">
                    <Briefcase className="h-5 w-5 text-brand-400" />
                    Job Match Trend
                  </h2>
                  {jobMatchTrend.length ? (
                    <ResponsiveContainer width="100%" height={240}>
                      <LineChart data={jobMatchTrend}>
                        <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                        <XAxis dataKey="label" tick={{ fill:"var(--text-muted)", fontSize:11 }} tickLine={false} axisLine={false} />
                        <YAxis domain={[0,100]} tick={{ fill:"var(--text-muted)", fontSize:11 }} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12 }} />
                        <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={2} dot={{ r:3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-sm" style={{ color:"var(--text-muted)" }}>Job match score history appears after running job matches.</p>
                  )}
                </GlassCard>
              </motion.div>
            </div>
          </motion.div>
        )}
      </main>
      <Footer />
    </div>
  );
}
