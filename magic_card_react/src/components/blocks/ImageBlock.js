// ImageBlock.js
import React, { useState } from "react";
import "./ImageBlock.css";

const ImageBlock = ({ block, onChange, readOnly }) => {
  // Update content structure to include captions
  const content = block.content || [];
  const images = Array.isArray(content) 
    ? content.map(item => typeof item === 'string' ? { url: item, caption: '' } : item)
    : [];
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const uploadedImages = [];
  
    for (const file of files) {
      const form = new FormData();
      form.append("image", file);
  
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:2000/api/image", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: form,
        });
  
        const data = await res.json();
        if (res.ok) {
          uploadedImages.push({ url: data.url, caption: '' });
        } else {
          console.error("Upload failed:", data.message);
        }
      } catch (err) {
        console.error("Image upload error:", err);
      }
    }
  
    if (uploadedImages.length > 0) {
      const newImages = [...images, ...uploadedImages];
      onChange(newImages);
    }
  };

  const handleCaptionChange = (e) => {
    const newImages = [...images];
    newImages[currentIndex] = {
      ...newImages[currentIndex],
      caption: e.target.value
    };
    onChange(newImages);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <div className="image-block-wrapper">
      <div className="carousel">
        {images.length > 0 ? (
          <>
            <img
              src={images[currentIndex].url}
              alt={images[currentIndex].caption || `Slide ${currentIndex + 1}`}
              className="carousel-image"
            />
            <div className="image-caption">
              {readOnly ? (
                <p className="caption-text">{images[currentIndex].caption}</p>
              ) : (
                <input
                  type="text"
                  value={images[currentIndex].caption}
                  onChange={handleCaptionChange}
                  placeholder="Add a caption..."
                  className="caption-input"
                />
              )}
            </div>
          </>
        ) : (
          <p className="no-image">No image uploaded</p>
        )}

        {/* Arrows inside carousel for subtle positioning */}
        <div className="carousel-controls">
          <button onClick={handlePrev}>&lt;</button>
          <button onClick={handleNext}>&gt;</button>
        </div>

        {!readOnly && (
          <label className="upload-label">
            Upload
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />
          </label>
        )}
      </div>
    </div>
  );
};

export default ImageBlock;