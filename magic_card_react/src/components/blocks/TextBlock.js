import React from "react";
import "./TextBlock.css";

const TextBlock = ({ block, onChange, readOnly }) => {
  const textMeta = typeof block.content === "object"
    ? block.content
    : { title: "", body: block.content || "" };

  const updateField = (field, value) => {
    if (readOnly) return;
    const updated = { ...textMeta, [field]: value };
    onChange?.(updated);
  };

  if (readOnly) {
    return (
      <div className="text-block-wrapper readonly">
        {textMeta.title && <h3 className="readonly-block-title">{textMeta.title}</h3>}
        <div className="readonly-block-content">
          {(textMeta.body ? textMeta.body.split('\n') : []).map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="text-block-wrapper">
      <textarea
        className="block-title"
        placeholder="Section Title (optional)"
        value={textMeta.title}
        onChange={(e) => updateField("title", e.target.value)}
      />
      <textarea
        className="block-textarea"
        placeholder="Write your main text here..."
        value={textMeta.body}
        onChange={(e) => updateField("body", e.target.value)}
      />
    </div>
  );
};

export default TextBlock;
