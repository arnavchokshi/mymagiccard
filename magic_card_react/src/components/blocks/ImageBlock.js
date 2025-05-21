import React, { useState } from "react";
import "./ImageBlock.css";

const ImageBlock = ({ block, onChange, readOnly }) => {
  // Normalize the content structure
  const normalizeContent = () => {
    if (!block.content) return [];
    
    // If content is an array
    if (Array.isArray(block.content)) {
      return block.content.map(item => {
        if (typeof item === 'string') return { url: item, caption: '' };
        return item;
      });
    }
    
    // If content is an object with imageUrl
    if (block.content.imageUrl) {
      return [{ 
        url: block.content.imageUrl, 
        caption: block.content.caption || '' 
      }];
    }
    
    // If content is a single URL string
    if (typeof block.content === 'string') {
      return [{ url: block.content, caption: '' }];
    }
    
    return [];
  };

  const images = normalizeContent();
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
        console.log("Upload response:", data);
        
        if (res.ok && data.url) {
          uploadedImages.push({ url: data.url, caption: '' });
        } else {
          throw new Error(data.message || "Failed to upload image");
        }
      } catch (err) {
        console.error("Image upload error:", err);
        setError("Failed to upload one or more images. Please try again.");
      }
    }
  
    if (uploadedImages.length > 0) {
      const newImages = [...images, ...uploadedImages];
      
      // Maintain the original content format
      if (Array.isArray(block.content)) {
        onChange(newImages);
      } else if (block.content && typeof block.content === 'object') {
        // If it was originally a single image object format
        const lastImage = uploadedImages[uploadedImages.length - 1];
        onChange({
          imageUrl: lastImage.url,
          caption: lastImage.caption
        });
      } else {
        // Default to array format if format is unknown
        onChange(newImages);
      }
      
      setCurrentIndex(newImages.length - 1);
    }
    setIsLoading(false);
  };

  const handleCaptionChange = (e) => {
    if (!images[currentIndex]) return;

    // Auto-resize the input
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;

    if (Array.isArray(block.content)) {
      const newImages = [...images];
      newImages[currentIndex] = {
        ...newImages[currentIndex],
        caption: e.target.value
      };
      onChange(newImages);
    } else {
      onChange({
        imageUrl: images[currentIndex].url,
        caption: e.target.value
      });
    }
  };

  const handleDeleteImage = () => {
    if (images.length === 0) return;
    
    // Always convert to array format for consistency
    const newImages = images.filter((_, index) => index !== currentIndex);
    
    // Update the state based on the original content format
    if (Array.isArray(block.content)) {
      onChange(newImages);
    } else if (block.content && typeof block.content === 'object') {
      // If it was originally a single image object format
      if (newImages.length > 0) {
        onChange({
          imageUrl: newImages[0].url,
          caption: newImages[0].caption || ''
        });
      } else {
        onChange({ imageUrl: '', caption: '' });
      }
    } else {
      // Default to array format if format is unknown
      onChange(newImages);
    }
    
    // Update current index
    if (currentIndex >= newImages.length) {
      setCurrentIndex(Math.max(newImages.length - 1, 0));
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
        {images.length > 0 && images[currentIndex] ? (
          <>
            <img
              src={images[currentIndex].url}
              alt={images[currentIndex].caption || `Slide ${currentIndex + 1}`}
              className="carousel-image"
              onError={(e) => {
                console.error("Image load error:", e.target.src);
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
                  value={images[currentIndex].caption || ''}
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

        {/* Upload and delete controls */}
        {!readOnly && (
          <div className="bottom-controls">
            <label className="upload-button">
              <span>Upload Image</span>
              <input
                type="file"
                multiple={Array.isArray(block.content)}
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

        {/* Debug info - remove in production */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.5)', color: 'white', padding: '5px', fontSize: '10px' }}>
          Images: {images.length} | Current: {currentIndex} | URL: {images[currentIndex]?.url || 'none'}
        </div>
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