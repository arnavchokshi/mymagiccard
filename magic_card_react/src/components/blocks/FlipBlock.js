// FlipBlock.js
import React, { useState } from "react";
import "./FlipBlock.css";
import { API_URLS } from "../../config";

const DEFAULT_IMAGE = "/defaultBackground.jpg";

const FlipBlock = ({ block, onChange, readOnly }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const content = block.content || {
    frontSide: {
      imageUrl: DEFAULT_IMAGE,
      title: "",
      subtitle: ""
    },
    backSide: {
      text: ""
    }
  };

  const handleContentChange = (side, field, value) => {
    if (readOnly) return;
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

  const handleImageUpload = async (e) => {
    if (readOnly) return;
    const file = e.target.files[0];
    if (!file) return;

    const form = new FormData();
    form.append("image", file);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(API_URLS.image, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: form
      });

      const data = await res.json();

      if (res.ok && data.url) {
        handleContentChange("frontSide", "imageUrl", data.url);
      } else {
        console.error("Image upload failed:", data.message || "Unknown error");
      }
    } catch (err) {
      console.error("Upload error:", err);
    }
  };

  return (
    <div className={`flip-block-wrapper ${readOnly ? "readonly" : ""}`}>
      <div className={`flip-block ${isFlipped ? "flipped" : ""}`}>
        <div className="flip-block-inner">
          <div className="flip-block-front">
            <div className="image-container">
              <img
                src={content.frontSide.imageUrl || DEFAULT_IMAGE}
                alt="Front content"
                className="front-image"
              />
              <div className="overlay-text">
                {readOnly ? (
                  <>
                    {content.frontSide.title && <h3 className="front-title-readonly">{content.frontSide.title}</h3>}
                    {content.frontSide.subtitle && <p className="front-subtitle-readonly">{content.frontSide.subtitle}</p>}
                  </>
                ) : (
                  <>
                    <input
                      type="text"
                      placeholder="Title"
                      value={content.frontSide.title}
                      onChange={(e) =>
                        handleContentChange("frontSide", "title", e.target.value)
                      }
                      className="front-title"
                    />
                    <input
                      type="text"
                      placeholder="Subtitle"
                      value={content.frontSide.subtitle}
                      onChange={(e) =>
                        handleContentChange("frontSide", "subtitle", e.target.value)
                      }
                      className="front-subtitle"
                    />
                  </>
                )}
                
                <div className="front-buttons">
                  {!readOnly && (
                    <label htmlFor="flip-image-upload" className="image-upload-label">
                      <span>Change Image</span>
                      <input
                        type="file"
                        id="flip-image-upload"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: "none" }}
                      />
                    </label>
                  )}
                  <button className="flip-button gold" onClick={handleFlip}>
                    Flip
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flip-block-back">
            {readOnly ? (
              <div className="back-text-readonly">
                {content.backSide.text.split('\n').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            ) : (
              <textarea
                placeholder="Write text for the back side..."
                value={content.backSide.text}
                onChange={(e) =>
                  handleContentChange("backSide", "text", e.target.value)
                }
                className="back-text"
              />
            )}
            <button className="flip-button gold" onClick={handleFlip}>
              Flip Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlipBlock;
