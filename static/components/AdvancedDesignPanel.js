const { useState } = React;

window.AdvancedDesignPanel = ({
  customization,
  updateCustomizationField,
  selectedTemplate
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="builder-accordion" style={{ border: "1px solid var(--card-border)", borderRadius: "8px", overflow: "hidden" }}>
      <div 
        className="builder-accordion-header"
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          background: "#F8FAFC", 
          padding: "0.65rem 0.85rem", 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          cursor: "pointer", 
          fontWeight: "700", 
          fontSize: "0.82rem" 
        }}
      >
        <span className="builder-accordion-title-container">
          <span className="builder-accordion-icon">⚙️</span>
          <span className="builder-accordion-title">Advanced Design & Layout Parameters</span>
        </span>
        <span className={`builder-accordion-arrow ${isOpen ? "expanded" : ""}`}>▼</span>
      </div>

      {isOpen && (
        <div className="builder-accordion-content" style={{ padding: "0.85rem", display: "flex", flexDirection: "column", gap: "1rem", borderTop: "1px solid var(--card-border)" }}>
          
          <div className="auth-field">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <label className="auth-label">🔤 Base Font Size</label>
              <span style={{ fontSize: "0.75rem", fontWeight: "bold" }}>{customization.fontSize || 9.5}pt</span>
            </div>
            <input 
              type="range" 
              min="8" 
              max="14" 
              step="0.5" 
              value={customization.fontSize || 9.5} 
              onChange={e => updateCustomizationField("fontSize", parseFloat(e.target.value))} 
              style={{ width: "100%", cursor: "pointer" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            <div className="auth-field">
              <label className="auth-label">🎨 Primary Color</label>
              <div style={{ display: "flex", gap: "0.35rem", alignItems: "center" }}>
                <input 
                  type="color" 
                  value={customization.primaryColor || "#0f172a"}
                  onChange={e => updateCustomizationField("primaryColor", e.target.value)}
                  style={{ width: "36px", height: "30px", border: "1px solid var(--card-border)", borderRadius: "4px", cursor: "pointer" }}
                />
                <span style={{ fontSize: "0.75rem", fontFamily: "monospace" }}>{customization.primaryColor || "#0f172a"}</span>
              </div>
            </div>
            <div className="auth-field">
              <label className="auth-label">✨ Accent Color</label>
              <div style={{ display: "flex", gap: "0.35rem", alignItems: "center" }}>
                <input 
                  type="color" 
                  value={customization.accentColor || "#2563eb"}
                  onChange={e => updateCustomizationField("accentColor", e.target.value)}
                  style={{ width: "36px", height: "30px", border: "1px solid var(--card-border)", borderRadius: "4px", cursor: "pointer" }}
                />
                <span style={{ fontSize: "0.75rem", fontFamily: "monospace" }}>{customization.accentColor || "#2563eb"}</span>
              </div>
            </div>
          </div>

          <div className="auth-field">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <label className="auth-label">📐 Page Margins</label>
              <span style={{ fontSize: "0.75rem", fontWeight: "bold" }}>{customization.marginSize !== undefined ? customization.marginSize : 54}px</span>
            </div>
            <input 
              type="range" 
              min="20" 
              max="100" 
              step="5" 
              value={customization.marginSize !== undefined ? customization.marginSize : 54} 
              onChange={e => updateCustomizationField("marginSize", parseInt(e.target.value))} 
              style={{ width: "100%", cursor: "pointer" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            <div className="auth-field">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <label className="auth-label">↕ Line Height</label>
                <span style={{ fontSize: "0.72rem", fontWeight: "bold" }}>{customization.lineSpacing || 1.15}</span>
              </div>
              <input 
                type="range" 
                min="1.0" 
                max="2.0" 
                step="0.05" 
                value={customization.lineSpacing || 1.15} 
                onChange={e => updateCustomizationField("lineSpacing", parseFloat(e.target.value))} 
                style={{ width: "100%", cursor: "pointer" }}
              />
            </div>
            <div className="auth-field">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <label className="auth-label">📦 Section Gap</label>
                <span style={{ fontSize: "0.72rem", fontWeight: "bold" }}>{customization.sectionSpacing !== undefined ? customization.sectionSpacing : 10}px</span>
              </div>
              <input 
                type="range" 
                min="5" 
                max="30" 
                step="1" 
                value={customization.sectionSpacing !== undefined ? customization.sectionSpacing : 10} 
                onChange={e => updateCustomizationField("sectionSpacing", parseInt(e.target.value))} 
                style={{ width: "100%", cursor: "pointer" }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            <div className="auth-field">
              <label className="auth-label">👤 Header Layout</label>
              <select 
                className="auth-input" 
                value={customization.headerLayout || "left"}
                onChange={e => updateCustomizationField("headerLayout", e.target.value)}
                style={{ fontSize: "0.8rem", height: "34px", minHeight: "auto" }}
              >
                <option value="left">Left Aligned Name</option>
                <option value="center">Centered Name</option>
                <option value="split">Split Details</option>
              </select>
            </div>
            <div className="auth-field">
              <label className="auth-label">🔲 Sidebar Layout</label>
              <select 
                className="auth-input" 
                value={customization.sidebarLayout || "left"}
                onChange={e => updateCustomizationField("sidebarLayout", e.target.value)}
                style={{ fontSize: "0.8rem", height: "34px", minHeight: "auto" }}
                disabled={selectedTemplate !== "Modern Professional" && selectedTemplate !== "Creative"}
              >
                <option value="left">Left Sidebar</option>
                <option value="right">Right Sidebar</option>
              </select>
            </div>
          </div>

          <div className="auth-field">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <label className="auth-label">🔎 Live Preview Scaling</label>
              <span style={{ fontSize: "0.72rem", fontWeight: "bold" }}>{customization.scale || 1.0}x</span>
            </div>
            <input 
              type="range" 
              min="0.7" 
              max="1.5" 
              step="0.05" 
              value={customization.scale || 1.0} 
              onChange={e => updateCustomizationField("scale", parseFloat(e.target.value))} 
              style={{ width: "100%", cursor: "pointer" }}
            />
          </div>

        </div>
      )}
    </div>
  );
};
