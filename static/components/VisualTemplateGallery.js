const { useState } = React;

window.VisualTemplateGallery = ({ 
  selectedTemplate, 
  setSelectedTemplate, 
  templatesList, 
  renderThumbnailMockup, 
  setIsPreviewModalOpen, 
  setIsDummyPreview, 
  setPreviewModalTemplate, 
  setZoomScale, 
  addToast 
}) => {
  const [filterCategory, setFilterCategory] = useState("all");

  const categories = ["all", "Professional", "Technical", "Executive", "Creative", "Minimal", "Academic"];

  // Filter templates list based on category
  const filteredTemplates = templatesList.map(tmpl => {
    // Dynamically assign category tags for rendering
    let category = "Professional";
    if (tmpl.name.includes("Modern")) category = "Modern";
    else if (tmpl.name.includes("Software") || tmpl.name.includes("Data")) category = "Technical";
    else if (tmpl.name.includes("Executive")) category = "Executive";
    else if (tmpl.name.includes("Creative")) category = "Creative";
    else if (tmpl.name.includes("Minimal")) category = "Minimal";
    else if (tmpl.name.includes("Student") || tmpl.name.includes("Academic")) category = "Academic";
    
    return { ...tmpl, category };
  }).filter(tmpl => filterCategory === "all" || tmpl.category.toLowerCase() === filterCategory.toLowerCase());

  return (
    <div className="glass-panel" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
        <h3 className="panel-title" style={{ margin: 0 }}>
          <span className="panel-title-text">📄 Professional Template Gallery</span>
        </h3>
        
        {/* Category Filters */}
        <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap" }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className="btn-secondary"
              style={{
                padding: "0.25rem 0.5rem",
                fontSize: "0.7rem",
                borderRadius: "20px",
                background: filterCategory === cat ? "var(--color-primary)" : "",
                color: filterCategory === cat ? "#ffffff" : "",
                border: filterCategory === cat ? "none" : "",
                minHeight: "auto"
              }}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Template Cards Grid */}
      <div className="template-gallery-grid" style={{ display: "flex", gap: "1rem", overflowX: "auto", paddingBottom: "0.75rem", scrollBehavior: "smooth" }} className="scroll-x-styled">
        {filteredTemplates.map(tmpl => (
          <div 
            key={tmpl.name} 
            className={`template-card-premium ${selectedTemplate === tmpl.name ? "active" : ""}`}
            style={{ 
              flex: "0 0 210px", 
              position: "relative", 
              display: "flex", 
              flexDirection: "column",
              padding: "0.75rem",
              borderRadius: "10px",
              border: selectedTemplate === tmpl.name ? "2px solid var(--color-primary)" : "1px solid var(--card-border)",
              cursor: "pointer",
              background: "#ffffff",
              transition: "transform 0.2s, box-shadow 0.2s"
            }}
            onClick={() => {
              setSelectedTemplate(tmpl.name);
              addToast(`Applied style: ${tmpl.name}`, "success");
            }}
          >
            <div style={{ background: tmpl.accent, height: "4px", width: "100%", position: "absolute", top: 0, left: 0, borderTopLeftRadius: "8px", borderTopRightRadius: "8px" }} />
            
            {/* Visual Miniature Mockup Preview */}
            <div className="template-thumbnail-mock" style={{ 
              height: "110px", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              background: "#f8fafc", 
              borderRadius: "6px", 
              marginBottom: "0.5rem", 
              overflow: "hidden", 
              border: "1px solid #e2e8f0",
              marginTop: "0.25rem"
            }}>
              {renderThumbnailMockup(tmpl.name)}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.25rem" }}>
              <div style={{ fontWeight: "700", fontSize: "0.82rem", color: "var(--color-text-main)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "120px" }}>{tmpl.name}</div>
              <span style={{ fontSize: "0.55rem", fontWeight: "700", padding: "0.1rem 0.35rem", borderRadius: "99px", background: "rgba(16, 185, 129, 0.08)", color: "#047857" }}>
                ATS Friendly
              </span>
            </div>
            
            <div style={{ display: "flex", gap: "0.25rem", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.58rem", background: "#f1f5f9", padding: "0.1rem 0.35rem", borderRadius: "4px", color: "var(--color-text-muted)" }}>
                🏷️ {tmpl.category}
              </span>
            </div>

            <p style={{ fontSize: "0.68rem", color: "var(--color-text-muted)", margin: "0 0 0.5rem 0", lineHeight: "1.25", flexGrow: 1 }}>
              {tmpl.bestFor}
            </p>
            
            <div style={{ display: "flex", gap: "0.25rem", marginTop: "auto" }}>
              <button 
                className="btn-secondary" 
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewModalTemplate(tmpl.name);
                  setIsDummyPreview(true);
                  setZoomScale(1.0);
                  setIsPreviewModalOpen(true);
                }}
                style={{ padding: "0.25rem 0.4rem", fontSize: "0.68rem", flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.15rem", minHeight: "auto" }}
              >
                🎨 Demo
              </button>
              <button 
                className="btn-primary" 
                style={{ padding: "0.25rem 0.4rem", fontSize: "0.68rem", flex: 1.2, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "auto" }}
              >
                {selectedTemplate === tmpl.name ? "✓ Active" : "Apply"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
