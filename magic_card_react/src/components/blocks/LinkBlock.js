import React, { useEffect, useState } from "react";
import "../EditProfile/EditProfile.css";
import "./LinkBlock.css";
import { API_URLS } from "../../config";

const getFaviconUrl = (url) => {
  try {
    const { hostname } = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${hostname}`;
  } catch {
    return null;
  }
};

const LinkBlock = ({ block, onChange, readOnly }) => {
  const content = block?.content || {};
  const faviconUrl = content?.url ? getFaviconUrl(content.url) : null;

  return (
    <div className="link-block-wrapper link-block-button-style">
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
            placeholder="Button label (e.g. 'View my GitHub')"
            value={content?.description || ""}
            onChange={(e) => onChange({ ...content, description: e.target.value })}
          />
        </>
      )}
      {content?.url && content?.description && (
        <a
          href={content.url}
          target="_blank"
          rel="noreferrer"
          className="link-block-main-button"
        >
          {faviconUrl && <img src={faviconUrl} alt="logo" className="link-block-favicon" />}
          <span className="link-block-btn-label">{content.description}</span>
        </a>
      )}
    </div>
  );
};

export default LinkBlock;
