import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { API_URLS } from "../../config";
import { UnfoldTemplate, MinimalTemplate, ModernTemplate } from '../../components/EditProfile/templates';
import HighlightsBar from '../../components/EditProfile/HighlightsBar';
import "../../components/EditProfile/EditProfile.css";

// Blocks (read-only)
import TextBlock from "../../components/blocks/TextBlock";
import LinkBlock from "../../components/blocks/LinkBlock";
import CodeBlock from "../../components/blocks/CodeBlock";
import FlipBlock from "../../components/blocks/FlipBlock";
import ContactsBlock from "../../components/blocks/ContactsBlock";
import MultiBlock from "../../components/blocks/MultiBlock";
import YouTubeBlock from "../../components/blocks/YouTubeBlock";
import ImageBlock from "../../components/blocks/ImageBlock";
import TitleBlock from "../../components/blocks/TitleBlock";
import SideBySideBlock from "../../components/blocks/SideBySideBlock";
import PDFBlock from "../../components/blocks/PDFBlock";

// Typing animation for header (copied from EditProfile.js)
function useTypingHeader(headerArray, typingSpeed = 80, pause = 1200, deletingSpeed = 40) {
  const [displayed, setDisplayed] = useState('');
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  React.useEffect(() => {
    if (!headerArray || headerArray.length === 0) {
      setDisplayed('');
      return;
    }
    if (!deleting && subIndex <= headerArray[index].length) {
      setDisplayed(headerArray[index].substring(0, subIndex));
      if (subIndex === headerArray[index].length) {
        setTimeout(() => setDeleting(true), pause);
      } else {
        setTimeout(() => setSubIndex(subIndex + 1), typingSpeed);
      }
    } else if (deleting && subIndex >= 0) {
      setDisplayed(headerArray[index].substring(0, subIndex));
      if (subIndex === 0) {
        setDeleting(false);
        setIndex((index + 1) % headerArray.length);
      } else {
        setTimeout(() => setSubIndex(subIndex - 1), deletingSpeed);
      }
    }
  }, [headerArray, index, subIndex, deleting, typingSpeed, deletingSpeed, pause]);

  return displayed;
}

