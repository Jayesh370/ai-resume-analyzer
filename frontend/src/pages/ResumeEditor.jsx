import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Download, Eye, Save, Sparkles, Wand2 } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import GlassCard from "../components/GlassCard.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import ResumePreview from "../components/resume-builder/ResumePreview.jsx";
import RepeatingSection from "../components/resume-builder/RepeatingSection.jsx";
import SectionOrderControl from "../components/resume-builder/SectionOrderControl.jsx";
import { BuilderField, ChipInput } from "../components/resume-builder/BuilderField.jsx";
import { resumeBuilderApi } from "../services/resumeBuilderApi.js";
import { TEMPLATES, validateResume } from "../utils/resumeBuilderData.js";

const tabs = [
  "Contact",
  "Summary",
  "Skills",
  "Experience",
  "Projects",
  "Education",
  "Certifications",
  "Achievements",
  "Links",
  "Order",
];

export default function ResumeEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [build, setBuild] = useState(null);
  const [activeTab, setActiveTab] = useState("Contact");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    resumeBuilderApi.get(id)
      .then(setBuild)
      .catch((err) => {
        toast.error(err.displayMessage || "Resume version not found.");
        navigate("/resume-builder");
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const content = build?.content;
  const completion = useMemo(() => {
    if (!content) return 0;
    const checks = [
      content.contact.fullName,
      content.contact.email,
      content.summary,
      content.skills?.length,
      content.experience?.length,
      content.education?.length,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [content]);

  const patchBuild = (patch) => setBuild((current) => ({ ...current, ...patch }));
  const patchContent = (patch) => patchBuild({ content: { ...content, ...patch } });
  const patchContact = (patch) => patchContent({ contact: { ...content.contact, ...patch } });

  const save = async () => {
    const validation = validateResume(build);
    setErrors(validation);
    if (Object.keys(validation).length) {
      toast.error(Object.values(validation)[0]);
      return false;
    }

    try {
      setSaving(true);
      const saved = await resumeBuilderApi.update(id, {
        title: build.title,
        templateId: build.templateId,
        content: build.content,
      });
      setBuild(saved);
      toast.success("Resume saved.");
      return true;
    } catch (err) {
      toast.error(err.displayMessage || "Could not save resume.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const exportPdf = async () => {
    try {
      const saved = await save();
      if (!saved) return;
      await resumeBuilderApi.openPrintWindow(id);
    } catch {
      toast.error("Could not open PDF export.");
    }
  };

  const renderTab = () => {
    if (!content) return null;

    if (activeTab === "Contact") {
      return (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <BuilderField label="Resume title" value={build.title} error={errors.title} onChange={(event) => patchBuild({ title: event.target.value })} />
            <BuilderField label="Full name" value={content.contact.fullName} error={errors.fullName} onChange={(event) => patchContact({ fullName: event.target.value })} />
            <BuilderField label="Headline" value={content.contact.headline} onChange={(event) => patchContact({ headline: event.target.value })} />
            <BuilderField label="Email" value={content.contact.email} error={errors.email} onChange={(event) => patchContact({ email: event.target.value })} />
            <BuilderField label="Phone" value={content.contact.phone} onChange={(event) => patchContact({ phone: event.target.value })} />
            <BuilderField label="Location" value={content.contact.location} onChange={(event) => patchContact({ location: event.target.value })} />
            <BuilderField label="Portfolio" value={content.contact.portfolio} onChange={(event) => patchContact({ portfolio: event.target.value })} />
            <BuilderField label="LinkedIn" value={content.contact.linkedin} onChange={(event) => patchContact({ linkedin: event.target.value })} />
            <BuilderField label="GitHub" value={content.contact.github} onChange={(event) => patchContact({ github: event.target.value })} />
          </div>
        </div>
      );
    }

    if (activeTab === "Summary") {
      return (
        <BuilderField
          as="textarea"
          label="Professional summary"
          value={content.summary}
          placeholder="3-4 lines focused on role, scope, strengths, and measurable outcomes."
          onChange={(event) => patchContent({ summary: event.target.value })}
        />
      );
    }

    if (activeTab === "Skills") {
      return (
        <ChipInput
          label="Skills"
          value={content.skills}
          placeholder="React, Node.js, MySQL, AWS, Leadership"
          onChange={(skills) => patchContent({ skills })}
        />
      );
    }

    if (activeTab === "Experience") {
      return <RepeatingSection title="Experience" type="experience" items={content.experience} onChange={(experience) => patchContent({ experience })} />;
    }

    if (activeTab === "Projects") {
      return <RepeatingSection title="Projects" type="projects" items={content.projects} onChange={(projects) => patchContent({ projects })} />;
    }

    if (activeTab === "Education") {
      return <RepeatingSection title="Education" type="education" items={content.education} onChange={(education) => patchContent({ education })} />;
    }

    if (activeTab === "Certifications") {
      return (
      <RepeatingSection
        title="Certifications"
        type="certifications"
        items={content.certifications}
        onChange={(certifications) => patchContent({ certifications })}
      />
      );
    }

    if (activeTab === "Achievements") {
      return <RepeatingSection title="Achievements" type="achievements" items={content.achievements || []} onChange={(achievements) => patchContent({ achievements })} />;
    }

    if (activeTab === "Links") {
      return <RepeatingSection title="Links" type="links" items={content.links || []} onChange={(links) => patchContent({ links })} />;
    }

    return (
      <div>
        <h3 className="section-title text-base mb-2">Section order</h3>
        <p className="mb-4 text-sm" style={{ color: "var(--text-secondary)" }}>
          Drag sections to change how the resume is rendered in preview and PDF export.
        </p>
        <SectionOrderControl value={content.sectionOrder} onChange={(sectionOrder) => patchContent({ sectionOrder })} />
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-primary)" }}>
      <Navbar />
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
        {loading || !build ? (
          <div className="flex h-64 items-center justify-center">
            <LoadingSpinner text="Opening resume editor..." />
          </div>
        ) : (
          <div className="mx-auto max-w-[1500px]">
            <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center gap-3">
                <Link to="/resume-builder" className="btn-secondary px-3">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
                <div>
                  <p className="text-sm font-semibold text-brand-300">Resume Editor</p>
                  <h1 className="page-title mt-1">{build.title || "Untitled Resume"}</h1>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="btn-secondary xl:hidden" onClick={() => setPreviewOpen((value) => !value)}>
                  <Eye className="h-4 w-4" />
                  Preview
                </button>
                <button type="button" className="btn-secondary" onClick={exportPdf}>
                  <Download className="h-4 w-4" />
                  Export PDF
                </button>
                <Link type="button" className="btn-secondary" to={`/resume-builder/${id}/tailor`}>
                  <Wand2 className="h-4 w-4" />
                  Tailor
                </Link>
                <button type="button" className="btn-primary" onClick={save} disabled={saving}>
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,720px)_minmax(560px,1fr)]">
              <div className="space-y-5">
                <GlassCard animate={false} padding="p-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-brand-300" />
                        <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                          Resume readiness
                        </span>
                      </div>
                      <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                        Fill core sections before exporting.
                      </p>
                    </div>
                    <div className="min-w-[180px]">
                      <div className="mb-1 text-right text-xs font-semibold text-brand-300">{completion}%</div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full rounded-full bg-gradient-brand" style={{ width: `${completion}%` }} />
                      </div>
                    </div>
                  </div>
                </GlassCard>

                <GlassCard animate={false} padding="p-4">
                  <h2 className="section-title text-base">Template</h2>
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    {TEMPLATES.map((template) => (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => patchBuild({ templateId: template.id })}
                        className={`rounded-xl border p-3 text-left transition ${
                          build.templateId === template.id ? "border-brand-400 bg-brand-500/10" : "hover:border-brand-500/40"
                        }`}
                        style={{ borderColor: build.templateId === template.id ? undefined : "var(--border)" }}
                      >
                        <span className="mb-2 block h-2 w-10 rounded-full" style={{ background: template.accent }} />
                        <span className="block text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{template.name}</span>
                        <span className="mt-1 block text-xs" style={{ color: "var(--text-muted)" }}>{template.description}</span>
                      </button>
                    ))}
                  </div>
                </GlassCard>

                <GlassCard animate={false} padding="p-0" className="overflow-hidden">
                  <div className="flex gap-1 overflow-x-auto border-b p-3" style={{ borderColor: "var(--border)" }}>
                    {tabs.map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveTab(tab)}
                        className={`shrink-0 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                          activeTab === tab ? "bg-brand-500/15 text-brand-200" : "text-secondary hover:bg-white/5"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                  <div className="p-5">{renderTab()}</div>
                </GlassCard>
              </div>

              <div className={`${previewOpen ? "block" : "hidden"} xl:block`}>
                <div className="sticky top-24">
                  <ResumePreview content={content} templateId={build.templateId} />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
