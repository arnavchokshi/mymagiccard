import React from "react";
import "./HighlightsBar.css";

const HighlightsBar = ({
  highlights,
  newHighlight,
  setNewHighlight,
  onAdd,
  onRemove
}) => {
  return (
    <div>
      <div className="highlights-row">
        {highlights.map((h, i) => (
          <div
            key={i}
            className={`highlight-badge ${h.category.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <span>{h.label} ({h.category})</span>
            <button
              className="remove-btn"
              onClick={() => onRemove(i)}
              type="button"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="highlight-form">
        <input
          type="text"
          className="highlight-input"
          placeholder="Highlight label..."
          value={newHighlight.label}
          onChange={(e) => setNewHighlight({ ...newHighlight, label: e.target.value })}
          onKeyDown={(e) => e.key === "Enter" && onAdd()}
        />
        <select
          value={newHighlight.category}
          onChange={(e) => setNewHighlight({ ...newHighlight, category: e.target.value })}
          className="highlight-category-select"
        >
          <option value="Academic">Academic</option>
          <option value="Professional">Professional</option>
          <option value="Personal Development">Personal Development</option>
          <option value="Technical">Technical</option>
        </select>
        <button 
          onClick={onAdd} 
          className="add-highlight-btn"
          type="button"
        >
          Add
        </button>
      </div>
    </div>
  );
};

export default HighlightsBar;
