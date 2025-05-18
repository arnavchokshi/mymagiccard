import React, { useRef } from "react";

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

  return (
    <div className="pdf-block-wrapper" style={{ width: "100%", maxWidth: 700, margin: "0 auto", padding: 16, background: "rgba(30,30,30,0.7)", borderRadius: 12 }}>
      {!readOnly && (
        <>
          <input
            type="text"
            className="pdf-block-input"
            placeholder="Paste Google Drive PDF link or direct PDF URL..."
            value={content.url || ""}
            onChange={handleUrlChange}
            style={{ width: "100%", padding: 10, marginBottom: 10, borderRadius: 6, border: "1px solid #b3a369" }}
          />
        </>
      )}
      {embedUrl ? (
        <>
          <iframe
            src={embedUrl + (embedUrl.includes('?') ? '&' : '?') + 'page=1'}
            title="PDF Preview"
            width="100%"
            height="900px"
            style={{ border: "1px solid #b3a369", borderRadius: 8, background: "#fff", display: 'block' }}
            allow="autoplay"
          ></iframe>
        </>
      ) : (
        <div style={{ color: "#b3a369", textAlign: "center", padding: 20 }}>
          No PDF selected. Paste a Google Drive link or direct PDF URL.
        </div>
      )}
    </div>
  );
};

export default PDFBlock; 