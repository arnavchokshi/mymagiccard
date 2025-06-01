import React, { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { API_URLS } from "../../config";
import { UnfoldTemplate, MinimalTemplate, ModernTemplate } from './templates';


// Blocks
import TextBlock from "../blocks/TextBlock";
import LinkBlock from "../blocks/LinkBlock";
import CodeBlock from "../blocks/CodeBlock";
import FlipBlock from "../blocks/FlipBlock";
import ContactsBlock from "../blocks/ContactsBlock";
import MultiBlock from "../blocks/MultiBlock";
import YouTubeBlock from "../blocks/YouTubeBlock";
import ImageBlock from "../blocks/ImageBlock";
import TitleBlock from "../blocks/TitleBlock";
import SideBySideBlock from "../blocks/SideBySideBlock";
import PDFBlock from "../blocks/PDFBlock";

// Layout Components
import HighlightsBar from "./HighlightsBar";
import PageTabs from "./PageTabs";
import BlockDropZone from "./BlockDropZone";

// Utilities
import { generateUniqueBlockId, getDefaultBlockContent } from "./utils";
import OnboardingCarousel from "./OnboardingCarousel";

const blockTypes = [
  { type: "text", label: "Text Block", tooltip: "Add simple text content" },
  { type: "title", label: "Title Block", tooltip: "Add a title and subtitle" },
  { type: "link", label: "Link Block", tooltip: "Add a clickable link" },
  { type: "youtube", label: "YouTube Link Block", tooltip: "Embed a YouTube video" },
  { type: "pdf", label: "PDF Block", tooltip: "Add PDF content" },
  { type: "image", label: "Image Block", tooltip: "Add an image or carousel" },
  { type: "code", label: "Code Block", tooltip: "Add code with syntax highlighting" },
  { type: "divider", label: "Divider Line", tooltip: "Add a visual separator" },
  { type: "contactsText", label: "Contacts Block", tooltip: "Add contact information" },
  { type: "flip", label: "Flip Block", tooltip: "Add flippable content" },
  { type: "multiBlock", label: "Multi Block", tooltip: "Combine multiple blocks" },
  { type: "sideBySide", label: "Side by Side", tooltip: "Place two blocks side by side" }
];

const blockCategories = {
  Content: ["text", "link", "youtube", "pdf", "title"],
  Media: ["image", "code"],
  Layout: ["divider", "flip", "multiBlock", "sideBySide"],
  Info: ["contactsText"]
};

const EditProfile = () => {
  const { id } = useParams();
  

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    highlights: [],
    backgroundPhoto: "",
    header: "Hello, my name is Your Name! Contact me at your.email@example.com",
    themeColor: "#b3a369"
  });

  const [typedText, setTypedText] = useState("");
  const [isTypingAnimationDone, setIsTypingAnimationDone] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [pages, setPages] = useState([{ id: "main", name: "Main", blocks: [] }]);
  const [activePageId, setActivePageId] = useState("main");

  const [newHighlight, setNewHighlight] = useState({ label: "", category: "Academic" });
  const [draggedBlockType, setDraggedBlockType] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [blockToDelete, setBlockToDelete] = useState(null);
  const [sidebarActive, setSidebarActive] = useState(true);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNameInBar, setShowNameInBar] = useState(false);
  const headerRef = useRef(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userOnboarding, setUserOnboarding] = useState(true);
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState('Sleek');
  const [showProfileControls, setShowProfileControls] = useState(false);
  const profileControlsRef = useRef(null);

  const activePage = pages.find((p) => p.id === activePageId) || pages[0];
  const blocksList = activePage ? activePage.blocks : [];

  // Update typed text when header changes
  useEffect(() => {
    setTypedText(formData.header || `Hello, my name is ${formData.name || "Your Name"}! Contact me at ${formData.email || "your.email@example.com"}`);
  }, [formData.header, formData.name, formData.email]);

  // Set animation as complete after timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTypingAnimationDone(true);
    }, 5000); // Animation completes after 5 seconds
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const clouds = document.querySelectorAll('.cloud');
      
      clouds.forEach((cloud, index) => {
        const speed = (index + 1) * -0.2; // Negative for opposite direction
        cloud.style.transform = `translateY(${scrolled * speed}px)`;
      });
    };
  
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("Token available:", !!token);
        
        if (token && id) {
          console.log("Attempting to fetch profile with token and URL ID:", id);
          // Use the same format as the public endpoint
          const res = await fetch(`${API_URLS.baseURL}/public/${id}`, {
            method: 'GET',
            headers: { 
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          });
          
          console.log("Profile fetch response status:", res.status);
          
          if (res.ok) {
            const data = await res.json();
            console.log("Profile data received:", data);
            
            setFormData({
              name: data.name || "",
              email: data.email || "",
              highlights: Array.isArray(data.highlights) ? data.highlights : [],
              backgroundPhoto: data.backgroundPhoto || "",
              header: data.header || "Hello, my name is Your Name! Contact me at your.email@example.com",
              themeColor: data.themeColor || "#b3a369"
            });
            setSelectedTemplate(data.template || 'Sleek');
            
            if (Array.isArray(data.pages)) {
              setPages(data.pages);
              setActivePageId(data.activePageId || "main");
            }
            
            console.log("Setting onboarding states - data.onboarding:", data.onboarding);
            setUserOnboarding(data.onboarding === true);
            setShowOnboarding(data.onboarding !== true);
            return;
          } else {
            const errorText = await res.text();
            console.error("Profile fetch failed:", res.status, errorText);
            // If profile fetch fails, try to fetch the public profile
            console.log("Falling back to public profile fetch");
            const publicRes = await fetch(API_URLS.public(id));
            if (publicRes.ok) {
              const publicData = await publicRes.json();
              console.log("Public profile data received:", publicData);
              setFormData({
                name: publicData.name || "",
                email: publicData.email || "",
                highlights: Array.isArray(publicData.highlights) ? publicData.highlights : [],
                backgroundPhoto: publicData.backgroundPhoto || "",
                header: publicData.header || "Hello, my name is Your Name! Contact me at your.email@example.com",
                themeColor: publicData.themeColor || "#b3a369"
              });
              if (Array.isArray(publicData.pages)) {
                setPages(publicData.pages);
                setActivePageId(publicData.activePageId || "main");
              }
              setUserOnboarding(false);
              setShowOnboarding(false);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
        setPages([{ id: "main", name: "Main", blocks: [] }]);
        setActivePageId("main");
      }
    };

    if (id) fetchProfile();

    setTimeout(() => {
      setSidebarActive(true);
    }, 100);
  }, [id]);

  // Toggle sidebar for mobile
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Handle typing text changes
  const handleTypedTextChange = (e) => {
    const newText = e.target.value;
    setTypedText(newText);
    
    // Update the header in formData
    setFormData(prev => ({
      ...prev,
      header: newText
    }));
    
    // Also try to extract name/email if it matches the pattern
    const match = newText.match(/^Hello, my name is (.*?)! Contact me at (.*?)$/);
    if (match) {
      setFormData(prev => ({
        ...prev,
        name: match[1].trim(),
        email: match[2].trim()
      }));
    }
  };

  const updateBlocksForActivePage = (newBlocks) => {
    const updated = pages.map((p) =>
      p.id === activePageId ? { ...p, blocks: newBlocks } : p
    );
    setPages(updated);
  };

  const handleDrop = (e, dropIndex = blocksList.length, parentMultiBlockIndex = null) => {
    e.preventDefault();
    const blockType = e.dataTransfer.getData("block-type") || draggedBlockType;
    if (!blockType) return;

    const newBlock = {
      id: generateUniqueBlockId(),
      type: blockType,
      content: getDefaultBlockContent(blockType)
    };

    const updated = [...blocksList];
    if (parentMultiBlockIndex !== null) {
      const parent = updated[parentMultiBlockIndex];
      parent.content.push(newBlock);
    } else if (!blocksList[dropIndex]) {
      updated.splice(dropIndex, 0, newBlock);
    }

    updateBlocksForActivePage(updated);
    setDraggedBlockType(null);
    setIsDragging(false);
    setSelectedBlock(newBlock.id);
    setTimeout(() => setSelectedBlock(null), 2000);
  };

  const handleContentChange = (blockId, value) => {
    const updateBlocksRecursively = (blocks) =>
      blocks.map((block) =>
        block.id === blockId
          ? { ...block, content: value }
          : block.type === "multiBlock"
          ? { ...block, content: updateBlocksRecursively(block.content) }
          : block
      );

    updateBlocksForActivePage(updateBlocksRecursively(blocksList));
  };

  const updateBlock = (index, newBlock) => {
    const updated = [...blocksList];
    updated[index] = newBlock;
    updateBlocksForActivePage(updated);
  };

  const renderBlock = (block, index, customChangeHandler = null) => {
    const handleChange = customChangeHandler
      ? (value) => customChangeHandler(block.id, value)
      : (value) => handleContentChange(block.id, value);

    switch (block.type) {
      case "text":
        return <TextBlock block={block} onChange={handleChange} />;
      case "title":
        return <TitleBlock block={block} onChange={handleChange} />;
      case "youtube":
        return <YouTubeBlock block={block} onChange={handleChange} />;
      case "image":
        return <ImageBlock block={block} onChange={handleChange} />;
        
      case "link":
        return <LinkBlock block={block} onChange={handleChange} />;
      case "code":
        return <CodeBlock content={block.content} onChange={handleChange} />;
      case "flip":
        return <FlipBlock block={block} onChange={handleChange} />;
      case "contactsText":
        return (
          <ContactsBlock
            block={block}
            onChangeLine={handleContactLineChange}
            onAddLine={handleAddContactLine}
            onRemoveLine={handleRemoveContactLine}
          />
        );
      case "divider":
        return <div className="divider-line-only" />;
      case "sideBySide":
        const updateSideBlock = (sideIndex, newBlock) => {
          const updatedContent = [...(block.content || [null, null])];
          updatedContent[sideIndex] = newBlock;
          updateBlock(index, { ...block, content: updatedContent });
        };
        
        const handleSideBySideDrop = (e, sideIndex, parentIndex) => {
          e.preventDefault();
          const blockType = e.dataTransfer.getData("block-type") || draggedBlockType;
          if (!blockType) return;
          
          const newBlock = {
            id: generateUniqueBlockId(),
            type: blockType,
            content: getDefaultBlockContent(blockType)
          };
          
          updateSideBlock(sideIndex, newBlock);
          setDraggedBlockType(null);
          setIsDragging(false);
        };
        
        return (
          <SideBySideBlock
            block={block}
            parentIndex={index}
            renderBlock={(sideBlock, sideIndex) => {
              if (!sideBlock) return null;
              return renderBlock(
                sideBlock,
                sideIndex,
                (blockId, value) => {
                  const updatedContent = [...(block.content || [])];
                  const blockIndex = updatedContent.findIndex(b => b?.id === blockId);
                  if (blockIndex !== -1) {
                    updatedContent[blockIndex] = {
                      ...updatedContent[blockIndex],
                      content: value
                    };
                    updateBlock(index, { ...block, content: updatedContent });
                  }
                }
              );
            }}
            onDrop={handleSideBySideDrop}
          />
        );
      case "multiBlock":
        const updateInner = (innerId, newContent) => {
          const updated = block.content.map((b) =>
            b.id === innerId ? { ...b, content: newContent } : b
          );
          updateBlock(index, { ...block, content: updated });
        };
        const removeInner = (innerId) => {
          const updated = block.content.filter((b) => b.id !== innerId);
          updateBlock(index, { ...block, content: updated });
        };
        return (
          <MultiBlock
            block={block}
            parentIndex={index}
            renderBlock={renderBlock}
            onDrop={handleDrop}
            onChangeInner={updateInner}
            onRemoveInner={removeInner}
          />
        );
      case "pdf":
        return <PDFBlock block={block} onChange={handleChange} />;
      default:
        return <div className="placeholder-block">{block.type.toUpperCase()} BLOCK</div>;
    }
  };

  const handleContactLineChange = (blockId, index, field, value) => {
    const updated = blocksList.map((block) =>
      block.id === blockId
        ? {
            ...block,
            content: block.content.map((line, i) =>
              i === index ? { ...line, [field]: value } : line
            )
          }
        : block
    );
    updateBlocksForActivePage(updated);
  };

  const handleAddContactLine = (blockId) => {
    const updated = blocksList.map((block) =>
      block.id === blockId
        ? {
            ...block,
            content: [...block.content, { label: "New", value: "" }]
          }
        : block
    );
    updateBlocksForActivePage(updated);
  };

  const handleRemoveContactLine = (blockId, index) => {
    const updated = blocksList.map((block) =>
      block.id === blockId
        ? {
            ...block,
            content: block.content.filter((_, i) => i !== index)
          }
        : block
    );
    updateBlocksForActivePage(updated);
  };

  const handleRemoveBlock = (index) => {
    setBlockToDelete(index);
    setTimeout(() => {
      const updated = [...blocksList];
      updated.splice(index, 1);
      updateBlocksForActivePage(updated);
      setBlockToDelete(null);
    }, 500);
  };

  const handleRenamePage = (id, newName) => {
    const updatedPages = pages.map((p) =>
      p.id === id ? { ...p, name: newName } : p
    );
    setPages(updatedPages);
  };

  const handleAddHighlight = () => {
    if (newHighlight.label.trim()) {
      setFormData((prev) => ({
        ...prev,
        highlights: [...prev.highlights, newHighlight]
      }));
      setNewHighlight({ label: "", category: "Academic" });
    }
  };

  const handleRemoveHighlight = (index) => {
    setFormData((prev) => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index)
    }));
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("Token missing. Log in again.");

      const form = new FormData();
      form.append("name", formData.name);
      form.append("email", formData.email);
      form.append("header", formData.header);
      form.append("highlights", JSON.stringify(formData.highlights));
      // Ensure each page includes its color property
      const pagesWithColor = pages.map(p => ({ ...p, color: p.color || formData.themeColor }));
      form.append("pages", JSON.stringify({ pages: pagesWithColor, activePageId }));
      form.append("blocksList", JSON.stringify(blocksList));
      form.append("themeColor", formData.themeColor);

      if (formData.backgroundPhoto instanceof File) {
        form.append("backgroundPhoto", formData.backgroundPhoto);
      } else if (typeof formData.backgroundPhoto === "string") {
        form.append("backgroundPhotoUrl", formData.backgroundPhoto);
      }

      const res = await fetch(API_URLS.setup, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form
      });

      const result = await res.json();
      if (res.ok) {
        if (result.user && result.user.backgroundPhoto) {
          setFormData(prev => ({ ...prev, backgroundPhoto: result.user.backgroundPhoto }));
        }
        alert("Profile saved!");
      } else throw new Error(result.message || "Save failed");
    } catch (err) {
      alert(`Save failed: ${err.message}`);
    }
  };

  const getBlocksByCategory = (categoryName) => {
    const categoryTypes = blockCategories[categoryName] || [];
    return blockTypes.filter((block) => categoryTypes.includes(block.type));
  };

  // Scroll listener for sticky name
  useEffect(() => {
    const handleScroll = () => {
      if (!headerRef.current) return;
      const headerBottom = headerRef.current.getBoundingClientRect().bottom;
      setShowNameInBar(headerBottom < 60); // 60px is the height of the fixed bar
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleHeaderNameChange = (e) => {
    setFormData(prev => ({
      ...prev,
      name: e.target.value
    }));
  };

  const handleHeaderSubtitleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      header: e.target.value
    }));
  };

  const renderHeaderTemplate = () => {
    const templateProps = {
      name: formData.name,
      header: formData.header,
      backgroundPhoto: formData.backgroundPhoto
    };

    switch (selectedTemplate) {
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

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileControlsRef.current && !profileControlsRef.current.contains(event.target)) {
        setShowProfileControls(false);
      }
    }
    if (showProfileControls) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showProfileControls]);

  return (
    <>
      <div className="edit-page">
        {console.log("Render - showOnboarding state:", showOnboarding)}
        <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
          ☰
        </button>
        <aside className={`sidebar ${sidebarActive ? "active" : ""} ${isSidebarOpen ? "open" : ""}`}>
          <div className="sidebar-header">
            <h2>Editor Tools</h2>
          </div>
          <div className="profile-controls-dropdown-wrapper">
          <button
            className="profile-controls-dropdown-btn"
            onClick={() => setShowProfileControls((v) => !v)}
            aria-haspopup="true"
            aria-expanded={showProfileControls}
          >
            Profile Settings <span className="gear-icon">&#9881;</span>
          </button>
            {showProfileControls && (
              <div className="profile-controls-bar profile-controls-dropdown" ref={profileControlsRef}>
                <label htmlFor="background-upload" className="change-background-btn">
                  Change Background
                </label>
                <button 
                  className="change-background-btn" 
                  onClick={() => {
                    const newName = prompt("Enter your name:", formData.name);
                    if (newName) {
                      const newHeader = prompt("Enter your header text:", formData.header);
                      if (newHeader) {
                        setFormData(prev => ({
                          ...prev,
                          name: newName,
                          header: newHeader
                        }));
                      }
                    }
                  }}
                >
                  Change Name & Header
                </button>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="change-background-btn"
                >
                  <option value="Sleek">Sleek Template</option>
                  <option value="Professional">Professional Template</option>
                  <option value="Serene">Serene Template</option>
                </select>
                <div className="theme-color-picker" style={{ margin: 0 }}>
                  <label htmlFor="theme-color">Theme Color</label>
                  <input
                    type="color"
                    id="theme-color"
                    value={formData.themeColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, themeColor: e.target.value }))}
                    style={{ width: "40px", height: "40px", margin: 0 }}
                  />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  id="background-upload"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) setFormData({ ...formData, backgroundPhoto: file });
                  }}
                  style={{ display: "none" }}
                />
              </div>
            )}
          </div>

          {/* Quick Actions at the top */}
          <div className="sidebar-category">
            <button className="save-profile-btn" onClick={handleSaveProfile} type="button">
              Save Profile
            </button>

            <Link to={`/user/${id}`} className="block-option view-public-button" style={{ marginTop: "8px", textAlign: "center", display: "block" }}>
              View Public Profile
            </Link>

            <Link to="/generate" className="block-option enhance-ai-button" style={{ marginTop: 12 }}>
              <span className="enhance-ai-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21M12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21M12 3V21M21 12H3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M19.5 12C19.5 16.1421 16.1421 19.5 12 19.5C7.85786 19.5 4.5 16.1421 4.5 12C4.5 7.85786 7.85786 4.5 12 4.5C16.1421 4.5 19.5 7.85786 19.5 12Z" stroke="currentColor" strokeWidth="1.5"/>
                  <circle cx="12" cy="12" r="1" fill="currentColor"/>
                </svg>
              </span>
              <span>Enhance with AI</span>
              <span className="enhance-ai-glow"></span>
            </Link>
          </div>

          {/* Block categories below */}
          {Object.keys(blockCategories).map((category) => (
            <div key={category} className="sidebar-category">
              <div className="sidebar-category-title">{category}</div>
              <div className="block-options-container">
                {getBlocksByCategory(category).map((block) => (
                  <div
                    key={block.type}
                    className={`block-option ${selectedBlock === block.type ? "selected" : ""}`}
                    draggable
                    data-tooltip={block.tooltip}
                    onDragStart={(e) => {
                      setDraggedBlockType(block.type);
                      setIsDragging(true);
                      e.dataTransfer.setData("block-type", block.type);
                    }}
                    onDragEnd={() => {
                      setIsDragging(false);
                      setDraggedBlockType(null);
                    }}
                    onClick={() => {
                      const newBlock = {
                        id: generateUniqueBlockId(),
                        type: block.type,
                        content: getDefaultBlockContent(block.type)
                      };
                      updateBlocksForActivePage([...blocksList, newBlock]);
                      setSelectedBlock(block.type);
                      setTimeout(() => setSelectedBlock(null), 1000);
                    }}
                  >
                    {block.label}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </aside>

        {/* Vertical right-side page navigation */}
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
          <div
            className="vertical-page-nav-add"
            title="Add Page"
            onClick={() => {
              const newId = `page-${Date.now()}`;
              setPages(prevPages => {
                const updated = [...prevPages, { id: newId, name: "New Page", blocks: [] }];
                setTimeout(() => handlePageClick(newId), 100);
                return updated;
              });
            }}
            style={{
              marginTop: '24px',
              fontSize: '28px',
              color: '#fff',
              opacity: 0.7,
              cursor: 'pointer',
              userSelect: 'none',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = 1}
            onMouseLeave={e => e.currentTarget.style.opacity = 0.7}
          >
            +
          </div>
        </nav>

        <main
          className="profile-editor"
          style={{
            backgroundColor: (activePage && (activePage.color || formData.themeColor)) + '80'
          }}
        >
          {renderHeaderTemplate()}
          <div className="main-content">
            {pages.map((page, idx) => (
              <div 
                key={page.id} 
                id={`page-${page.id}`}
                className="page-section"
                style={{ 
                  minHeight: '100vh',
                  padding: '0',
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  backgroundColor: `${page.color || formData.themeColor}`,
                  opacity: 1,
                  position: 'relative',
                  zIndex: 10 + idx,
                }}
              >
                <div className="page-gradient-overlay" />
                <div className="page-side-gradient-overlay" />
                <div style={{ position: 'absolute', top: 18, left: 24, zIndex: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <label htmlFor={`color-picker-${page.id}`} style={{ color: '#fff', fontSize: 20, fontWeight: 500, marginRight: 6 }}>Page Color</label>
                  <input
                    id={`color-picker-${page.id}`}
                    type="color"
                    value={page.color || formData.themeColor}
                    onChange={e => {
                      const newColor = e.target.value;
                      setPages(pages.map(p => p.id === page.id ? { ...p, color: newColor } : p));
                    }}
                    style={{ width: 43, height: 32, border: '1px solid #000000', borderRadius: 6, background: 'rgba(30,30,30,0.7)', cursor: 'pointer', padding: 0 }}
                  />
                </div>
                <div className="page-inner-content" style={{ padding: '0 100px', width: '100%', boxSizing: 'border-box' }}>
                  {/* X button for deleting page, not shown for the first page */}
                  {idx !== 0 && (
                    <button
                      className="page-delete-btn"
                      title="Delete Page"
                      onClick={() => {
                        setPages(pages.filter((p) => p.id !== page.id));
                      }}
                    >
                      <span className="delete-x">×</span>
                      <span className="delete-label">delete whole page</span>
                    </button>
                  )}
                  <div className="page-header" style={{ marginBottom: '40px', textAlign: 'center' }}>
                    <input
                      type="text"
                      value={page.name}
                      onChange={e => handleRenamePage(page.id, e.target.value)}
                      className="page-title-input"
                      style={{
                        color: '#fff',
                        fontSize: '2.8rem',
                        fontWeight: 700,
                        background: 'none',
                        border: 'none',
                        outline: 'none',
                        textAlign: 'center',
                        width: '100%',
                        marginBottom: '16px',
                        marginTop: '8px',
                        letterSpacing: '0.01em',
                        padding: 0,
                        borderRadius: '8px',
                        boxShadow: 'none',
                      }}
                      maxLength={40}
                    />
                  </div>
                  {/* Render HighlightsBar inside the Main page */}
                  {page.id === 'main' && (
                    <div className="highlights-section" style={{ marginBottom: '32px' }}>
                      <HighlightsBar
                        highlights={formData.highlights}
                        newHighlight={newHighlight}
                        setNewHighlight={setNewHighlight}
                        onAdd={handleAddHighlight}
                        onRemove={handleRemoveHighlight}
                      />
                    </div>
                  )}
                  <div className="blocks-list">
                    <BlockDropZone
                      blocks={page.blocks}
                      draggedBlockType={draggedBlockType}
                      renderBlock={renderBlock}
                      isDragging={isDragging}
                      onInsertBlock={(type, index) => {
                        const updated = [...page.blocks];
                        if (!type) {
                          updated.splice(index, 1);
                        } else {
                          const newBlock = {
                            id: generateUniqueBlockId(),
                            type,
                            content: getDefaultBlockContent(type),
                          };
                          while (updated.length < index) updated.push(null);
                          updated.splice(index, 0, newBlock);
                        }
                        const updatedPages = pages.map(p => 
                          p.id === page.id ? { ...p, blocks: updated } : p
                        );
                        setPages(updatedPages);
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
      <OnboardingCarousel
        show={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onProfileSetup={async (userInfo) => {
          // Send onboarding data to backend
          try {
            const token = localStorage.getItem("token");
            if (!token) return;
            const payload = {
              template: userInfo.template, // use the value from onboarding
              themeColor: userInfo.themeColor, // use the value from onboarding
              onboarding: true
            };
            const res = await fetch(`${API_URLS.baseURL}/api/me`, {
              method: "PATCH",
              headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify(payload)
            });
            if (res.ok) {
              setSelectedTemplate(userInfo.template); // update local state
              setFormData(prev => ({ ...prev, themeColor: userInfo.themeColor })); // update local state
              setUserOnboarding(true);
            } else {
              const err = await res.text();
              alert("Failed to update onboarding: " + err);
            }
          } catch (err) {
            alert("Failed to update onboarding: " + err.message);
          }
        }}
        onGenerateAI={() => { setShowOnboarding(false); navigate("/resume-to-webpage"); }}
      />
    </>
  );
};

export default EditProfile;