import React from "react";
import "./MultiBlock.css";

const MultiBlock = ({
  block,
  parentIndex,
  renderBlock,
  onDrop,
  onChangeInner,
  onRemoveInner
}) => {
  return (
    <div
        className="multi-block-column"
        style={{ gridTemplateColumns: `repeat(${block.content.length}, 1fr)` }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => onDrop(e, null, parentIndex)}
      >

      {(!block.content || block.content.length === 0) ? (
        <div className="drop-here-placeholder">Drop blocks here</div>
      ) : (
        block.content.map((inner, i) => (
          <div key={inner.id} className="multi-inner-block">
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
