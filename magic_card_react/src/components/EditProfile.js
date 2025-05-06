import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const blockTypes = ["text", "link", "pdf", "image", "code"];

const EditProfile = () => {
  const { id } = useParams();
  const [blocks, setBlocks] = useState([]);
  const [newType, setNewType] = useState("text");
  const [isLoading, setIsLoading] = useState(true);

  const fetchBlocks = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`http://localhost:2000/api/${id}/blocks`);
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      const data = await res.json();
      console.log("Fetched blocks:", data);
      // Make sure blocks is always treated as an array
      const blocksArray = Array.isArray(data) ? data : [];
      setBlocks(blocksArray);
    } catch (error) {
      console.error("Failed to fetch blocks:", error);
      setBlocks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateBlockContent = (index, content) => {
    const updatedBlocks = [...blocks];
    updatedBlocks[index].content = content;
    setBlocks(updatedBlocks);
  };

  const deleteBlock = async (index) => {
    try {
      const res = await fetch(`http://localhost:2000/api/${id}/blocks/${index}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      const data = await res.json();
      setBlocks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to delete block:", error);
      // Refresh blocks to ensure UI is in sync with server
      fetchBlocks();
    }
  };

  const addBlock = async () => {
    try {
      const res = await fetch(`http://localhost:2000/api/${id}/blocks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: newType, content: "" }),
      });
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      const data = await res.json();
      setBlocks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to add block:", error);
      // Refresh blocks to ensure UI is in sync with server
      fetchBlocks();
    }
  };

  const saveAllBlocks = async () => {
    try {
      for (let i = 0; i < blocks.length; i++) {
        const res = await fetch(`http://localhost:2000/api/${id}/blocks/${i}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(blocks[i]),
        });
        if (!res.ok) {
          throw new Error(`Failed to save block ${i}. Status: ${res.status}`);
        }
      }
      alert("All blocks saved successfully!");
    } catch (error) {
      console.error("Failed to save blocks:", error);
      alert("Failed to save some blocks. Please try again.");
    }
  };

  const getBlockBackground = (type) => {
    const colors = {
      text: "#f0f7ff",
      link: "#f0fff4",
      pdf: "#fff0f0",
      image: "#faf0ff",
      code: "#fffff0"
    };
    return colors[type] || "#f5f5f5";
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <h1 style={{ fontSize: "24px", marginBottom: "16px" }}>Edit Your Profile Blocks</h1>
      
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
        <div>
          <a 
            href={`/user/${id}`} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              padding: "8px 16px", 
              background: "#f5f5f5", 
              borderRadius: "4px", 
              textDecoration: "none", 
              color: "#333"
            }}
          >
            View Public Page
          </a>
        </div>
        <button 
          onClick={saveAllBlocks}
          style={{ 
            padding: "8px 16px", 
            background: "#4CAF50", 
            color: "white", 
            border: "none", 
            borderRadius: "4px", 
            cursor: "pointer"
          }}
        >
          Save All
        </button>
      </div>

      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <select 
          value={newType} 
          onChange={(e) => setNewType(e.target.value)}
          style={{ 
            padding: "8px 12px", 
            borderRadius: "4px", 
            border: "1px solid #ddd" 
          }}
        >
          {blockTypes.map((type) => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
        <button 
          onClick={addBlock}
          style={{ 
            padding: "8px 16px", 
            background: "#2196F3", 
            color: "white", 
            border: "none", 
            borderRadius: "4px", 
            cursor: "pointer"
          }}
        >
          Add Block
        </button>
        <button onClick={fetchBlocks} style={{ 
            padding: "8px 16px", 
            background: "#2196F3", 
            color: "white", 
            border: "none", 
            borderRadius: "4px", 
            cursor: "pointer"}} >Show Current Blocks</button>


      </div>

      {isLoading ? (
        <p>Loading blocks...</p>
      ) : blocks.length === 0 ? (
        <div style={{ 
          padding: "20px", 
          background: "#f9f9f9", 
          borderRadius: "4px", 
          textAlign: "center" 
        }}>
          <p>No blocks found. Add your first block using the button above.</p>
        </div>
      ) : (
        <div>
          {blocks.map((block, index) => (
            <div 
              key={index} 
              style={{ 
                marginBottom: "16px", 
                border: "1px solid #ddd", 
                borderRadius: "4px", 
                overflow: "hidden",
                background: getBlockBackground(block.type)
              }}
            >
              <div style={{ 
                padding: "12px", 
                borderBottom: "1px solid #eee",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#fff"
              }}>
                <strong>{block.type.toUpperCase()}</strong>
                <button 
                  onClick={() => deleteBlock(index)}
                  style={{ 
                    padding: "4px 8px", 
                    background: "#ff5252", 
                    color: "white", 
                    border: "none", 
                    borderRadius: "4px", 
                    cursor: "pointer" 
                  }}
                >
                  Delete
                </button>
              </div>
              <div style={{ padding: "12px" }}>
                <textarea
                  value={block.content || ""}
                  onChange={(e) => updateBlockContent(index, e.target.value)}
                  style={{ 
                    width: "100%", 
                    minHeight: "100px", 
                    padding: "8px", 
                    borderRadius: "4px", 
                    border: "1px solid #ddd",
                    boxSizing: "border-box"
                  }}
                  placeholder={`Enter ${block.type} content here...`}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EditProfile;