import React from 'react';
import './ModernTemplate.css'; // nature

const ModernTemplate = ({ name, header, backgroundPhoto }) => {
  return (
    <div className="modern-template">
      <div 
        className="modern-background"
        style={{
          backgroundImage: `url(${backgroundPhoto || '/natureWall.jpg'})`
        }}
      />
      <div className="modern-overlay">
        <div className="modern-header-center">
          <div className="modern-header-content">
            <h1 className="modern-header-name">{name}</h1>
            <div className="modern-header-subtitle">
              <span className="modern-typewriter-text">{header}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ModernTemplate; 