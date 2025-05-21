import React, { useRef } from "react";
import "./PDFBlock.css"; // Import the new CSS file

const getGoogleDriveEmbedUrl = (url) => {
  // Convert a Google Drive share link to an embeddable link
  // e.g. https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  // => https://drive.google.com/file/d/FILE_ID/preview
  const match = url.match(/https:\/\/drive\.google\.com\/file\/d\/([\w-]+)\//);
  if (match) {
    return `https://drive.google.com/file/d/${match[1]}/preview`;
  }
  return null;
};

const PDFBlock = ({ block, onChange, readOnly }) => {
  const content = block.content || { url: "" };
  const fileInputRef = useRef();

  const handleUrlChange = (e) => {
    onChange({ ...content, url: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      const reader = new FileReader();
      reader.onload = (ev) => {
        onChange({ ...content, fileUrl: ev.target.result, url: "" });
      };
      reader.readAsDataURL(file);
    }
  };

  let embedUrl = "";
  if (content.url) {
    const driveEmbed = getGoogleDriveEmbedUrl(content.url);
    embedUrl = driveEmbed || content.url;
  } else if (content.fileUrl) {
    embedUrl = content.fileUrl;
  }

  // Determine iframe height based on screen size for responsiveness
  // This is a simple approach; more sophisticated methods exist (e.g., ResizeObserver)
  let iframeHeight = "900px"; // Default
  if (window.innerWidth <= 480) {
    iframeHeight = "450px";
  } else if (window.innerWidth <= 768) {
    iframeHeight = "600px";
  }

  return (
    <div className="pdf-block-wrapper">
      {!readOnly && (
        <>
          <input
            type="text"
            className="pdf-block-input"
            placeholder="Paste Google Drive PDF link or direct PDF URL..."
            value={content.url || ""}
            onChange={handleUrlChange}
          />
        </>
      )}
      {embedUrl ? (
        <>
          <iframe
            src={embedUrl + (embedUrl.includes('?') ? '&' : '?') + 'page=1'}
            title="PDF Preview"
            className="pdf-iframe"
            width="100%"
            height={iframeHeight}
            allow="autoplay"
          ></iframe>
        </>
      ) : (
        <div className="pdf-block-placeholder">
          No PDF selected. Paste a Google Drive link or direct PDF URL.
        </div>
      )}
    </div>
  );
};

export default PDFBlock; 