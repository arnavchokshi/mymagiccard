import React, { useState } from "react";
import "./PageTabs.css";

const PageTabs = ({ pages, activePageId, onSwitchPage, onAddPage, onRenamePage, readOnly }) => {
  const [editingId, setEditingId] = useState(null);
  const [tempName, setTempName] = useState("");

  const handleRename = (id, name) => {
    if (readOnly) return;
    setEditingId(id);
    setTempName(name);
  };

  const commitRename = (id) => {
    if (tempName.trim()) {
      onRenamePage(id, tempName.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="page-tabs">
      {pages.map((page) => (
        <div
          key={page.id}
          className={`page-tab ${page.id === activePageId ? "active" : ""}`}
          onClick={() => onSwitchPage(page.id)}
          onDoubleClick={(e) => {
            e.stopPropagation();
            handleRename(page.id, page.name);
          }}
        >
          {editingId === page.id ? (
            <input
              className="page-tab-input"
              value={tempName}
              autoFocus
              onChange={(e) => setTempName(e.target.value)}
              onBlur={() => commitRename(page.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitRename(page.id);
                if (e.key === "Escape") setEditingId(null);
              }}
            />
          ) : (
            <span>{page.name}</span>
          )}
        </div>
      ))}
      {!readOnly && (
        <button className="add-page-btn" onClick={onAddPage} type="button">
          + Add Page
        </button>
      )}
    </div>
  );
};

export default PageTabs;
