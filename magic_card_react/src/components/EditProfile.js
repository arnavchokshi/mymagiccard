// EditProfile.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./EditProfile.css";
import CodeBlock from "./CodeBlock";
import LinkBlock from "./LinkBlock";
import "./HeighlightBadge.css";
import FlipBlock from "./FlipBlock";

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
  
  const [pages, setPages] = useState([
    { id: "main", name: "Main", blocks: [] }
  ]);
  const [activePageId, setActivePageId] = useState("main");
  
  const [newHighlight, setNewHighlight] = useState({ label: "", category: "Academic" });
  const [draggedBlockType, setDraggedBlockType] = useState(null);
  const [showGridLines, setShowGridLines] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [useDualColumns, setUseDualColumns] = useState(false);

  const activePage = pages.find((p) => p.id === activePageId);
const blocksList = activePage ? activePage.blocks : [];

const updateBlocksForActivePage = (newBlocks) => {
    const updated = pages.map((p) =>
      p.id === activePageId ? { ...p, blocks: newBlocks } : p
    );
    setPages(updated);
  };
  

  useEffect(() => {
    fetch(`http://localhost:2000/api/public/${id}`)
      .then(res => res.json())
      .then(data => {
        setFormData({
          name: data.name || "",
          email: data.email || "",
          highlights: data.highlights || [],
          profilePhoto: data.profilePhoto || ""
        });
  
        const loadedBlocks = data.blocksList;

        if (Array.isArray(loadedBlocks)) {
            updateBlocksForActivePage(loadedBlocks);
        } else {
            updateBlocksForActivePage([]);
        }
      })
      .catch(err => {
        console.error("Failed to load profile:", err);
        updateBlocksForActivePage([]);
      });
  }, [id]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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

  const handleDragStart = (e, blockType) => {
    setDraggedBlockType(blockType);
    setIsDragging(true);
    e.dataTransfer.setData("block-type", blockType);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedBlockType(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('cell-drag-over');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('cell-drag-over');
  };

  const handleDrop = (e, dropIndex = blocksList.length, parentMultiBlockIndex = null) => {
    e.preventDefault();
    const blockType = e.dataTransfer.getData("block-type") || draggedBlockType;
    if (!blockType) return;
  
    const defaultContacts = [
      { label: "LinkedIn", value: "" },
      { label: "GitHub", value: "" },
      { label: "Instagram", value: "" }
    ];
  
    let content;

        if (blockType === "contactsText") {
        content = defaultContacts;
        } else if (blockType === "text") {
        content = { title: "", body: "" };
        } else if (blockType === "multiBlock") {
        content = []; // ✅ required for multiBlock
        } else {
        content = "";
        }

        const newBlock = {
        id: `block-${Date.now()}`,
        type: blockType,
        content
        };

  
    if (parentMultiBlockIndex !== null) {
      // Dropping inside a multiBlock
      const updated = [...blocksList];
      const parent = updated[parentMultiBlockIndex];
      parent.content = [...parent.content, newBlock];
      updated[parentMultiBlockIndex] = { ...parent };
      updateBlocksForActivePage(updated);
    } else {
      const updated = [...blocksList];
      updated.splice(dropIndex, 0, newBlock);
      updateBlocksForActivePage(updated);
    }
  
    setDraggedBlockType(null);
    setIsDragging(false);
  };
  

  const handleContentChange = (blockId, value) => {
    const updatedBlocks = blocksList.map(block => 
      block.id === blockId ? { ...block, content: value } : block
    );
    updateBlocksForActivePage(updatedBlocks);
  };

  const handleContactLineChange = (blockId, lineIndex, field, newValue) => {
    const updatedBlocks = blocksList.map(block => 
      block.id === blockId ? {
        ...block,
        content: block.content.map((line, i) => 
          i === lineIndex ? { ...line, [field]: newValue } : line
        )
      } : block
    );
    updateBlocksForActivePage(updatedBlocks);
  };

  const handleRemoveContactLine = (blockId, lineIndex) => {
    const updatedBlocks = blocksList.map(block =>
      block.id === blockId ? {
        ...block,
        content: block.content.filter((_, i) => i !== lineIndex)
      } : block
    );
    updateBlocksForActivePage(updatedBlocks);
  };

  const handleAddContactLine = (blockId) => {
    const updatedBlocks = blocksList.map(block =>
      block.id === blockId ? {
        ...block,
        content: [...block.content, { label: "New", value: "" }]
      } : block
    );
    updateBlocksForActivePage(updatedBlocks);
  };

  const handleRemoveBlock = (index) => {
    const updatedBlocks = [...blocksList];
    updatedBlocks.splice(index, 1);
    updateBlocksForActivePage(updatedBlocks);
  };

  const handleSaveProfile = async () => {
    const token = localStorage.getItem("token");
  
    const form = new FormData();
    form.append("name", formData.name);
    form.append("email", formData.email);
    form.append("highlights", JSON.stringify(formData.highlights));
    form.append("blocksList", JSON.stringify(blocksList));
  
    // Append profilePhoto if it's a File
    if (formData.profilePhoto instanceof File) {
      form.append("profilePhoto", formData.profilePhoto);
    }
  
    try {
      console.log("Submitting FormData with:");
      for (let [key, val] of form.entries()) {
        console.log(key, val);
      }
  
      const res = await fetch("http://localhost:2000/api/setup", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: form
      });
  
      const result = await res.json();
  
      if (res.ok) {
        alert("Profile saved!");
      } else {
        alert("Save failed: " + result.message);
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("An error occurred while saving.");
    }
  };

  const updateBlock = (index, newBlock) => {
    const updated = [...blocksList];
    updated[index] = newBlock;
    updateBlocksForActivePage(updated);
  };
  

  const renderMultiBlock = (block, parentIndex) => {
    const updateInner = (innerId, newContent) => {
      const updated = block.content.map(b =>
        b.id === innerId ? { ...b, content: newContent } : b
      );
      updateBlock(parentIndex, { ...block, content: updated });
    };
  
    const removeInner = (innerId) => {
      const updated = block.content.filter(b => b.id !== innerId);
      updateBlock(parentIndex, { ...block, content: updated });
    };
  
    return (
      <div
        className="multi-block-row"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, null, parentIndex)} // ✅ key line: drop into this block
      >
        {block.content.length === 0 && (
          <div className="drop-here-placeholder">Drop blocks here</div>
        )}
  
        {block.content.map((inner, i) => (
          <div key={inner.id} className="multi-inner-cell">
            <div className="block-header">
              <span className="block-type-label">{inner.type}</span>
              <button className="remove-block-btn" onClick={() => removeInner(inner.id)}>×</button>
            </div>
            <div className="block-content">
              {renderBlock(inner, i, true, updateInner)}
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  

  const renderBlock = (block, index) => {
    if (!block) return null;

    const blockContent = (
      <div className="block-content">
        {(() => {
          switch (block.type) {
            case "text": {
              const textMeta = typeof block.content === "object" ? block.content : {
                title: "",
                description: "",
                body: block.content || ""
              };
              const updateTextMeta = (field, value) => {
                const updated = { ...textMeta, [field]: value };
                handleContentChange(block.id, updated);
              };
              return (
                <div className="text-block-wrapper">
                  <textarea
                    className="block-title"
                    placeholder="Section Title (optional)"
                    value={textMeta.title}
                    onChange={(e) => updateTextMeta("title", e.target.value)}
                  />
                  <textarea
                    className="block-textarea"
                    placeholder="Write your main text here..."
                    value={textMeta.body}
                    onChange={(e) => updateTextMeta("body", e.target.value)}
                  />
                </div>
              );
            }
            case "link":
              return (
                <LinkBlock
                  block={block}
                  onChange={(newContent) => handleContentChange(block.id, newContent)}
                />
              );
            case "flip":
              return (
                <FlipBlock
                  block={block}
                  onChange={(newContent) => handleContentChange(block.id, newContent)}
                />
              );
            case "contactsText":
              return (
                <div className="contacts-block">
                  {block.content.map((line, i) => (
                    <div key={i} className="contact-line">
                      <input
                        type="text"
                        value={line.label}
                        onChange={(e) => handleContactLineChange(block.id, i, "label", e.target.value)}
                        className="contact-label-input"
                      />
                      <input
                        type="text"
                        value={line.value}
                        onChange={(e) => handleContactLineChange(block.id, i, "value", e.target.value)}
                        className="contact-value-input"
                      />
                      <button onClick={() => handleRemoveContactLine(block.id, i)} className="remove-line">×</button>
                    </div>
                  ))}
                  <button onClick={() => handleAddContactLine(block.id)} className="add-line">+ Add Line</button>
                </div>
              );
            case "code":
              return (
                <CodeBlock
                  content={block.content}
                  onChange={(newContent) => handleContentChange(block.id, newContent)}
                />
              );
            case "divider":
              return <div className="divider-line-block"></div>;
            case "multiBlock":
                return renderMultiBlock(block, index);
              
            default:
              return `${block.type.toUpperCase()} BLOCK`;
          }
        })()}
      </div>
    );

    return (
      <div className={`block-item block-${block.type}`}>
        <div className="block-header">
          <span className="block-type-label">{block.type}</span>
          <button className="remove-block-btn" onClick={() => handleRemoveBlock(index)}>×</button>
        </div>
        {blockContent}
      </div>
    );
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
              onDragStart={(e) => handleDragStart(e, b.type)}
              onDragEnd={handleDragEnd}
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
      </aside>
      

      <main className="profile-editor">
        <div className="profile-header">
          <div className="profile-pic-wrapper">
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
                  console.log("File selected:", file);
                  setFormData({ ...formData, profilePhoto: file });
                }}
                style={{ display: "none" }}
              />
            </label>
          </div>
          <div className="profile-name">{formData.name}</div>
          <div className="profile-email">{formData.email}</div>
        </div>

        <div className="highlights-row">
          {formData.highlights.map((h, i) => (
            <div key={i} className={`highlight-badge ${h.category.toLowerCase().replace(/\s+/g, '-')}`}>
              <span>{h.label} ({h.category})</span>
              <button
                className="remove-btn"
                onClick={() => handleRemoveHighlight(i)}
              >
                ×
              </button>
            </div>
          ))}
          <input
            type="text"
            className="highlight-input"
            placeholder="Highlight label..."
            value={newHighlight.label}
            onChange={(e) => setNewHighlight({ ...newHighlight, label: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && handleAddHighlight()}
          />
          <select
            value={newHighlight.category}
            onChange={(e) => setNewHighlight({ ...newHighlight, category: e.target.value })}
            className="highlight-input"
          >
            <option value="Academic">Academic</option>
            <option value="Professional">Professional</option>
            <option value="Personal Development">Personal Development</option>
            <option value="Extracurricular">Extracurricular</option>
            <option value="Technical">Technical</option>
          </select>
        </div>

        

        <div className="divider-line"></div>

        <div className="page-tabs">
  {pages.map((page) => (
    <button
      key={page.id}
      className={`page-tab ${page.id === activePageId ? 'active' : ''}`}
      onClick={() => setActivePageId(page.id)}
    >
      {page.name}
    </button>
  ))}
  <button
    className="add-page-btn"
    onClick={() => {
      const newId = `page-${Date.now()}`;
      setPages([...pages, { id: newId, name: "New Page", blocks: [] }]);
      setActivePageId(newId);
    }}
  >
    + Add Page
  </button>
</div>


        <div className={`blocks-list ${showGridLines ? 'show-grid-lines' : ''}`}>
          {blocksList.map((block, index) => (
            <div
              key={block.id || index}
              className={`grid-cell ${block ? 'has-block' : 'empty-cell'}`}
              onDragOver={(e) => handleDragOver(e)}
              onDragLeave={(e) => handleDragLeave(e)}
              onDrop={(e) => handleDrop(e, index)}
            >
              {renderBlock(block, index)}
            </div>
          ))}
          {/* final drop zone at the end */}
          <div
            className="grid-cell empty-cell"
            onDragOver={(e) => handleDragOver(e)}
            onDragLeave={(e) => handleDragLeave(e)}
            onDrop={(e) => handleDrop(e)}
          >
            <div className="drop-here-placeholder">Drop Here</div>
          </div>
        </div>

        <button className="save-profile-btn" onClick={handleSaveProfile}>
          Save Profile
        </button>
      </main>
    </div>
  );
};

export default EditProfile;