function hexToRgba(hex, alpha = 1) {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map((char) => char + char).join('');
  }
  const num = parseInt(c, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

const UserPage = () => {
  const { id } = useParams();
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    highlights: [],
    backgroundPhoto: "",
    header: "Hello, my name is Your Name! Contact me at your.email@example.com",
    themeColor: "#b3a369",
    template: "Sleek"
  });
  const [pages, setPages] = useState([{ id: "main", name: "Main", blocks: [] }]);
  const [activePageId, setActivePageId] = useState("main");

  // Typing animation for header (match EditProfile)
  const animatedHeader = useTypingHeader(
    Array.isArray(userData.header) ? userData.header : [userData.header],
    80, 1200, 40
  );

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(API_URLS.public(id));
        const data = await res.json();
        setUserData({
          name: data.name || "",
          email: data.email || "",
          highlights: Array.isArray(data.highlights) ? data.highlights : [],
          backgroundPhoto: data.backgroundPhoto || "",
          header: data.header || `Hello, my name is ${data.name || "Your Name"}! Contact me at ${data.email || "your.email@example.com"}`,
          themeColor: data.themeColor || '#b3a369',
          template: data.template || 'Sleek',
        });
        if (Array.isArray(data.pages)) {
          setPages(data.pages);
          setActivePageId(data.activePageId || "main");
        }
      } catch (err) {
        setPages([{ id: "main", name: "Main", blocks: [] }]);
        setActivePageId("main");
      }
    };
    if (id) fetchProfile();
  }, [id]);

  useEffect(() => {
    if (userData.themeColor) {
      document.documentElement.style.setProperty('--primary-neon', userData.themeColor);
    }
  }, [userData.themeColor]);

  const renderBlock = (block, index) => {
    switch (block.type) {
      case "text":
        return <TextBlock block={block} readOnly />;
      case "title":
        return <TitleBlock block={block} readOnly />;
      case "pdf":
        return <PDFBlock block={block} readOnly />;
      case "youtube":
        return <YouTubeBlock block={typeof block.content === "string" ? { ...block, content: { url: block.content } } : block} readOnly />;
      case "image":
        return <ImageBlock block={block} readOnly />;
      case "link":
        return <LinkBlock block={typeof block.content === "string" ? { ...block, content: { url: block.content, title: "", description: "" } } : block} readOnly />;
      case "code":
        return <CodeBlock content={typeof block.content === "object" ? JSON.stringify(block.content) : block.content} readOnly />;
      case "flip":
        return <FlipBlock block={block} readOnly />;
      case "contactsText":
        return <ContactsBlock block={block} readOnly />;
      case "sideBySide":
        return <SideBySideBlock block={block} renderBlock={renderBlock} readOnly />;
      case "multiBlock":
        return <MultiBlock block={block} renderBlock={renderBlock} readOnly />;
      default:
        return <div className="placeholder-block">{block.type.toUpperCase()} BLOCK</div>;
    }
  };

  const renderHeaderTemplate = () => {
    const templateProps = {
      name: userData.name,
      header: `I'm ${animatedHeader}`,
      backgroundPhoto: userData.backgroundPhoto
    };
    switch (userData.template) {
      case 'Sleek':
        return <UnfoldTemplate {...templateProps} />;
      case 'Professional':
        return <MinimalTemplate {...templateProps} />;
      case 'Serene':
        return <ModernTemplate {...templateProps} />;
      default:
        return <UnfoldTemplate {...templateProps} />;
    }
  };

  const handlePageClick = (pageId) => {
    const pageElement = document.getElementById(`page-${pageId}`);
    if (pageElement) {
      pageElement.scrollIntoView({ behavior: 'smooth' });
    }
    setActivePageId(pageId);
  };

  return (
    <div>
      {/* No sidebar for public view */}
      <nav className="vertical-page-nav">
        {pages.map((page) => (
          <div
            key={page.id}
            className="vertical-page-nav-item"
            onClick={() => handlePageClick(page.id)}
            style={{ cursor: 'pointer', margin: '12px 0', color: '#fff', fontWeight: 500, fontSize: '18px', writingMode: 'vertical-lr', textAlign: 'center', letterSpacing: '0.05em', opacity: 0.7, transition: 'opacity 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = 1}
            onMouseLeave={e => e.currentTarget.style.opacity = 0.7}
          >
            {page.name}
          </div>
        ))}
      </nav>
      <main
        className="profile-editor"
        style={{ backgroundColor: (pages.find(p => p.id === activePageId)?.color || userData.themeColor) + '80', marginLeft: 0, width: '100vw' }}
      >
        {renderHeaderTemplate()}
        <div className="main-content" style={{ width: '100vw', marginLeft: 0 }}>
          {pages.map((page, idx) => (
            <div
              key={page.id}
              id={`page-${page.id}`}
              className="page-section"
              style={{
                minHeight: '100vh',
                padding: 0,
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                backgroundColor: hexToRgba(page.color || userData.themeColor, 0.25),
                opacity: 1,
                position: 'relative',
                zIndex: 10 + idx,
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                boxShadow: '0 4px 32px 0 rgba(31, 38, 135, 0.10)',
                borderRadius: 0,
                margin: 0,
              }}
            >
              <div className="page-gradient-overlay" />
              <div className="page-side-gradient-overlay" />
              <div className="page-inner-content" style={{ padding: '0 100px', width: '100%', boxSizing: 'border-box' }}>
                {/* Page name heading */}
                <h2 className="page-title-readonly" style={{ color: '#fff', fontSize: '2.2rem', fontWeight: 700, textAlign: 'center', margin: '32px 0 24px 0', letterSpacing: '0.01em' }}>{page.name && page.name.trim() ? page.name : 'Untitled Page'}</h2>
                {page.id === 'main' && (
                  <div className="highlights-section" style={{ marginBottom: '32px' }}>
                    <HighlightsBar
                      highlights={userData.highlights}
                      newHighlight={{ label: '', category: 'Academic' }}
                      setNewHighlight={() => {}}
                      onAdd={() => {}}
                      onRemove={() => {}}
                      readOnly
                    />
                  </div>
                )}
                <div className="blocks-list">
                  {page.blocks.map((block, idx) => (
                    <div key={block?.id || `block-${idx}`} className="block-container">
                      {renderBlock(block, idx)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default UserPage;