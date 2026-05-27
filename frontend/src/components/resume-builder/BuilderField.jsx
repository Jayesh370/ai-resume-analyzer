import React from "react";

export const BuilderField = ({ label, error, as = "input", className = "", ...props }) => {
  const Tag = as;
  return (
    <label className={`block ${className}`}>
      <span className="label">{label}</span>
      <Tag className={`input ${error ? "input-error" : ""} ${as === "textarea" ? "min-h-[92px] resize-y" : ""}`} {...props} />
      {error && <span className="error-msg">{error}</span>}
    </label>
  );
};

export const ChipInput = ({ label, value, onChange, placeholder }) => {
  const textValue = Array.isArray(value) ? value.join(", ") : "";

  return (
    <BuilderField
      as="textarea"
      label={label}
      value={textValue}
      placeholder={placeholder}
      onChange={(event) =>
        onChange(
          event.target.value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        )
      }
    />
  );
};
