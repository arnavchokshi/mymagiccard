// FlipBlock.js
import React, { useState } from "react";
import "./FlipBlock.css";

const FlipBlock = ({ block, onChange }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Initialize content structure if necessary
  const content = block.content || {
    frontSide: {
      imageUrl: "",
      title: "",
      subtitle: ""
    },
    backSide: {
      text: ""
    }
  };
  
  const handleContentChange = (side, field, value) => {
    const updatedContent = {
      ...content,
      [side]: {
        ...content[side],
        [field]: value
      }
    };
    onChange(updatedContent);
  };
  
  const handleFlip = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFlipped(!isFlipped);
  };
  
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleContentChange("frontSide", "imageUrl", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  return (
    <div className={`flip-block ${isFlipped ? "flipped" : ""}`}>
      <div className="flip-block-inner">
        {/* Front Side */}
        <div className="flip-block-front">
          <div className="front-content">
            <div className="front-header">
              <input
                type="text"
                placeholder="Title"
                value={content.frontSide.title}
                onChange={(e) => handleContentChange("frontSide", "title", e.target.value)}
                className="front-title"
              />
              <input
                type="text"
                placeholder="Subtitle"
                value={content.frontSide.subtitle}
                onChange={(e) => handleContentChange("frontSide", "subtitle", e.target.value)}
                className="front-subtitle"
              />
            </div>
            
            <div className="image-container">
              {content.frontSide.imageUrl ? (
                <img 
                  src={content.frontSide.imageUrl} 
                  alt="Front content" 
                  className="front-image"
                />
              ) : (
                <div className="image-placeholder">
                  <label htmlFor="image-upload" className="image-upload-label">
                    <span>Click to upload image</span>
                    <input
                      type="file"
                      id="image-upload"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: "none" }}
                    />
                  </label>
                </div>
              )}
            </div>
            
            <button className="flip-button" onClick={handleFlip}>
              Flip
            </button>
          </div>
        </div>
        
        {/* Back Side */}
        <div className="flip-block-back">
          <textarea
            placeholder="Write text for the back side..."
            value={content.backSide.text}
            onChange={(e) => handleContentChange("backSide", "text", e.target.value)}
            className="back-text"
          />
          <button className="flip-button" onClick={handleFlip}>
            Flip Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlipBlock;