import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './OnboardingCarousel.css';

const OnboardingCarousel = ({ onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);
  const navigate = useNavigate();

  const slides = [
    {
      type: 'choice',
      title: 'Welcome to Magic Card!',
      subtitle: 'Choose how you want to create your profile',
      content: (
        <div className="choice-buttons">
          <button 
            className="choice-button ai-choice"
            onClick={() => navigate('/generate')}
          >
            <span className="choice-icon">✨</span>
            <span className="choice-title">Generate with AI</span>
            <span className="choice-description">Let AI help you create a professional profile</span>
          </button>
          <button 
            className="choice-button manual-choice"
            onClick={() => setShowTutorial(true)}
          >
            <span className="choice-icon">🎨</span>
            <span className="choice-title">Build from Scratch</span>
            <span className="choice-description">Create your profile manually with our tools</span>
          </button>
        </div>
      )
    },
    {
      type: 'tutorial',
      title: 'Getting Started',
      subtitle: 'Here\'s how to use the editor',
      content: (
        <div className="tutorial-content">
          <div className="tutorial-step">
            <span className="step-number">1</span>
            <p>Drag and drop blocks to create your profile</p>
          </div>
          <div className="tutorial-step">
            <span className="step-number">2</span>
            <p>Add highlights for quick flexs</p>
          </div>
        </div>
      )
    },
    {
      type: 'tutorial',
      title: 'Customize Your Profile',
      subtitle: 'Make it uniquely yours',
      content: (
        <div className="tutorial-content">
          <div className="tutorial-step">
            <span className="step-number">3</span>
            <p>Customize each block with your content</p>
          </div>
          <div className="tutorial-step">
            <span className="step-number">4</span>
            <p>Add your background photo and header text</p>
          </div>
        </div>
      )
    },
    {
      type: 'tutorial',
      title: 'Save and Share',
      subtitle: 'Final steps to complete your profile',
      content: (
        <div className="tutorial-content">
          <div className="tutorial-step">
            <span className="step-number">5</span>
            <p>Save your changes to update your profile</p>
          </div>
          <div className="tutorial-step">
            <span className="step-number">6</span>
            <p>View your public profile and share it with others</p>
          </div>
        </div>
      )
    }
  ];

  // Only show tutorial slides if showTutorial is true
  const tutorialSlides = slides.slice(1);
  const tutorialIndex = showTutorial ? currentSlide : 0;
  const currentSlideData = showTutorial ? tutorialSlides[tutorialIndex] : slides[0];

  const handleNext = () => {
    if (tutorialIndex < tutorialSlides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (tutorialIndex > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-carousel">
        <button className="close-button" onClick={onClose}>×</button>
        <div className="carousel-content">
          <h2 className="carousel-title">{currentSlideData.title}</h2>
          <p className="carousel-subtitle">{currentSlideData.subtitle}</p>
          <div className="carousel-body">
            {currentSlideData.content}
          </div>
        </div>
        {showTutorial && (
          <div className="carousel-navigation subtle-nav">
            <button 
              className="nav-button prev"
              onClick={handlePrev}
              disabled={tutorialIndex === 0}
            >
              ←
            </button>
            <div className="slide-dots subtle-dots">
              {tutorialSlides.map((_, index) => (
                <span 
                  key={index}
                  className={`dot ${index === tutorialIndex ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
            <button 
              className="nav-button next"
              onClick={handleNext}
            >
              {tutorialIndex === tutorialSlides.length - 1 ? 'Get Started' : '→'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingCarousel; 