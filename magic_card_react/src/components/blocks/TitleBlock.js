import React from "react";
import "./TitleBlock.css";

const TitleBlock = ({ block, onChange, readOnly }) => {
  const content = block.content || { title: "", subtitle: "" };
  
  const handleChange = (field, value) => {
    if (readOnly) return;
    const updatedContent = { ...content, [field]: value };
    onChange(updatedContent);
  };
  
  if (readOnly) {
    return (
      <div className="title-block readonly">
        {content.title && <h2 className="readonly-title">{content.title}</h2>}
      </div>
    );
  }
  
  return (
    <div className="title-block">
      <input
        type="text"
        className="title-input"
        value={content.title || ""}
        onChange={(e) => handleChange("title", e.target.value)}
        placeholder="Enter title..."
      />
    </div>
  );
};

export default TitleBlock;