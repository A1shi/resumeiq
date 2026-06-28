const { useState } = React;

window.AtsSuggestionsPanel = ({
  atsAnalysis,
  editedResume,
  setEditedResume,
  addToast,
  aiImproveResults,
  setAiImproveResults,
  onAiImprove,
  aiImproveLoading,
  updateCustomizationField,
  selectedTemplate,
  setSelectedTemplate
}) => {
  if (!atsAnalysis) {
    return (
      <div className="glass-panel" style={{ padding: "1.25rem", textAlign: "center" }}>
        <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", fontStyle: "italic" }}>
          No ATS audit data available. Upload or save your profile and run an audit first.
        </p>
      </div>
    );
  }

  const score = atsAnalysis.ats_score || 0;
  const missingKeywords = atsAnalysis.missing_keywords || [];
  const weaknesses = atsAnalysis.weaknesses || [];
  const recommendedSkills = atsAnalysis.recommended_skills || [];
  const scoreColor = score >= 80 ? "#10b981" : score >= 60 ? "#3b82f6" : score >= 40 ? "#f59e0b" : "#ef4444";

  // Calculate Resume Word Count & Estimated Page Count
  const calculateWordCount = () => {
    let text = "";
    if (editedResume.summary) text += " " + editedResume.summary;
    if (editedResume.experience) {
      editedResume.experience.forEach(exp => {
        if (exp.role) text += " " + exp.role;
        if (exp.company) text += " " + exp.company;
        if (exp.description) text += " " + exp.description;
      });
    }
    if (editedResume.projects) {
      editedResume.projects.forEach(proj => {
        if (proj.title) text += " " + proj.title;
        if (proj.description) text += " " + proj.description;
      });
    }
    if (editedResume.skills) text += " " + editedResume.skills.join(" ");
    return text.split(/\s+/).filter(Boolean).length;
  };

  const wordCount = calculateWordCount();
  const estimatedPages = Math.ceil(wordCount / 480);
  const isTooLong = wordCount > 550;

  // Handle one-click apply keyword to skills list
  const applyKeyword = (keyword) => {
    const currentSkills = editedResume.skills || [];
    if (!currentSkills.some(s => s.toLowerCase() === keyword.toLowerCase())) {
      setEditedResume(prev => ({
        ...prev,
        skills: [...(prev.skills || []), keyword]
      }));
      addToast(`Added skill: ${keyword}`, "success");
    } else {
      addToast("Skill is already present in your profile.", "info");
    }
  };

  // One-click apply all AI improvements
  const handleApplyAllAIImprovements = () => {
    if (!aiImproveResults) return;
    
    setEditedResume(prev => {
      let updated = { ...prev };
      
      // 1. Summary
      if (aiImproveResults.improvements?.improved_summary) {
        updated.summary_text = aiImproveResults.improvements.improved_summary;
      }
      
      // 2. Experience
      if (aiImproveResults.improvements?.improved_experience) {
        const newExp = (prev.experience || []).map(exp => {
          const match = aiImproveResults.improvements.improved_experience.find(
            ie => ie.role === exp.role && ie.company === exp.company
          );
          return match ? { ...exp, description: match.improved } : exp;
        });
        updated.experience = newExp;
      }
      
      // 3. Projects
      if (aiImproveResults.improvements?.improved_projects) {
        const newProj = (prev.projects || []).map(proj => {
          const match = aiImproveResults.improvements.improved_projects.find(
            ip => ip.title === proj.title
          );
          return match ? { ...proj, description: match.improved } : proj;
        });
        updated.projects = newProj;
      }
      
      // 4. Keyword Suggestions
      if (aiImproveResults.improvements?.keyword_suggestions) {
        const currentSkills = prev.skills || [];
        const toAdd = aiImproveResults.improvements.keyword_suggestions.filter(
          kw => !currentSkills.some(s => s.toLowerCase() === kw.toLowerCase())
        );
        updated.skills = [...currentSkills, ...toAdd];
      }
      
      return updated;
    });

    setAiImproveResults(null);
    addToast("Auto-applied all AI improved paragraphs & keywords!", "success");
  };

  // One-page compact layout auto-fit
  const handleAutofitCompact = () => {
    setSelectedTemplate("Compact One Page");
    updateCustomizationField("sectionSpacing", 6);
    updateCustomizationField("lineSpacing", 1.1);
    addToast("Applied Compact layout with tight line spacing to fit on 1 Page!", "success");
  };

  // Detailed Section Audits
  const sectionAudits = [
    { name: "Summary", score: atsAnalysis.summary_score ?? 100, elementId: "summary" },
    { name: "Experience", score: atsAnalysis.experience_score ?? 100, elementId: "experience" },
    { name: "Projects", score: atsAnalysis.projects_score ?? 100, elementId: "projects" },
    { name: "Skills", score: atsAnalysis.skills_score ?? 100, elementId: "skills" },
    { name: "Contact Info", score: atsAnalysis.contact_score ?? 100, elementId: "contact" }
  ];

  return (
    <div className="glass-panel" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem", height: "100%", overflowY: "auto", maxHeight: "80vh" }}>
      <h3 className="explanation-title" style={{ margin: 0, fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        🎯 ATS Resume Assistant
      </h3>

      {/* ATS Score Dials */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", background: "rgba(79, 70, 229, 0.03)", padding: "0.75rem", borderRadius: "10px", border: "1px solid var(--card-border)" }}>
        <div style={{ position: "relative", width: "55px", height: "55px" }}>
          <svg width="55" height="55" viewBox="0 0 60 60">
            <circle cx="30" cy="30" r="24" fill="transparent" stroke="#e2e8f0" strokeWidth="4" />
            <circle cx="30" cy="30" r="24" fill="transparent" stroke={scoreColor} strokeWidth="4" 
                    strokeDasharray={2 * Math.PI * 24} 
                    strokeDashoffset={2 * Math.PI * 24 - (score / 100) * 2 * Math.PI * 24} 
                    transform="rotate(-90 30 30)" />
            <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fontSize="13" fontWeight="bold" fill="var(--color-text-main)">
              {score}%
            </text>
          </svg>
        </div>
        <div>
          <div style={{ fontWeight: "700", fontSize: "0.85rem", color: "var(--color-text-main)" }}>ATS Score</div>
          <div style={{ fontSize: "0.72rem", color: "var(--color-text-muted)" }}>
            {score >= 80 ? "Excellent ATS readiness" : score >= 60 ? "Good, but can be optimized" : "Needs improvements"}
          </div>
        </div>
      </div>

      {/* Resume Length and Page Meter */}
      <div style={{ background: "var(--bg-card)", padding: "0.6rem 0.75rem", borderRadius: "8px", border: "1px solid var(--card-border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontWeight: "700", marginBottom: "0.25rem" }}>
          <span>Resume Length</span>
          <span style={{ color: isTooLong ? "var(--color-warning)" : "var(--color-success)" }}>
            {wordCount} words (~{estimatedPages} Page{estimatedPages > 1 ? "s" : ""})
          </span>
        </div>
        <div style={{ width: "100%", height: "6px", background: "#e2e8f0", borderRadius: "3px", overflow: "hidden" }}>
          <div style={{ 
            width: `${Math.min(100, (wordCount / 650) * 100)}%`, 
            height: "100%", 
            background: isTooLong ? "var(--color-warning)" : "var(--color-success)" 
          }} />
        </div>
        
        {isTooLong && (
          <div style={{ marginTop: "0.5rem", padding: "0.4rem", background: "rgba(245, 158, 11, 0.08)", border: "1px solid rgba(245, 158, 11, 0.2)", borderRadius: "4px" }}>
            <p style={{ fontSize: "0.68rem", color: "#b45309", margin: "0 0 0.4rem 0", lineHeight: "1.3" }}>
              ⚠️ <strong>One-Page Recommendation</strong>: Recruiters prefer a single-page document. Apply our compact layout with one-click.
            </p>
            <button 
              onClick={handleAutofitCompact}
              className="btn-secondary" 
              style={{ width: "100%", padding: "0.2rem 0.5rem", fontSize: "0.65rem", minHeight: "auto", fontWeight: "bold" }}
            >
              🗜️ Auto-fit to 1 Page
            </button>
          </div>
        )}
      </div>

      {/* One-Click AI Improve */}
      <div>
        {aiImproveResults ? (
          <div style={{ padding: "0.75rem", background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "8px" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: "bold", color: "#065f46", marginBottom: "0.25rem" }}>
              ✨ AI Improved Suggestions Ready!
            </div>
            <p style={{ fontSize: "0.68rem", color: "#065f46", margin: "0 0 0.5rem 0", lineHeight: "1.3" }}>
              Apply polished professional summaries, active action verb descriptions, and missing keywords in one click.
            </p>
            <button 
              onClick={handleApplyAllAIImprovements}
              className="btn-primary" 
              style={{ width: "100%", padding: "0.35rem", fontSize: "0.72rem", minHeight: "auto", fontWeight: "700" }}
            >
              ⚡ Auto-Apply All Suggestions
            </button>
          </div>
        ) : (
          <button 
            onClick={onAiImprove}
            disabled={aiImproveLoading}
            className="btn-primary" 
            style={{ width: "100%", padding: "0.45rem", fontSize: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.35rem", fontWeight: "700" }}
          >
            {aiImproveLoading ? "🤖 AI Polishing..." : "🤖 One-Click AI Improve"}
          </button>
        )}
      </div>

      {/* Highlight Weak Sections */}
      <div>
        <div style={{ fontWeight: "700", fontSize: "0.78rem", color: "var(--color-text-main)", marginBottom: "0.35rem" }}>
          🔍 Highlight Weak Sections
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          {sectionAudits.map(sec => {
            const isWeak = sec.score < 70;
            return (
              <div 
                key={sec.name} 
                style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center", 
                  padding: "0.4rem 0.5rem", 
                  background: isWeak ? "rgba(239, 68, 68, 0.03)" : "rgba(16, 185, 129, 0.03)", 
                  border: `1px solid ${isWeak ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.15)"}`, 
                  borderRadius: "6px" 
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.72rem" }}>
                  <span>{isWeak ? "❌" : "✅"}</span>
                  <span style={{ fontWeight: isWeak ? "bold" : "normal" }}>{sec.name}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <span style={{ fontSize: "0.7rem", color: isWeak ? "#b91c1c" : "#047857", fontWeight: "bold" }}>
                    {sec.score}/100
                  </span>
                  {isWeak && (
                    <button 
                      onClick={() => {
                        const target = document.querySelector(`.preview-section-container[key="${sec.elementId}"]`);
                        if (target) {
                          target.scrollIntoView({ behavior: "smooth", block: "center" });
                          target.style.outline = "2px dashed #b91c1c";
                          setTimeout(() => { target.style.outline = "none"; }, 3000);
                        } else {
                          addToast(`Located ${sec.name} section for adjustments.`, "info");
                        }
                      }}
                      style={{ border: "none", background: "var(--color-primary)", color: "white", borderRadius: "3px", fontSize: "0.62rem", padding: "0.1rem 0.3rem", cursor: "pointer" }}
                    >
                      Locate
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Keyword Suggestions */}
      <div>
        <div style={{ fontWeight: "700", fontSize: "0.78rem", color: "var(--color-text-main)", marginBottom: "0.35rem" }}>
          ⚠️ Missing Critical Keywords ({missingKeywords.length})
        </div>
        {missingKeywords.length === 0 ? (
          <p style={{ fontSize: "0.72rem", color: "#047857", fontStyle: "italic", margin: 0 }}>✓ No missing keywords detected!</p>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
            {missingKeywords.slice(0, 12).map(kw => (
              <span 
                key={kw} 
                onClick={() => applyKeyword(kw)}
                onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); applyKeyword(kw); } }}
                role="button"
                tabIndex="0"
                aria-label={`Add skill ${kw} instantly`}
                className="keyword-chip" 
                style={{ 
                  cursor: "pointer", 
                  fontSize: "0.68rem", 
                  padding: "0.15rem 0.35rem",
                  background: "rgba(239, 68, 68, 0.04)", 
                  border: "1px dashed rgba(239, 68, 68, 0.3)",
                  color: "#b91c1c",
                  borderRadius: "4px"
                }}
                title="Click to apply skill instantly"
              >
                + {kw}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Missing Skills */}
      {recommendedSkills.length > 0 && (
        <div>
          <div style={{ fontWeight: "700", fontSize: "0.78rem", color: "var(--color-text-main)", marginBottom: "0.35rem" }}>
            💡 Suggested Skills to Add
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
            {recommendedSkills.map(sk => (
              <span 
                key={sk} 
                onClick={() => applyKeyword(sk)}
                onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); applyKeyword(sk); } }}
                role="button"
                tabIndex="0"
                className="keyword-chip" 
                style={{ 
                  cursor: "pointer", 
                  fontSize: "0.68rem", 
                  padding: "0.15rem 0.35rem",
                  background: "rgba(59, 130, 246, 0.04)", 
                  border: "1px dashed rgba(59, 130, 246, 0.3)",
                  color: "#1d4ed8",
                  borderRadius: "4px"
                }}
                title="Click to add skill"
              >
                + {sk}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Weaknesses & Fixes */}
      <div>
        <div style={{ fontWeight: "700", fontSize: "0.78rem", color: "var(--color-text-main)", marginBottom: "0.35rem" }}>
          🛠️ Weaknesses & Fixes
        </div>
        {weaknesses.length === 0 ? (
          <p style={{ fontSize: "0.72rem", color: "#047857", fontStyle: "italic", margin: 0 }}>✓ Structure is highly optimized!</p>
        ) : (
          <ul style={{ paddingLeft: "1.1rem", margin: 0, fontSize: "0.72rem", color: "var(--color-text-muted)", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            {weaknesses.map((w, idx) => (
              <li key={idx} style={{ lineHeight: "1.3" }}>{w}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Grammar Suggestions */}
      <div>
        <div style={{ fontWeight: "700", fontSize: "0.78rem", color: "var(--color-text-main)", marginBottom: "0.25rem" }}>
          🔠 Grammar & Action Verbs
        </div>
        <p style={{ fontSize: "0.72rem", color: "var(--color-text-muted)", margin: 0, lineHeight: "1.3" }}>
          Avoid passive terms like "assisted with" or "helped to". Swap them for impactful action verbs: <strong>Spearheaded</strong>, <strong>Optimized</strong>, <strong>Engineered</strong>, or <strong>Architected</strong>.
        </p>
      </div>

      {/* Achievement Suggestions */}
      <div>
        <div style={{ fontWeight: "700", fontSize: "0.78rem", color: "var(--color-text-main)", marginBottom: "0.25rem" }}>
          📈 Achievement Formula
        </div>
        <p style={{ fontSize: "0.72rem", color: "var(--color-text-muted)", margin: 0, lineHeight: "1.3" }}>
          Format bullet points with the XYZ pattern: <em>"Accomplished [X], as measured by [Y], by doing [Z]"</em> to immediately capture recruiter attention.
        </p>
      </div>
    </div>
  );
};
