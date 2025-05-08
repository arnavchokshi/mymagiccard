import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const MAX_HIGHLIGHTS = 5;

const EditProfile = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    github: "",
    linkedin: "",
    profilePhoto: null,
    highlights: [],
    blocks: [],
  });
  const [newHighlight, setNewHighlight] = useState({ category: "", label: "" });
  const [newBlock, setNewBlock] = useState({ type: "text", content: "" });

  useEffect(() => {
    fetch(`http://localhost:2000/api/public/${id}`)
      .then(res => res.json())
      .then(data => setFormData({
        name: data.name || "",
        email: data.email || "",
        github: data.github || "",
        linkedin: data.linkedin || "",
        highlights: data.highlights || [],
        blocks: data.blocks || []
      }))
      .catch(err => console.error("Failed to load profile:", err));
  }, [id]);

  const handleFieldChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addHighlight = () => {
    if (!newHighlight.label || !newHighlight.category) return;
    if (formData.highlights.length >= MAX_HIGHLIGHTS) return;

    setFormData(prev => ({
      ...prev,
      highlights: [...prev.highlights, newHighlight]
    }));
    setNewHighlight({ category: "", label: "" });
  };

  const removeHighlight = (index) => {
    setFormData(prev => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index)
    }));
  };

  const addBlock = async () => {
    if (newBlock.type === "pdf" && newBlock.file) {
      const fileData = new FormData();
      fileData.append("pdf", newBlock.file);
  
      try {
        const res = await fetch("http://localhost:2000/api/upload-pdf", {
          method: "POST",
          body: fileData
        });
  
        const data = await res.json();
        if (res.ok && data.url) {
          const newOrder = formData.blocks.length;
          setFormData(prev => ({
            ...prev,
            blocks: [...prev.blocks, { type: "pdf", content: data.url, order: newOrder }]
          }));
        } else {
          alert("PDF upload failed.");
        }
      } catch (err) {
        console.error("Upload error:", err);
      }
    } else if (newBlock.content) {
      const newOrder = formData.blocks.length;
      setFormData(prev => ({
        ...prev,
        blocks: [...prev.blocks, { ...newBlock, order: newOrder }]
      }));
    }
  
    setNewBlock({ type: "text", content: "", file: null });
  };
  

  const removeBlock = (index) => {
    setFormData(prev => ({
      ...prev,
      blocks: prev.blocks.filter((_, i) => i !== index)
    }));
  };

  const saveProfile = async () => {
    const token = localStorage.getItem("token");
    const body = new FormData();
  
    // Append all form fields
    body.append("name", formData.name);
    body.append("email", formData.email);
    body.append("github", formData.github);
    body.append("linkedin", formData.linkedin);
  
    if (formData.profilePhoto) {
      body.append("profilePhoto", formData.profilePhoto);
    }
  
    body.append("highlights", JSON.stringify(formData.highlights));
    body.append("blocks", JSON.stringify(formData.blocks));
  
    try {
      const res = await fetch("http://localhost:2000/api/setup", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body
      });
  
      const result = await res.json();
  
      if (res.ok) {
        alert("Profile saved!");
        // ✅ Redirect to public profile
        window.location.href = `/user/${id}`;
      } else {
        alert("Save failed: " + result.message);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Something went wrong.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-6">
      <h1 className="text-2xl font-bold">Edit Profile</h1>

      {/* Contact Info */}
      <div className="space-y-3">
        <input name="name" placeholder="Name" value={formData.name} onChange={handleFieldChange} />
        <input name="email" placeholder="Email" value={formData.email} onChange={handleFieldChange} />
        <input name="github" placeholder="GitHub" value={formData.github} onChange={handleFieldChange} />
        <input name="linkedin" placeholder="LinkedIn" value={formData.linkedin} onChange={handleFieldChange} />
      </div>

      {/* Highlights Section */}
      <div>
        <h2 className="text-lg font-semibold">Highlights ({formData.highlights.length}/5)</h2>
        <div>
          {formData.highlights.map((h, i) => (
            <div key={i}>
              <span>{h.label} ({h.category})</span>
              <button onClick={() => removeHighlight(i)}>❌</button>
            </div>
          ))}
        </div>
        <select
          value={newHighlight.category}
          onChange={(e) => setNewHighlight({ ...newHighlight, category: e.target.value })}
        >
          <option value="">Select Category</option>
          <option value="Academic">Academic</option>
          <option value="Professional">Professional</option>
          <option value="Personal Development">Personal Development</option>
          <option value="Extracurricular">Extracurricular</option>
          <option value="Technical">Technical</option>
        </select>
        <input
          placeholder="Highlight label"
          value={newHighlight.label}
          onChange={(e) => setNewHighlight({ ...newHighlight, label: e.target.value })}
        />
        <button onClick={addHighlight}>Add Highlight</button>
      </div>

      {/* Blocks Section */}
      <div>
        <h2 className="text-lg font-semibold">Content Blocks</h2>
        {formData.blocks.map((b, i) => (
          <div key={i} className="border p-2 my-2">
            <strong>{b.type}</strong>: {b.content.slice(0, 60)}...
            <button onClick={() => removeBlock(i)}>🗑️</button>
          </div>
        ))}
        <select value={newBlock.type} onChange={(e) => setNewBlock({ ...newBlock, type: e.target.value })}>
          <option value="text">Text</option>
          <option value="link">Link</option>
          <option value="pdf">PDF</option>
          <option value="code">Code</option>
          <option value="image">Image</option>
        </select>
        {newBlock.type === "pdf" ? (
        <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setNewBlock({ ...newBlock, file: e.target.files[0] })}
        />
        ) : (
        <input
            placeholder="Block content"
            value={newBlock.content}
            onChange={(e) => setNewBlock({ ...newBlock, content: e.target.value })}
        />
        )}

        <button onClick={addBlock}>Add Block</button>
      </div>

      {/* Save Button */}
      <div>
        <button onClick={saveProfile} className="bg-blue-600 text-white px-4 py-2 rounded">
          Save Profile
        </button>
      </div>

      <a href={`/user/${id}`} className="text-blue-600 underline">
        View Public Profile
        </a>

    </div>
  );
};

export default EditProfile;
