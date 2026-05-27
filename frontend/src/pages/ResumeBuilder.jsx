import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Copy, Download, Edit3, FilePlus2, FileText, Plus, Star, Trash2, Wand2 } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import GlassCard from "../components/GlassCard.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import PageWrapper from "../components/PageWrapper.jsx";
import api from "../services/api.js";
import { resumeBuilderApi } from "../services/resumeBuilderApi.js";
import { createEmptyResume, TEMPLATES } from "../utils/resumeBuilderData.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function ResumeBuilder() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [builds, setBuilds] = useState([]);
  const [uploadedResumes, setUploadedResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const [savedBuilds, resumeResponse] = await Promise.all([
      resumeBuilderApi.list(),
      api.get("/resumes"),
    ]);
    setBuilds(savedBuilds);
    setUploadedResumes(resumeResponse.data.resumes || []);
  };

  useEffect(() => {
    load().catch((err) => toast.error(err.displayMessage || "Could not load resume builder.")).finally(() => setLoading(false));
  }, []);

  const createBlank = async () => {
    try {
      setBusy(true);
      const payload = createEmptyResume(user);
      const build = await resumeBuilderApi.create(payload);
      navigate(`/resume-builder/${build.id}`);
    } catch (err) {
      toast.error(err.displayMessage || "Could not create resume.");
    } finally {
      setBusy(false);
    }
  };

  const createFromUpload = async (sourceResumeId) => {
    try {
      setBusy(true);
      const build = await resumeBuilderApi.create({
        ...createEmptyResume(user),
        title: "Edited Uploaded Resume",
        sourceResumeId,
      });
      navigate(`/resume-builder/${build.id}`);
    } catch (err) {
      toast.error(err.displayMessage || "Could not import uploaded resume.");
    } finally {
      setBusy(false);
    }
  };

  const duplicate = async (id) => {
    try {
      const build = await resumeBuilderApi.duplicate(id);
      toast.success("Resume version duplicated.");
      navigate(`/resume-builder/${build.id}`);
    } catch (err) {
      toast.error(err.displayMessage || "Could not duplicate version.");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this resume version?")) return;
    try {
      await resumeBuilderApi.remove(id);
      setBuilds((items) => items.filter((item) => item.id !== id));
      toast.success("Resume version deleted.");
    } catch (err) {
      toast.error(err.displayMessage || "Could not delete version.");
    }
  };

  const favorite = async (build) => {
    try {
      await resumeBuilderApi.favorite(build.id, !build.isFavorite);
      setBuilds((items) => items.map((item) => (item.id === build.id ? { ...item, isFavorite: !item.isFavorite } : item)));
    } catch (err) {
      toast.error(err.displayMessage || "Could not update favorite.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-primary)" }}>
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <LoadingSpinner text="Loading resume versions..." />
          </div>
        ) : (
          <PageWrapper>
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold text-brand-300">Resume Builder</p>
                <h1 className="page-title mt-1">Create, edit, and export resumes</h1>
                <p className="mt-2 max-w-2xl text-sm" style={{ color: "var(--text-secondary)" }}>
                  Save multiple tailored versions, choose ATS-friendly templates, and export a polished PDF.
                </p>
              </div>
              <button type="button" className="btn-primary" onClick={createBlank} disabled={busy}>
                <Plus className="h-4 w-4" />
                New Resume
              </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
              <div className="space-y-4">
                {builds.length === 0 ? (
                  <GlassCard className="py-14 text-center" gradient>
                    <FilePlus2 className="mx-auto h-12 w-12 text-brand-300" />
                    <h2 className="section-title mt-4">No resume versions yet</h2>
                    <p className="mx-auto mt-2 max-w-md text-sm" style={{ color: "var(--text-secondary)" }}>
                      Start with a blank resume or import extracted text from an uploaded PDF.
                    </p>
                    <button type="button" className="btn-primary mt-6" onClick={createBlank} disabled={busy}>
                      <Plus className="h-4 w-4" />
                      Create Resume
                    </button>
                  </GlassCard>
                ) : (
                  builds.map((build, index) => {
                    const template = TEMPLATES.find((item) => item.id === build.templateId);
                    return (
                      <motion.div key={build.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
                        <GlassCard hover animate={false} padding="p-5">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-brand-300" />
                                <h2 className="truncate font-display text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                                  {build.title}
                                </h2>
                                {build.isFavorite && <Star className="h-4 w-4 fill-amber-400 text-amber-400" />}
                              </div>
                              <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                                {template?.name || "Classic ATS"} · Updated {new Date(build.updatedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <button className="btn-secondary px-3" onClick={() => favorite(build)} title="Favorite">
                                <Star className="h-4 w-4" />
                              </button>
                              <button className="btn-secondary px-3" onClick={() => duplicate(build.id)} title="Duplicate">
                                <Copy className="h-4 w-4" />
                              </button>
                              <button className="btn-secondary px-3" onClick={() => resumeBuilderApi.openPrintWindow(build.id)} title="Export PDF">
                                <Download className="h-4 w-4" />
                              </button>
                              <Link className="btn-primary px-4" to={`/resume-builder/${build.id}`}>
                                <Edit3 className="h-4 w-4" />
                                Edit
                              </Link>
                              <Link className="btn-secondary px-3" to={`/resume-builder/${build.id}/tailor`} title="Tailor to job">
                                <Wand2 className="h-4 w-4" />
                              </Link>
                              <button className="btn-danger px-3" onClick={() => remove(build.id)} title="Delete">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </GlassCard>
                      </motion.div>
                    );
                  })
                )}
              </div>

              <aside className="space-y-4">
                <GlassCard animate={false}>
                  <h2 className="section-title text-base">Import Uploaded Resume</h2>
                  <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                    Turn extracted PDF text into an editable version.
                  </p>
                  <div className="mt-4 space-y-2">
                    {uploadedResumes.length ? uploadedResumes.slice(0, 5).map((resume) => (
                      <button
                        key={resume.id}
                        type="button"
                        className="w-full rounded-xl border p-3 text-left transition hover:border-brand-500/40"
                        style={{ borderColor: "var(--border)", background: "var(--bg-primary)" }}
                        onClick={() => createFromUpload(resume.id)}
                        disabled={busy}
                      >
                        <span className="block truncate text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{resume.originalName}</span>
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>{new Date(resume.createdAt).toLocaleDateString()}</span>
                      </button>
                    )) : (
                      <p className="text-sm" style={{ color: "var(--text-muted)" }}>No uploaded resumes found.</p>
                    )}
                  </div>
                </GlassCard>

                <GlassCard animate={false}>
                  <h2 className="section-title text-base">ATS Templates</h2>
                  <div className="mt-4 space-y-3">
                    {TEMPLATES.map((template) => (
                      <div key={template.id} className="rounded-xl border p-3" style={{ borderColor: "var(--border)" }}>
                        <div className="flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full" style={{ background: template.accent }} />
                          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{template.name}</span>
                        </div>
                        <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>{template.description}</p>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </aside>
            </div>
          </PageWrapper>
        )}
      </main>
      <Footer />
    </div>
  );
}
