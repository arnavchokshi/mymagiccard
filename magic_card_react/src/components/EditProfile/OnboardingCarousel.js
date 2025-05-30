import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './OnboardingCarousel.css';

const OnboardingCarousel = ({ show, onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  if (!show) return null;

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
            onClick={() => setCurrentSlide(1)}
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
      title: 'Build Your Profile',
      subtitle: 'Drag and drop blocks to create your perfect profile',
      content: (
        <div className="tutorial-content">
          <div className="tutorial-step">
            <span className="step-number">1</span>
            <p>Drag and drop content blocks to design your profile.</p>
          </div>
          <div className="tutorial-step">
            <span className="step-number">2</span>
            <p>Showcase your achievements by adding highlights to your profile.</p>
          </div>
          <div className="tutorial-step">
            <span className="step-number">3</span>
            <p>Organize your information by adding new pages with the button in the top right.</p>
          </div>
          <div className="tutorial-step">
            <span className="step-number">4</span>
            <p>Personalize your profile by changing the background and header in the top left corner.</p>
          </div>
          <div className="tutorial-step">
            <span className="step-number">4</span>
            <p>Save, enhance with AI, and share your public profile using the buttons on the left.</p>
          </div>
        </div>
      )
    },
    {
      type: 'tutorial',
      title: 'Show Off Your Work',
      subtitle: 'Add highlights to flex your best content',
      content: (
        <div className="tutorial-content">
          <div className="tutorial-step">
            <span className="step-number">1</span>
            <p>Click "Add Highlight" in the highlights section</p>
          </div>
          <div className="tutorial-step">
            <span className="step-number">2</span>
            <p>Upload your best work - images, videos, or links</p>
          </div>
          <div className="tutorial-step">
            <span className="step-number">3</span>
            <p>Add a catchy title and description</p>
          </div>
          <div className="tutorial-step">
            <span className="step-number">4</span>
            <p>Drag to reorder and showcase your favorites first</p>
          </div>
        </div>
      )
    },
    {
      type: 'tutorial',
      title: 'Create Multiple Pages',
      subtitle: 'Use the top right button to add new pages',
      content: (
        <div className="tutorial-content">
          <div className="tutorial-step">
            <span className="step-number">1</span>
            <p>Click the "Pages" button in the top right</p>
          </div>
          <div className="tutorial-step">
            <span className="step-number">2</span>
            <p>Click "Add New Page" to create a new section</p>
          </div>
          <div className="tutorial-step">
            <span className="step-number">3</span>
            <p>Name your page (e.g., "Projects", "Experience")</p>
          </div>
          <div className="tutorial-step">
            <span className="step-number">4</span>
            <p>Build your page with blocks, just like the main profile</p>
          </div>
        </div>
      )
    },
    {
      type: 'tutorial',
      title: 'Make It Yours',
      subtitle: 'Change background and header from the top left',
      content: (
        <div className="tutorial-content">
          <div className="tutorial-step">
            <span className="step-number">1</span>
            <p>Click the "Theme" button in the top left</p>
          </div>
          <div className="tutorial-step">
            <span className="step-number">2</span>
            <p>Upload a custom header image or choose a color</p>
          </div>
          <div className="tutorial-step">
            <span className="step-number">3</span>
            <p>Pick a background that matches your style</p>
          </div>
          <div className="tutorial-step">
            <span className="step-number">4</span>
            <p>Customize fonts and colors to make it unique</p>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const currentSlideData = slides[currentSlide];

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

        {currentSlide > 0 && (
          <div className="carousel-navigation">
            <button 
              className="nav-button prev"
              onClick={handlePrev}
              disabled={currentSlide === 0}
            >
              ←
            </button>
            <div className="slide-dots">
              {slides.map((_, index) => (
                <span 
                  key={index}
                  className={`dot ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
            <button 
              className="nav-button next"
              onClick={handleNext}
            >
              {currentSlide === slides.length - 1 ? 'Get Started' : '→'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingCarousel;