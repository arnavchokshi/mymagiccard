import React, { useEffect, useState } from "react";
import "../EditProfile/EditProfile.css";

const LinkBlock = ({ block, onChange }) => {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:2000/api/link-preview?url=${encodeURIComponent(block.content)}`)
      .then((res) => res.json())
      .then(setPreview)
      .catch(() => setPreview(null));
  }, [block.content]);

  return (
    <div>
      <input
        type="text"
        className="block-link-input"
        placeholder="Paste link..."
        value={block.content}
        onChange={(e) => onChange(block.id, e.target.value)}
      />
      {preview ? (
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
      ) : (
        block.content && <div className="block-link-loading">Loading link preview...</div>
      )}
    </div>
  );
};

export default LinkBlock;
