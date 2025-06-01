// BlockDropZone.js
import React from "react";
import "./BlockDropZone.css";

const BlockDropZone = ({
  blocks,
  draggedBlockType,
  onInsertBlock,
  renderBlock,
  isDragging
}) => {
  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    const blockType = e.dataTransfer.getData("block-type") || draggedBlockType;
    if (!blockType) return;
    onInsertBlock(blockType, dropIndex);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add("cell-drag-over");
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove("cell-drag-over");
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove("cell-drag-over");
  };

  return (
    <>
      {/* Top-level drop zone before the first block */}
      <div
        className={`drop-zone-wrapper ${isDragging ? "is-dragging" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={(e) => {
          e.currentTarget.classList.remove("cell-drag-over");
          handleDrop(e, 0);
        }}
      >
        <div className="invisible-hit-area" />
      </div>

      {blocks.map((block, index) => (
        <React.Fragment key={block?.id || `block-${index}`}>
          <div className="block-container">
            {renderBlock(block, index)}
            <button
              className="delete-block-btn"
              onClick={() => onInsertBlock(null, index)}
              type="button"
            >
              ×
            </button>
          </div>

          {/* Drop zone between blocks */}
          <div
            className={`drop-zone-wrapper ${isDragging ? "is-dragging" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => {
              e.currentTarget.classList.remove("cell-drag-over");
              handleDrop(e, index + 1);
            }}
          >
            <div className="invisible-hit-area" />
          </div>
        </React.Fragment>
      ))}
    </>
  );
};

export default BlockDropZone;
