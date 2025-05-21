import React, { useState } from "react";
import "./MultiBlock.css";

const MultiBlock = ({
  block,
  renderBlock,
  parentIndex,
  onDrop,
  readOnly
}) => {
  const children = Array.isArray(block.content) ? block.content : [];
  const [activeIndex, setActiveIndex] = useState(0);
  const itemCount = children.length;

  const next = () => setActiveIndex((prev) => (prev + 1) % itemCount);
  const prev = () => setActiveIndex((prev) => (prev - 1 + itemCount) % itemCount);

  return (
    <div
      className="multi-block-carousel-container"
      onDragOver={(e) => !readOnly && e.preventDefault()}
      onDrop={(e) => !readOnly && onDrop && onDrop(e, null, parentIndex)}
    >
      <div
        className="multi-block-carousel"
        style={{ transform: `rotateY(-${(360 / itemCount) * activeIndex}deg)` }}
      >
        {children.map((child, i) => {
          const zDistance = 320;
          return (
            <figure
              key={child.id || i}
              style={{
                top: '50%',
                position: 'absolute',
                transform: `rotateY(${(360 / itemCount) * i}deg) translateZ(${zDistance}px) translateY(-50%)`
              }}
              className={i === activeIndex ? "active" : ""}
            >
              <div className="block-wrapper-inside-carousel">
                {renderBlock(child, i)}
              </div>
            </figure>
          );
        })}
      </div>

      {itemCount > 1 && (
        <div className="carousel-controls">
          <button onClick={prev}>◀</button>
          <button onClick={next}>▶</button>
        </div>
      )}
    </div>
  );
};

export default MultiBlock;