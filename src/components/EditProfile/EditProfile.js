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
  // Default to empty array if content is not properly defined
  const content = block.content && Array.isArray(block.content) ? block.content : [null, null];
  
  // Make sure we always have exactly two slots (left and right)
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

  // Add delete functionality
  const handleDeleteBlock = (side) => {
    if (readOnly) return;
    const newContent = [...content];
    newContent[side] = null;
    onChange({ ...block, content: newContent });
  };

  return (
    <div className={`side-by-side-block ${readOnly ? "readonly" : ""}`}>
      <div className="side-by-side-container">
        {/* Left side */}
        <div 
          className={`side-block left-block ${!leftBlock ? "empty-slot" : ""}`}
          onDragOver={(e) => handleDragOver(e, 0)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, 0)}
        >
          {leftBlock ? (
            <div className="side-block-content">
              {renderBlock(leftBlock, 0, (blockId, value) => {
                const updatedContent = [...(block.content || [])];
                const blockIndex = updatedContent.findIndex(b => b?.id === blockId);
                if (blockIndex !== -1) {
                  updatedContent[blockIndex] = {
                    ...updatedContent[blockIndex],
                    content: value
                  };
                  onChange({ ...block, content: updatedContent });
                }
              })}
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
        
        {/* Right side */}
        <div 
          className={`side-block right-block ${!rightBlock ? "empty-slot" : ""}`}
          onDragOver={(e) => handleDragOver(e, 1)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, 1)}
        >
          {rightBlock ? (
            <div className="side-block-content">
              {renderBlock(rightBlock, 1, (blockId, value) => {
                const updatedContent = [...(block.content || [])];
                const blockIndex = updatedContent.findIndex(b => b?.id === blockId);
                if (blockIndex !== -1) {
                  updatedContent[blockIndex] = {
                    ...updatedContent[blockIndex],
                    content: value
                  };
                  onChange({ ...block, content: updatedContent });
                }
              })}
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