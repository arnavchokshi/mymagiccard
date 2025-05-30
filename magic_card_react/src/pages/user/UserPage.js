import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./UserPage.css";
import { API_URLS } from "../../config";

// Base API URL constant to avoid hardcoding
const API_BASE_URL = "http://192.168.86.40:2000";

const UserPage = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/public/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load profile");
        return res.json();
      })
      .then((data) => {
        console.log("HIGHLIGHTS LOADED:", data.highlights);
        setUser({
          ...data,
          highlights: data.highlights || [],
          blocks: data.blocks || [],
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading profile:", err);
        setError("Failed to load profile");
        setLoading(false);
      });
  }, [id]);
  
  if (loading) return <div className="loading-state">Loading profile...</div>;
  if (error) return <div className="error-state">{error}</div>;
  if (!user) return <div className="empty-state">No user found</div>;

  return (
    <div className="user-page-container">
      {/* Header */}
      <div className="user-page-header">
        <div className="user-header-text-center">
          <h1 className="fancy-header-name">
            {user.name || "Your Name"}
          </h1>
          <div 
            className="user-header-typing"
            // Optionally, you can add a typing animation here if you want
          >
            {user.header || `Currently @ ...`}
          </div>
        </div>
      </div>

      {/* Highlights */}
      {user.highlights.length > 0 && (
        <div className="highlights-container">
          {user.highlights.map((highlight, index) => (
            <div key={index} className="highlight-item">
              🔥 <strong>{highlight.label}</strong> — <em>{highlight.category}</em>
            </div>
          ))}
        </div>
      )}

      {/* Content Blocks */}
      <div className="blocks-container">
        <div className="blocks-scroll-area">
          {user.blocks
            .sort((a, b) => a.order - b.order)
            .map((block, index) => (
              <BlockRenderer key={index} block={block} />
            ))}
        </div>
      </div>
    </div>
  );
};

const BlockRenderer = ({ block }) => {
  const { type, content } = block;

  switch (type) {
    case "text":
      return <p className="block-text">{content}</p>;

    case "pdf":
      return (
        <div className="block-pdf">
          <iframe
            src={`${API_BASE_URL}${content}`}
            title="PDF Preview"
            className="pdf-frame"
            frameBorder="0"
          />
        </div>
      );

    case "link":
      return <LinkBlock content={content} />;

    case "code":
      return (
        <div className="block-code">
          <iframe
            srcDoc={content}
            sandbox="allow-scripts"
            title="Live Code Block"
            className="code-frame"
          />
        </div>
      );

    case "image":
      return (
        <img
          src={content}
          alt="Uploaded content"
          className="block-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/placeholder-image.png";
          }}
        />
      );

    default:
      return <div className="block-unsupported">Unsupported block type: {type}</div>;
  }
};

// Move the link preview logic into its own component to avoid hooks-in-conditional
const LinkBlock = ({ content }) => {
  const [preview, setPreview] = React.useState(null);

  React.useEffect(() => {
    fetch(`http://localhost:2000/api/link-preview?url=${encodeURIComponent(content)}`)
      .then((res) => res.json())
      .then(setPreview)
      .catch(() => setPreview(null));
  }, [content]);

  if (preview) {
    return (
      <a
        href={preview.url}
        target="_blank"
        rel="noreferrer"
        className="block-link"
      >
        {preview.image && (
          <img
            src={preview.image}
            alt=""
            className="link-image"
          />
        )}
        <h3 className="link-title">{preview.title}</h3>
        <p className="link-description">{preview.description}</p>
        <p className="link-url">{preview.url}</p>
      </a>
    );
  }

  return <div className="block-link-loading">Loading link preview...</div>;
};

export default UserPage;