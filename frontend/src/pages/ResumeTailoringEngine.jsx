import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ArrowRight, Briefcase, Loader2, Target, Wand2 } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../services/api.js";
import Footer from "../components/Footer.jsx";
import GlassCard from "../components/GlassCard.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import Navbar from "../components/Navbar.jsx";
import ResumePreview from "../components/resume-builder/ResumePreview.jsx";

export default function ResumeTailoringEngine() {
  const [resumes, setResumes] = useState([]);
  const [resumeId, setResumeId] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    api.get("/resumes")
      .then((res) => {
        setResumes(res.data.resumes || []);
        setResumeId(String(res.data.resumes?.[0]?.id || ""));
      })
      .catch((err) => toast.error(err.displayMessage || "Could not load resumes."))
      .finally(() => setLoading(false));
  }, []);

  const runTailoring = async () => {
    if (!resumeId || jobDescription.trim().length < 80) {
      toast.error("Choose a resume and paste a fuller job description.");
      return;
    }
    try {
      setRunning(true);
      const { data } = await api.post("/resume-tailorings/run", {
        resumeId,
        jobTitle,
        companyName,
        jobDescription,
      });
      setResult(data);
      toast.success("Tailored resume version created.");
    } catch (err) {
      toast.error(err.displayMessage || "Could not tailor resume.");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-primary)" }}>
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <p className="text-sm font-semibold text-brand-300">Resume Tailoring Engine</p>
          <h1 className="page-title mt-1">Tailor Resume to a Job</h1>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center"><LoadingSpinner text="Loading resumes..." /></div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
            <div className="space-y-5">
              <GlassCard animate={false}>
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-brand-300" />
                  <h2 className="section-title text-base">Target Role</h2>
                </div>
                <label className="mt-4 block text-xs" style={{ color: "var(--text-muted)" }}>Resume</label>
                <select className="input mt-2" value={resumeId} onChange={(event) => setResumeId(event.target.value)}>
                  {resumes.map((resume) => (
                    <option key={resume.id} value={resume.id}>{resume.originalName}</option>
                  ))}
                </select>
                <input className="input mt-3" value={jobTitle} onChange={(event) => setJobTitle(event.target.value)} placeholder="Job title" />
                <input className="input mt-3" value={companyName} onChange={(event) => setCompanyName(event.target.value)} placeholder="Company name" />
                <textarea
                  className="input mt-3 min-h-[280px] resize-y"
                  value={jobDescription}
                  onChange={(event) => setJobDescription(event.target.value)}
                  placeholder="Paste the job description here."
                />
                <button className="btn-primary mt-4 w-full" onClick={runTailoring} disabled={running || resumes.length === 0}>
                  {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                  {running ? "Tailoring..." : "Run Tailoring"}
                </button>
              </GlassCard>
            </div>

            <div className="space-y-5">
              {result ? (
                <>
                  <div className="grid gap-4 md:grid-cols-3">
                    <GlassCard animate={false} padding="p-4">
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>ATS Before</p>
                      <p className="mt-1 text-3xl font-bold" style={{ color: "var(--text-primary)" }}>{result.tailoring.ats_before ?? 0}</p>
                    </GlassCard>
                    <GlassCard animate={false} padding="p-4">
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>ATS After</p>
                      <p className="mt-1 text-3xl font-bold text-emerald-400">{result.tailoring.ats_after ?? 0}</p>
                    </GlassCard>
                    <GlassCard animate={false} padding="p-4">
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>Version</p>
                      <Link className="mt-2 inline-flex items-center gap-1 text-sm text-brand-300" to={`/resume-builder/${result.build.id}`}>
                        Edit version <ArrowRight className="h-4 w-4" />
                      </Link>
                    </GlassCard>
                  </div>
                  <GlassCard animate={false}>
                    <h2 className="section-title text-base">Keyword Analysis</h2>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>Keywords Added</p>
                        <div className="flex flex-wrap gap-2">
                          {(result.tailoring.keywords_added || []).map((item) => <span key={item} className="badge badge-green">{item}</span>)}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>Still Missing</p>
                        <div className="flex flex-wrap gap-2">
                          {(result.tailoring.keywords_missing || []).map((item) => <span key={item} className="badge badge-yellow">{item}</span>)}
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                  <ResumePreview content={result.build.content} templateId={result.build.template_id || result.build.templateId} />
                </>
              ) : (
                <GlassCard className="min-h-[520px] flex items-center justify-center text-center" animate={false}>
                  <div>
                    <Briefcase className="mx-auto h-12 w-12 text-brand-300" />
                    <h2 className="section-title mt-4">ATS comparison appears here</h2>
                    <p className="mx-auto mt-2 max-w-md text-sm" style={{ color: "var(--text-secondary)" }}>
                      Tailoring automatically saves a new resume version linked to your uploaded resume.
                    </p>
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
