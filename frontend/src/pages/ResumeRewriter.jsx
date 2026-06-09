import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Check, FileText, Loader2, Save, Wand2 } from "lucide-react";
import api from "../services/api.js";
import Footer from "../components/Footer.jsx";
import GlassCard from "../components/GlassCard.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import Navbar from "../components/Navbar.jsx";

export default function ResumeRewriter() {
  const { analysisId } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [rewrite, setRewrite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get(`/analyses/${analysisId}`)
      .then((res) => setAnalysis(res.data.analysis))
      .catch((err) => toast.error(err.displayMessage || "Could not load analysis."))
      .finally(() => setLoading(false));
  }, [analysisId]);

  const sections = useMemo(() => rewrite?.rewritten_content?.sections || [], [rewrite]);

  const generateRewrite = async () => {
    try {
      setGenerating(true);
      const { data } = await api.post("/resume-rewrites/run", {
        resumeId: analysis.resume_id,
        analysisId: analysis.id,
      });
      setRewrite(data.rewrite);
      toast.success("Resume rewrite generated.");
    } catch (err) {
      toast.error(err.displayMessage || "Could not rewrite resume.");
    } finally {
      setGenerating(false);
    }
  };

  const saveVersion = async () => {
    try {
      setSaving(true);
      const { data } = await api.post(`/resume-rewrites/${rewrite.id}/save-version`, {
        title: `${analysis.resume_name} - Rewritten`,
      });
      toast.success("Saved as a resume version.");
      navigate(`/resume-builder/${data.build.id}`);
    } catch (err) {
      toast.error(err.displayMessage || "Could not save version.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-primary)" }}>
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <LoadingSpinner text="Loading rewriter..." />
          </div>
        ) : (
          <div>
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <Link to={`/analysis/${analysisId}`} className="inline-flex items-center gap-1.5 text-sm mb-4" style={{ color: "var(--text-muted)" }}>
                  <ArrowLeft className="h-4 w-4" /> Back to analysis
                </Link>
                <h1 className="page-title">AI Resume Rewriter</h1>
                <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                  {analysis?.resume_name}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button className="btn-primary" onClick={generateRewrite} disabled={generating || !analysis}>
                  {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                  {generating ? "Rewriting..." : "Rewrite Resume"}
                </button>
                {rewrite && (
                  <button className="btn-secondary" onClick={saveVersion} disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Version
                  </button>
                )}
              </div>
            </div>

            {!rewrite ? (
              <GlassCard className="min-h-[420px] flex items-center justify-center text-center" animate={false}>
                <div>
                  <FileText className="mx-auto h-12 w-12 text-brand-300" />
                  <h2 className="section-title mt-4">Generate recruiter-ready improvements</h2>
                  <p className="mx-auto mt-2 max-w-lg text-sm" style={{ color: "var(--text-secondary)" }}>
                    The rewriter will improve summary, experience bullets, projects, action verbs, ATS keywords, and readability.
                  </p>
                </div>
              </GlassCard>
            ) : (
              <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
                <div className="space-y-4">
                  {sections.map((item, index) => (
                    <GlassCard key={`${item.section}-${index}`} animate={false}>
                      <div className="flex items-center justify-between gap-3">
                        <h2 className="section-title text-base">{item.section}</h2>
                        <span className="badge badge-green"><Check className="h-3 w-3" /> Improved</span>
                      </div>
                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <div className="rounded-xl border p-4" style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}>
                          <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-muted)" }}>Original Text</p>
                          <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--text-secondary)" }}>{item.originalText}</p>
                        </div>
                        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                          <p className="text-xs font-semibold mb-2 text-emerald-300">Improved Text</p>
                          <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--text-primary)" }}>{item.improvedText}</p>
                        </div>
                      </div>
                      <p className="mt-4 text-sm" style={{ color: "var(--text-secondary)" }}>
                        <span className="font-semibold text-brand-300">Reason:</span> {item.reason}
                      </p>
                    </GlassCard>
                  ))}
                </div>
                <div className="space-y-5">
                  <GlassCard animate={false}>
                    <h2 className="section-title text-base">Improvement Summary</h2>
                    <div className="mt-4 space-y-3">
                      {(rewrite.improvement_summary || []).map((item) => (
                        <p key={item} className="text-sm" style={{ color: "var(--text-secondary)" }}>{item}</p>
                      ))}
                    </div>
                  </GlassCard>
                  <GlassCard animate={false}>
                    <h2 className="section-title text-base">Rewritten Resume</h2>
                    <pre className="mt-4 max-h-[520px] overflow-auto whitespace-pre-wrap text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      {rewrite.rewritten_content?.rewrittenResume}
                    </pre>
                  </GlassCard>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
