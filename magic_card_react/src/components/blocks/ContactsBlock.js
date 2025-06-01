import React from "react";
import "./ContactsBlock.css";

// Platform icon and color map
const PLATFORM_MAP = {
  linkedin: {
    color: "#0077b5",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8.5h4V24h-4V8.5zm7.5 0h3.8v2.1h.05c.53-1 1.82-2.1 3.75-2.1 4.01 0 4.75 2.64 4.75 6.08V24h-4v-7.2c0-1.72-.03-3.94-2.4-3.94-2.4 0-2.77 1.87-2.77 3.8V24h-4V8.5z" fill="#fff"/></svg>
    )
  },
  github: {
    color: "#181717",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.5 2.87 8.32 6.84 9.67.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.36-3.37-1.36-.45-1.18-1.1-1.5-1.1-1.5-.9-.63.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05A9.38 9.38 0 0112 6.84c.85.004 1.7.12 2.5.35 1.9-1.33 2.74-1.05 2.74-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.8 0 .27.18.58.69.48A10.01 10.01 0 0022 12.26C22 6.58 17.52 2 12 2z" fill="#fff"/></svg>
    )
  },
  email: {
    color: "#c71610",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 2v.01L12 13 4 6.01V6h16zM4 20v-9.99l8 7.99 8-7.99V20H4z" fill="#fff"/></svg>
    )
  },
  twitter: {
    color: "#1da1f2",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M22.46 6c-.77.35-1.6.59-2.47.7a4.3 4.3 0 001.88-2.37 8.59 8.59 0 01-2.72 1.04A4.28 4.28 0 0016.11 4c-2.37 0-4.29 1.92-4.29 4.29 0 .34.04.67.11.99C7.69 9.13 4.07 7.38 1.64 4.7c-.37.64-.58 1.38-.58 2.17 0 1.5.76 2.82 1.92 3.6-.7-.02-1.36-.21-1.94-.53v.05c0 2.1 1.5 3.85 3.5 4.25-.36.1-.74.16-1.13.16-.28 0-.54-.03-.8-.08.54 1.7 2.1 2.94 3.95 2.97A8.6 8.6 0 012 19.54c-.63 0-1.25-.04-1.86-.11A12.13 12.13 0 006.29 21c7.55 0 11.68-6.26 11.68-11.68 0-.18-.01-.36-.02-.54A8.18 8.18 0 0024 4.59a8.36 8.36 0 01-2.54.7z" fill="#fff"/></svg>
    )
  },
  facebook: {
    color: "#1877f3",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.405 24 24 23.408 24 22.674V1.326C24 .592 23.405 0 22.675 0" fill="#fff"/></svg>
    )
  },
  instagram: {
    color: "#e1306c",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2.2c3.2 0 3.584.012 4.85.07 1.17.056 1.97.24 2.43.41.59.22 1.01.48 1.45.92.44.44.7.86.92 1.45.17.46.354 1.26.41 2.43.058 1.266.07 1.65.07 4.85s-.012 3.584-.07 4.85c-.056 1.17-.24 1.97-.41 2.43-.22.59-.48 1.01-.92 1.45-.44.44-.86.7-1.45.92-.46.17-1.26.354-2.43.41-1.266.058-1.65.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.056-1.97-.24-2.43-.41-.59-.22-1.01-.48-1.45-.92-.44-.44-.7-.86-.92-1.45-.17-.46-.354-1.26-.41-2.43C2.212 15.634 2.2 15.25 2.2 12s.012-3.584.07-4.85c.056-1.17.24-1.97.41-2.43.22-.59.48-1.01.92-1.45.44-.44.86-.7 1.45-.92.46-.17 1.26-.354 2.43-.41C8.416 2.212 8.8 2.2 12 2.2zm0-2.2C8.736 0 8.332.012 7.052.07 5.77.128 4.87.312 4.13.54c-.77.24-1.42.56-2.07 1.21-.65.65-.97 1.3-1.21 2.07-.23.74-.412 1.64-.47 2.92C.012 8.332 0 8.736 0 12c0 3.264.012 3.668.07 4.948.058 1.28.24 2.18.47 2.92.24.77.56 1.42 1.21 2.07.65.65 1.3.97 2.07 1.21.74.23 1.64.412 2.92.47C8.332 23.988 8.736 24 12 24s3.668-.012 4.948-.07c1.28-.058 2.18-.24 2.92-.47.77-.24 1.42-.56 2.07-1.21.65-.65.97-1.3 1.21-2.07.23-.74.412-1.64.47-2.92.058-1.28.07-1.684.07-4.948s-.012-3.668-.07-4.948c-.058-1.28-.24-2.18-.47-2.92-.24-.77-.56-1.42-1.21-2.07-.65-.65-1.3-.97-2.07-1.21-.74-.23-1.64-.412-2.92-.47C15.668.012 15.264 0 12 0z" fill="#fff"/><circle cx="12" cy="12" r="3.5" fill="#fff"/><circle cx="18.5" cy="5.5" r="1.5" fill="#fff"/></svg>
    )
  },
  website: {
    color: "#4b6cb7",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" fill="#fff"/></svg>
    )
  },
  phone: {
    color: "#34c759",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.21c1.21.49 2.53.76 3.88.76a1 1 0 011 1V20a1 1 0 01-1 1C10.07 21 3 13.93 3 5a1 1 0 011-1h3.5a1 1 0 011 1c0 1.35.27 2.67.76 3.88a1 1 0 01-.21 1.11l-2.2 2.2z" fill="#fff"/></svg>
    )
  },
};

