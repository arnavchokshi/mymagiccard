import React, { useState, useEffect } from "react";
import "./YouTubeBlock.css";

const YouTubeBlock = ({ block, onChange, readOnly }) => {
  const initialUrl = typeof block.content === "string"
    ? block.content
    : typeof block.content?.url === "string"
      ? block.content.url
      : "";

  const [url, setUrl] = useState(initialUrl);

  const extractVideoId = (url) => {
    if (typeof url !== "string") return null;
    const match = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([\w-]+)/
    );
    return match ? match[1] : null;
  };

  const videoId = extractVideoId(url);
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : null;

  // keep url in sync with block changes (for public read-only)
  useEffect(() => {
    setUrl(initialUrl);
  }, [initialUrl]);

  return (
    <div className="youtube-block">
      {!readOnly && (
        <input
          type="text"
          placeholder="Paste YouTube link..."
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            onChange?.({ url: e.target.value }); // Safe optional call
          }}
        />
      )}
      {embedUrl ? (
        <iframe
          width="100%"
          height="315"
          src={embedUrl}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      ) : (
        readOnly ? <p style={{ color: "#ccc" }}>No valid YouTube video</p> : <p>Enter a valid YouTube link to preview</p>
      )}
    </div>
  );
};

export default YouTubeBlock;
