import React from "react";
import "./TextBlock.css";

const TextBlock = ({ block, onChange }) => {
  const textMeta = typeof block.content === "object"
    ? block.content
    : { title: "", body: block.content || "" };

  const updateField = (field, value) => {
    const updated = { ...textMeta, [field]: value };
    onChange(updated);
  };

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
