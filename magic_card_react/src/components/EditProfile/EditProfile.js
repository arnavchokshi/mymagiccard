import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./EditProfile.css";

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
  { type: "text", label: "Text Block" },
  { type: "link", label: "Link Block" },
  { type: "pdf", label: "PDF Block" },
  { type: "image", label: "Image Block" },
  { type: "code", label: "Code Block" },
  { type: "divider", label: "Divider Line" },
  { type: "contactsText", label: "Contacts Block" },
  { type: "flip", label: "Flip Block" },
  { type: "multiBlock", label: "Multi Block" }
];

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
  const [showGridLines, setShowGridLines] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [blockToDelete, setBlockToDelete] = useState(null);

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
    } else {
      updated.splice(dropIndex, 0, newBlock);
    }

    updateBlocksForActivePage(updated);
    setDraggedBlockType(null);
    setIsDragging(false);
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
          return (
            <div className="divider-line-only" />
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
    
    // After animation completes, actually remove the block
    setTimeout(() => {
      const updated = [...blocksList];
      updated.splice(index, 1);
      updateBlocksForActivePage(updated);
      setBlockToDelete(null);
    }, 500); // Match this with CSS animation duration
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
      form.append("blocksList", JSON.stringify(blocksList)); // backward compatibility

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

  return (
    <div className="edit-page">
      <aside className="sidebar">
        <div className="block-options-container">
          <h3>Block Types</h3>
          {blockTypes.map((b) => (
            <div
              key={b.type}
              className="block-option"
              draggable
              onDragStart={(e) => {
                setDraggedBlockType(b.type);
                setIsDragging(true);
                e.dataTransfer.setData("block-type", b.type);
              }}
              onDragEnd={() => {
                setIsDragging(false);
                setDraggedBlockType(null);
              }}
            >
              {b.label}
            </div>
          ))}
        </div>
        <div className="grid-controls">
          <label>
            <input
              type="checkbox"
              checked={showGridLines}
              onChange={() => setShowGridLines(!showGridLines)}
            />
            Show Grid Lines
          </label>
        </div>

        <button 
          className="save-profile-btn" 
          onClick={handleSaveProfile}
          type="button"
        >
          Save Profile
        </button>
      </aside>

      <main className="profile-editor">
        {/* Profile Header */}
        <div className="profile-header">
          <label htmlFor="profile-upload" className="profile-pic-label">
            <img
              src={
                formData.profilePhoto instanceof File
                  ? URL.createObjectURL(formData.profilePhoto)
                  : formData.profilePhoto || "/default-avatar.png"
              }
              alt="Profile"
              className="profile-pic"
            />
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
          </label>
          <div className="profile-info">
            <div className="profile-name">{formData.name}</div>
            <div className="profile-email">{formData.email}</div>
          </div>
        </div>

        {/* Highlights + Pages */}
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

<div className={`blocks-list ${showGridLines ? "show-grid-lines" : ""}`}>
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
          content: getDefaultBlockContent(type)
        };
        while (updated.length < index) updated.push(null);
        updated.splice(index, 0, newBlock);
      }
      updateBlocksForActivePage(updated);
    }}
  />
</div>


      </main>
    </div>
  );
};

export default EditProfile;