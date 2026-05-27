/**
 * pages/Landing.jsx — Public marketing/landing page
 */

import React from "react";
import { Link } from "react-router-dom";
import {
  BrainCircuit, FileSearch, Target, Lightbulb,
  MessageSquare, BarChart3, ArrowRight, CheckCircle2,
} from "lucide-react";

const features = [
  { icon: FileSearch,    title: "ATS Score Analysis",    desc: "Get an instant compatibility score and learn how to beat applicant-tracking systems." },
  { icon: Target,        title: "Job Role Matching",     desc: "Discover the top 3 roles your resume aligns with and their percentage match." },
  { icon: Lightbulb,     title: "Skill Gap Insights",    desc: "See exactly which skills you're missing and what to add to land your dream role." },
  { icon: MessageSquare, title: "Interview Questions",   desc: "Receive tailored interview questions based on your actual resume content." },
  { icon: BarChart3,     title: "Analysis History",      desc: "Track your progress over time with a full history of every analysis you've run." },
  { icon: BrainCircuit,  title: "AI-Powered Engine",     desc: "Powered by GPT-4o (or our intelligent mock engine when offline)." },
];

const steps = [
  { n: "01", title: "Upload Your Resume", desc: "Upload any PDF resume — we extract the text automatically." },
  { n: "02", title: "AI Analysis",        desc: "Our engine scores, extracts skills, and matches you to roles in seconds." },
  { n: "03", title: "Prep & Improve",     desc: "Use actionable feedback and interview Q&As to land the job." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-surface text-primary font-sans">

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-surface-border bg-surface/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-brand-600 rounded-lg">
              <BrainCircuit className="h-5 w-5 text-white" />
            </div>
            <span className="font-display font-bold text-primary text-lg">ResumeAI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login"    className="btn-secondary text-sm py-2 px-4">Log in</Link>
            <Link to="/register" className="btn-primary  text-sm py-2 px-4">Get started free</Link>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-24 md:py-36">
        {/* Glow blobs */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-brand-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] rounded-full bg-indigo-700/8 blur-[100px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-300 text-xs font-medium mb-6">
            <BrainCircuit className="h-3.5 w-3.5" />
            AI-powered resume intelligence
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-primary leading-tight mb-6">
            Land your dream job with{" "}
            <span className="gradient-text">AI resume insights</span>
          </h1>

          <p className="text-lg text-secondary max-w-2xl mx-auto mb-10">
            Upload your resume and get an ATS score, skill analysis, job-role match, missing skills, and personalised interview questions — in under 30 seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/register" className="btn-primary text-base px-6 py-3 w-full sm:w-auto">
              Analyze my resume free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/login" className="btn-secondary text-base px-6 py-3 w-full sm:w-auto">
              I already have an account
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-10 flex items-center justify-center gap-6 flex-wrap">
            {["No credit card required","Free to start","Instant results"].map((t) => (
              <span key={t} className="flex items-center gap-1.5 text-sm text-muted">
                <CheckCircle2 className="h-4 w-4 text-brand-500" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────── */}
      <section className="py-20 border-t border-surface-border">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-primary text-center mb-12">
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div key={s.n} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-600/20 border border-brand-500/30 font-display font-bold text-brand-400 text-lg mb-4">
                  {s.n}
                </div>
                <h3 className="font-display font-semibold text-primary text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-secondary">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────── */}
      <section className="py-20 border-t border-surface-border">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-primary text-center mb-12">
            Everything you need to get hired
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card-hover">
                <div className="p-2.5 w-fit rounded-xl bg-brand-600/15 border border-brand-500/20 mb-4">
                  <Icon className="h-5 w-5 text-brand-400" />
                </div>
                <h3 className="font-display font-semibold text-primary mb-2">{title}</h3>
                <p className="text-sm text-secondary leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section className="py-24 border-t border-surface-border">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-4">
            Ready to level up your job search?
          </h2>
          <p className="text-secondary mb-8">
            Join thousands of job seekers using AI to craft better resumes.
          </p>
          <Link to="/register" className="btn-primary text-base px-8 py-3">
            Start for free — it takes 30 seconds
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-surface-border py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-muted">
            <BrainCircuit className="h-4 w-4 text-brand-500" />
            ResumeAI
          </div>
          <p className="text-xs text-muted">© {new Date().getFullYear()} ResumeAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
