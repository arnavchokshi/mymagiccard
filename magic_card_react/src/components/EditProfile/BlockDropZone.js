import React from "react";
import "./BlockDropZone.css";

const BlockDropZone = ({
  blocks,
  draggedBlockType,
  onInsertBlock,
  renderBlock
}) => {
  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    const blockType = e.dataTransfer.getData("block-type") || draggedBlockType;
    if (!blockType) return;
    onInsertBlock(blockType, dropIndex);
  };

  return (
    <>
      {blocks.map((block, index) => (
        <div
          key={block?.id || `empty-${index}`}
          className={`grid-cell ${block ? "has-block" : "empty-cell"}`}
          onDragOver={(e) => {
            e.preventDefault();
            e.currentTarget.classList.add("cell-drag-over");
          }}
          onDragLeave={(e) => e.currentTarget.classList.remove("cell-drag-over")}
          onDrop={(e) => {
            e.currentTarget.classList.remove("cell-drag-over");
            handleDrop(e, index);
          }}
        >
          {block ? (
            <>
              {renderBlock(block, index)}
              <button
                className="delete-block-btn"
                onClick={() => onInsertBlock(null, index)}
              >
                ×
              </button>
            </>
          ) : (
            <div className="drop-here-placeholder">Drop Here</div>
          )}
        </div>
      ))}

      {/* Final drop zone */}
      <div
        className="grid-cell empty-cell drop-zone"
        onDragOver={(e) => {
          e.preventDefault();
          e.currentTarget.classList.add("cell-drag-over");
        }}
        onDragLeave={(e) => e.currentTarget.classList.remove("cell-drag-over")}
        onDrop={(e) => {
          e.currentTarget.classList.remove("cell-drag-over");
          handleDrop(e, blocks.length);
        }}
      >
        <div className="drop-here-placeholder">Drop Here</div>
      </div>
    </>
  );
};

export default BlockDropZone;
