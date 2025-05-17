// ImageBlock.js
import React, { useState } from "react";
import "./ImageBlock.css";

const ImageBlock = ({ block, onChange }) => {
  const images = Array.isArray(block.content) ? block.content : [];
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const uploadedURLs = [];
  
    for (const file of files) {
      const form = new FormData();
      form.append("image", file);
  
      try {
        const token = localStorage.getItem("token"); // needed for auth
        const res = await fetch("http://localhost:2000/api/image", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: form,
        });
  
        const data = await res.json();
        if (res.ok) {
          uploadedURLs.push(data.url);
        } else {
          console.error("Upload failed:", data.message);
        }
      } catch (err) {
        console.error("Image upload error:", err);
      }
    }
  
    if (uploadedURLs.length > 0) {
      const newImages = [...images, ...uploadedURLs];
      onChange(newImages);
    }
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
          <img
            src={images[currentIndex]}
            alt={`Slide ${currentIndex + 1}`}
            className="carousel-image"
          />
        ) : (
          <p className="no-image">No image uploaded</p>
        )}
        <div className="carousel-controls">
          <button onClick={handlePrev}>&lt;</button>
          <button onClick={handleNext}>&gt;</button>
        </div>
      </div>
      <label className="upload-label">
        Upload Images
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: "none" }}
        />
      </label>
    </div>
  );
};

export default ImageBlock;