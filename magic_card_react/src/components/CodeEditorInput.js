// src/CodeEditorInput.js
import React from "react";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import "prismjs/components/prism-jsx.min";
import "prismjs/themes/prism-tomorrow.css"; // Or another Prism theme

const highlight = (code) =>
  Prism.highlight(code, Prism.languages.jsx, "jsx");

const CodeEditorInput = ({ value, onChange, placeholder }) => {
  return (
    <Editor
      value={value}
      onValueChange={onChange}
      highlight={highlight}
      padding={10}
      placeholder={placeholder}
      style={{
        fontFamily: '"Fira Code", monospace',
        fontSize: 16,
        backgroundColor: "rgba(30, 30, 30, 0.8)",
        border: "1px solid #b3a369",
        borderRadius: "6px",
        color: "#f8f8f2",
        minHeight: 60,
        width: "100%",
        textAlign: "center",
      }}
    />
  );
};

export default CodeEditorInput;
