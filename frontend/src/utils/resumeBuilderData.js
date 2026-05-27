export const SECTION_ORDER = [
  "summary",
  "skills",
  "experience",
  "projects",
  "education",
  "certifications",
  "achievements",
  "links",
];

export const SECTION_LABELS = {
  summary: "Summary",
  skills: "Skills",
  experience: "Experience",
  projects: "Projects",
  education: "Education",
  certifications: "Certifications",
  achievements: "Achievements",
  links: "Links",
};

export const TEMPLATES = [
  {
    id: "modern-developer",
    name: "Modern Developer Template",
    description: "Technical layout with project depth, tools, and measurable engineering impact.",
    accent: "#2563eb",
  },
  {
    id: "professional-corporate",
    name: "Professional Corporate Template",
    description: "Executive ATS layout for business, operations, and leadership roles.",
    accent: "#4f46e5",
  },
  {
    id: "minimal-ats",
    name: "Minimal ATS Template",
    description: "Dense parser-friendly one-page layout with minimal decoration.",
    accent: "#111827",
  },
  {
    id: "creative-portfolio",
    name: "Creative Portfolio Template",
    description: "Polished portfolio layout that still keeps headings and keywords ATS-readable.",
    accent: "#be185d",
  },
];

export const emptyResumeContent = {
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
  sectionOrder: [...SECTION_ORDER],
};

export const createEmptyResume = (user) => ({
  title: "My Resume",
  templateId: "minimal-ats",
  content: {
    ...emptyResumeContent,
    contact: {
      ...emptyResumeContent.contact,
      fullName: user?.name || "",
      email: user?.email || "",
    },
  },
});

export const sectionDefaults = {
  experience: {
    company: "",
    role: "",
    location: "",
    startDate: "",
    endDate: "",
    bullets: [""],
  },
  projects: {
    name: "",
    link: "",
    tech: "",
    bullets: [""],
  },
  education: {
    school: "",
    degree: "",
    location: "",
    startDate: "",
    endDate: "",
  },
  certifications: {
    name: "",
    issuer: "",
    date: "",
    link: "",
  },
  achievements: {
    title: "",
    issuer: "",
    date: "",
    bullets: [""],
  },
  links: {
    label: "",
    url: "",
  },
};

export const normaliseSectionOrder = (sectionOrder = []) => [
  ...sectionOrder.filter((key) => SECTION_ORDER.includes(key)),
  ...SECTION_ORDER.filter((key) => !sectionOrder.includes(key)),
];

export const validateResume = ({ title, content }) => {
  const errors = {};
  if (!title?.trim()) errors.title = "Resume title is required.";
  if (!content.contact.fullName?.trim()) errors.fullName = "Full name is required.";
  if (!content.contact.email?.trim()) errors.email = "Email is required.";
  if (content.contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(content.contact.email)) {
    errors.email = "Enter a valid email.";
  }
  return errors;
};
