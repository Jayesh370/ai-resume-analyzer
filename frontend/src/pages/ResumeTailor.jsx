import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, ArrowRight, Loader2, Target, Wand2 } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import GlassCard from "../components/GlassCard.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import ResumeComparison from "../components/resume-builder/ResumeComparison.jsx";
import ResumePreview from "../components/resume-builder/ResumePreview.jsx";
import { resumeBuilderApi } from "../services/resumeBuilderApi.js";

export default function ResumeTailor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [build, setBuild] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [tailored, setTailored] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    resumeBuilderApi.get(id)
      .then(setBuild)
      .catch((err) => {
        toast.error(err.displayMessage || "Resume version not found.");
        navigate("/resume-builder");
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const generateTailored = async () => {
    if (jobDescription.trim().length < 80) {
      toast.error("Paste a fuller job description first.");
      return;
    }

    try {
      setGenerating(true);
      const result = await resumeBuilderApi.tailor(id, {
        jobDescription,
        title: `${build.title} - Tailored`,
      });
      setTailored(result);
      toast.success("Tailored resume version generated.");
    } catch (err) {
      toast.error(err.displayMessage || "Could not tailor resume.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-primary)" }}>
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {loading || !build ? (
          <div className="flex h-64 items-center justify-center">
            <LoadingSpinner text="Loading tailoring studio..." />
          </div>
        ) : (
          <div>
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="flex items-center gap-3">
                <Link to={`/resume-builder/${id}`} className="btn-secondary px-3">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
                <div>
                  <p className="text-sm font-semibold text-brand-300">Resume Tailoring</p>
                  <h1 className="page-title mt-1">{build.title}</h1>
                </div>
              </div>
              {tailored && (
                <Link to={`/resume-builder/${tailored.id}`} className="btn-primary">
                  Edit Tailored Version
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>

            <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
              <div className="space-y-5">
                <GlassCard animate={false}>
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-brand-300" />
                    <h2 className="section-title text-base">Job Description</h2>
                  </div>
                  <textarea
                    className="input mt-4 min-h-[320px] resize-y"
                    value={jobDescription}
                    onChange={(event) => setJobDescription(event.target.value)}
                    placeholder="Paste the job description here. Include responsibilities, qualifications, tech stack, and preferred skills."
                  />
                  <button type="button" className="btn-primary mt-4 w-full" onClick={generateTailored} disabled={generating}>
                    {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                    {generating ? "Generating..." : "Generate Tailored Resume"}
                  </button>
                </GlassCard>

                <GlassCard animate={false}>
                  <h2 className="section-title text-base">Optimization Checklist</h2>
                  <div className="mt-4 space-y-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                    <p>Match headline and summary to the target role.</p>
                    <p>Prioritize job keywords in skills and recent experience.</p>
                    <p>Rewrite bullets around impact, scope, and tools.</p>
                    <p>Keep facts truthful and ATS-readable.</p>
                  </div>
                </GlassCard>
              </div>

              <div className="space-y-6">
                {tailored ? (
                  <>
                    <div className="grid gap-4 md:grid-cols-3">
                      <GlassCard animate={false} padding="p-4">
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>Before ATS</p>
                        <p className="mt-1 text-3xl font-bold" style={{ color: "var(--text-primary)" }}>{tailored.atsBefore ?? 0}</p>
                      </GlassCard>
                      <GlassCard animate={false} padding="p-4">
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>After ATS</p>
                        <p className="mt-1 text-3xl font-bold text-emerald-400">{tailored.atsAfter ?? 0}</p>
                      </GlassCard>
                      <GlassCard animate={false} padding="p-4">
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>Improvement</p>
                        <p className="mt-1 text-3xl font-bold text-brand-300">+{Math.max(0, (tailored.atsAfter || 0) - (tailored.atsBefore || 0))}</p>
                      </GlassCard>
                    </div>
                    <ResumeComparison original={build.content} tailored={tailored} notes={tailored.tailoringNotes} />
                    <ResumePreview content={tailored.content} templateId={tailored.templateId} />
                  </>
                ) : (
                  <GlassCard className="min-h-[520px] flex items-center justify-center text-center" animate={false} gradient>
                    <div>
                      <Wand2 className="mx-auto h-12 w-12 text-brand-300" />
                      <h2 className="section-title mt-4">Tailored version preview appears here</h2>
                      <p className="mx-auto mt-2 max-w-md text-sm" style={{ color: "var(--text-secondary)" }}>
                        Paste a job description and Gemini will generate targeted rewrites, keyword suggestions, and an ATS score delta.
                      </p>
                    </div>
                  </GlassCard>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
