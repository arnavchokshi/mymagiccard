// src/components/CodeBlock.js
import React, { useState, useRef, useEffect } from "react";
import "./CodeBlock.css";

const CodeBlock = ({ content, onChange, readOnly }) => {
  const [code, setCode] = useState(content || "");
  const dropAreaRef = useRef(null);
  const editorRef = useRef(null);

  // Handle normal input changes
  const handleInput = (e) => {
    setCode(e.target.value);
    onChange?.(e.target.value);
  };

  // Handle drag events
  useEffect(() => {
    // Skip setting up drag events in readOnly mode
    if (readOnly) return;
    
    const dropArea = dropAreaRef.current;
    const editor = editorRef.current;

    const highlight = () => {
      dropArea.classList.add("highlight-drop");
    };

    const unhighlight = () => {
      dropArea.classList.remove("highlight-drop");
    };

    const handleDragOver = (e) => {
      e.preventDefault();
      highlight();
    };

    const handleDragLeave = () => {
      unhighlight();
    };

    const handleDrop = (e) => {
      e.preventDefault();
      unhighlight();
      
      // Process the dropped content
      if (e.dataTransfer.items) {
        // Use DataTransferItemList interface
        [...e.dataTransfer.items].forEach((item) => {
          if (item.kind === "file") {
            const file = item.getAsFile();
            const reader = new FileReader();
            reader.onload = (event) => {
              const fileContent = event.target.result;
              // Insert at cursor position or append
              if (document.activeElement === editor && editor.selectionStart !== undefined) {
                const cursorPos = editor.selectionStart;
                const textBefore = code.substring(0, cursorPos);
                const textAfter = code.substring(cursorPos);
                const newCode = textBefore + fileContent + textAfter;
                setCode(newCode);
                onChange(newCode);
              } else {
                // Just append if no specific position
                const newCode = code + fileContent;
                setCode(newCode);
                onChange(newCode);
              }
            };
            reader.readAsText(file);
          } else if (item.kind === "string" && item.type === "text/plain") {
            // Handle dragged text
            item.getAsString((str) => {
              if (document.activeElement === editor && editor.selectionStart !== undefined) {
                const cursorPos = editor.selectionStart;
                const textBefore = code.substring(0, cursorPos);
                const textAfter = code.substring(cursorPos);
                const newCode = textBefore + str + textAfter;
                setCode(newCode);
                onChange(newCode);
              } else {
                const newCode = code + str;
                setCode(newCode);
                onChange(newCode);
              }
            });
          }
        });
      }
    };

    // Add drag and drop event listeners
    dropArea.addEventListener("dragover", handleDragOver);
    dropArea.addEventListener("dragleave", handleDragLeave);
    dropArea.addEventListener("drop", handleDrop);

    // Clean up event listeners
    return () => {
      dropArea.removeEventListener("dragover", handleDragOver);
      dropArea.removeEventListener("dragleave", handleDragLeave);
      dropArea.removeEventListener("drop", handleDrop);
    };
  }, [code, onChange, readOnly]);

  // Handle paste events to also support copy-paste drops
  const handlePaste = (e) => {
    // Default paste behavior is usually fine, but you could
    // customize it here if needed
  };

  if (readOnly) {
    return (
      <div className="code-block-container readonly">
        <pre className="code-block-readonly">{code || ""}</pre>
        {code && (
          <iframe
            title="Live Preview"
            sandbox="allow-scripts allow-same-origin"
            srcDoc={code}
            className="code-block-preview"
          />
        )}
      </div>
    );
  }

  return (
    <div className="code-block-container" ref={dropAreaRef}>
      <div className="drop-instructions">
        <span>Drag and drop code blocks, files, or text here</span>
      </div>
      <textarea
        ref={editorRef}
        className="code-block-editor"
        value={code}
        onChange={handleInput}
        onPaste={handlePaste}
        placeholder="Write HTML/CSS/JS here or drop code blocks..."
      />
      <iframe
        title="Live Preview"
        sandbox="allow-scripts allow-same-origin"
        srcDoc={code}
        className="code-block-preview"
      />
    </div>
  );
};

export default CodeBlock;