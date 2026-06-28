const { useState, useEffect, useRef } = React;

window.ResumeRuler = ({
  marginSize,
  setMarginSize,
  scale = 1.0
}) => {
  const rulerRef = useRef(null);
  const [isDraggingLeft, setIsDraggingLeft] = useState(false);
  const [isDraggingRight, setIsDraggingRight] = useState(false);

  // Ruler dimension markers (total width of letter page in standard display is about 800px scaled)
  const totalWidth = 800; 

  const handleMouseDownLeft = (e) => {
    e.preventDefault();
    setIsDraggingLeft(true);
  };

  const handleMouseDownRight = (e) => {
    e.preventDefault();
    setIsDraggingRight(true);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDraggingLeft && !isDraggingRight) return;
      if (!rulerRef.current) return;

      const rect = rulerRef.current.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left) / scale; // account for scaling zoom

      if (isDraggingLeft) {
        // Limit left margin from 20px to 150px
        const newMargin = Math.max(20, Math.min(150, Math.round(mouseX)));
        setMarginSize(newMargin);
      } else if (isDraggingRight) {
        // Limit right margin by subtracting mouse x from page width
        const newMargin = Math.max(20, Math.min(150, Math.round(totalWidth - mouseX)));
        setMarginSize(newMargin);
      }
    };

    const handleMouseUp = () => {
      setIsDraggingLeft(false);
      setIsDraggingRight(false);
    };

    if (isDraggingLeft || isDraggingRight) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingLeft, isDraggingRight, marginSize, scale]);

  const leftPosition = marginSize;
  const rightPosition = totalWidth - marginSize;

  return (
    <div 
      ref={rulerRef}
      className="resume-ruler-container"
      style={{
        position: "relative",
        height: "22px",
        width: "100%",
        background: "#e2e8f0",
        borderBottom: "1px solid #cbd5e1",
        userSelect: "none",
        boxSizing: "border-box"
      }}
    >
      {/* Visual tick marks */}
      <div style={{ display: "flex", width: "100%", height: "100%", position: "absolute", top: 0, left: 0, pointerEvents: "none" }}>
        {Array.from({ length: 16 }).map((_, i) => (
          <div 
            key={i} 
            style={{ 
              flex: 1, 
              borderLeft: "1px solid #cbd5e1", 
              height: i % 2 === 0 ? "10px" : "5px",
              fontSize: "7px",
              color: "#64748b",
              paddingLeft: "2px",
              lineHeight: "10px"
            }}
          >
            {i % 2 === 0 ? i : ""}
          </div>
        ))}
      </div>

      {/* Margin guides */}
      {/* Left Margin Slider Handle */}
      <div 
        onMouseDown={handleMouseDownLeft}
        style={{
          position: "absolute",
          left: `${leftPosition}px`,
          top: 0,
          width: "8px",
          height: "22px",
          background: "var(--color-primary)",
          cursor: "ew-resize",
          transform: "translateX(-50%)",
          zIndex: 10,
          borderRadius: "2px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
        title="Drag left margin"
      >
        <div style={{ width: "2px", height: "10px", background: "#ffffff" }} />
      </div>

      {/* Right Margin Slider Handle */}
      <div 
        onMouseDown={handleMouseDownRight}
        style={{
          position: "absolute",
          left: `${rightPosition}px`,
          top: 0,
          width: "8px",
          height: "22px",
          background: "var(--color-primary)",
          cursor: "ew-resize",
          transform: "translateX(-50%)",
          zIndex: 10,
          borderRadius: "2px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
        title="Drag right margin"
      >
        <div style={{ width: "2px", height: "10px", background: "#ffffff" }} />
      </div>

      {/* Printable Area Background */}
      <div 
        style={{
          position: "absolute",
          left: `${leftPosition}px`,
          right: `${totalWidth - rightPosition}px`,
          top: 0,
          bottom: 0,
          background: "rgba(255,255,255,0.7)",
          pointerEvents: "none",
          zIndex: 1
        }}
      />
    </div>
  );
};
