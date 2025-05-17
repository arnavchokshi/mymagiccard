import React, { useEffect, useState } from "react";
import "../EditProfile/EditProfile.css";

const LinkBlock = ({ content, onChange, readOnly }) => {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Reset states when URL changes
    setError(null);
    if (!content?.url || typeof content.url !== "string" || !content.url.match(/^https?:\/\//i)) {
      setPreview(null);
      return;
    }

    const delay = setTimeout(() => {
      setLoading(true);
      fetch(`http://localhost:2000/api/link-preview?url=${encodeURIComponent(content.url)}`)
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
    <div className="link-block-wrapper" style={styles.wrapper}>
      {!readOnly && (
        <>
          <input
            type="text"
            style={styles.input}
            placeholder="Paste link..."
            value={content?.url || ""}
            onChange={(e) => onChange({ ...content, url: e.target.value })}
          />
          <input
            type="text"
            style={styles.input}
            placeholder="Link title"
            value={content?.title || ""}
            onChange={(e) => onChange({ ...content, title: e.target.value })}
          />
          <input
            type="text"
            style={styles.input}
            placeholder="Short description"
            value={content?.description || ""}
            onChange={(e) => onChange({ ...content, description: e.target.value })}
          />
        </>
      )}

      {loading && <div style={styles.loading}>Loading preview...</div>}
      {error && <div style={styles.error}>{error}</div>}

      {preview && !loading && !error && (
        <a
          href={preview.url}
          target="_blank"
          rel="noreferrer"
          style={styles.linkPreview}
        >
          <div style={styles.previewContainer}>
            {preview.image && (
              <img src={preview.image} alt="" style={styles.image} />
            )}
            <div style={styles.textContent}>
              <h3 style={styles.title}>{preview.title || "Untitled"}</h3>
              {preview.description && (
                <p style={styles.description}>{preview.description}</p>
              )}
              <p style={styles.url}>{preview.url}</p>
            </div>
          </div>
        </a>
      )}

      {readOnly && content?.url && !preview && !loading && !error && (
        <a
          href={content.url}
          target="_blank"
          rel="noreferrer"
          style={styles.simpleLinkWrapper}
        >
          <div style={styles.simpleLink}>{content.title || content.url}</div>
          {content.description && <p style={styles.description}>{content.description}</p>}
        </a>
      )}
    </div>
  );
};

const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    width: "100%",
    maxWidth: "600px",
    margin: "0 auto",
    padding: "16px",
    boxSizing: "border-box"
  },
  input: {
    width: "100%",
    padding: "12px",
    fontSize: "18px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    outline: "none",
    transition: "border-color 0.2s",
    marginBottom: "8px"
  },
  loading: {
    padding: "12px",
    color: "#666",
    fontStyle: "italic",
    textAlign: "center",
    fontSize: "16px"
  },
  error: {
    padding: "12px",
    color: "#d32f2f",
    textAlign: "center",
    backgroundColor: "#ffebee",
    borderRadius: "4px",
    fontSize: "16px"
  },
  linkPreview: {
    display: "block",
    textDecoration: "none",
    color: "inherit",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    overflow: "hidden",
    transition: "box-shadow 0.2s",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
    cursor: "pointer"
  },
  previewContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "stretch",
    backgroundColor: "#fff"
  },
  image: {
    width: "150px",
    height: "150px",
    objectFit: "cover",
    backgroundColor: "#f5f5f5"
  },
  textContent: {
    flex: 1,
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between"
  },
  title: {
    margin: "0 0 8px 0",
    fontSize: "22px",
    fontWeight: "600",
    color: "#333",
    lineHeight: "1.3"
  },
  description: {
    margin: "0 0 12px 0",
    fontSize: "16px",
    color: "#666",
    lineHeight: "1.4"
  },
  url: {
    margin: "0",
    fontSize: "14px",
    color: "#999",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap"
  },
  simpleLinkWrapper: {
    textDecoration: "none",
    display: "block",
    width: "100%"
  },
  simpleLink: {
    padding: "12px",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: "4px",
    color: "#0066cc",
    textDecoration: "underline",
    wordBreak: "break-word"
  }
};

export default LinkBlock;
