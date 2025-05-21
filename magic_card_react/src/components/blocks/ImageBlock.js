import React, { useState } from "react";
import "./ImageBlock.css";

const ImageBlock = ({ block, onChange, readOnly }) => {
  // Update content structure to include captions
  const content = block.content || [];
  const images = Array.isArray(content) 
    ? content.map(item => typeof item === 'string' ? { url: item, caption: '' } : item)
    : [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const uploadedImages = [];
    setIsLoading(true);
    setError(null);
  
    for (const file of files) {
      const form = new FormData();
      form.append("image", file);
  
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("https://mymagiccard.onrender.com/api/image", {
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
          throw new Error(data.message || "Failed to upload image");
        }
      } catch (err) {
        setError("Failed to upload one or more images. Please try again.");
        console.error("Image upload error:", err);
      }
    }
  
    if (uploadedImages.length > 0) {
      const newImages = [...images, ...uploadedImages];
      onChange(newImages);
    }
    setIsLoading(false);
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

  const handleDeleteImage = () => {
    if (images.length === 0) return;
    
    const newImages = images.filter((_, index) => index !== currentIndex);
    onChange(newImages);
    
    // Adjust current index if necessary
    if (currentIndex >= newImages.length) {
      setCurrentIndex(Math.max(newImages.length - 1, 0));
    }
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
              onError={(e) => {
                e.target.src = '/placeholder-image.jpg';
                e.target.classList.add('image-error');
              }}
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

        {/* Navigation controls */}
        {images.length > 1 && (
          <div className="carousel-nav-controls">
            <button onClick={handlePrev} className="nav-button">&lt;</button>
            <button onClick={handleNext} className="nav-button">&gt;</button>
          </div>
        )}

        {/* Separated upload and delete controls */}
        {!readOnly && (
          <div className="bottom-controls">
            <label className="upload-button">
              <span>Upload Image</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isLoading}
                style={{ display: "none" }}
              />
            </label>
            {images.length > 0 && (
              <button 
                onClick={handleDeleteImage}
                className="delete-button"
                title="Delete current image"
              >
                Delete
              </button>
            )}
          </div>
        )}

        {/* Loading and error states */}
        {isLoading && (
          <div className="loading-overlay">
            <span>Uploading images...</span>
          </div>
        )}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </div>
      
      {/* Image counter */}
      {images.length > 0 && (
        <div className="image-counter">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
};

export default ImageBlock;