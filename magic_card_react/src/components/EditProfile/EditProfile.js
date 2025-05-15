import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";


// Blocks
import TextBlock from "../blocks/TextBlock";
import LinkBlock from "../blocks/LinkBlock";
import CodeBlock from "../blocks/CodeBlock";
import FlipBlock from "../blocks/FlipBlock";
import ContactsBlock from "../blocks/ContactsBlock";
import MultiBlock from "../blocks/MultiBlock";

// Layout Components
import HighlightsBar from "./HighlightsBar";
import PageTabs from "./PageTabs";
import BlockDropZone from "./BlockDropZone";

// Utilities
import { generateUniqueBlockId, getDefaultBlockContent } from "./utils";

const blockTypes = [
  { type: "text", label: "Text Block", tooltip: "Add simple text content" },
  { type: "link", label: "Link Block", tooltip: "Add a clickable link" },
  { type: "pdf", label: "PDF Block", tooltip: "Add PDF content" },
  { type: "image", label: "Image Block", tooltip: "Add an image" },
  { type: "code", label: "Code Block", tooltip: "Add code with syntax highlighting" },
  { type: "divider", label: "Divider Line", tooltip: "Add a visual separator" },
  { type: "contactsText", label: "Contacts Block", tooltip: "Add contact information" },
  { type: "flip", label: "Flip Block", tooltip: "Add flippable content" },
  { type: "multiBlock", label: "Multi Block", tooltip: "Combine multiple blocks" }
];

const blockCategories = {
  Content: ["text", "link", "pdf"],
  Media: ["image", "code"],
  Layout: ["divider", "flip", "multiBlock"],
  Info: ["contactsText"]
};

const EditProfile = () => {
  const { id } = useParams();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    highlights: [],
    profilePhoto: ""
  });

  const [pages, setPages] = useState([{ id: "main", name: "Main", blocks: [] }]);
  const [activePageId, setActivePageId] = useState("main");

  const [newHighlight, setNewHighlight] = useState({ label: "", category: "Academic" });
  const [draggedBlockType, setDraggedBlockType] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [blockToDelete, setBlockToDelete] = useState(null);
  const [sidebarActive, setSidebarActive] = useState(true);
  const [selectedBlock, setSelectedBlock] = useState(null);

  const activePage = pages.find((p) => p.id === activePageId) || pages[0];
  const blocksList = activePage ? activePage.blocks : [];

  const updateBlocksForActivePage = (newBlocks) => {
    const updated = pages.map((p) =>
      p.id === activePageId ? { ...p, blocks: newBlocks } : p
    );
    setPages(updated);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`http://localhost:2000/api/public/${id}`);
        const data = await res.json();

        setFormData({
          name: data.name || "",
          email: data.email || "",
          highlights: Array.isArray(data.highlights) ? data.highlights : [],
          profilePhoto: data.profilePhoto || ""
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

    setTimeout(() => {
      setSidebarActive(true);
    }, 100);
  }, [id]);

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
      form.append("highlights", JSON.stringify(formData.highlights));
      form.append("pages", JSON.stringify({ pages, activePageId }));
      form.append("blocksList", JSON.stringify(blocksList));

      if (formData.profilePhoto instanceof File) {
        form.append("profilePhoto", formData.profilePhoto);
      } else if (typeof formData.profilePhoto === "string") {
        form.append("profilePhotoUrl", formData.profilePhoto);
      }

      const res = await fetch("http://localhost:2000/api/setup", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form
      });

      const result = await res.json();
      if (res.ok) alert("Profile saved!");
      else throw new Error(result.message || "Save failed");
    } catch (err) {
      alert(`Save failed: ${err.message}`);
    }
  };

  const getBlocksByCategory = (categoryName) => {
    const categoryTypes = blockCategories[categoryName] || [];
    return blockTypes.filter((block) => categoryTypes.includes(block.type));
  };

  return (
    <div className="edit-page">
      <aside className={`sidebar ${sidebarActive ? "active" : ""}`}>
        <div className="sidebar-header">
          <h2>Editor Tools</h2>
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

        <div className="sidebar-category">
          <div className="sidebar-category-title">Settings</div>
          <button className="save-profile-btn" onClick={handleSaveProfile} type="button">
            Save Profile
          </button>
          <Link to={`/user/${id}`} className="block-option view-public-button" style={{ marginTop: "8px", textAlign: "center", display: "block" }}>
            View Public Profile
          </Link>
        </div>
      </aside>

      <main className="profile-editor">
        <div
          className="profile-header-background"
          style={{
            backgroundImage: formData.profilePhoto
              ? `url(${formData.profilePhoto instanceof File ? URL.createObjectURL(formData.profilePhoto) : formData.profilePhoto})`
              : `url('/defaultBackground.jpg')`,
          }}
        >
          <div className="profile-header-overlay">
            <input
              type="file"
              accept="image/*"
              id="profile-upload"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) setFormData({ ...formData, profilePhoto: file });
              }}
              style={{ display: "none" }}
            />
            <div className="profile-text">
              <textarea
                className="code-input profile-name-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your Name"
              />
              <textarea
                className="code-input profile-email-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your.email@example.com"
              />
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

        <div className="blocks-list">
          <BlockDropZone
            blocks={blocksList}
            draggedBlockType={draggedBlockType}
            renderBlock={renderBlock}
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
  );
};

export default EditProfile;
