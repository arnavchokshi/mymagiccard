import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { API_URLS } from "../../config";

// Blocks (read-only versions)
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

// Import HighlightsBar CSS
import "../../components/EditProfile/HighlightsBar.css";

// Styles
import "./UserPage.css";

// Custom wrapper for block components in user page
const UserBlockWrapper = ({ children, type }) => {
  return (
    <div className={`user-block-container user-${type}-block-wrapper`}>
      {children}
    </div>
  );
};

const UserPage = () => {
  const { id } = useParams();
  
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    highlights: [],
    backgroundPhoto: "",
    header: "Hello, my name is Your Name! Contact me at your.email@example.com"
  });
  
  const [pages, setPages] = useState([{ id: "main", name: "Main", blocks: [] }]);
  const [activePageId, setActivePageId] = useState("main");
  const [typedText, setTypedText] = useState("");
  const [isTypingAnimationDone, setIsTypingAnimationDone] = useState(false);
  
  const activePage = pages.find((p) => p.id === activePageId) || pages[0];
  const blocksList = activePage ? activePage.blocks : [];

  // Add state and handlers for editable blocks
  const [blocksState, setBlocksState] = useState({});

  // Handler for updating a block's content
  const handleBlockChange = (blockId, value) => {
    setBlocksState((prev) => ({ ...prev, [blockId]: value }));
  };

  // ContactsBlock handlers
  const handleContactLineChange = (blockId, index, field, value) => {
    setBlocksState((prev) => ({
      ...prev,
      [blockId]: {
        ...((prev[blockId] || {})),
        content: (prev[blockId]?.content || userData.pages?.find(p => p.id === activePageId)?.blocks?.find(b => b.id === blockId)?.content || []).map((line, i) =>
          i === index ? { ...line, [field]: value } : line
        )
      }
    }));
  };
  const handleAddContactLine = (blockId) => {
    setBlocksState((prev) => ({
      ...prev,
      [blockId]: {
        ...((prev[blockId] || {})),
        content: [
          ...((prev[blockId]?.content || userData.pages?.find(p => p.id === activePageId)?.blocks?.find(b => b.id === blockId)?.content || [])),
          { label: "New", value: "" }
        ]
      }
    }));
  };
  const handleRemoveContactLine = (blockId, index) => {
    setBlocksState((prev) => ({
      ...prev,
      [blockId]: {
        ...((prev[blockId] || {})),
        content: (prev[blockId]?.content || userData.pages?.find(p => p.id === activePageId)?.blocks?.find(b => b.id === blockId)?.content || []).filter((_, i) => i !== index)
      }
    }));
  };

  // Add this after the existing useState declarations
  const typingRef = React.useRef(null);

  // Add this effect to calculate the text width
  useEffect(() => {
    if (typingRef.current) {
      const width = typingRef.current.scrollWidth;
      typingRef.current.style.setProperty('--text-width', `${width}px`);
    }
  }, [typedText]);

  // Update typed text when header is available
  useEffect(() => {
    setTypedText(userData.header || `Hello, my name is ${userData.name || "Your Name"}! Contact me at ${userData.email || "your.email@example.com"}`);
  }, [userData.header, userData.name, userData.email]);

  // Set animation as complete after timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTypingAnimationDone(true);
    }, 5000); // Animation completes after 5 seconds
    
    return () => clearTimeout(timer);
  }, []);

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
        });

        if (Array.isArray(data.pages)) {
          setPages(data.pages);
          setActivePageId(data.activePageId || "main");
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
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
    const safeBlock = { ...block, ...(blocksState[block.id] || {}) };
  
    switch (block.type) {
      case "text":
        return (
          <UserBlockWrapper type="text">
            <TextBlock block={safeBlock} readOnly />
          </UserBlockWrapper>
        );
      case "title":
        return (
          <UserBlockWrapper type="title">
            <TitleBlock block={safeBlock} readOnly />
          </UserBlockWrapper>
        );
      case "pdf":
        return (
          <UserBlockWrapper type="pdf">
            <PDFBlock block={safeBlock} readOnly />
          </UserBlockWrapper>
        );
      case "youtube":
        // Ensure YouTube block content is always an object with a url field
        const ytSafe = {
          ...safeBlock,
          content: typeof safeBlock.content === "string"
            ? { url: safeBlock.content }
            : safeBlock.content || { url: "" }
        };
        return (
          <UserBlockWrapper type="youtube">
            <YouTubeBlock block={ytSafe} readOnly />
          </UserBlockWrapper>
        );
      case "image":
        return (
          <UserBlockWrapper type="image">
            <ImageBlock block={safeBlock} readOnly />
          </UserBlockWrapper>
        );
      case "link":
        // Ensure Link block content is structured properly
        const linkSafe = {
          ...safeBlock,
          content: typeof safeBlock.content === "string"
            ? { url: safeBlock.content, title: "", description: "" }
            : safeBlock.content || { url: "", title: "", description: "" }
        };
        return (
          <UserBlockWrapper type="link">
            <LinkBlock block={linkSafe} readOnly />
          </UserBlockWrapper>
        );
      case "code":
        const codeContent = typeof safeBlock.content === "object"
          ? JSON.stringify(safeBlock.content)
          : safeBlock.content;
        return (
          <UserBlockWrapper type="code">
            <CodeBlock content={codeContent} readOnly />
          </UserBlockWrapper>
        );
      case "flip":
        return (
          <UserBlockWrapper type="flip">
            <FlipBlock block={safeBlock} readOnly />
          </UserBlockWrapper>
        );
      case "contactsText":
        return (
          <UserBlockWrapper type="contacts">
            <ContactsBlock block={safeBlock} readOnly />
          </UserBlockWrapper>
        );
      case "sideBySide":
        return (
          <UserBlockWrapper type="side-by-side">
            <SideBySideBlock
              block={safeBlock}
              renderBlock={renderBlock}
              readOnly
            />
          </UserBlockWrapper>
        );
      case "multiBlock":
        return (
          <UserBlockWrapper type="multi" style={{ overflow: "visible" }}>
            <div style={{ overflow: "visible" }}>
              <MultiBlock
                block={safeBlock}
                renderBlock={renderBlock}
                readOnly
              />
            </div>
          </UserBlockWrapper>
        );
      default:
        return <div className="user-placeholder-block">{block.type.toUpperCase()} BLOCK</div>;
    }
  };
  

  // Get category class (using similar naming to EditProfile)
  const getCategoryClass = (category) => {
    const categoryMap = {
      "AI & HCI": "ai-hci",
      "Frontend Dev": "frontend",
      "UX Design": "ux",
      "Leadership": "leadership",
      "Dance Team": "dance",
      "Academic": "academic",
      "Professional": "professional",
      "Personal Development": "personal-development",
      "Technical": "technical",
      "Extracurricular": "extracurricular"
    };
    
    return categoryMap[category] || "";
  };

  // Background image URL
  const backgroundImage = userData.backgroundPhoto || '/defaultBackground.jpg';

  return (
    <div className="user-page-viewer">
      {/* Background image with reduced opacity */}
      <div 
        className="user-page-background" 
        style={{ 
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
        }}
      ></div>
      
      {/* Centered header with intro text */}
      <div className="user-page-header">
        <div className="user-header-text-center">
          <div className="user-header-name">
            {userData.name || "Your Name"}
          </div>
          <div 
            ref={typingRef}
            className="user-header-typing"
            style={{
              animation: !isTypingAnimationDone ? 
                `typing 3s steps(${typedText.length}, end) forwards, blink-caret 0.75s step-end infinite` : 
                'blink-caret 0.75s step-end infinite'
            }}
          >
            {typedText}
          </div>
        </div>
      </div>
      
      {/* Main content area - similar to EditProfile layout */}
      <div className="user-profile-content">
        {/* Highlights section */}
        <div className="highlights-container">
          <div className="highlights-header">
            <h3>Highlights</h3>
          </div>
          <div className="highlights-row">
            {userData.highlights.map((highlight, index) => (
              <div
                key={index}
                className={`highlight-badge ${getCategoryClass(highlight.category)}`}
              >
                <span className="highlight-label">{highlight.label}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Page tabs */}
        <div className="user-navigation-tabs">
          {pages.map(page => (
            <button
              key={page.id}
              onClick={() => setActivePageId(page.id)}
              className={`user-nav-tab ${activePageId === page.id ? 'active' : ''}`}
            >
              {page.name}
            </button>
          ))}
          
        </div>
        
        {/* Content blocks */}
        <div className="user-blocks-container">
          {blocksList.map((block, index) => (
            <div key={block?.id || `block-${index}`} className="user-block-item">
              {renderBlock(block, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserPage;
