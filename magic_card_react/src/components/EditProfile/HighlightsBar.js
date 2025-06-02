import React, { useState } from "react";
import "./HighlightsBar.css";

const CATEGORIES = {
  ACADEMIC: "Academic",
  PROFESSIONAL: "Professional",
  PERSONAL_DEVELOPMENT: "Personal Development",
  TECHNICAL: "Technical",
  EXTRACURRICULAR: "Extracurricular"
};

const allowedCategories = Object.values(CATEGORIES);

const getCategoryClass = (category) => {
  const map = {
    [CATEGORIES.ACADEMIC]: "academic",
    [CATEGORIES.PROFESSIONAL]: "professional",
    [CATEGORIES.PERSONAL_DEVELOPMENT]: "personal-development",
    [CATEGORIES.TECHNICAL]: "technical",
    [CATEGORIES.EXTRACURRICULAR]: "extracurricular"
  };
  return map[category] || "";
};

const HighlightsBar = ({
  highlights = [],
  newHighlight = { label: "", category: CATEGORIES.ACADEMIC },
  setNewHighlight,
  onAdd,
  onRemove,
  readOnly = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleAddHighlight = () => {
    if (newHighlight.label.trim()) {
      const cleanedCategory = allowedCategories.includes(newHighlight.category)
        ? newHighlight.category
        : CATEGORIES.ACADEMIC;

      onAdd({
        label: newHighlight.label.trim(),
        category: cleanedCategory
      });

      setNewHighlight({ label: "", category: CATEGORIES.ACADEMIC });
      setIsExpanded(false);
    }
  };

  return (
    <div className="highlights-container">
      <div className="highlights-header">
        {!readOnly && (
          <button
            className="toggle-highlight-form-btn"
            onClick={() => setIsExpanded(!isExpanded)}
            type="button"
          >
            {isExpanded ? "Cancel" : "Add Highlight"}
          </button>
        )}
      </div>

      <div className="highlights-row">
        {highlights.length > 0 ? (
          highlights.map((highlight, index) => (
            <div
              key={index}
              className={`highlight-badge ${getCategoryClass(highlight.category)}`}
            >
              <span className="highlight-label">{highlight.label}</span>
              {!readOnly && (
                <button
                  className="remove-btn"
                  onClick={() => onRemove(index)}
                  type="button"
                  aria-label="Remove highlight"
                >
                  ×
                </button>
              )}
            </div>
          ))
        ) : (
          <p className="no-highlights-message">
            No highlights added yet. Add some to showcase your skills and achievements!
          </p>
        )}
      </div>

      {!readOnly && isExpanded && (
        <div className="highlight-form">
          <input
            type="text"
            className="highlight-input"
            placeholder="Enter highlight text..."
            value={newHighlight.label}
            onChange={(e) => setNewHighlight({ ...newHighlight, label: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && handleAddHighlight()}
            autoFocus
          />
          <select
            value={newHighlight.category}
            onChange={(e) => setNewHighlight({ ...newHighlight, category: e.target.value })}
            className="highlight-category-select"
          >
            {allowedCategories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <button
            onClick={handleAddHighlight}
            className="add-highlight-btn"
            type="button"
            disabled={!newHighlight.label.trim()}
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
};

export default HighlightsBar;