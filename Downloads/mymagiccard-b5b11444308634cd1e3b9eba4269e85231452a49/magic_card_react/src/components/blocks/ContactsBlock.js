import React from "react";
import "./ContactsBlock.css";

const ContactsBlock = ({ block, onChangeLine, onAddLine, onRemoveLine }) => {
  const handleChange = (index, field, value) => {
    if (onChangeLine) {
      onChangeLine(block.id, index, field, value);
    }
  };

  return (
    <div className="contacts-block">
      {Array.isArray(block.content) &&
        block.content.map((line, index) => (
          <div key={index} className="contact-line">
            <input
              type="text"
              className="contact-label-input"
              value={line.label || ""}
              onChange={(e) => handleChange(index, "label", e.target.value)}
              placeholder="Label"
            />
            <input
              type="text"
              className="contact-value-input"
              value={line.value || ""}
              onChange={(e) => handleChange(index, "value", e.target.value)}
              placeholder="Value"
            />
            <button
              className="remove-line"
              type="button"
              onClick={() => onRemoveLine(block.id, index)}
            >
              ×
            </button>
          </div>
        ))}
      <button
        className="add-line"
        type="button"
        onClick={() => onAddLine(block.id)}
      >
        + Add Line
      </button>
    </div>
  );
};

export default ContactsBlock;
