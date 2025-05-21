import React, { useEffect, useState } from "react";
import "../EditProfile/EditProfile.css";
import "./LinkBlock.css";
import { API_URLS } from "../../config";

const LinkBlock = ({ block, onChange, readOnly }) => {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const content = block?.content || {};

  useEffect(() => {
    setError(null);
    if (!content?.url || typeof content.url !== "string" || !content.url.match(/^https?:\/\//i)) {
      setPreview(null);
      return;
    }

    const delay = setTimeout(() => {
      setLoading(true);
      fetch(API_URLS.linkPreview + `?url=${encodeURIComponent(content.url)}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch link preview");
          return res.json();
        })
        .then((data) => {
          setPreview(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching link preview:", err);
          setError("Could not load preview for this link");
          setPreview(null);
          setLoading(false);
        });
    }, 500);

    return () => clearTimeout(delay);
  }, [content?.url]);

  return (
    <div className="link-block-wrapper">
      {!readOnly && (
        <>
          <input
            type="text"
            className="link-block-input"
            placeholder="Paste link..."
            value={content?.url || ""}
            onChange={(e) => onChange({ ...content, url: e.target.value })}
          />
          <input
            type="text"
            className="link-block-input"
            placeholder="Link title"
            value={content?.title || ""}
            onChange={(e) => onChange({ ...content, title: e.target.value })}
          />
          <input
            type="text"
            className="link-block-input"
            placeholder="Short description"
            value={content?.description || ""}
            onChange={(e) => onChange({ ...content, description: e.target.value })}
          />
        </>
      )}

      {loading && <div className="link-block-loading">Loading preview...</div>}
      {error && <div className="link-block-error">{error}</div>}

      {preview && !loading && !error && (
        <a
          href={preview.url}
          target="_blank"
          rel="noreferrer"
          className="link-block-preview"
        >
          <div className="link-block-preview-container">
            {preview.image && (
              <img src={preview.image} alt="" className="link-block-image" />
            )}
            <div className="link-block-text-content">
              <h3 className="link-block-title">{preview.title || "Untitled"}</h3>
              {preview.description && (
                <p className="link-block-description">{preview.description}</p>
              )}
              <p className="link-block-url">{preview.url}</p>
            </div>
          </div>
        </a>
      )}

      {readOnly && content?.url && !preview && !loading && !error && (
        <a
          href={content.url}
          target="_blank"
          rel="noreferrer"
          className="link-block-simple-wrapper"
        >
          <div className="link-block-simple">{content.title || content.url}</div>
          {content.description && <p className="link-block-description">{content.description}</p>}
        </a>
      )}
    </div>
  );
};

export default LinkBlock;
