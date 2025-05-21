import React from "react";
import "./SideBySideBlock.css";

const SideBySideBlock = ({
  block,
  renderBlock,
  parentIndex,
  onDrop,
  readOnly,
  onChange
}) => {
  const content = block.content && Array.isArray(block.content) ? block.content : [null, null];
  
  const leftBlock = content[0] || null;
  const rightBlock = content[1] || null;
  
  const handleDragOver = (e, side) => {
    if (readOnly) return;
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add("side-drop-active");
  };
  
  const handleDragLeave = (e) => {
    if (readOnly) return;
    e.currentTarget.classList.remove("side-drop-active");
  };
  
  const handleDrop = (e, side) => {
    if (readOnly) return;
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove("side-drop-active");
    
    if (onDrop) {
      onDrop(e, side, parentIndex);
    }
  };

  const handleDeleteBlock = (side) => {
    if (readOnly) return;
    const newContent = [...content];
    newContent[side] = null;
    onChange({ ...block, content: newContent });
  };

  return (
    <div className={`side-by-side-block ${readOnly ? "readonly" : ""}`}>
      <div className="side-by-side-container">
        <div 
          className={`side-block left-block ${!leftBlock ? "empty-slot" : ""}`}
          onDragOver={(e) => handleDragOver(e, 0)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, 0)}
        >
          {leftBlock ? (
            <div className="side-block-content">
              {renderBlock(leftBlock, 0)}
              {!readOnly && (
                <button 
                  className="delete-side-block-btn"
                  onClick={() => handleDeleteBlock(0)}
                  title="Delete left block"
                >
                  ×
                </button>
              )}
            </div>
          ) : (
            !readOnly && (
              <div className="empty-side-message">
                <p>Drop a block here</p>
              </div>
            )
          )}
        </div>
        
        <div 
          className={`side-block right-block ${!rightBlock ? "empty-slot" : ""}`}
          onDragOver={(e) => handleDragOver(e, 1)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, 1)}
        >
          {rightBlock ? (
            <div className="side-block-content">
              {renderBlock(rightBlock, 1)}
              {!readOnly && (
                <button 
                  className="delete-side-block-btn"
                  onClick={() => handleDeleteBlock(1)}
                  title="Delete right block"
                >
                  ×
                </button>
              )}
            </div>
          ) : (
            !readOnly && (
              <div className="empty-side-message">
                <p>Drop a block here</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default SideBySideBlock; 