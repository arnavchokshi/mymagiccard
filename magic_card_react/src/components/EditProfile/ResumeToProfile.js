// ResumeToProfile.js
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./ResumeToProfile.css";

function ResumeToProfile() {
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [processingStep, setProcessingStep] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Extract user ID from token for back button
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.id) {
          setUserId(payload.id);
        }
      } catch (e) {
        console.error("Error parsing token:", e);
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setShowSuccess(false);
    setProcessingStep("Initializing...");

    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in to generate a profile.");
      setLoading(false);
      return;
    }

    if (!resumeText.trim()) {
      setError("Please enter your resume text before generating a profile.");
      setLoading(false);
      return;
    }

    try {
      setProcessingStep("Sending resume to AI...");
      
      // Start a progress indication
      const progressInterval = setInterval(() => {
        setProcessingStep(currentStep => {
          if (currentStep.includes("...")) {
            if (currentStep.includes("Analyzing resume")) return "Analyzing resume (this may take up to 60 seconds)....";
            if (currentStep.includes("Sending resume")) return "Analyzing resume (this may take up to 60 seconds)...";
            return currentStep + ".";
          }
          return currentStep;
        });
      }, 3000);
      
      const response = await fetch("https://mymagiccard.onrender.com/api/generate-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ resumeText })
      });

      clearInterval(progressInterval);
      
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Something went wrong.");
        console.error("❌ Failed:", data);
      } else {
        console.log("✅ Success:", data);
        setProcessingStep("Profile generated!");
        setShowSuccess(true);
        // Navigate after a short delay to show success message
        setTimeout(() => {
          navigate(`/user/${data.userId}/edit`);
        }, 1500);
      }
    } catch (err) {
      console.error("❌ Error submitting resume:", err);
      setError("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="resume-page-container">
      <div className="resume-background"></div>
      
    <div className="resume-upload-container">
        <div className="resume-header">
      <h2>Generate Profile from Resume</h2>
          <p className="resume-subheading">
            Paste your resume text below and our AI will create a professional profile highlighting your skills and experience
          </p>
        </div>
        
      <form onSubmit={handleSubmit} className="resume-form">
          <div className="form-group">
            <label htmlFor="resume-text">Resume Text</label>
        <textarea
              id="resume-text"
          rows="16"
          className="resume-textarea"
          placeholder="Paste your resume here..."
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          required
              disabled={loading}
        />
          </div>
          
          <div className="button-group">
            {userId && (
              <Link to={`/user/${userId}/edit`} className="back-button">
                Back to Editor
              </Link>
            )}
        <button className="submit-btn" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  <span>{processingStep}</span>
                </>
              ) : showSuccess ? (
                <>
                  <span>✓</span>
                  <span>Success!</span>
                </>
              ) : (
                "Generate Profile"
              )}
        </button>
          </div>
          
          {error && (
            <div className="error-container">
              <p className="error-msg">{error}</p>
            </div>
          )}
          
          {showSuccess && (
            <div className="success-container">
              <p className="success-msg">Profile generated successfully! Redirecting...</p>
            </div>
          )}
          
          <div className="info-container">
            <p className="info-text">
              <strong>Note:</strong> This process may take 30-60 seconds to complete as our AI analyzes your resume.
            </p>
          </div>
      </form>
      </div>
    </div>
  );
}

export default ResumeToProfile;
