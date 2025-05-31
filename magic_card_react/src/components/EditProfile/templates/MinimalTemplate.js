import React from 'react';
import './MinimalTemplate.css';

const MinimalTemplate = ({ name, header, backgroundPhoto }) => {
  return (
    <div className="minimal-template">
      <div 
        className="minimal-background"
        style={{
          backgroundImage: `url(${backgroundPhoto || '/TechWall.jpg'})`
        }}
      />
      <div className="minimal-overlay">
        <div className="minimal-header-center">
          <h1 className="minimal-header-name">{name}</h1>
          <div className="minimal-header-subtitle">
            <span className="minimal-typewriter-text">{header}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinimalTemplate; 