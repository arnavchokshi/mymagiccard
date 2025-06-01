import React from "react";
import { Link } from "react-router-dom";

const ThankYouPage = () => (
  <div className="thankyou-container">
    <div className="thankyou-card">
      <h1 className="gradient-text">Thank You for Using Magic Frames!</h1>
      
      <div className="device-section">
        <p className="device-preference">Laptop Preferred</p>
        
        {/* Device Animation */}
        <div className="device-container">
          <div className="device iphone"></div>
          
          <div className="device laptop">
            <div className="laptop-screen"></div>
            <div className="laptop-base"></div>
          </div>
        </div>
      </div>
      
      <div className="content-section">
        
      <a
            className="linkedin-link"
            href="https://www.linkedin.com/in/arnav-chokshi/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linkedin/linkedin-original.svg"
              alt="LinkedIn"
              className="linkedin-icon"
            />
            @arnav-chokshi
          </a>
        <div className="connect-section">
          <p className="connect-text">
            Connect with me, I'd love to hear your feedback!
          </p>
          <div className="thankyou-btn-group">
          <Link to="/login" className="thankyou-btn">Login</Link>
          <Link to="/register" className="thankyou-btn">Sign Up</Link>
        </div>
          
        </div>
        
        <div className="note-box">
          ⏱️ Note: Login/Signup may take up to 30 seconds
        </div>
      </div>
    </div>

    <style jsx>{`
      .thankyou-container {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: url('/6436961_3312580.jpg') center center/cover no-repeat fixed;
        position: relative;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        padding: 20px;
      }

      .thankyou-card {
        background: rgba(255, 255, 255, 0.67);
        backdrop-filter: blur(20px);
        border-radius: 24px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.2);
        padding: 40px;
        text-align: center;
        max-width: 500px;
        width: 100%;
        position: relative;
        border: 1px solid rgba(255, 255, 255, 0.2);
      }

      .thankyou-card h1 {
        font-size: 2.4rem;
        margin-bottom: 30px;
        font-weight: 800;
        text-shadow: 0 2px 8px rgba(44,44,44,0.12);
      }

      .gradient-text {
        background: linear-gradient(135deg, #667eea, #764ba2, #f093fb, #f5576c);
        background-size: 300% auto;
        color: transparent;
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: gradient-move 4s ease-in-out infinite;
        font-weight: 800;
        text-shadow: 0 2px 8px rgba(44,44,44,0.12);
      }

      @keyframes gradient-move {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
      }

      .device-section {
        margin: 30px 0;
        padding: 25px;
        background: rgba(102, 126, 234, 0.08);
        border-radius: 16px;
        border: 1px solid rgba(102, 126, 234, 0.2);
      }

      .device-preference {
        font-size: 1.3rem;
        font-weight: 600;
        color: #2d3748;
        margin-bottom: 20px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      .content-section {
        margin-top: 30px;
      }

      .thankyou-btn-group {
        display: flex;
        gap: 18px;
        justify-content: center;
        margin-bottom: 30px;
      }
      .thankyou-btn {
        display: inline-block;
        padding: 12px 32px;
        border-radius: 14px;
        background: linear-gradient(135deg, #667eea, #764ba2, #f093fb, #f5576c);
        background-size: 200% 200%;
        color: #fff;
        font-weight: 700;
        font-size: 1.1rem;
        text-decoration: none;
        box-shadow: 0 4px 18px rgba(102, 126, 234, 0.18);
        transition: 
          transform 0.35s cubic-bezier(0.4,0,0.2,1),
          box-shadow 0.35s cubic-bezier(0.4,0,0.2,1),
          background-position 0.6s cubic-bezier(0.4,0,0.2,1),
          filter 0.25s cubic-bezier(0.4,0,0.2,1);
        border: none;
        outline: none;
        letter-spacing: 0.01em;
        cursor: pointer;
        background-position: 0% 50%;
        will-change: transform, box-shadow, background-position, filter;
      }
      .thankyou-btn:hover, .thankyou-btn:focus {
        background-position: 100% 50%;
        transform: translateY(-3px) scale(1.07) rotate(-1deg);
        box-shadow: 0 10px 32px rgba(102, 126, 234, 0.28), 0 2px 8px rgba(245, 87, 108, 0.12);
        filter: brightness(1.08) saturate(1.2);
      }
      .thankyou-btn:active {
        transform: scale(0.97) translateY(1px);
        filter: brightness(0.98);
      }

      .connect-section {
        margin-top: 20px;
        margin-bottom: 25px;
      }

      .connect-text {
        color: #2d3748;
        font-size: 1.1rem;
        margin-bottom: 20px;
        font-weight: 500;
      }

      .linkedin-link {
        display: inline-flex;
        align-items: center;
        gap: 12px;
        background: linear-gradient(135deg, #0077b5, #005983);
        color: #fff;
        padding: 12px 24px;
        border-radius: 12px;
        font-weight: 600;
        text-decoration: none;
        font-size: 1.1rem;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(0, 119, 181, 0.3);
      }

      .linkedin-link:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 119, 181, 0.4);
        background: linear-gradient(135deg, #005983, #004266);
      }

      .linkedin-icon {
        width: 24px;
        height: 24px;
      }

      .note-box {
        display: inline-block;
        font-size: 0.95em;
        color: #2d3748;
        background: rgba(102, 126, 234, 0.1);
        border: 1px solid rgba(102, 126, 234, 0.2);
        border-radius: 12px;
        padding: 12px 20px;
        font-weight: 500;
      }

      /* Device Animation Styles */
      .device-container {
        position: relative;
        width: 180px;
        height: 180px;
        margin: 0 auto;
      }

      .device {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        transition: all 2s ease-in-out;
      }

      /* iPhone X styles */
      .iphone {
        width: 55px;
        height: 100px;
        border: 2px solid #4c5c96;
        border-radius: 16px;
        background: rgba(102, 126, 234, 0.1);
        opacity: 1;
        animation: phoneToLaptop 4s infinite;
        position: relative;
      }

      /* Notch */
      .iphone::before {
        content: '';
        position: absolute;
        top: -2px;
        left: 50%;
        transform: translateX(-50%);
        width: 22px;
        height: 6px;
        background: #4c5c96;
        border-radius: 0 0 4px 4px;
      }

      /* Side button */
      .iphone::after {
        content: '';
        position: absolute;
        right: -3px;
        top: 18px;
        width: 2px;
        height: 6px;
        background: #4c5c96;
        border-radius: 1px;
      }

      /* Laptop styles */
      .laptop {
        width: 85px;
        height: 55px;
        opacity: 0;
        animation: laptopFromPhone 4s infinite;
      }

      .laptop-screen {
        width: 85px;
        height: 45px;
        border: 2px solid #4c5c96;
        border-radius: 6px 6px 0 0;
        background: rgba(102, 126, 234, 0.1);
        position: relative;
      }

      .laptop-base {
        width: 90px;
        height: 10px;
        border: 2px solid #4c5c96;
        border-radius: 0 0 6px 6px;
        background: rgba(102, 126, 234, 0.1);
        margin-left: -2.5px;
        position: relative;
      }

      .laptop-base::after {
        content: '';
        position: absolute;
        bottom: 1px;
        left: 50%;
        transform: translateX(-50%);
        width: 25px;
        height: 1px;
        background: #4c5c96;
        border-radius: 1px;
      }

      @keyframes phoneToLaptop {
        0%, 30% {
          opacity: 1;
          transform: translate(-50%, -50%) rotateY(0deg) scale(1);
        }
        50% {
          opacity: 0;
          transform: translate(-50%, -50%) rotateY(90deg) scale(1);
        }
        51%, 100% {
          opacity: 0;
          transform: translate(-50%, -50%) rotateY(90deg) scale(1);
        }
      }

      @keyframes laptopFromPhone {
        0%, 50% {
          opacity: 0;
          transform: translate(-50%, -50%) rotateY(-90deg) scale(1);
        }
        51% {
          opacity: 0;
          transform: translate(-50%, -50%) rotateY(-90deg) scale(1);
        }
        70% {
          opacity: 1;
          transform: translate(-50%, -50%) rotateY(0deg) scale(1);
        }
        100% {
          opacity: 1;
          transform: translate(-50%, -50%) rotateY(0deg) scale(1);
        }
      }

      /* Responsive Design */
      @media (max-width: 480px) {
        .thankyou-card {
          padding: 30px 20px;
          margin: 10px;
        }
        
        .thankyou-card h1 {
          font-size: 2rem;
        }
        
        .device-container {
          width: 150px;
          height: 150px;
        }
      }
    `}</style>
  </div>
);

export default ThankYouPage;