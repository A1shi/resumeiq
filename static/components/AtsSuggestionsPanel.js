const { useState } = React;

window.AtsSuggestionsPanel = ({
  atsAnalysis,
  editedResume,
  setEditedResume,
  addToast
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
  const scoreColor = score >= 80 ? "#10b981" : score >= 60 ? "#3b82f6" : score >= 40 ? "#f59e0b" : "#ef4444";

  // Handle one-click apply missing keyword to skills
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

  return (
    <div className="glass-panel" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem", height: "100%" }}>
      <h3 className="explanation-title" style={{ margin: 0, fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        🎯 ATS Real-time Checklist
      </h3>

      {/* ATS Score circle */}
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
          <div style={{ fontWeight: "700", fontSize: "0.85rem", color: "var(--color-text-main)" }}>ATS Compliance Score</div>
          <div style={{ fontSize: "0.72rem", color: "var(--color-text-muted)" }}>
            {score >= 80 ? "Excellent ATS readiness" : score >= 60 ? "Good, but can be optimized" : "Needs improvements"}
          </div>
        </div>
      </div>

      {/* Missing Keywords list */}
      <div>
        <div style={{ fontWeight: "700", fontSize: "0.78rem", color: "var(--color-text-main)", marginBottom: "0.35rem" }}>
          ⚠️ Missing Critical Keywords ({missingKeywords.length})
        </div>
        {missingKeywords.length === 0 ? (
          <p style={{ fontSize: "0.72rem", color: "#047857", fontStyle: "italic", margin: 0 }}>✓ No missing keywords detected!</p>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
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

      {/* Weaknesses list */}
      <div>
        <div style={{ fontWeight: "700", fontSize: "0.78rem", color: "var(--color-text-main)", marginBottom: "0.35rem" }}>
          🛠️ Weak Sections & Visual Fixes
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

      {/* Grammar / Polish Suggestions */}
      <div>
        <div style={{ fontWeight: "700", fontSize: "0.78rem", color: "var(--color-text-main)", marginBottom: "0.25rem" }}>
          💡 Recommender Summary Advice
        </div>
        <p style={{ fontSize: "0.72rem", color: "var(--color-text-muted)", margin: 0, lineHeight: "1.3" }}>
          Use action-oriented verbs like <strong>Spearheaded</strong> or <strong>Optimized</strong> and quantify experience with metrics (e.g. <i>"Boosted performance by 25%"</i>).
        </p>
      </div>
    </div>
  );
};
