import React from "react";
import "./MultiBlock.css";

const MultiBlock = ({
  block,
  parentIndex,
  renderBlock,
  onDrop,
  onChangeInner,
  onRemoveInner,
  readOnly
}) => {
  // Ensure block.content is always an array
  const children = Array.isArray(block.content) ? block.content : [];

  return (
    <div
      className={`multi-block-column ${readOnly ? 'readonly' : ''}`}
      style={{ gridTemplateColumns: `repeat(${children.length || 1}, 1fr)` }}
      onDragOver={(e) => !readOnly && e.preventDefault()}
      onDrop={(e) => !readOnly && onDrop && onDrop(e, null, parentIndex)}
    >
      {children.length === 0 ? (
        !readOnly && <div className="drop-here-placeholder">Drop blocks here</div>
      ) : (
        children.map((inner, i) => (
          <div key={inner.id} className="multi-inner-block">
            {!readOnly && (
              <div className="block-header">
                <span className="block-type-label">{inner.type}</span>
                <button
                  className="remove-block-btn"
                  onClick={() => onRemoveInner(inner.id)}
                  type="button"
                >
                  ×
                </button>
              </div>
            )}
            <div className="block-content">
              {renderBlock(inner, i, onChangeInner)}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MultiBlock;
