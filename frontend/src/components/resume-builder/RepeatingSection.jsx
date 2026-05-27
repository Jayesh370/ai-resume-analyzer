import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { BuilderField } from "./BuilderField.jsx";
import { sectionDefaults } from "../../utils/resumeBuilderData.js";

const newItem = (type) => JSON.parse(JSON.stringify(sectionDefaults[type]));

const fieldLabels = {
  company: "Company",
  role: "Role",
  location: "Location",
  startDate: "Start",
  endDate: "End",
  name: "Name",
  link: "Link",
  tech: "Tech stack",
  school: "School",
  degree: "Degree",
  issuer: "Issuer",
  date: "Date",
  title: "Title",
  label: "Label",
  url: "URL",
};

export default function RepeatingSection({ title, type, items, onChange }) {
  const updateItem = (index, key, value) => {
    onChange(items.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item)));
  };

  const updateBullet = (itemIndex, bulletIndex, value) => {
    onChange(
      items.map((item, index) => {
        if (index !== itemIndex) return item;
        const bullets = [...(item.bullets || [])];
        bullets[bulletIndex] = value;
        return { ...item, bullets };
      })
    );
  };

  const addBullet = (itemIndex) => {
    onChange(
      items.map((item, index) =>
        index === itemIndex ? { ...item, bullets: [...(item.bullets || []), ""] } : item
      )
    );
  };

  const removeBullet = (itemIndex, bulletIndex) => {
    onChange(
      items.map((item, index) =>
        index === itemIndex
          ? { ...item, bullets: item.bullets.filter((_, current) => current !== bulletIndex) }
          : item
      )
    );
  };

  const keys = Object.keys(sectionDefaults[type]).filter((key) => key !== "bullets");

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="section-title text-base">{title}</h3>
        <button type="button" className="btn-secondary px-3 py-2" onClick={() => onChange([...items, newItem(type)])}>
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>

      {!items.length && (
        <div className="rounded-xl border border-dashed p-4 text-sm" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
          Add your first {title.toLowerCase()} entry.
        </div>
      )}

      {items.map((item, index) => (
        <div key={index} className="rounded-2xl border p-4" style={{ borderColor: "var(--border)", background: "var(--bg-primary)" }}>
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
              {title} {index + 1}
            </span>
            <button
              type="button"
              className="rounded-lg p-2 text-red-400 hover:bg-red-500/10"
              onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}
              title="Remove entry"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {keys.map((key) => (
              <BuilderField
                key={key}
                label={fieldLabels[key] || key}
                value={item[key] || ""}
                onChange={(event) => updateItem(index, key, event.target.value)}
              />
            ))}
          </div>

          {"bullets" in item && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="label mb-0">Impact bullets</span>
                <button type="button" className="text-xs font-semibold text-brand-300" onClick={() => addBullet(index)}>
                  Add bullet
                </button>
              </div>
              {(item.bullets || []).map((bullet, bulletIndex) => (
                <div key={bulletIndex} className="flex gap-2">
                  <input
                    className="input"
                    value={bullet}
                    placeholder="Quantify impact, tools, scope, and outcome"
                    onChange={(event) => updateBullet(index, bulletIndex, event.target.value)}
                  />
                  <button
                    type="button"
                    className="rounded-xl border px-3 text-red-400"
                    style={{ borderColor: "var(--border)" }}
                    onClick={() => removeBullet(index, bulletIndex)}
                    title="Remove bullet"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
