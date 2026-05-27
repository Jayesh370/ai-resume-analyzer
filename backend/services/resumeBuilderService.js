const TEMPLATE_IDS = [
  "modern-developer",
  "professional-corporate",
  "minimal-ats",
  "creative-portfolio",
];

const DEFAULT_SECTION_ORDER = [
  "summary",
  "skills",
  "experience",
  "projects",
  "education",
  "certifications",
  "achievements",
  "links",
];

const TEMPLATE_META = {
  "modern-developer": { accent: "#2563eb", density: "normal" },
  "professional-corporate": { accent: "#4f46e5", density: "normal" },
  "minimal-ats": { accent: "#111827", density: "compact" },
  "creative-portfolio": { accent: "#be185d", density: "normal" },
};

const emptyResumeContent = () => ({
  contact: {
    fullName: "",
    headline: "",
    email: "",
    phone: "",
    location: "",
    portfolio: "",
    linkedin: "",
    github: "",
  },
  summary: "",
  skills: [],
  experience: [],
  projects: [],
  education: [],
  certifications: [],
  achievements: [],
  links: [],
  sectionOrder: [...DEFAULT_SECTION_ORDER],
});

const normaliseString = (value, max = 5000) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

const normaliseBulletArray = (items, maxItems = 8) =>
  Array.isArray(items)
    ? items.map((item) => normaliseString(item, 300)).filter(Boolean).slice(0, maxItems)
    : [];

const normaliseSkills = (items) =>
  Array.isArray(items)
    ? items.map((item) => normaliseString(item, 80)).filter(Boolean).slice(0, 80)
    : [];

const normaliseCollection = (items, shape, maxItems = 20) => {
  if (!Array.isArray(items)) return [];

  return items.slice(0, maxItems).map((item) => {
    const next = {};
    Object.entries(shape).forEach(([key, type]) => {
      if (type === "bullets") next[key] = normaliseBulletArray(item?.[key]);
      else next[key] = normaliseString(item?.[key], type === "long" ? 1000 : 180);
    });
    return next;
  });
};

const normaliseSectionOrder = (sectionOrder) => {
  const requested = Array.isArray(sectionOrder) ? sectionOrder : [];
  return [
    ...requested.filter((key) => DEFAULT_SECTION_ORDER.includes(key)),
    ...DEFAULT_SECTION_ORDER.filter((key) => !requested.includes(key)),
  ];
};

const normaliseContent = (content = {}) => {
  const base = emptyResumeContent();
  const contact = content.contact || {};

  return {
    contact: {
      fullName: normaliseString(contact.fullName, 120),
      headline: normaliseString(contact.headline, 160),
      email: normaliseString(contact.email, 160),
      phone: normaliseString(contact.phone, 60),
      location: normaliseString(contact.location, 120),
      portfolio: normaliseString(contact.portfolio, 180),
      linkedin: normaliseString(contact.linkedin, 180),
      github: normaliseString(contact.github, 180),
    },
    summary: normaliseString(content.summary ?? base.summary, 1200),
    skills: normaliseSkills(content.skills),
    experience: normaliseCollection(
      content.experience,
      { company: "short", role: "short", location: "short", startDate: "short", endDate: "short", bullets: "bullets" },
      18
    ),
    projects: normaliseCollection(
      content.projects,
      { name: "short", link: "short", tech: "short", bullets: "bullets" },
      16
    ),
    education: normaliseCollection(
      content.education,
      { school: "short", degree: "short", location: "short", startDate: "short", endDate: "short" },
      12
    ),
    certifications: normaliseCollection(
      content.certifications,
      { name: "short", issuer: "short", date: "short", link: "short" },
      20
    ),
    achievements: normaliseCollection(
      content.achievements,
      { title: "short", issuer: "short", date: "short", bullets: "bullets" },
      16
    ),
    links: normaliseCollection(
      content.links,
      { label: "short", url: "short" },
      12
    ),
    sectionOrder: normaliseSectionOrder(content.sectionOrder),
  };
};

