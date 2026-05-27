import React, { useState } from "react";
import { GripVertical } from "lucide-react";
import { SECTION_LABELS, normaliseSectionOrder } from "../../utils/resumeBuilderData.js";

export default function SectionOrderControl({ value, onChange }) {
  const [dragging, setDragging] = useState(null);
  const order = normaliseSectionOrder(value);

  const move = (target) => {
    if (!dragging || dragging === target) return;
    const next = order.filter((key) => key !== dragging);
    next.splice(next.indexOf(target), 0, dragging);
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {order.map((key) => (
        <button
          key={key}
          type="button"
          draggable
          onDragStart={() => setDragging(key)}
          onDragOver={(event) => {
            event.preventDefault();
            move(key);
          }}
          onDragEnd={() => setDragging(null)}
          className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
            dragging === key ? "border-brand-400 bg-brand-500/10" : "hover:border-brand-500/40"
          }`}
          style={{ borderColor: dragging === key ? undefined : "var(--border)", background: "var(--bg-primary)" }}
        >
          <GripVertical className="h-4 w-4 text-brand-300" />
          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            {SECTION_LABELS[key]}
          </span>
        </button>
      ))}
    </div>
  );
}
