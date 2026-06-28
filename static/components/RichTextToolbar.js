const { useEffect, useState } = React;

window.RichTextToolbar = ({ 
  activeElementId, 
  onUndo, 
  onRedo, 
  canUndo, 
  canRedo 
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0, visible: false });

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
        setPosition(prev => ({ ...prev, visible: false }));
        return;
      }

      // Check if selection is inside an editable element
      let node = selection.anchorNode;
      let isEditable = false;
      while (node) {
        if (node.nodeType === 1 && (node.hasAttribute("contenteditable") || node.classList.contains("preview-editable-element"))) {
          isEditable = true;
          break;
        }
        node = node.parentNode;
      }

      if (!isEditable) {
        setPosition(prev => ({ ...prev, visible: false }));
        return;
      }

      // Get bounding box of selection
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      // Calculate float toolbar location relative to viewport (fixed positioning)
      setPosition({
        top: rect.top - 45,
        left: rect.left + rect.width / 2,
        visible: true
      });
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => document.removeEventListener("selectionchange", handleSelectionChange);
  }, []);

  const format = (command, value = null) => {
    document.execCommand(command, false, value);
  };

  if (!position.visible) return null;

  return (
    <div 
      className="rich-text-floating-toolbar"
      style={{
        position: "fixed",
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: "translateX(-50%) translateY(-100%)",
        background: "rgba(15, 23, 42, 0.95)",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(255, 255, 255, 0.15)",
        borderRadius: "8px",
        padding: "0.35rem 0.5rem",
        display: "flex",
        alignItems: "center",
        gap: "0.25rem",
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
        zIndex: 10000,
        pointerEvents: "auto",
        transition: "opacity 0.2s, transform 0.2s"
      }}
    >
      <button onClick={() => format("bold")} style={btnStyle} title="Bold (Ctrl+B)"><b>B</b></button>
      <button onClick={() => format("italic")} style={btnStyle} title="Italic (Ctrl+I)"><i>I</i></button>
      <button onClick={() => format("underline")} style={btnStyle} title="Underline (Ctrl+U)"><u>U</u></button>
      
      <div style={separatorStyle} />

      <button onClick={() => format("justifyLeft")} style={btnStyle} title="Align Left">Align L</button>
      <button onClick={() => format("justifyCenter")} style={btnStyle} title="Align Center">Align C</button>
      
      <div style={separatorStyle} />

      <button onClick={() => format("insertUnorderedList")} style={btnStyle} title="Bullet List">List •</button>
      
      <div style={separatorStyle} />

      {/* Color Picker */}
      <input 
        type="color" 
        onChange={(e) => format("foreColor", e.target.value)} 
        style={{ width: "20px", height: "20px", padding: 0, border: "none", cursor: "pointer", background: "transparent" }} 
        title="Text Color"
      />
    </div>
  );
};

const btnStyle = {
  background: "transparent",
  border: "none",
  color: "#ffffff",
  fontSize: "0.72rem",
  fontWeight: "600",
  padding: "0.25rem 0.4rem",
  borderRadius: "4px",
  cursor: "pointer",
  transition: "background 0.2s",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: "22px",
  minHeight: "22px"
};

const separatorStyle = {
  width: "1px",
  height: "14px",
  background: "rgba(255, 255, 255, 0.2)",
  margin: "0 0.15rem"
};
