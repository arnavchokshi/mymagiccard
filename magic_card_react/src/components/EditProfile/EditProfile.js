import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { API_URLS } from "../../config";
import OnboardingCarousel from "./OnboardingCarousel";

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
    header: "Hello, my name is Your Name! Contact me at your.email@example.com"
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
  const [themeColor, setThemeColor] = useState(
    localStorage.getItem('themeColor') || '#b3a369' // default gold
  );

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

  // Update the CSS variable and localStorage when themeColor changes
  useEffect(() => {
    document.documentElement.style.setProperty('--primary-neon', themeColor);
    localStorage.setItem('themeColor', themeColor);
  }, [themeColor]);

  // Load themeColor from user profile if available
  useEffect(() => {
    if (formData && formData.themeColor) {
      setThemeColor(formData.themeColor);
    }
  }, [formData.themeColor]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.log("No token found, showing onboarding");
          setShowOnboarding(true);
          return;
        }

        const res = await fetch(API_URLS.profile, {
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (res.ok) {
          const data = await res.json();
          setFormData({
            name: data.name || "",
            email: data.email || "",
            highlights: Array.isArray(data.highlights) ? data.highlights : [],
            backgroundPhoto: data.backgroundPhoto || "",
            header: data.header || "Hello, my name is Your Name! Contact me at your.email@example.com",
            themeColor: data.themeColor || '#b3a369', // load from backend if available
          });
          if (Array.isArray(data.pages)) {
            setPages(data.pages);
            setActivePageId(data.activePageId || "main");
          }
          setShowOnboarding(true);
        } else {
          console.log("Profile fetch failed, showing onboarding");
          // If profile fetch fails, still show onboarding
          setShowOnboarding(true);
          // Set default empty state
          setPages([{ id: "main", name: "Main", blocks: [] }]);
          setActivePageId("main");
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
        setPages([{ id: "main", name: "Main", blocks: [] }]);
        setActivePageId("main");
        setShowOnboarding(true);
      }
    };

    fetchProfile();

    setTimeout(() => {
      setSidebarActive(true);
    }, 100);
  }, []);

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
      form.append("pages", JSON.stringify({ pages, activePageId }));
      form.append("blocksList", JSON.stringify(blocksList));

      if (formData.backgroundPhoto instanceof File) {
        form.append("backgroundPhoto", formData.backgroundPhoto);
      } else if (typeof formData.backgroundPhoto === "string") {
        form.append("backgroundPhotoUrl", formData.backgroundPhoto);
      }

      // Save themeColor to backend
      form.append("themeColor", themeColor);

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

  return (
    <>
      {showOnboarding && (
        <OnboardingCarousel onClose={() => setShowOnboarding(false)} />
      )}
      <div className="fixed-page-tabs-bar">
        <label htmlFor="background-upload" className="change-background-btn" style={{ margin: '0 24px 0 0', position: 'static' }}>
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
          style={{ margin: '0 24px 0 0', position: 'static' }}
        >
          Change Name & Header
        </button>
        {/* Theme color picker */}
        <input
          type="color"
          value={themeColor}
          onChange={e => setThemeColor(e.target.value)}
          style={{ marginLeft: 16, width: 40, height: 40, border: 'none', background: 'none', cursor: 'pointer' }}
          title="Pick your theme color"
        />
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
        <div className={`bar-username${showNameInBar ? " visible" : ""}`}>{formData.name}</div>
        <div style={{ flex: 1 }} />
        <PageTabs
          pages={pages}
          activePageId={activePageId}
          onSwitchPage={setActivePageId}
          onAddPage={() => {
            const newId = `page-${Date.now()}`;
            setPages([...pages, { id: newId, name: "New Page", blocks: [] }]);
            setActivePageId(newId);
          }}
          onRenamePage={handleRenamePage}
        />
      </div>
      <div className="edit-page">
        <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
          ☰ {/* Hamburger Icon */}
        </button>
        <aside className={`sidebar ${sidebarActive ? "active" : ""} ${isSidebarOpen ? "open" : ""}`}>
          <div className="sidebar-header">
            <h2>Editor Tools</h2>
          </div>

          <div className="sidebar-category">
            <div className="sidebar-category-title">Quick Actions</div>
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

        <main className="profile-editor">
          <div
            className="profile-header-background"
            style={{
              backgroundImage: formData.backgroundPhoto
                ? `url(${formData.backgroundPhoto instanceof File ? URL.createObjectURL(formData.backgroundPhoto) : formData.backgroundPhoto})`
                : `url('/defaultBackground.jpg')`,
            }}
          >
            <div className="profile-header-overlay">
              <div className="fancy-header-center" ref={headerRef}>
                <h1 className="fancy-header-name">
                  {formData.name || "Your Name"}
                </h1>
                <div className="fancy-header-subtitle">
                  <span className="typewriter-text">
                    {formData.header || "Currently @ ..."}
                  </span>
                </div>
                <div className="down-arrow-anim">
                  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 10V26" stroke="#b3a369" strokeWidth="2.5" strokeLinecap="round"/>
                    <path d="M11 19L18 26L25 19" stroke="#b3a369" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          <div className="main-content">
            <HighlightsBar
              highlights={formData.highlights}
              newHighlight={newHighlight}
              setNewHighlight={setNewHighlight}
              onAdd={handleAddHighlight}
              onRemove={handleRemoveHighlight}
            />

          <div className="divider-line" />

          <div className="blocks-list">
            <BlockDropZone
              blocks={blocksList}
              draggedBlockType={draggedBlockType}
              renderBlock={renderBlock}
              isDragging={isDragging}
              onInsertBlock={(type, index) => {
                const updated = [...blocksList];
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
                updateBlocksForActivePage(updated);
              }}
            />
          </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default EditProfile;