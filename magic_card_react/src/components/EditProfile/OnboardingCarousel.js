import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './OnboardingCarousel.css';

const templateOptions = [
  { value: 'Sleek', label: 'Sleek Template', img: '/UnfoldTemplate.png' },
  { value: 'Professional', label: 'Professional Template', img: '/MinimalTemplate.png' },
  { value: 'Serene', label: 'Serene Template', img: '/ModernTemplate.png' },
];

const OnboardingCarousel = ({ show, onClose, onProfileSetup }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [userInfo, setUserInfo] = useState({
    template: 'Sleek',
    themeColor: '#b3a369',
    skipOnboarding: false
  });
  const navigate = useNavigate();

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (onProfileSetup) {
      onProfileSetup(userInfo);
    }
    setCurrentSlide(1);
  };

  const handleSkip = () => {
    if (onProfileSetup) {
      onProfileSetup({ ...userInfo, skipOnboarding: true });
    }
    if (onClose) onClose();
  };

  const slides = [
    {
      type: 'profile-setup',
      title: 'Get Started',
      subtitle: 'Choose your style and theme color',
      content: (
        <form
          className="onboarding-profile-form"
        >
          <div className="onboarding-template-choices">
            {templateOptions.map(opt => (
              <div
                key={opt.value}
                className={`template-choice-img${userInfo.template === opt.value ? ' selected' : ''}`}
                onClick={() => setUserInfo({ ...userInfo, template: opt.value })}
                tabIndex={0}
                role="button"
                aria-label={opt.label}
              >
                <img src={opt.img} alt={opt.label} />
                <div className="template-choice-label">{opt.label}</div>
              </div>
            ))}
          </div>
          <div className="onboarding-inline-row">
            <label className="onboarding-label-inline">
              Theme Color
            </label>
            <input
              type="color"
              value={userInfo.themeColor}
              onChange={e => setUserInfo({ ...userInfo, themeColor: e.target.value })}
              className="onboarding-input-color"
            />
          </div>
        </form>
      )
    },
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
            onClick={() => { if (onClose) onClose(); }}
          >
            <span className="choice-icon">🎨</span>
            <span className="choice-title">Build from Scratch</span>
            <span className="choice-description">Create your profile manually with our tools</span>
          </button>
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
        <button className="close-button skip-button" onClick={handleSkip}>Skip and don't show again</button>
        <div className="carousel-content">
          <h2 className="carousel-title">{currentSlideData.title}</h2>
          <p className="carousel-subtitle">{currentSlideData.subtitle}</p>
          <div className="carousel-body">
            {currentSlideData.content}
          </div>
        </div>
        {currentSlide === 0 && (
          <button 
            className="nav-button next submit-bottom-right"
            onClick={() => setCurrentSlide(currentSlide + 1)}
            type="button"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default OnboardingCarousel;