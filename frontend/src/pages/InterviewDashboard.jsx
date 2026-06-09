import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Brain, CheckCircle2, Loader2, MessageSquare, Play, Send } from "lucide-react";
import api from "../services/api.js";
import Footer from "../components/Footer.jsx";
import GlassCard from "../components/GlassCard.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import Navbar from "../components/Navbar.jsx";

const TYPES = ["Technical", "Behavioral", "HR", "Resume-Based", "Job-Specific"];

export default function InterviewDashboard() {
  const [resumes, setResumes] = useState([]);
  const [resumeId, setResumeId] = useState("");
  const [sessionType, setSessionType] = useState("Resume-Based");
  const [jobDescription, setJobDescription] = useState("");
  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadInitial = async () => {
    const [resumeRes, statsRes] = await Promise.all([api.get("/resumes"), api.get("/interviews/stats")]);
    setResumes(resumeRes.data.resumes || []);
    setResumeId(String(resumeRes.data.resumes?.[0]?.id || ""));
    setStats(statsRes.data.stats);
  };

  useEffect(() => {
    loadInitial()
      .catch((err) => toast.error(err.displayMessage || "Could not load interview dashboard."))
      .finally(() => setLoading(false));
  }, []);

  const startInterview = async () => {
    if (!resumeId) {
      toast.error("Upload a resume first.");
      return;
    }
    try {
      setStarting(true);
      const { data } = await api.post("/interviews/sessions", {
        resumeId,
        sessionType,
        jobDescription,
      });
      setSession(data.session);
      setQuestions(data.questions || []);
      setAnswers([]);
      setAnswer("");
      setIndex(0);
      toast.success("Mock interview started.");
    } catch (err) {
      toast.error(err.displayMessage || "Could not start interview.");
    } finally {
      setStarting(false);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim()) {
      toast.error("Write your answer first.");
      return;
    }
    try {
      setSubmitting(true);
      const { data } = await api.post(`/interviews/sessions/${session.id}/answers`, {
        question: questions[index],
        userAnswer: answer,
      });
      setAnswers((current) => [...current, data.answer]);
      setAnswer("");
      setIndex((current) => Math.min(current + 1, questions.length));
      setSession((current) => ({ ...current, overall_score: data.overallScore }));
    } catch (err) {
      toast.error(err.displayMessage || "Could not evaluate answer.");
    } finally {
      setSubmitting(false);
    }
  };

  const currentQuestion = questions[index];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-primary)" }}>
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <p className="text-sm font-semibold text-brand-300">AI Mock Interview</p>
          <h1 className="page-title mt-1">Interview Dashboard</h1>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center"><LoadingSpinner text="Loading interviews..." /></div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
            <div className="space-y-5">
              <GlassCard animate={false}>
                <h2 className="section-title text-base">Start Interview</h2>
                <select className="input mt-4" value={resumeId} onChange={(event) => setResumeId(event.target.value)}>
                  {resumes.map((resume) => <option key={resume.id} value={resume.id}>{resume.originalName}</option>)}
                </select>
                <select className="input mt-3" value={sessionType} onChange={(event) => setSessionType(event.target.value)}>
                  {TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
                <textarea
                  className="input mt-3 min-h-[140px]"
                  value={jobDescription}
                  onChange={(event) => setJobDescription(event.target.value)}
                  placeholder="Optional job description for job-specific questions."
                />
                <button className="btn-primary mt-4 w-full" onClick={startInterview} disabled={starting}>
                  {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                  {starting ? "Starting..." : "Start Interview"}
                </button>
              </GlassCard>

              <div className="grid grid-cols-3 gap-3">
                <GlassCard animate={false} padding="p-4">
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Average</p>
                  <p className="mt-1 text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{stats?.average_score ? Number(stats.average_score).toFixed(1) : "-"}</p>
                </GlassCard>
                <GlassCard animate={false} padding="p-4">
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Best</p>
                  <p className="mt-1 text-2xl font-bold text-emerald-400">{stats?.best_score ? Number(stats.best_score).toFixed(1) : "-"}</p>
                </GlassCard>
                <GlassCard animate={false} padding="p-4">
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Total</p>
                  <p className="mt-1 text-2xl font-bold text-brand-300">{stats?.total || 0}</p>
                </GlassCard>
              </div>
            </div>

            <div className="space-y-5">
              {session && currentQuestion ? (
                <GlassCard animate={false}>
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="section-title text-base">Question {index + 1} of {questions.length}</h2>
                    <span className="badge badge-purple">{session.session_type}</span>
                  </div>
                  <p className="mt-5 text-lg leading-relaxed" style={{ color: "var(--text-primary)" }}>{currentQuestion}</p>
                  <textarea
                    className="input mt-5 min-h-[180px]"
                    value={answer}
                    onChange={(event) => setAnswer(event.target.value)}
                    placeholder="Type your answer here."
                  />
                  <button className="btn-primary mt-4" onClick={submitAnswer} disabled={submitting}>
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Evaluate Answer
                  </button>
                </GlassCard>
              ) : session ? (
                <GlassCard animate={false} className="text-center">
                  <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />
                  <h2 className="section-title mt-4">Interview complete</h2>
                  <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>Overall score: {session.overall_score || "-"}/10</p>
                </GlassCard>
              ) : (
                <GlassCard className="min-h-[360px] flex items-center justify-center text-center" animate={false}>
                  <div>
                    <Brain className="mx-auto h-12 w-12 text-brand-300" />
                    <h2 className="section-title mt-4">Start a guided mock interview</h2>
                    <p className="mx-auto mt-2 max-w-md text-sm" style={{ color: "var(--text-secondary)" }}>
                      Practice technical, behavioral, HR, resume-based, or job-specific questions with live AI scoring.
                    </p>
                  </div>
                </GlassCard>
              )}

              {answers.length > 0 && (
                <GlassCard animate={false}>
                  <h2 className="section-title text-base">Live Scoring</h2>
                  <div className="mt-4 space-y-4">
                    {answers.map((item, itemIndex) => (
                      <div key={item.id || itemIndex} className="rounded-xl border p-4" style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}>
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Answer {itemIndex + 1}</p>
                          <span className="badge badge-green">{item.score}/10</span>
                        </div>
                        <p className="mt-3 text-sm" style={{ color: "var(--text-secondary)" }}>{item.feedback?.communication}</p>
                        <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>{item.feedback?.technicalAccuracy}</p>
                        <p className="mt-3 text-xs font-semibold text-brand-300">Suggested Better Answer</p>
                        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>{item.improved_answer}</p>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
