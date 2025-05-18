import React, { useEffect, useRef } from "react";
import "./TextBlock.css";

const TextBlock = ({ block, onChange, readOnly }) => {
  const textMeta = typeof block.content === "object"
    ? block.content
    : { title: "", body: block.content || "" };

  const titleRef = useRef(null);
  const bodyRef = useRef(null);

  const updateField = (field, value) => {
    if (readOnly) return;
    const updated = { ...textMeta, [field]: value };
    onChange?.(updated);
  };

  const autoResize = (el) => {
    if (el) {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }
  };

  useEffect(() => {
    if (!readOnly) {
      autoResize(titleRef.current);
      autoResize(bodyRef.current);
    }
  }, [textMeta.title, textMeta.body, readOnly]);

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
    <div className="text-block-wrapper auto-expanding">
      <textarea
        ref={titleRef}
        className="block-title"
        placeholder="Section Title (optional)"
        value={textMeta.title}
        onChange={(e) => {
          updateField("title", e.target.value);
          autoResize(e.target);
        }}
        rows={1}
      />

      <hr className="divider-line-gold" />

      <textarea
        ref={bodyRef}
        className="block-textarea"
        placeholder="Write your main text here..."
        value={textMeta.body}
        onChange={(e) => {
          updateField("body", e.target.value);
          autoResize(e.target);
        }}
        rows={1}
      />
    </div>
  );
};

export default TextBlock;
