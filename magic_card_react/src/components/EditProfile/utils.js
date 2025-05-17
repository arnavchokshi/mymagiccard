// Generate a unique ID for a new block
export const generateUniqueBlockId = () => {
  return `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Returns default content for a given block type
export const getDefaultBlockContent = (type) => {
  switch (type) {
    case "title":
      return { title: "Your Title", subtitle: "Your Subtitle" };
    case "contactsText":
      return [
        { label: "LinkedIn", value: "" },
        { label: "GitHub", value: "" },
        { label: "Instagram", value: "" }
      ];
    case "text":
      return { title: "", body: "" };
    case "multiBlock":
      return [];
    default:
      return "";
  }
};