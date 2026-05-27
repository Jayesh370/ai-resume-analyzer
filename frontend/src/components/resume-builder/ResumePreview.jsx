import React from "react";
import { Link as LinkIcon, Mail, MapPin, Phone } from "lucide-react";
import { SECTION_LABELS, TEMPLATES, normaliseSectionOrder } from "../../utils/resumeBuilderData.js";

const clean = (value) => value?.trim();
const joinDate = (start, end) => [start, end || "Present"].filter(Boolean).join(" - ");

const BulletList = ({ bullets }) => {
  const safeBullets = bullets?.filter(clean) || [];
  if (!safeBullets.length) return null;
  return (
    <ul className="mt-1.5 list-disc pl-4 space-y-1">
      {safeBullets.map((bullet, index) => (
        <li key={`${bullet}-${index}`}>{bullet}</li>
      ))}
    </ul>
  );
};

const Section = ({ title, children }) => {
  if (!children) return null;
  return (
    <section className="mt-4 break-inside-avoid">
      <h2 className="resume-section-title mb-2 border-b pb-1 text-[11px] font-bold uppercase tracking-[0.12em]">
        {title}
      </h2>
      {children}
    </section>
  );
};

export default function ResumePreview({ content, templateId = "minimal-ats", scale = "normal" }) {
  const template = TEMPLATES.find((item) => item.id === templateId) || TEMPLATES[2];
  const contact = content.contact || {};
  const isCompact = templateId === "minimal-ats";
  const isCreative = templateId === "creative-portfolio";
  const accentStyle = { "--resume-accent": template.accent };
  const previewScale = scale === "small" ? "scale-[0.72] origin-top" : "";
  const sectionOrder = normaliseSectionOrder(content.sectionOrder);

  const renderSection = (key) => {
    if (key === "summary") {
      return (
        <Section key={key} title={SECTION_LABELS[key]}>
          {clean(content.summary) ? <p className="leading-relaxed text-slate-700">{content.summary}</p> : null}
        </Section>
      );
    }

    if (key === "skills") {
      return (
        <Section key={key} title={SECTION_LABELS[key]}>
          {content.skills?.filter(clean).length ? (
            <div className="flex flex-wrap gap-1.5">
              {content.skills.filter(clean).map((skill) => (
                <span key={skill} className="rounded-full border border-slate-300 px-2 py-0.5 text-[10px]">
                  {skill}
                </span>
              ))}
            </div>
          ) : null}
        </Section>
      );
    }

    if (key === "experience") {
      return (
        <Section key={key} title={SECTION_LABELS[key]}>
          {content.experience?.filter((item) => clean(item.role) || clean(item.company)).map((item, index) => (
            <div key={index} className="mb-3 break-inside-avoid">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-bold">{item.role || "Role"}</h3>
                <span className="shrink-0 text-[10px] font-semibold text-slate-500">{joinDate(item.startDate, item.endDate)}</span>
              </div>
              <p className="text-[11px] text-slate-600">{[item.company, item.location].filter(clean).join(" | ")}</p>
              <BulletList bullets={item.bullets} />
            </div>
          ))}
        </Section>
      );
    }

    if (key === "projects") {
      return (
        <Section key={key} title={SECTION_LABELS[key]}>
          {content.projects?.filter((item) => clean(item.name)).map((item, index) => (
            <div key={index} className="mb-3 break-inside-avoid">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-bold">{item.name}</h3>
                <span className="text-[10px] font-semibold text-slate-500">{item.tech}</span>
              </div>
              <BulletList bullets={item.bullets} />
            </div>
          ))}
        </Section>
      );
    }

    if (key === "education") {
      return (
        <Section key={key} title={SECTION_LABELS[key]}>
          {content.education?.filter((item) => clean(item.school) || clean(item.degree)).map((item, index) => (
            <div key={index} className="mb-2 break-inside-avoid">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-bold">{item.degree || "Degree"}</h3>
                <span className="text-[10px] font-semibold text-slate-500">{joinDate(item.startDate, item.endDate)}</span>
              </div>
              <p className="text-[11px] text-slate-600">{[item.school, item.location].filter(clean).join(" | ")}</p>
            </div>
          ))}
        </Section>
      );
    }

    if (key === "certifications") {
      return (
        <Section key={key} title={SECTION_LABELS[key]}>
          {content.certifications?.filter((item) => clean(item.name)).map((item, index) => (
            <div key={index} className="mb-2 flex items-baseline justify-between gap-4">
              <div>
                <h3 className="font-bold">{item.name}</h3>
                <p className="text-[11px] text-slate-600">{item.issuer}</p>
              </div>
              <span className="text-[10px] font-semibold text-slate-500">{item.date}</span>
            </div>
          ))}
        </Section>
      );
    }

    if (key === "achievements") {
      return (
        <Section key={key} title={SECTION_LABELS[key]}>
          {content.achievements?.filter((item) => clean(item.title)).map((item, index) => (
            <div key={index} className="mb-3 break-inside-avoid">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-bold">{item.title}</h3>
                <span className="text-[10px] font-semibold text-slate-500">{item.date}</span>
              </div>
              <p className="text-[11px] text-slate-600">{item.issuer}</p>
              <BulletList bullets={item.bullets} />
            </div>
          ))}
        </Section>
      );
    }

    if (key === "links") {
      return (
        <Section key={key} title={SECTION_LABELS[key]}>
          {content.links?.filter((item) => clean(item.url)).length ? (
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-600">
              {content.links.filter((item) => clean(item.url)).map((item) => (
                <span key={`${item.label}-${item.url}`}>{item.label || "Link"}: {item.url}</span>
              ))}
            </div>
          ) : null}
        </Section>
      );
    }

    return null;
  };

  return (
    <div className="w-full overflow-auto rounded-2xl bg-zinc-200/80 p-4">
      <article
        className={`resume-preview mx-auto min-h-[1050px] w-[760px] bg-white text-slate-900 shadow-2xl ${previewScale}`}
        style={accentStyle}
      >
        <div className={isCompact ? "p-8 text-[11px]" : "p-10 text-[12px]"}>
          <header
            className={`pb-4 ${isCreative ? "rounded-xl border p-4" : "border-b-2"}`}
            style={{ borderColor: "var(--resume-accent)" }}
          >
            <h1 className="font-sans text-3xl font-bold leading-tight tracking-normal">
              {clean(contact.fullName) || "Your Name"}
            </h1>
            <p className="mt-1 font-semibold" style={{ color: "var(--resume-accent)" }}>
              {clean(contact.headline) || "Target role or professional headline"}
            </p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-600">
              {clean(contact.email) && <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" />{contact.email}</span>}
              {clean(contact.phone) && <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{contact.phone}</span>}
              {clean(contact.location) && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{contact.location}</span>}
              {[contact.portfolio, contact.linkedin, contact.github].filter(clean).map((link) => (
                <span key={link} className="inline-flex items-center gap-1"><LinkIcon className="h-3 w-3" />{link}</span>
              ))}
            </div>
          </header>

          {sectionOrder.map(renderSection)}
        </div>
      </article>
    </div>
  );
}