const validateResumeBuild = ({ title, templateId, content }) => {
  const errors = [];
  const safeTitle = normaliseString(title, 120);
  const safeTemplateId = TEMPLATE_IDS.includes(templateId) ? templateId : "minimal-ats";
  const safeContent = normaliseContent(content);

  if (!safeTitle) errors.push("Resume title is required.");
  if (!safeContent.contact.fullName) errors.push("Full name is required.");
  if (!safeContent.contact.email) errors.push("Email is required.");
  if (safeContent.contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(safeContent.contact.email)) {
    errors.push("Enter a valid email address.");
  }

  return { errors, title: safeTitle, templateId: safeTemplateId, content: safeContent };
};

const parseUploadedText = (text = "", user = {}) => {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const joined = lines.join("\n");
  const email = joined.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || "";
  const phone = joined.match(/(?:\+?\d[\d\s().-]{7,}\d)/)?.[0] || "";
  const skillsIndex = lines.findIndex((line) => /^skills\b/i.test(line));
  const summaryIndex = lines.findIndex((line) => /^(summary|profile|objective)\b/i.test(line));

  const skills =
    skillsIndex >= 0
      ? lines
          .slice(skillsIndex + 1, skillsIndex + 5)
          .join(", ")
          .split(/[,|•]/)
          .map((skill) => normaliseString(skill, 80))
          .filter(Boolean)
          .slice(0, 30)
      : [];

  return normaliseContent({
    contact: {
      fullName: lines[0] || user.name || "",
      headline: lines[1] && !lines[1].includes("@") ? lines[1] : "",
      email: email || user.email || "",
      phone,
    },
    summary: summaryIndex >= 0 ? lines.slice(summaryIndex + 1, summaryIndex + 4).join(" ") : lines.slice(1, 4).join(" "),
    skills,
  });
};

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const renderBullets = (bullets = []) =>
  bullets.length ? `<ul>${bullets.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : "";

const renderSection = (key, c) => {
  const sections = {
    summary: c.summary && `<section><h2>Summary</h2><p>${escapeHtml(c.summary)}</p></section>`,
    skills:
      c.skills.length &&
      `<section><h2>Skills</h2><div class="skills">${c.skills.map((skill) => `<span>${escapeHtml(skill)}</span>`).join("")}</div></section>`,
    experience:
      c.experience.length &&
      `<section><h2>Experience</h2>${c.experience
        .map(
          (item) => `<article><div class="row"><h3>${escapeHtml(item.role)}</h3><strong>${escapeHtml(item.startDate)} - ${escapeHtml(
            item.endDate || "Present"
          )}</strong></div><p class="meta">${escapeHtml([item.company, item.location].filter(Boolean).join(" | "))}</p>${renderBullets(
            item.bullets
          )}</article>`
        )
        .join("")}</section>`,
    projects:
      c.projects.length &&
      `<section><h2>Projects</h2>${c.projects
        .map(
          (item) => `<article><div class="row"><h3>${escapeHtml(item.name)}</h3><strong>${escapeHtml(item.tech)}</strong></div>${renderBullets(
            item.bullets
          )}</article>`
        )
        .join("")}</section>`,
    education:
      c.education.length &&
      `<section><h2>Education</h2>${c.education
        .map(
          (item) => `<article><div class="row"><h3>${escapeHtml(item.degree)}</h3><strong>${escapeHtml(
            [item.startDate, item.endDate].filter(Boolean).join(" - ")
          )}</strong></div><p class="meta">${escapeHtml([item.school, item.location].filter(Boolean).join(" | "))}</p></article>`
        )
        .join("")}</section>`,
    certifications:
      c.certifications.length &&
      `<section><h2>Certifications</h2>${c.certifications
        .map(
          (item) => `<article><div class="row"><h3>${escapeHtml(item.name)}</h3><strong>${escapeHtml(item.date)}</strong></div><p class="meta">${escapeHtml(
            item.issuer
          )}</p></article>`
        )
        .join("")}</section>`,
    achievements:
      c.achievements.length &&
      `<section><h2>Achievements</h2>${c.achievements
        .map(
          (item) => `<article><div class="row"><h3>${escapeHtml(item.title)}</h3><strong>${escapeHtml(item.date)}</strong></div><p class="meta">${escapeHtml(
            item.issuer
          )}</p>${renderBullets(item.bullets)}</article>`
        )
        .join("")}</section>`,
    links:
      c.links.length &&
      `<section><h2>Links</h2><div class="links">${c.links.map((item) => `<span>${escapeHtml(item.label)}: ${escapeHtml(item.url)}</span>`).join("")}</div></section>`,
  };

  return sections[key] || "";
};

const renderResumeHtml = ({ title, templateId, content }) => {
  const c = normaliseContent(content);
  const meta = TEMPLATE_META[templateId] || TEMPLATE_META["minimal-ats"];
  const sectionOrder = normaliseSectionOrder(c.sectionOrder);
  const sections = sectionOrder.map((key) => renderSection(key, c)).filter(Boolean).join("");

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title || "Resume")}</title>
  <style>
    @page { size: A4; margin: 0.45in; }
    * { box-sizing: border-box; }
    body { margin: 0; color: #111827; font-family: Arial, Helvetica, sans-serif; background: #ffffff; }
    .resume { max-width: 8.27in; margin: 0 auto; padding: 0; }
    header { border-bottom: 2px solid ${meta.accent}; padding-bottom: 12px; margin-bottom: 16px; }
    h1 { margin: 0; font-size: ${templateId === "creative-portfolio" ? "32px" : "30px"}; letter-spacing: 0; color: #111827; }
    .headline { margin: 5px 0 8px; font-size: 13px; font-weight: 700; color: ${meta.accent}; }
    .contact, .links { display: flex; flex-wrap: wrap; gap: 8px 14px; color: #4b5563; font-size: 10.5px; }
    section { margin-top: ${meta.density === "compact" ? "10px" : "16px"}; break-inside: avoid; }
    h2 { color: ${meta.accent}; font-size: 12px; margin: 0 0 7px; text-transform: uppercase; letter-spacing: 0.08em; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
    h3 { margin: 0; font-size: 13px; color: #111827; }
    p { margin: 0; font-size: 11px; line-height: 1.45; }
    article { margin-bottom: ${meta.density === "compact" ? "7px" : "11px"}; break-inside: avoid; }
    .row { display: flex; justify-content: space-between; gap: 12px; align-items: baseline; }
    strong { font-size: 10px; color: #4b5563; white-space: nowrap; }
    .meta { margin-top: 2px; color: #4b5563; font-size: 10.5px; }
    ul { margin: 5px 0 0 17px; padding: 0; }
    li { font-size: 10.5px; line-height: 1.4; margin-bottom: 2px; }
    .skills { display: flex; flex-wrap: wrap; gap: 6px; }
    .skills span { border: 1px solid #d1d5db; border-radius: 999px; padding: 3px 8px; font-size: 10px; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .resume { width: 100%; } }
  </style>
</head>
<body>
  <main class="resume">
    <header>
      <h1>${escapeHtml(c.contact.fullName)}</h1>
      <p class="headline">${escapeHtml(c.contact.headline)}</p>
      <div class="contact">${[c.contact.email, c.contact.phone, c.contact.location, c.contact.portfolio, c.contact.linkedin, c.contact.github]
        .filter(Boolean)
        .map((item) => `<span>${escapeHtml(item)}</span>`)
        .join("")}</div>
    </header>
    ${sections}
  </main>
</body>
</html>`;
};

module.exports = {
  TEMPLATE_IDS,
  DEFAULT_SECTION_ORDER,
  emptyResumeContent,
  normaliseContent,
  normaliseSectionOrder,
  validateResumeBuild,
  parseUploadedText,
  renderResumeHtml,
};
