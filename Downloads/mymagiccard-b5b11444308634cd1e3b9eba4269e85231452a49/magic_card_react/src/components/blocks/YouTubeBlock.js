import React, { useState } from "react";
import "./YouTubeBlock.css";

const YouTubeBlock = ({ block, onChange, readOnly }) => {
  const initialUrl =
    typeof block.content === "string"
      ? block.content
      : block.content?.url || "";

  const [url, setUrl] = useState(initialUrl);

  const extractVideoId = (url) => {
    const match = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=))([\w-]+)/
    );
    return match ? match[1] : null;
  };

  const videoId = extractVideoId(url);
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : null;

  return (
    <div className={`youtube-block ${readOnly ? "readonly" : ""}`}>
      {!readOnly && (
      <input
        type="text"
        placeholder="Paste YouTube link..."
        value={url}
        onChange={(e) => {
          setUrl(e.target.value);
          onChange({ url: e.target.value }); // Store as object, not raw string
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
        !readOnly && <p>Enter a valid YouTube link to preview</p>
      )}
      
      {readOnly && !embedUrl && url && (
        <div className="youtube-invalid-url">
          <p>YouTube link: <a href={url} target="_blank" rel="noopener noreferrer">{url}</a></p>
        </div>
      )}
    </div>
  );
};

export default YouTubeBlock;