function getPlatformInfo(label, value) {
  const l = label.toLowerCase();
  if (l.includes("linkedin")) return PLATFORM_MAP.linkedin;
  if (l.includes("github")) return PLATFORM_MAP.github;
  if (l.includes("twitter")) return PLATFORM_MAP.twitter;
  if (l.includes("facebook")) return PLATFORM_MAP.facebook;
  if (l.includes("insta")) return PLATFORM_MAP.instagram;
  if (l.includes("email") || value.includes("@")) return PLATFORM_MAP.email;
  if (l.includes("phone") || value.match(/^\+?\d{7,}/)) return PLATFORM_MAP.phone;
  if (l.includes("site") || l.includes("web") || value.match(/^https?:\/\//)) return PLATFORM_MAP.website;
  return { color: "#888", icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#fff"/><text x="12" y="16" textAnchor="middle" fontSize="12" fill="#888">🔗</text></svg>
  ) };
}

const ContactsBlock = ({ block, onChangeLine, onAddLine, onRemoveLine, readOnly }) => {
  // Always render the horizontal button layout for links
  const renderLinks = () => (
    <div className="contacts-block contacts-block-links">
      {Array.isArray(block.content) && block.content.map((line, idx) => {
        const { label = "", value = "" } = line || {};
        const info = getPlatformInfo(label, value);
        let href = value.trim();
        // Simple email validation
        const isEmail = info === PLATFORM_MAP.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(href);
        if (isEmail && !href.startsWith("mailto:")) href = `mailto:${href}`;
        if (info === PLATFORM_MAP.phone) {
          const phone = href.replace(/\s+/g, "");
          if (!phone.startsWith("tel:")) href = `tel:${phone}`;
        }
        if (info === PLATFORM_MAP.website && !/^https?:\/\//.test(href)) href = `https://${href}`;
        // If not a valid email, fallback to #
        if (info === PLATFORM_MAP.email && !isEmail) href = "#";
        return (
          <a
            key={idx}
            className="contact-link-btn"
            style={{ background: info.color }}
            href={href}
            target={info === PLATFORM_MAP.email || info === PLATFORM_MAP.phone ? undefined : "_blank"}
            rel={info === PLATFORM_MAP.email || info === PLATFORM_MAP.phone ? undefined : "noopener noreferrer"}
            title={label}
          >
            <span className="contact-link-icon">{info.icon}</span>
            <span className="contact-link-label">{label}</span>
          </a>
        );
      })}
    </div>
  );

  if (readOnly) {
    return renderLinks();
  }
  const handleChange = (index, field, value) => {
    if (onChangeLine) {
      onChangeLine(block.id, index, field, value);
    }
  };
  return (
    <div className="contacts-block">
      {Array.isArray(block.content) &&
        block.content.map((line, index) => (
          <div key={index} className="contact-line">
            <input
              type="text"
              className="contact-label-input"
              value={line.label || ""}
              onChange={(e) => handleChange(index, "label", e.target.value)}
              placeholder="Label"
            />
            <input
              type="text"
              className="contact-value-input"
              value={line.value || ""}
              onChange={(e) => handleChange(index, "value", e.target.value)}
              placeholder="Value"
            />
            <button
              className="remove-line"
              type="button"
              onClick={() => onRemoveLine(block.id, index)}
            >
              ×
            </button>
          </div>
        ))}
      <button
        className="add-line"
        type="button"
        onClick={() => onAddLine(block.id)}
      >
        + Add Line
      </button>
      {/* Live preview of the links below the fields */}
      {renderLinks()}
    </div>
  );
};

export default ContactsBlock;
