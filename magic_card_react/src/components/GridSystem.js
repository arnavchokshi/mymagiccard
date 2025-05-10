// src/components/GridSystem.js
import React, { useState, useRef } from 'react';
import './GridSystem.css';

// Sample block types
const BLOCK_TYPES = {
  CODE: 'code',
  TEXT: 'text',
  IMAGE: 'image',
};

const BlockPalette = ({ onDragStart }) => {
  const handleDragStart = (e, blockType) => {
    e.dataTransfer.setData('blockType', blockType);
    if (onDragStart) onDragStart(blockType);
  };

  return (
    <div className="block-palette">
      <h3>Available Blocks</h3>
      <div 
        className="palette-block code-block"
        draggable
        onDragStart={(e) => handleDragStart(e, BLOCK_TYPES.CODE)}
      >
        Code Block
      </div>
      <div 
        className="palette-block text-block"
        draggable
        onDragStart={(e) => handleDragStart(e, BLOCK_TYPES.TEXT)}
      >
        Text Block
      </div>
      <div 
        className="palette-block image-block"
        draggable
        onDragStart={(e) => handleDragStart(e, BLOCK_TYPES.IMAGE)}
      >
        Image Block
      </div>
    </div>
  );
};

const GridCell = ({ onDrop, hasBlock, blockData, index }) => {
  const [isOver, setIsOver] = useState(false);
  
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsOver(true);
  };
  
  const handleDragLeave = () => {
    setIsOver(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsOver(false);
    
    const blockType = e.dataTransfer.getData('blockType');
    if (onDrop) {
      onDrop(index, blockType);
    }
  };
  
  return (
    <div 
      className={`grid-cell ${isOver ? 'drag-over' : ''} ${hasBlock ? 'has-block' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {hasBlock ? (
        <div className={`placed-block ${blockData.type}-block`}>
          {blockData.type === BLOCK_TYPES.CODE && 'Code Block'}
          {blockData.type === BLOCK_TYPES.TEXT && 'Text Block'}
          {blockData.type === BLOCK_TYPES.IMAGE && 'Image Block'}
        </div>
      ) : (
        <div className="empty-cell">Drop here</div>
      )}
    </div>
  );
};

const GridSystem = () => {
  const [gridState, setGridState] = useState(Array(12).fill(null));
  const [draggedBlockType, setDraggedBlockType] = useState(null);
  
  const handleBlockDrop = (cellIndex, blockType) => {
    const newGridState = [...gridState];
    newGridState[cellIndex] = { type: blockType };
    setGridState(newGridState);
  };
  
  const handleDragStart = (blockType) => {
    setDraggedBlockType(blockType);
  };

  const handleClearGrid = () => {
    setGridState(Array(12).fill(null));
  };

  return (
    <div className="grid-system-container">
      <div className="grid-controls">
        <h2>Drag & Drop Grid System</h2>
        <button onClick={handleClearGrid}>Clear Grid</button>
      </div>
      
      <div className="grid-layout">
        <BlockPalette onDragStart={handleDragStart} />
        
        <div className="grid-container">
          {gridState.map((cell, index) => (
            <GridCell 
              key={index}
              index={index}
              hasBlock={cell !== null}
              blockData={cell}
              onDrop={handleBlockDrop}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GridSystem;