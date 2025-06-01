import React from 'react';
import './UnfoldTemplate.css';

const UnfoldTemplate = ({ name, header, backgroundPhoto }) => {
  return (
    <div className="unfold-template">
      <div className="scrollDist" />
      <div
        className="unfold-background"
        style={{
          backgroundImage: backgroundPhoto
            ? `url(${backgroundPhoto instanceof File ? URL.createObjectURL(backgroundPhoto) : backgroundPhoto})`
            : `url('/defaultBackground.jpg')`,
        }}
      >
        <div className="unfold-overlay">
          <div className="unfold-header-center">
            <h1 className="unfold-header-name" data-text={name || "Your Name"}>
              {name || "Your Name"}
            </h1>
            <div className="unfold-header-subtitle">
              <span className="unfold-typewriter-text">
                {header || "Currently @ ..."}
              </span>
            </div>
            <div className="unfold-down-arrow">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 10V26" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M11 19L18 26L25 19" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnfoldTemplate; 