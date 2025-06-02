import React, { useState } from 'react';
import './OnboardingCarousel.css';

const helpSlides = [
  {
    title: 'How to Use Magic Card',
    subtitle: 'A quick guide to editing and sharing your profile',
    content: (
      <div className="tutorial-content">
        <div className="tutorial-step">
          <span className="step-number">1</span>
          <p>Use the sidebar to add, edit, or remove content blocks (text, images, links, etc.).</p>
        </div>
        <div className="tutorial-step">
          <span className="step-number">2</span>
          <p>Drag and drop blocks to reorder them and customize your page layout.</p>
        </div>
        <div className="tutorial-step">
          <span className="step-number">3</span>
          <p>Click the color picker or background button to personalize your theme and background.</p>
        </div>
      </div>
    )
  },
  {
    title: 'Highlights & Pages',
    subtitle: 'Showcase your best work and organize your info',
    content: (
      <div className="tutorial-content">
        <div className="tutorial-step">
          <span className="step-number">1</span>
          <p>Add highlights to feature your top achievements, projects, or media.</p>
        </div>
        <div className="tutorial-step">
          <span className="step-number">2</span>
          <p>Use the "+ Add Page" button to create new sections (e.g., Projects, Experience).</p>
        </div>
        <div className="tutorial-step">
          <span className="step-number">3</span>
          <p>Switch between pages using the vertical navigation on the right.</p>
        </div>
      </div>
    )
  },
  {
    title: 'AI & Sharing',
    subtitle: 'Enhance your profile and share it with the world',
    content: (
      <div className="tutorial-content">
        <div className="tutorial-step">
          <span className="step-number">1</span>
          <p>Click "Enhance with AI" to get smart suggestions for your profile content.</p>
        </div>
        <div className="tutorial-step">
          <span className="step-number">2</span>
          <p>Use the "View Public Profile" button to see how your page looks to others.</p>
        </div>
        <div className="tutorial-step">
          <span className="step-number">3</span>
          <p>Share your public profile link with friends, recruiters, or on social media!</p>
        </div>
      </div>
    )
  },
  {
    title: 'Tips & Support',
    subtitle: 'Get the most out of Magic Card',
    content: (
      <div className="tutorial-content">
        <div className="tutorial-step">
          <span className="step-number">1</span>
          <p>Click your name or the gear icon to edit your profile settings, template, or theme.</p>
        </div>
        <div className="tutorial-step">
          <span className="step-number">2</span>
          <p>Hover over buttons and icons for tooltips and extra info.</p>
        </div>
        <div className="tutorial-step">
          <span className="step-number">3</span>
          <p>If you need more help, feel free to dm me on linkedin @arnav-chokshi.</p>
        </div>
      </div>
    )
  }
];

const HelpCarousel = ({ show, onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  if (!show) return null;

  const handleNext = () => {
    if (currentSlide < helpSlides.length - 1) {
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

  const currentSlideData = helpSlides[currentSlide];

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-carousel">
        <button className="close-button skip-button" onClick={onClose}>Close</button>
        <div className="carousel-content">
          <h2 className="carousel-title">{currentSlideData.title}</h2>
          <p className="carousel-subtitle">{currentSlideData.subtitle}</p>
          <div className="carousel-body">
            {currentSlideData.content}
          </div>
        </div>
        <div className="carousel-navigation">
          <button 
            className="nav-button prev"
            onClick={handlePrev}
            disabled={currentSlide === 0}
          >
            ←
          </button>
          <div className="slide-dots">
            {helpSlides.map((_, index) => (
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
            {currentSlide === helpSlides.length - 1 ? 'Got it!' : '→'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpCarousel; 