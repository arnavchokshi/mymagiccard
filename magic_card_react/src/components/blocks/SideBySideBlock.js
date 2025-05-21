import React from "react";
import "./SideBySideBlock.css";

const SideBySideBlock = ({
  block,
  renderBlock,
  parentIndex,
  onDrop,
  readOnly
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
    
    // If onDrop is provided, use it to handle the drop
    if (onDrop) {
      onDrop(e, side, parentIndex);
    }
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
            renderBlock(leftBlock, 0)
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
            renderBlock(rightBlock, 1)
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