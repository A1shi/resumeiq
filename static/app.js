const { useState, useEffect, useRef } = React;

const highlightEnhancements = (text) => {
  if (!text) return "";
  const actionVerbs = [
    "Developed", "Optimized", "Architected", "Spearheaded", "Led", "Designed", "Built",
    "Implemented", "Created", "Scaled", "Reduced", "Increased", "Improved", "Managed",
    "Engineered", "Maintained", "Formulated", "Accelerated", "Delivered", "Analyzed",
    "Established", "Coordinated", "Executed", "Expanded"
  ];
  let html = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  actionVerbs.forEach(verb => {
    const regex = new RegExp(`\\b(${verb})\\b`, 'g');
    html = html.replace(regex, '<span class="highlight-add">$1</span>');
  });
  return <span dangerouslySetInnerHTML={{ __html: html.replace(/\n/g, "<br/>") }} />;
};

const getRatingDetails = (score) => {
  if (score >= 90) return { label: "Excellent", class: "rating-excellent" };
  if (score >= 75) return { label: "Good", class: "rating-good" };
  if (score >= 60) return { label: "Average", class: "rating-average" };
  return { label: "Needs Review", class: "rating-poor" };
};

const dummyResumeData = {
  name: "Alexander Wright",
  email: "alexander.wright@techdomain.com",
  phone: "+1 (555) 489-0123",
  professional_summary: "Distinguished systems engineer and solutions architect with over 9 years of expertise designing resilient microservice infrastructures, tuning database engines for high-volume transactions, and leading agile dev teams. Passionate about automating delivery and cloud security architectures.",
  skills: ["Python", "Go", "SQL", "Docker", "Kubernetes", "AWS", "Terraform", "PostgreSQL", "Git", "CI/CD", "Prometheus", "System Design"],
  experience: [
    {
      role: "Lead Cloud Infrastructure Architect",
      company: "Apex Global Cloud Solutions",
      start_date: "Mar 2021",
      end_date: "Present",
      description: "Pioneered deployment of zero-downtime multi-region Kubernetes clusters handling 50k requests/sec.\nReduced AWS monthly spending by 35% through resource auto-scaling policies and spot instances.\nSpearheaded a developer-experience team of 8 to automate deployment workflows using GitHub Actions."
    },
    {
      role: "Senior Software Engineer",
      company: "Matrix Core Technologies",
      start_date: "Sep 2017",
      end_date: "Feb 2021",
      description: "Designed core messaging queue APIs processing 1.2 billion events daily with Node.js and Redis.\nRefactored legacy database schemas to PostgreSQL partitioning, improving read times by 40%."
    }
  ],
  projects: [
    {
      title: "Distributed Rate Limiter",
      technologies: ["Go", "Redis", "gRPC"],
      description: "Created a sliding-window rate-limiting package deployed across 200+ container endpoints with less than 2ms latency."
    }
  ],
  education: [
    {
      degree: "M.S. Computer Science",
      field_of_study: "Distributed Systems",
      school: "Stanford University",
      end_date: "2017"
    }
  ],
  certifications: [
    { name: "AWS Solutions Architect Professional" },
    { name: "Certified Kubernetes Administrator (CKA)" }
  ],
  languages: [
    { language: "English", proficiency: "Native" },
    { language: "German", proficiency: "Professional" }
  ]
};

const categorizeSkills = (skills) => {
  const categories = {
    "Languages": [],
    "Databases & Tools": [],
    "Concepts & Methods": []
  };
  const languagesKeywords = ["python", "sql", "r", "julia", "matlab", "sas", "scala", "c++", "java", "javascript", "typescript", "bash"];
  const databasesTools = ["postgresql", "mysql", "mongodb", "snowflake", "redshift", "excel", "tableau", "power bi", "powerbi", "spark", "hadoop", "oracle", "bigquery", "aws", "gcp", "azure", "docker", "kubernetes", "git", "pandas", "numpy", "matplotlib", "seaborn", "scikit-learn", "keras", "tensorflow", "pytorch", "jupyter"];
  
  if (!skills) return {};
  skills.forEach(s => {
    const sLower = s.toLowerCase().trim();
    if (languagesKeywords.some(kw => sLower.includes(kw))) {
      categories["Languages"].push(s);
    } else if (databasesTools.some(kw => sLower.includes(kw))) {
      categories["Databases & Tools"].push(s);
    } else {
      categories["Concepts & Methods"].push(s);
    }
  });
  
  return categories;
};
const renderThumbnailMockup = (templateName) => {
  if (templateName === "Modern Professional") {
    return (
      <div className="mini-mockup modern">
        <div className="mini-sidebar" style={{ background: "#f8fafc", width: "30%", borderRight: "1px solid #cbd5e1" }}>
          <div className="mini-circle" />
          <div className="mini-line short" />
          <div className="mini-line short" />
          <div className="mini-line" style={{ width: "80%", background: "#3b82f6" }} />
          <div className="mini-line short" />
        </div>
        <div className="mini-content" style={{ width: "70%", padding: "6px" }}>
          <div className="mini-card" style={{ background: "#f1f5f9", height: "18px", marginBottom: "4px" }} />
          <div className="mini-line" style={{ width: "40%", background: "#2563eb" }} />
          <div className="mini-line" />
          <div className="mini-line" />
        </div>
      </div>
    );
  }
  if (templateName === "Creative" || templateName === "Creative Resume") {
    return (
      <div className="mini-mockup creative">
        <div className="mini-content" style={{ width: "70%", padding: "6px" }}>
          <div className="mini-line" style={{ width: "50%", background: "#ec4899" }} />
          <div className="mini-line" />
          <div className="mini-line" />
          <div className="mini-line" style={{ width: "40%", background: "#ec4899" }} />
          <div className="mini-line" />
        </div>
        <div className="mini-sidebar" style={{ background: "#fff1f2", width: "30%", borderLeft: "1px solid #f472b6" }}>
          <div className="mini-line short" />
          <div className="mini-line short" style={{ background: "#db2777" }} />
          <div className="mini-pills-row">
            <span className="mini-pill" />
            <span className="mini-pill" />
          </div>
        </div>
      </div>
    );
  }
  if (templateName === "Software Engineer") {
    return (
      <div className="mini-mockup software" style={{ padding: "8px" }}>
        <div className="mini-line" style={{ width: "60%", background: "#4f46e5" }} />
        <div className="mini-line" style={{ width: "30%" }} />
        <div className="mini-line" style={{ width: "80%", background: "#6366f1" }} />
        <div className="mini-grid">
          <div className="mini-cell" style={{ background: "#f5f3ff", border: "1px solid #ddd6fe", height: "8px" }} />
          <div className="mini-cell" style={{ background: "#f5f3ff", border: "1px solid #ddd6fe", height: "8px" }} />
        </div>
        <div className="mini-line" />
      </div>
    );
  }
  if (templateName === "Data Analyst") {
    return (
      <div className="mini-mockup data" style={{ padding: "8px" }}>
        <div className="mini-line" style={{ width: "50%", background: "#0f766e" }} />
        <div className="mini-line" style={{ width: "40%" }} />
        <div className="mini-line" style={{ width: "90%" }} />
        <div className="mini-matrix" style={{ display: "flex", flexDirection: "column", gap: "3px", marginTop: "4px" }}>
          <div style={{ display: "flex", gap: "4px" }}><div style={{ width: "15px", height: "4px", background: "#ccfbf1" }} /><div style={{ width: "35px", height: "4px", background: "#e2e8f0" }} /></div>
          <div style={{ display: "flex", gap: "4px" }}><div style={{ width: "15px", height: "4px", background: "#ccfbf1" }} /><div style={{ width: "25px", height: "4px", background: "#e2e8f0" }} /></div>
        </div>
      </div>
    );
  }
  if (templateName === "Executive" || templateName === "Executive Resume") {
    return (
      <div className="mini-mockup executive" style={{ padding: "8px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div className="mini-line" style={{ width: "50%", background: "#1e3a8a" }} />
        <div className="mini-line" style={{ width: "30%", background: "#b45309" }} />
        <div className="mini-line" style={{ width: "80%" }} />
        <div className="mini-line" />
        <div className="mini-line" />
      </div>
    );
  }
  if (templateName === "Minimal Elegant") {
    return (
      <div className="mini-mockup minimal" style={{ padding: "12px 10px" }}>
        <div className="mini-line" style={{ width: "40%", background: "#09090b" }} />
        <div className="mini-line" style={{ width: "90%" }} />
        <div className="mini-line" />
        <div className="mini-line" />
      </div>
    );
  }
  if (templateName === "Student/Fresher" || templateName === "Student / Fresher") {
    return (
      <div className="mini-mockup student" style={{ padding: "8px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div className="mini-line" style={{ width: "45%", background: "#047857" }} />
        <div className="mini-line" style={{ width: "35%" }} />
        <div className="mini-line" style={{ width: "90%", background: "#a7f3d0" }} />
        <div className="mini-line" style={{ width: "80%" }} />
        <div className="mini-line" style={{ width: "70%" }} />
      </div>
    );
  }
  // Default ATS Professional
  return (
    <div className="mini-mockup ats" style={{ padding: "8px" }}>
      <div className="mini-line" style={{ width: "50%", background: "#0f172a" }} />
      <div className="mini-line" style={{ width: "90%" }} />
      <div className="mini-line" />
      <div className="mini-line" />
      <div className="mini-line" />
    </div>
  );
};

const templatesList = [
  { 
    name: "ATS Professional", 
    icon: "📊", 
    badge: "ATS: 98%", 
    bestFor: "General corporate, standard application tracking systems.",
    accent: "#0f172a"
  },
  { 
    name: "Modern Professional", 
    icon: "✨", 
    badge: "ATS: 85%", 
    bestFor: "Tech managers, operations, consulting, & marketing roles.",
    accent: "#2563eb"
  },
  { 
    name: "Software Engineer", 
    icon: "💻", 
    badge: "ATS: 95%", 
    bestFor: "Developers, software engineers, DevOps, and systems architects.",
    accent: "#4f46e5"
  },
  { 
    name: "Data Analyst", 
    icon: "📈", 
    badge: "ATS: 92%", 
    bestFor: "Data scientists, database engineers, & business analysts.",
    accent: "#0f766e"
  },
  { 
    name: "Executive", 
    icon: "👑", 
    badge: "ATS: 88%", 
    bestFor: "C-Suite, VP/directors, and senior executives.",
    accent: "#b45309"
  },
  { 
    name: "Creative", 
    icon: "🎨", 
    badge: "ATS: 70%", 
    bestFor: "Designers, UI/UX, product design, creative and art direction.",
    accent: "#db2777"
  },
  { 
    name: "Minimal Elegant", 
    icon: "🍃", 
    badge: "ATS: 90%", 
    bestFor: "Architects, writers, researchers, and academic profiles.",
    accent: "#71717a"
  },
  { 
    name: "Student/Fresher", 
    icon: "🎓", 
    badge: "ATS: 91%", 
    bestFor: "Internships, university grads, and entry-level career transitions.",
    accent: "#10b981"
  }
];

function App() {
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [apiStatus, setApiStatus] = useState({ healthy: false, hasKey: false, db: "" });
  const [error, setError] = useState(null);
  const [uploadStatusMsg, setUploadStatusMsg] = useState("");
  const [jdText, setJdText] = useState("");
  const [matchLoading, setMatchLoading] = useState(false);
  const [matches, setMatches] = useState([]);
  const [activeMatch, setActiveMatch] = useState(null);
  
  // Recruiter Screening States
  const [recruiterJdText, setRecruiterJdText] = useState("");
  const [simulationLoading, setSimulationLoading] = useState(false);
  const [simulations, setSimulations] = useState([]);
  const [activeSimulation, setActiveSimulation] = useState(null);

  // Interview Prep Engine 2.0 States
  const [interviewPrep, setInterviewPrep] = useState(null);
  const [generatingPrep, setGeneratingPrep] = useState(false);
  const [activePrepCategory, setActivePrepCategory] = useState("hr"); // "hr", "tech", "jd", "projects", "resume", "behavioral"
  const [prepDifficultyFilter, setPrepDifficultyFilter] = useState("all"); // "all", "easy", "medium", "hard"
  const [expandedQuestionIndex, setExpandedQuestionIndex] = useState(null);
  
  // Tab Navigation State
  const [activeTab, setActiveTab] = useState("ats"); // "ats", "enhance", "cover_letter", "details"
  const [currentNav, setCurrentNav] = useState("history"); // "history", "cover_letter", "downloads", "settings"
  const [historySearchQuery, setHistorySearchQuery] = useState("");
  const [historySortKey, setHistorySortKey] = useState("date"); // "name", "date", "score", "match"
  const [historySortDirection, setHistorySortDirection] = useState("desc"); // "asc", "desc"
  const [reportSubTab, setReportSubTab] = useState("page1"); // "page1", "page2", "page3"
  const [activeToolkitTab, setActiveToolkitTab] = useState("professional_cover_letter");
  const [toolkitDrafts, setToolkitDrafts] = useState({
    professional_cover_letter: "",
    short_cover_letter: "",
    email_application: "",
    linkedin_outreach: "",
    recruiter_intro: ""
  });

  useEffect(() => {
    if (selectedResume && selectedResume.ats_analysis) {
      setToolkitDrafts({
        professional_cover_letter: selectedResume.ats_analysis.professional_cover_letter || "",
        short_cover_letter: selectedResume.ats_analysis.short_cover_letter || "",
        email_application: selectedResume.ats_analysis.email_application || "",
        linkedin_outreach: selectedResume.ats_analysis.linkedin_outreach || "",
        recruiter_intro: selectedResume.ats_analysis.recruiter_intro || ""
      });
      setInterviewPrep(selectedResume.ats_analysis.interview_prep || null);
    } else {
      setInterviewPrep(null);
    }
  }, [selectedResume]);

  // Resume Enhancements State
  const [enhancements, setEnhancements] = useState(null);
  const [enhancementsLoading, setEnhancementsLoading] = useState(false);

  // Email Verification & Password Reset States
  const [verificationCode, setVerificationCode] = useState("");
  const [resetCode, setResetCode] = useState("");
  
  // Cover Letter Generator States
  const [coverJobTitle, setCoverJobTitle] = useState("");
  const [coverCompanyName, setCoverCompanyName] = useState("");
  const [coverIndustry, setCoverIndustry] = useState("");
  const [coverLetterText, setCoverLetterText] = useState("");
  const [coverLetterVersions, setCoverLetterVersions] = useState(null);
  const [activeCoverVersion, setActiveCoverVersion] = useState("professional");
  const [coverLoading, setCoverLoading] = useState(false);

  // Resume Builder States
  const [editedResume, setEditedResume] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState("ATS Professional");
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewModalTemplate, setPreviewModalTemplate] = useState("ATS Professional");
  const [zoomScale, setZoomScale] = useState(1.0);
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [compareTemplate, setCompareTemplate] = useState("Modern Professional");
  const [isDummyPreview, setIsDummyPreview] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    contact: true,
    skills: false,
    experience: false,
    education: false,
    projects: false,
    certifications: false,
    languages: false
  });
  const [newSkillInput, setNewSkillInput] = useState("");

  // Landing page auth modal
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Toast notifications state
  const [toasts, setToasts] = useState([]);
  
  // Deletion States
  const [deletingResumeId, setDeletingResumeId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  
  // Auth & Profile States
  const [currentUser, setCurrentUser] = useState(null);
  const [authView, setAuthView] = useState("login"); // "login", "register", "forgot_password", "reset_password"
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authFullName, setAuthFullName] = useState("");
  const [authError, setAuthError] = useState("");
  
  const [showProfile, setShowProfile] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  
  const [dashboardStats, setDashboardStats] = useState({
    total_resumes: 0,
    average_ats_score: 0.0,
    highest_ats_score: 0,
    recent_analyses: []
  });
  
  const fileInputRef = useRef(null);

  const addToast = (msg, type = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const toggleSection = (sec) => {
    setExpandedSections(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  const updateField = (field, val) => {
    setEditedResume(prev => ({ ...prev, [field]: val }));
  };

  const updateListField = (field, index, subfield, val) => {
    setEditedResume(prev => {
      const newList = [...prev[field]];
      newList[index] = { ...newList[index], [subfield]: val };
      return { ...prev, [field]: newList };
    });
  };

  const updateProjectTech = (index, val) => {
    setEditedResume(prev => {
      const newList = [...prev.projects];
      newList[index] = { ...newList[index], technologies: val.split(",").map(t => t.trim()) };
      return { ...prev, projects: newList };
    });
  };

  const addListItem = (field, defaultObj) => {
    setEditedResume(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), defaultObj]
    }));
  };

  const removeListItem = (field, index) => {
    setEditedResume(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const addSkillTag = () => {
    if (newSkillInput.trim() && !editedResume.skills.includes(newSkillInput.trim())) {
      setEditedResume(prev => ({
        ...prev,
        skills: [...prev.skills, newSkillInput.trim()]
      }));
      setNewSkillInput("");
    }
  };

  const removeSkillTag = (index) => {
    setEditedResume(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  // 1. Fetch API Health and Session check on mount
  useEffect(() => {
    checkApiHealth();
    checkSession();
  }, []);

  useEffect(() => {
    if (currentUser) {
      setProfileName(currentUser.full_name || "");
      setProfileEmail(currentUser.email || "");
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedResume) {
      setEditedResume({
        name: selectedResume.name || "",
        email: selectedResume.email || "",
        phone: selectedResume.phone || "",
        skills: selectedResume.skills ? [...selectedResume.skills] : [],
        education: selectedResume.education ? JSON.parse(JSON.stringify(selectedResume.education)) : [],
        experience: selectedResume.experience ? JSON.parse(JSON.stringify(selectedResume.experience)) : [],
        projects: selectedResume.projects ? JSON.parse(JSON.stringify(selectedResume.projects)) : [],
        certifications: selectedResume.certifications ? JSON.parse(JSON.stringify(selectedResume.certifications)) : [],
        languages: selectedResume.languages ? JSON.parse(JSON.stringify(selectedResume.languages)) : []
      });
    } else {
      setEditedResume(null);
    }
  }, [selectedResume]);

  const checkSession = async () => {
    try {
      const res = await fetch("/api/v1/users/me");
      if (res.ok) {
        const user = await res.json();
        setCurrentUser(user);
        await Promise.all([fetchHistory(), fetchDashboardStats()]);
      } else {
        setCurrentUser(null);
      }
    } catch (err) {
      setCurrentUser(null);
      console.error("Failed to check session", err);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const res = await fetch("/api/v1/users/dashboard/stats");
      if (res.ok) {
        const data = await res.json();
        setDashboardStats(data);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard stats", err);
    }
  };

  const checkApiHealth = async () => {
    try {
      const res = await fetch("/api/v1/health");
      if (res.ok) {
        const data = await res.json();
        setApiStatus({
          healthy: true,
          hasKey: data.gemini_api_configured,
          db: data.database
        });
      } else {
        setApiStatus({ healthy: false, hasKey: false, db: "" });
      }
    } catch (err) {
      setApiStatus({ healthy: false, hasKey: false, db: "" });
      console.error("API is down or unreachable", err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/v1/resumes");
      if (res.ok) {
        const data = await res.json();
        setResumes(data);
      }
    } catch (err) {
      console.error("Failed to fetch resume history", err);
    }
  };

  const fetchResumeDetails = async (id) => {
    setLoading(true);
    setError(null);
    setJdText("");
    setRecruiterJdText("");
    setActiveMatch(null);
    setActiveSimulation(null);
    setMatches([]);
    setSimulations([]);
    setEnhancements(null);
    setCoverJobTitle("");
    setCoverCompanyName("");
    setCoverLetterText("");
    setActiveTab("ats"); // Reset tab on load
    try {
      const res = await fetch(`/api/v1/resumes/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedResume(data);
        await Promise.all([
          fetchMatches(id),
          fetchSimulations(id),
          fetchEnhancements(id)
        ]);
        addToast("Resume data loaded successfully.", "info");
      } else {
        const errData = await res.json();
        setError(errData.detail || "Failed to load resume details.");
      }
    } catch (err) {
      setError("Network error when pulling resume details.");
    } finally {
      setLoading(false);
    }
  };

  const fetchEnhancements = async (resumeId) => {
    setEnhancementsLoading(true);
    try {
      const res = await fetch(`/api/v1/resumes/${resumeId}/enhancements`);
      if (res.ok) {
        const data = await res.json();
        setEnhancements(data);
      }
    } catch (err) {
      console.error("Failed to fetch enhancements", err);
    } finally {
      setEnhancementsLoading(false);
    }
  };

  const fetchSimulations = async (resumeId) => {
    try {
      const res = await fetch(`/api/v1/resumes/${resumeId}/simulations`);
      if (res.ok) {
        const data = await res.json();
        setSimulations(data);
        if (data.length > 0) {
          setActiveSimulation(data[0]); // default to latest simulation
        } else {
          setActiveSimulation(null);
        }
      }
    } catch (err) {
      console.error("Failed to fetch recruiter simulations", err);
    }
  };

  const runRecruiterSimulation = async (resumeId) => {
    if (!recruiterJdText.trim()) {
      setError("Please paste a valid job description first.");
      return;
    }
    setSimulationLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/resumes/${resumeId}/simulate-recruiter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jd_text: recruiterJdText })
      });
      if (res.ok) {
        const simData = await res.json();
        setActiveSimulation(simData);
        await fetchSimulations(resumeId);
        addToast("Recruiter screening simulation completed!", "success");
      } else {
        const errData = await res.json();
        setError(errData.detail || "Recruiter simulation failed.");
      }
    } catch (err) {
      setError("Network error during recruiter simulation.");
      console.error(err);
    } finally {
      setSimulationLoading(false);
    }
  };

  const runInterviewPrep = async (resumeId) => {
    setGeneratingPrep(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/resumes/${resumeId}/interview-prep`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: recruiterJdText.trim() ? JSON.stringify({ jd_text: recruiterJdText }) : null
      });
      if (res.ok) {
        const atsData = await res.json();
        setSelectedResume(prev => ({
          ...prev,
          ats_analysis: atsData
        }));
        setInterviewPrep(atsData.interview_prep);
        addToast("Interview Prep Guide generated successfully!", "success");
      } else {
        const errData = await res.json();
        setError(errData.detail || "Failed to generate Interview Prep Guide.");
      }
    } catch (err) {
      setError("Network error during Interview Prep generation.");
      console.error(err);
    } finally {
      setGeneratingPrep(false);
    }
  };

  const downloadInterviewPDF = (resumeId, exportType, candidateName) => {
    const label = exportType === "questions" ? "Practice_Questions" : "Study_Guide";
    const url = `/api/v1/resumes/${resumeId}/export-interview?export_type=${exportType}`;
    const nameToUse = candidateName || (selectedResume ? selectedResume.name : "Candidate");
    
    fetch(url)
      .then(response => {
        if (!response.ok) throw new Error("Failed to export PDF");
        return response.blob();
      })
      .then(blob => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = `ResumeIQ_${label}_${nameToUse || "Candidate"}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);
        addToast(`${exportType === "questions" ? "Practice Questions Sheet" : "Study Prep Guide"} downloaded successfully!`, "success");
      })
      .catch(err => {
        addToast("Failed to download PDF export. Please try again.", "error");
        console.error(err);
      });
  };

  const fetchMatches = async (resumeId) => {
    try {
      const res = await fetch(`/api/v1/resumes/${resumeId}/matches`);
      if (res.ok) {
        const data = await res.json();
        setMatches(data);
        if (data.length > 0) {
          setActiveMatch(data[0]); // default to latest match
        } else {
          setActiveMatch(null);
        }
      }
    } catch (err) {
      console.error("Failed to fetch matches history", err);
    }
  };

  const handleJdUpload = async (file) => {
    const ext = file.name.slice(((file.name.lastIndexOf(".") - 1) >>> 0) + 2).toLowerCase();
    if (ext !== "pdf" && ext !== "docx" && ext !== "txt") {
      addToast("Only PDF, DOCX and TXT files are supported.", "error");
      return;
    }
    
    setMatchLoading(true);
    addToast("Extracting text from Job Description file...", "info");
    
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const res = await fetch("/api/v1/resumes/jd/upload", {
        method: "POST",
        body: formData
      });
      
      if (res.ok) {
        const data = await res.json();
        setJdText(data.jd_text);
        addToast("Job Description file parsed successfully!", "success");
      } else {
        const errData = await res.json();
        addToast(errData.detail || "Failed to parse Job Description file.", "error");
      }
    } catch (err) {
      addToast("Failed to upload Job Description file.", "error");
      console.error(err);
    } finally {
      setMatchLoading(false);
    }
  };

  const handleDownloadMatchPdfReport = async (matchId) => {
    if (!selectedResume || !matchId) return;
    try {
      addToast("Preparing Job Match PDF Report...", "info");
      window.open(`/api/v1/resumes/${selectedResume.id}/matches/${matchId}/export-pdf`, "_blank");
      addToast("Job Match PDF report downloaded successfully!", "success");
    } catch (err) {
      addToast("Failed to download PDF report.", "error");
      console.error(err);
    }
  };

  const runJdMatch = async (resumeId) => {
    if (!jdText.trim()) {
      setError("Please paste a valid job description first.");
      return;
    }
    setMatchLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/resumes/${resumeId}/match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jd_text: jdText })
      });
      if (res.ok) {
        const matchData = await res.json();
        setActiveMatch(matchData);
        await fetchMatches(resumeId);
        addToast("Job description analysis completed!", "success");
      } else {
        const errData = await res.json();
        setError(errData.detail || "JD comparison failed.");
      }
    } catch (err) {
      setError("Network error during JD matching.");
      console.error(err);
    } finally {
      setMatchLoading(false);
    }
  };

  const runAtsAudit = async (id) => {
    setLoading(true);
    setError(null);
    setUploadStatusMsg("Auditing document formatting and compliance...");
    try {
      const res = await fetch(`/api/v1/resumes/${id}/analyze`, {
        method: "POST"
      });
      if (res.ok) {
        const atsData = await res.json();
        setSelectedResume(prev => ({
          ...prev,
          ats_score: atsData.ats_score,
          ats_analysis: atsData
        }));
        await fetchHistory();
        addToast("ATS score audit completed successfully!", "success");
      } else {
        const errData = await res.json();
        setError(errData.detail || "Failed to calculate ATS score.");
      }
    } catch (err) {
      setError("Network error during ATS analysis.");
    } finally {
      setLoading(false);
      setUploadStatusMsg("");
    }
  };

  // 2. Drag & Drop File Handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // 3. Upload and Parse Pipeline
  const processFile = async (file) => {
    const ext = file.name.slice(((file.name.lastIndexOf(".") - 1) >>> 0) + 2).toLowerCase();
    if (ext !== "pdf" && ext !== "docx") {
      setError("Only PDF and DOCX documents are supported.");
      return;
    }

    setLoading(true);
    setError(null);
    setUploadStatusMsg("Uploading file...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Step-by-step loading state animations
      setTimeout(() => setUploadStatusMsg("Extracting resume content structure..."), 1000);
      setTimeout(() => setUploadStatusMsg("Analyzing technical keywords locally..."), 2200);

      const res = await fetch("/api/v1/resumes/upload", {
        method: "POST",
        body: formData
      });

      if (res.status === 201) {
        const data = await res.json();
        setSelectedResume(data);
        setJdText("");
        setActiveMatch(null);
        setMatches([]);
        await Promise.all([fetchHistory(), fetchDashboardStats()]);
        setUploadStatusMsg("");
        addToast("Resume uploaded and parsed successfully!", "success");
      } else {
        const errData = await res.json();
        setError(errData.detail || "Local parsing failed. Check file format.");
      }
    } catch (err) {
      setError("Failed to upload file. Connection was interrupted.");
    } finally {
      setLoading(false);
      setUploadStatusMsg("");
      checkApiHealth();
    }
  };

  const handleDeleteResume = async (id) => {
    setDeletingResumeId(id);
    try {
      const res = await fetch(`/api/v1/resumes/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        addToast("Resume analysis permanently deleted.", "success");
        await Promise.all([fetchHistory(), fetchDashboardStats()]);
        if (selectedResume && selectedResume.id === id) {
          setSelectedResume(null);
          setMatches([]);
          setActiveMatch(null);
          setSimulations([]);
          setActiveSimulation(null);
        }
      } else {
        const errData = await res.json();
        addToast(errData.detail || "Failed to delete resume analysis.", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Network error during deletion.", "error");
    } finally {
      setDeletingResumeId(null);
    }
  };

  const handleDeleteAllHistory = async () => {
    setLoading(true);
    setUploadStatusMsg("Clearing history database...");
    try {
      const res = await fetch("/api/v1/resumes", {
        method: "DELETE"
      });
      if (res.ok) {
        addToast("All resume analyses cleared successfully.", "success");
        setSelectedResume(null);
        setMatches([]);
        setActiveMatch(null);
        setSimulations([]);
        setActiveSimulation(null);
        await Promise.all([fetchHistory(), fetchDashboardStats()]);
      } else {
        const errData = await res.json();
        addToast(errData.detail || "Failed to clear resume history.", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Network error during clear all operations.", "error");
    } finally {
      setLoading(false);
      setUploadStatusMsg("");
    }
  };

  // Helper formatting functions
  const formatDate = (isoString) => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Skill Categorization Engine
  const categorizeSkills = (skillsList) => {
    const categories = {
      "Programming Languages": [],
      "Frameworks & Libraries": [],
      "Databases & Storage": [],
      "Cloud & DevOps": [],
      "AI & Machine Learning": [],
      "Soft Skills & Methods": []
    };
    
    const progList = ["python", "javascript", "typescript", "java", "c++", "c#", "go", "rust", "ruby", "php", "sql", "html", "css", "bash", "shell", "r", "scala", "swift", "kotlin", "objective-c", "perl", "dart", "matlab", "haskell"];
    const fwList = ["fastapi", "django", "flask", "react", "node.js", "nodejs", "angular", "vue.js", "vuejs", "vue", "next.js", "nextjs", "express", "spring", "spring boot", "asp.net", "laravel", "rails", "junit", "testng", "cypress", "selenium", "jest", "playwright", "tailwind", "tailwindcss", "bootstrap", "jquery", "flutter", "react native", "redux", "graphql", "apollo"];
    const dbList = ["postgresql", "postgres", "mysql", "sqlite", "mongodb", "redis", "cassandra", "elasticsearch", "dynamodb", "oracle", "sql server", "mariadb", "firebase", "firestore", "neo4j", "supabase"];
    const cloudList = ["aws", "amazon web services", "azure", "gcp", "google cloud", "docker", "kubernetes", "jenkins", "git", "github", "gitlab", "terraform", "ansible", "ci/cd", "circleci", "travisci", "prometheus", "grafana", "nginx", "apache", "linux", "unix", "vagrant", "heroku", "netlify", "vercel"];
    const aiList = ["pytorch", "tensorflow", "keras", "pandas", "numpy", "scikit-learn", "sklearn", "scipy", "machine learning", "deep learning", "nlp", "natural language processing", "computer vision", "artificial intelligence", "ai"];
    
    if (skillsList) {
      skillsList.forEach(skill => {
        const sLower = skill.toLowerCase();
        if (progList.includes(sLower)) {
          categories["Programming Languages"].push(skill);
        } else if (fwList.includes(sLower)) {
          categories["Frameworks & Libraries"].push(skill);
        } else if (dbList.includes(sLower)) {
          categories["Databases & Storage"].push(skill);
        } else if (cloudList.includes(sLower)) {
          categories["Cloud & DevOps"].push(skill);
        } else if (aiList.includes(sLower)) {
          categories["AI & Machine Learning"].push(skill);
        } else {
          categories["Soft Skills & Methods"].push(skill);
        }
      });
    }
    
    return categories;
  };

  // Local Certifications Scanner
  const detectCertificates = (resume) => {
    if (!resume) return [];
    const certs = [];
    const certKeywords = ["certif", "pmp", "ccna", "comptia", "aws certified", "cisco", "credential", "license", "scrum master", "csm", "scrum", "itil", "microsoft certified"];
    
    if (resume.skills) {
      resume.skills.forEach(s => {
        if (certKeywords.some(kw => s.toLowerCase().includes(kw))) {
          let issuer = "Professional Issuer";
          if (s.toLowerCase().includes("aws")) issuer = "Amazon Web Services";
          else if (s.toLowerCase().includes("scrum")) issuer = "Scrum Alliance";
          else if (s.toLowerCase().includes("cisco")) issuer = "Cisco";
          else if (s.toLowerCase().includes("google")) issuer = "Google";
          else if (s.toLowerCase().includes("microsoft")) issuer = "Microsoft";
          
          certs.push({ name: s, issuer, score: "Active", date: "Verified" });
        }
      });
    }
    
    if (resume.education) {
      resume.education.forEach(edu => {
        if (edu.degree && certKeywords.some(kw => edu.degree.toLowerCase().includes(kw))) {
          certs.push({ name: edu.degree, issuer: edu.school || "Verified Provider", score: "Passed", date: edu.end_date || "Completed" });
        }
      });
    }
    
    // Deduplicate certificates by name
    const uniqueCerts = [];
    const names = new Set();
    certs.forEach(c => {
      if (!names.has(c.name.toLowerCase())) {
        names.add(c.name.toLowerCase());
        uniqueCerts.push(c);
      }
    });
    return uniqueCerts;
  };

  // Calculate Completeness %
  const calculateCompleteness = (resume) => {
    if (!resume) return 0;
    let score = 0;
    if (resume.name) score += 10;
    if (resume.email && resume.phone) score += 15;
    if (resume.skills && resume.skills.length > 0) score += 20;
    if (resume.education && resume.education.length > 0) score += 15;
    if (resume.experience && resume.experience.length > 0) score += 20;
    if (resume.projects && resume.projects.length > 0) score += 20;
    return score;
  };

  // Score benchmark translation
  const getScoreBenchmark = (score) => {
    if (score >= 90) return { label: "Excellent", class: "excellent", bg: "bg-excellent" };
    if (score >= 75) return { label: "Good", class: "good", bg: "bg-good" };
    if (score >= 60) return { label: "Average", class: "average", bg: "bg-average" };
    return { label: "Needs Improvement", class: "poor", bg: "bg-poor" };
  };

  // Recommendation Badge translation
  const getRecVerdict = (decision) => {
    if (decision === "Shortlist") return { label: "Strong Hire", class: "stronghire" };
    if (decision === "Maybe") return { label: "Hire", class: "hire" };
    if (decision === "Reject") return { label: "Reject", class: "reject" };
    return { label: "Maybe", class: "maybe" };
  };

  // Export functions
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdfReport = () => {
    if (!selectedResume) return;
    window.open(`/api/v1/resumes/${selectedResume.id}/export-pdf`, "_blank");
    addToast("PDF report generation started.", "success");
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAuthError("");
    try {
      const res = await fetch("/api/v1/users/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authEmail })
      });
      const data = await res.json();
      if (res.ok) {
        addToast(data.message || "Reset code sent successfully.", "success");
        setAuthView("reset_password");
      } else {
        setAuthError(data.detail || "Failed to initiate password reset.");
      }
    } catch (err) {
      setAuthError("Connection error.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAuthError("");
    try {
      const res = await fetch("/api/v1/users/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authEmail, token: resetCode, new_password: authPassword })
      });
      const data = await res.json();
      if (res.ok) {
        addToast("Password reset successfully. Please sign in.", "success");
        setAuthView("login");
        setAuthPassword("");
        setResetCode("");
      } else {
        setAuthError(data.detail || "Failed to reset password. Code may be invalid or expired.");
      }
    } catch (err) {
      setAuthError("Connection error.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAuthError("");
    try {
      const res = await fetch("/api/v1/users/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: currentUser.email, token: verificationCode })
      });
      const data = await res.json();
      if (res.ok) {
        addToast("Email verified successfully!", "success");
        setCurrentUser(prev => ({ ...prev, is_verified: true }));
        setVerificationCode("");
        await Promise.all([fetchHistory(), fetchDashboardStats()]);
      } else {
        setAuthError(data.detail || "Verification failed. Please check your code.");
      }
    } catch (err) {
      setAuthError("Connection error.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/users/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: currentUser.email })
      });
      const data = await res.json();
      if (res.ok) {
        addToast("Verification code resent to your email.", "success");
      } else {
        addToast(data.detail || "Failed to resend code.", "error");
      }
    } catch (err) {
      addToast("Connection error.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!coverJobTitle.trim() || !coverCompanyName.trim()) {
      addToast("Please fill in Job Title and Company Name", "error");
      return;
    }
    setCoverLoading(true);
    try {
      const res = await fetch(`/api/v1/resumes/${selectedResume.id}/cover-letter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_title: coverJobTitle,
          company_name: coverCompanyName,
          industry: coverIndustry || null
        })
      });
      if (res.ok) {
        const data = await res.json();
        setCoverLetterVersions(data);
        setCoverLetterText(data.professional); // default to professional version text
        setActiveCoverVersion("professional");
        addToast("3 versions of cover letter generated successfully!", "success");
      } else {
        const errData = await res.json();
        addToast(errData.detail || "Failed to generate cover letter.", "error");
      }
    } catch (err) {
      addToast("Connection error.", "error");
    } finally {
      setCoverLoading(false);
    }
  };

  const handleCopyCoverLetter = () => {
    if (!coverLetterText) return;
    navigator.clipboard.writeText(coverLetterText);
    addToast("Cover letter copied to clipboard!", "success");
  };

  const handleDownloadCoverLetter = async (format) => {
    try {
      addToast(`Preparing ${format.toUpperCase()} download...`, "info");
      const res = await fetch(`/api/v1/resumes/cover-letter/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: coverLetterText,
          format: format,
          filename: `Cover_Letter_${coverCompanyName.replace(/\s+/g, "_")}`
        })
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Cover_Letter_${coverCompanyName.replace(/\s+/g, "_")}.${format}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        addToast(`Cover letter downloaded in ${format.toUpperCase()} format.`, "success");
      } else {
        addToast("Failed to download cover letter.", "error");
      }
    } catch (err) {
      addToast("Download failed.", "error");
    }
  };

  const downloadResumeReportPdf = (resumeId, resumeName) => {
    window.open(`/api/v1/resumes/${resumeId}/export-pdf`, "_blank");
    addToast("PDF report generation started.", "success");
  };

  const downloadResumeTemplate = async (resumeId, resumeName, format) => {
    try {
      addToast(`Generating ${format.toUpperCase()} styled resume...`, "info");
      const res = await fetch(`/api/v1/resumes/${resumeId}/export-template`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template_name: "ATS Professional",
          format: format
        })
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const safeName = resumeName.replace(/\s+/g, "_");
        a.download = `${safeName}_Resume_ATS_Professional.${format}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        addToast(`Resume downloaded in ${format.toUpperCase()} format.`, "success");
      } else {
        addToast("Failed to download resume template.", "error");
      }
    } catch (err) {
      addToast("Download template failed.", "error");
    }
  };

  const downloadCoverLetterRaw = async (text, candidateName, format) => {
    try {
      addToast(`Preparing ${format.toUpperCase()} download...`, "info");
      const res = await fetch(`/api/v1/resumes/cover-letter/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text,
          format: format,
          filename: `Cover_Letter_${candidateName.replace(/\s+/g, "_")}`
        })
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Cover_Letter_${candidateName.replace(/\s+/g, "_")}.${format}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        addToast(`Cover letter downloaded in ${format.toUpperCase()} format.`, "success");
      } else {
        addToast("Failed to download cover letter.", "error");
      }
    } catch (err) {
      addToast("Download failed.", "error");
    }
  };

  const handleSaveResume = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/resumes/${selectedResume.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedResume)
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedResume(updated);
        addToast("Resume changes saved and ATS scorecard recalculated!", "success");
        await Promise.all([fetchHistory(), fetchDashboardStats(), fetchEnhancements(selectedResume.id)]);
      } else {
        const errData = await res.json();
        setError(errData.detail || "Failed to save changes.");
      }
    } catch (err) {
      setError("Network error during save operation.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportTemplate = async (format, templateName = selectedTemplate) => {
    try {
      addToast(`Generating ${format.toUpperCase()} styled resume...`, "info");
      const res = await fetch(`/api/v1/resumes/${selectedResume.id}/export-template`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template_name: templateName,
          format: format,
          resume_data: editedResume
        })
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const ext = format.toLowerCase();
        a.download = `${editedResume.name.replace(/\s+/g, "_")}_Resume_${templateName.replace(/\s+/g, "_")}.${ext}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        addToast(`Resume downloaded in ${format.toUpperCase()} format.`, "success");
      } else {
        addToast("Failed to download resume template.", "error");
      }
    } catch (err) {
      addToast("Download template failed.", "error");
    }
  };

  const handleShareReport = () => {
    if (!selectedResume) return;
    const matchPart = activeMatch ? `Matched: ${activeMatch.job_title} with ${activeMatch.match_score}% Match Score` : "Parsed locally";
    const text = `ResumeIQ AI Intel Report: ${selectedResume.name || "Candidate"} - ATS Score: ${selectedResume.ats_score || "Unrated"}/100. ${matchPart}. Verified on ${new Date().toLocaleDateString()}.`;
    navigator.clipboard.writeText(text);
    addToast("Share report details copied to clipboard!", "success");
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAuthError("");
    try {
      if (authView === "login") {
        const res = await fetch("/api/v1/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: authEmail, password: authPassword })
        });
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user);
          addToast(`Welcome back, ${data.user.full_name}!`, "success");
          if (data.user.is_verified) {
            await Promise.all([fetchHistory(), fetchDashboardStats()]);
          }
        } else {
          const errData = await res.json();
          setAuthError(errData.detail || "Incorrect email or password.");
        }
      } else {
        const res = await fetch("/api/v1/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: authEmail, full_name: authFullName, password: authPassword })
        });
        if (res.ok) {
          addToast("Account created successfully! Logging in...", "success");
          const loginRes = await fetch("/api/v1/users/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: authEmail, password: authPassword })
          });
          if (loginRes.ok) {
            const loginData = await loginRes.json();
            setCurrentUser(loginData.user);
            if (loginData.user.is_verified) {
              await Promise.all([fetchHistory(), fetchDashboardStats()]);
            }
          } else {
            setAuthView("login");
          }
        } else {
          const errData = await res.json();
          setAuthError(errData.detail || "Registration failed. Email may already be in use.");
        }
      }
    } catch (err) {
      setAuthError("Connection error. Please check if services are running.");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setProfileError("");
    setProfileSuccess("");
    try {
      const res = await fetch("/api/v1/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: profileName, email: profileEmail })
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data);
        setProfileSuccess("Profile updated successfully!");
        addToast("Profile details updated.", "success");
      } else {
        const errData = await res.json();
        setProfileError(errData.detail || "Failed to update profile details.");
      }
    } catch (err) {
      setProfileError("Network error while saving changes.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setProfileError("");
    setProfileSuccess("");
    if (newPassword.length < 6) {
      setProfileError("New password must be at least 6 characters.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/v1/users/me/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ old_password: oldPassword, new_password: newPassword })
      });
      if (res.ok) {
        setProfileSuccess("Password changed successfully!");
        setOldPassword("");
        setNewPassword("");
        addToast("Password changed successfully.", "success");
      } else {
        const errData = await res.json();
        setProfileError(errData.detail || "Failed to change password. Old password may be incorrect.");
      }
    } catch (err) {
      setProfileError("Network error while updating password.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch("/api/v1/users/logout", { method: "POST" });
      setCurrentUser(null);
      setResumes([]);
      setSelectedResume(null);
      setShowProfile(false);
      addToast("Signed out successfully.", "info");
    } catch (err) {
      console.error("Failed to log out", err);
    }
  };

  // Custom SVG Icons
  const Icons = {
    Upload: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
    ),
    Trash: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
    ),
    History: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
    ),
    User: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    ),
    Mail: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
    ),
    Phone: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
    ),
    ArrowRight: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle" }}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
    ),
    Cpu: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="15" x2="23" y2="15"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="15" x2="4" y2="15"/></svg>
    ),
    Briefcase: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
    ),
    BookOpen: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
    ),
    Folder: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
    ),
    FileText: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 22 8"/></svg>
    ),
    AlertTriangle: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
    ),
    Check: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
    ),
    X: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    ),
    Award: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
    ),
    Target: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
    ),
    TrendingUp: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
    ),
    Download: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
    ),
    Share: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
    ),
    Printer: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
    )
  };

  const skillsCategories = selectedResume ? categorizeSkills(selectedResume.skills) : {};
  const detectedCerts = selectedResume 
    ? (selectedResume.certifications && selectedResume.certifications.length > 0 
        ? selectedResume.certifications 
        : detectCertificates(selectedResume)) 
    : [];
  const completenessScore = selectedResume ? calculateCompleteness(selectedResume) : 0;
  const scoreBenchmark = selectedResume && selectedResume.ats_score !== null ? getScoreBenchmark(selectedResume.ats_score) : null;
  const renderLivePreview = (templateName = selectedTemplate, forceDummy = false) => {
    const useDummy = forceDummy || (isPreviewModalOpen && isDummyPreview);
    const data = useDummy ? dummyResumeData : editedResume;
    if (!data) return <div style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-muted)" }}>Please upload/select a resume to view live preview.</div>;
    const { name, email, phone, skills, education, experience, projects, certifications, languages } = data;
    const summary_text = data.professional_summary || "";
    
    if (templateName === "Modern Professional") {
      return (
        <div className="preview-modern">
          <div className="mod-sidebar">
            <div className="mod-sec-title">CONTACT</div>
            <div style={{ wordBreak: "break-all", marginBottom: "0.5rem" }}>✉ {email || "N/A"}</div>
            <div style={{ marginBottom: "0.85rem" }}>☎ {phone || "N/A"}</div>
            
            {skills && skills.length > 0 && (
              <React.Fragment>
                <div className="mod-sec-title">SKILLS</div>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "6px", padding: 0 }}>
                  {skills.map((s, i) => {
                    const percentages = [90, 85, 80, 75, 95];
                    const pct = percentages[i % percentages.length];
                    return (
                      <li key={i} style={{ marginBottom: "0.25rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", fontWeight: "600" }}>
                          <span>{s}</span>
                          <span>{pct}%</span>
                        </div>
                        <div style={{ height: "6px", background: "#e2e8f0", borderRadius: "3px", overflow: "hidden", marginTop: "2px" }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: "#2563eb", borderRadius: "3px" }} />
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <div style={{ height: "0.5rem" }} />
              </React.Fragment>
            )}
            
            {languages && languages.length > 0 && (
              <React.Fragment>
                <div className="mod-sec-title">LANGUAGES</div>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "2px", padding: 0 }}>
                  {languages.map((l, i) => <li key={i}>• {l.language || l.language}{l.proficiency ? ` (${l.proficiency})` : ""}</li>)}
                </ul>
                <div style={{ height: "0.5rem" }} />
              </React.Fragment>
            )}
            
            {certifications && certifications.length > 0 && (
              <React.Fragment>
                <div className="mod-sec-title">CERTIFICATIONS</div>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "2px", padding: 0 }}>
                  {certifications.map((c, i) => <li key={i}>• {c.name}</li>)}
                </ul>
              </React.Fragment>
            )}
          </div>
          <div className="mod-main">
            {/* Profile Card */}
            <div className="profile-card" style={{ background: "#f8fafc", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "1rem" }}>
              <div className="res-name" style={{ fontSize: "1.5rem", fontWeight: "800", color: "#0f172a", marginBottom: "0.25rem" }}>{name || "Candidate Name"}</div>
              <div style={{ color: "#2563eb", fontSize: "0.8rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Professional Profile</div>
              {summary_text && <p style={{ margin: 0, fontSize: "0.82rem", lineHeight: "1.4", color: "#334155" }}>{summary_text}</p>}
            </div>
            
            {experience && experience.length > 0 && (
              <div style={{ marginTop: "0.5rem" }}>
                <div className="main-sec-title">WORK EXPERIENCE</div>
                {experience.map((exp, i) => (
                  <div key={i} style={{ marginTop: "0.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
                      <span>{exp.role || "Role"} at {exp.company || "Company"}</span>
                      <span style={{ fontWeight: "normal", color: "var(--color-text-muted)" }}>{exp.start_date || "N/A"} - {exp.end_date || "Present"}</span>
                    </div>
                    {exp.description && (
                      <ul style={{ paddingLeft: "1.2rem", marginTop: "2px" }}>
                        {exp.description.split("\n").filter(Boolean).map((bullet, idx) => (
                          <li key={idx}>{bullet.replace(/^-\s*/, "").replace(/^•\s*/, "")}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {projects && projects.length > 0 && (
              <div style={{ marginTop: "0.5rem" }}>
                <div className="main-sec-title">PROJECTS</div>
                {projects.map((proj, i) => (
                  <div key={i} style={{ marginTop: "0.5rem" }}>
                    <div style={{ fontWeight: "bold" }}>
                      {proj.title || "Project"}
                      {proj.technologies && proj.technologies.length > 0 && (
                        <span style={{ fontWeight: "normal", fontStyle: "italic", fontSize: "0.7rem", color: "var(--color-text-muted)", marginLeft: "0.5rem" }}>
                          ({Array.isArray(proj.technologies) ? proj.technologies.join(", ") : proj.technologies})
                        </span>
                      )}
                    </div>
                    {proj.description && <p style={{ marginTop: "2px" }}>{proj.description}</p>}
                  </div>
                ))}
              </div>
            )}
            
            {education && education.length > 0 && (
              <div style={{ marginTop: "0.5rem" }}>
                <div className="main-sec-title">EDUCATION</div>
                {education.map((edu, i) => (
                  <div key={i} style={{ marginTop: "0.35rem", display: "flex", justifyContent: "space-between" }}>
                    <span>
                      <strong>{edu.degree || "Degree"}</strong> {edu.field_of_study ? `in ${edu.field_of_study}` : ""} — {edu.school || "School"}
                    </span>
                    <span style={{ color: "var(--color-text-muted)" }}>{edu.end_date || ""}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }
    
    if (templateName === "Creative" || templateName === "Creative Resume" || templateName === "Creative Designer") {
      return (
        <div className="preview-creative">
          <div className="creative-main">
            <div className="res-name">{name || "Candidate Name"}</div>
            <div style={{ color: "#ec4899", fontSize: "0.85rem", fontWeight: "600", marginTop: "-0.5rem", letterSpacing: "0.05em" }}>CREATIVE PROFESSIONAL</div>
            
            {summary_text && (
              <div style={{ marginTop: "0.5rem" }}>
                <div className="main-sec-title">PROFILE SUMMARY</div>
                <p style={{ margin: 0 }}>{summary_text}</p>
              </div>
            )}
            
            {experience && experience.length > 0 && (
              <div style={{ marginTop: "0.5rem" }}>
                <div className="main-sec-title">CAREER EXPERIENCE</div>
                {experience.map((exp, i) => (
                  <div key={i} style={{ marginTop: "0.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
                      <span style={{ color: "#1e1b4b" }}>{exp.role || "Role"} @ {exp.company || "Company"}</span>
                      <span style={{ fontWeight: "normal", color: "#ec4899", fontSize: "0.75rem" }}>{exp.start_date || "N/A"} - {exp.end_date || "Present"}</span>
                    </div>
                    {exp.description && (
                      <ul style={{ paddingLeft: "1.2rem", marginTop: "2px" }}>
                        {exp.description.split("\n").filter(Boolean).map((bullet, idx) => (
                          <li key={idx}>{bullet.replace(/^-\s*/, "").replace(/^•\s*/, "")}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {projects && projects.length > 0 && (
              <div style={{ marginTop: "0.5rem" }}>
                <div className="main-sec-title">FEATURED CREATIONS</div>
                {projects.map((proj, i) => (
                  <div key={i} style={{ marginTop: "0.5rem" }}>
                    <div style={{ fontWeight: "bold", color: "#1e1b4b" }}>
                      {proj.title || "Project"}
                    </div>
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div style={{ fontSize: "0.7rem", color: "#db2777", fontWeight: "600" }}>
                        Tools: {Array.isArray(proj.technologies) ? proj.technologies.join(", ") : proj.technologies}
                      </div>
                    )}
                    {proj.description && <p style={{ marginTop: "2px" }}>{proj.description}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="creative-sidebar">
            <div className="creative-sec-title">GET IN TOUCH</div>
            <div style={{ wordBreak: "break-all", marginBottom: "0.5rem" }}>✉ {email || "N/A"}</div>
            <div style={{ marginBottom: "0.85rem" }}>☎ {phone || "N/A"}</div>
            
            {skills && skills.length > 0 && (
              <React.Fragment>
                <div className="creative-sec-title">EXPERTISE</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                  {skills.map((s, i) => <span key={i} className="creative-skill-chip">{s}</span>)}
                </div>
                <div style={{ height: "0.5rem" }} />
              </React.Fragment>
            )}
            
            {education && education.length > 0 && (
              <React.Fragment>
                <div className="creative-sec-title">EDUCATION</div>
                {education.map((edu, i) => (
                  <div key={i} style={{ marginBottom: "0.5rem" }}>
                    <strong>{edu.degree}</strong>
                    <div style={{ fontSize: "0.72rem" }}>{edu.field_of_study}</div>
                    <div style={{ fontSize: "0.72rem", color: "var(--color-text-muted)" }}>{edu.school} ({edu.end_date})</div>
                  </div>
                ))}
                <div style={{ height: "0.5rem" }} />
              </React.Fragment>
            )}
            
            {languages && languages.length > 0 && (
              <React.Fragment>
                <div className="creative-sec-title">LANGUAGES</div>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "2px", padding: 0 }}>
                  {languages.map((l, i) => <li key={i}>🎨 {l.language || l.language}{l.proficiency ? ` (${l.proficiency})` : ""}</li>)}
                </ul>
                <div style={{ height: "0.5rem" }} />
              </React.Fragment>
            )}
            
            {certifications && certifications.length > 0 && (
              <React.Fragment>
                <div className="creative-sec-title">AWARDS</div>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "2px", padding: 0 }}>
                  {certifications.map((c, i) => <li key={i}>🏆 {c.name}</li>)}
                </ul>
              </React.Fragment>
            )}
          </div>
        </div>
      );
    }
    
    if (templateName === "Software Engineer") {
      const githubSlug = name ? name.toLowerCase().replace(/[^a-z0-9]/g, "") : "dev";
      
      // Developer focus sections rendering
      const sections = ["skills", "projects", "experience", "education"];
      
      return (
        <div className="preview-software">
          <div className="res-name">&lt; {name || "Candidate Name"} /&gt;</div>
          <div className="res-contact">// {email || "N/A"}  |  {phone || "N/A"}  |  github.com/{githubSlug}</div>
          
          {summary_text && (
            <div style={{ marginTop: "0.5rem" }}>
              <div className="res-sec-title">Candidate Profile</div>
              <p style={{ margin: "4px 0" }}>{summary_text}</p>
            </div>
          )}
          
          {sections.map(sec => {
            if (sec === "skills" && skills && skills.length > 0) {
              return (
                <div key={sec} style={{ marginTop: "0.5rem" }}>
                  <div className="res-sec-title">Technical Index & Stack</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginTop: "0.35rem" }}>
                    {skills.map((s, i) => (
                      <span key={i} className="software-skill-chip">{s}</span>
                    ))}
                  </div>
                </div>
              );
            }
            if (sec === "projects" && projects && projects.length > 0) {
              return (
                <div key={sec} style={{ marginTop: "0.5rem" }}>
                  <div className="res-sec-title">Systems & Highlights</div>
                  {projects.map((proj, i) => (
                    <div key={i} style={{ marginTop: "0.5rem" }}>
                      <div style={{ fontWeight: "bold" }}>{proj.title}</div>
                      {proj.technologies && proj.technologies.length > 0 && (
                        <div style={{ fontSize: "0.72rem", color: "#4f46e5", fontWeight: "600", fontFamily: "monospace" }}>
                          Stack: {Array.isArray(proj.technologies) ? proj.technologies.join(", ") : proj.technologies}
                        </div>
                      )}
                      {proj.description && <p style={{ fontSize: "0.75rem", marginTop: "2px" }}>{proj.description}</p>}
                    </div>
                  ))}
                </div>
              );
            }
            if (sec === "experience" && experience && experience.length > 0) {
              return (
                <div key={sec} style={{ marginTop: "0.5rem" }}>
                  <div className="res-sec-title">Work Log & Development</div>
                  {experience.map((exp, i) => (
                    <div key={i} style={{ marginTop: "0.5rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
                        <span>{exp.role} @ {exp.company}</span>
                        <span>{exp.start_date} - {exp.end_date}</span>
                      </div>
                      {exp.description && (
                        <ul style={{ paddingLeft: "1.2rem", marginTop: "2px" }}>
                          {exp.description.split("\n").filter(Boolean).map((b, idx) => (
                            <li key={idx}>{b.replace(/^-\s*/, "").replace(/^•\s*/, "")}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              );
            }
            if (sec === "education" && education && education.length > 0) {
              return (
                <div key={sec} style={{ marginTop: "0.5rem" }}>
                  <div className="res-sec-title">Education background</div>
                  {education.map((edu, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", marginTop: "0.25rem" }}>
                      <span><strong>{edu.degree}</strong> in {edu.field_of_study} — {edu.school}</span>
                      <span>{edu.end_date}</span>
                    </div>
                  ))}
                </div>
              );
            }
            return null;
          })}
        </div>
      );
    }
    
    if (templateName === "Data Analyst") {
      const cats = categorizeSkills(skills);
      const sections = ["skills", "experience", "projects", "education"];
      
      return (
        <div className="preview-data">
          <div className="res-name">{name || "Candidate Name"}</div>
          <div style={{ fontSize: "0.75rem", color: "#64748B", marginBottom: "0.5rem" }}>{email || "N/A"} | {phone || "N/A"}</div>
          
          {summary_text && (
            <div style={{ marginTop: "0.5rem" }}>
              <div className="res-sec-title">Executive Summary</div>
              <p style={{ margin: "4px 0" }}>{summary_text}</p>
            </div>
          )}
          
          {sections.map(sec => {
            if (sec === "skills" && skills && skills.length > 0) {
              return (
                <div key={sec} style={{ marginTop: "0.5rem" }}>
                  <div className="res-sec-title">TECHNICAL SKILLS MATRIX</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginTop: "0.4rem" }}>
                    {Object.entries(cats).map(([catName, catSkills]) => (
                      <div key={catName} style={{ display: "grid", gridTemplateColumns: "150px 1fr", borderBottom: "1px solid #ccfbf1", paddingBottom: "0.25rem", gap: "0.5rem" }}>
                        <span style={{ fontWeight: "700", fontSize: "0.75rem", color: "#0f766e" }}>{catName}:</span>
                        <span style={{ fontSize: "0.75rem", color: "var(--color-text-main)" }}>{catSkills.join(", ")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }
            if (sec === "experience" && experience && experience.length > 0) {
              return (
                <div key={sec} style={{ marginTop: "0.5rem" }}>
                  <div className="res-sec-title">ANALYTICS EXPERIENCE</div>
                  {experience.map((exp, i) => (
                    <div key={i} style={{ marginTop: "0.5rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
                        <span style={{ color: "#0F766E" }}>{exp.role}</span>
                        <span>{exp.start_date} - {exp.end_date}</span>
                      </div>
                      <div style={{ fontSize: "0.75rem", fontStyle: "italic", color: "var(--color-text-muted)" }}>{exp.company}</div>
                      {exp.description && (
                        <ul style={{ paddingLeft: "1.2rem", marginTop: "2px" }}>
                          {exp.description.split("\n").filter(Boolean).map((b, idx) => (
                            <li key={idx}>{b.replace(/^-\s*/, "").replace(/^•\s*/, "")}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              );
            }
            if (sec === "projects" && projects && projects.length > 0) {
              return (
                <div key={sec} style={{ marginTop: "0.5rem" }}>
                  <div className="res-sec-title">DATA PROJECTS & CAPSTONES</div>
                  {projects.map((proj, i) => (
                    <div key={i} style={{ marginTop: "0.5rem" }}>
                      <div style={{ fontWeight: "bold" }}>{proj.title}</div>
                      {proj.technologies && proj.technologies.length > 0 && (
                        <div style={{ fontSize: "0.7rem", color: "#0d9488", fontWeight: "600" }}>
                          Stack: {Array.isArray(proj.technologies) ? proj.technologies.join(", ") : proj.technologies}
                        </div>
                      )}
                      {proj.description && <p style={{ fontSize: "0.75rem", marginTop: "2px" }}>{proj.description}</p>}
                    </div>
                  ))}
                </div>
              );
            }
            if (sec === "education" && education && education.length > 0) {
              return (
                <div key={sec} style={{ marginTop: "0.5rem" }}>
                  <div className="res-sec-title">EDUCATION</div>
                  {education.map((edu, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", marginTop: "0.25rem" }}>
                      <span><strong>{edu.degree}</strong> ({edu.field_of_study}) — {edu.school}</span>
                      <span>{edu.end_date}</span>
                    </div>
                  ))}
                </div>
              );
            }
            return null;
          })}
        </div>
      );
    }
 
    if (templateName === "Executive" || templateName === "Executive Resume") {
      return (
        <div className="preview-executive">
          <div className="exec-header">
            <div className="res-name">{name || "Candidate Name"}</div>
            <div className="res-subtitle">EXECUTIVE PROFILE</div>
            <div className="res-contact">{email || "N/A"} • {phone || "N/A"}</div>
          </div>
          
          {summary_text && (
            <div style={{ marginBottom: "0.85rem" }}>
              <div className="res-sec-title">Executive Summary</div>
              <p style={{ margin: "4px 0", fontStyle: "italic" }}>{summary_text}</p>
            </div>
          )}
          
          {experience && experience.length > 0 && (
            <div>
              <div className="res-sec-title">PROFESSIONAL CHRONOLOGY</div>
              {experience.map((exp, i) => (
                <div key={i} style={{ marginTop: "0.6rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", color: "#0f172a" }}>
                    <span>{exp.role ? exp.role.toUpperCase() : "ROLE"} — {exp.company ? exp.company.toUpperCase() : "COMPANY"}</span>
                    <span>{exp.start_date} - {exp.end_date}</span>
                  </div>
                  {exp.description && (
                    <ul style={{ paddingLeft: "1.2rem", marginTop: "4px", listStyleType: "square" }}>
                      {exp.description.split("\n").filter(Boolean).map((b, idx) => (
                        <li key={idx}>{b.replace(/^-\s*/, "").replace(/^•\s*/, "")}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {projects && projects.length > 0 && (
            <div>
              <div className="res-sec-title">KEY INITIATIVES & STAKEHOLDER PROJECTS</div>
              {projects.map((proj, i) => (
                <div key={i} style={{ marginTop: "0.6rem" }}>
                  <div style={{ fontWeight: "bold", color: "#1e3a8a" }}>{proj.title}</div>
                  {proj.description && <p style={{ marginTop: "2px", fontStyle: "italic" }}>{proj.description}</p>}
                </div>
              ))}
            </div>
          )}
          
          {skills && skills.length > 0 && (
            <div>
              <div className="res-sec-title">EXECUTIVE SKILLS & BOARD COMPETENCIES</div>
              <p style={{ marginTop: "4px", letterSpacing: "0.02em" }}>{skills.join(" • ")}</p>
            </div>
          )}
          
          {education && education.length > 0 && (
            <div>
              <div className="res-sec-title">CREDENTIALS & EDUCATION</div>
              {education.map((edu, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", marginTop: "0.35rem" }}>
                  <span><strong>{edu.degree}</strong> {edu.field_of_study ? `in ${edu.field_of_study}` : ""} — {edu.school}</span>
                  <span>{edu.end_date}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
 
    if (templateName === "Minimal Elegant") {
      return (
        <div className="preview-minimal">
          <div className="min-header">
            <div className="res-name">{name || "Candidate Name"}</div>
            <div className="res-contact">{email || "N/A"}   /   {phone || "N/A"}</div>
          </div>
          
          {summary_text && (
            <div className="min-section">
              <div className="res-sec-title">Profile</div>
              <p style={{ margin: 0 }}>{summary_text}</p>
            </div>
          )}
          
          {experience && experience.length > 0 && (
            <div className="min-section">
              <div className="res-sec-title">Experience</div>
              {experience.map((exp, i) => (
                <div key={i} className="min-item">
                  <div className="min-item-header">
                    <span className="min-role">{exp.role}</span>
                    <span className="min-date">{exp.start_date} – {exp.end_date}</span>
                  </div>
                  <div className="min-company">{exp.company}</div>
                  {exp.description && (
                    <div className="min-desc">
                      {exp.description.split("\n").filter(Boolean).map((b, idx) => (
                        <p key={idx} style={{ margin: "2px 0" }}>– {b.replace(/^-\s*/, "").replace(/^•\s*/, "")}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {projects && projects.length > 0 && (
            <div className="min-section">
              <div className="res-sec-title">Projects</div>
              {projects.map((proj, i) => (
                <div key={i} className="min-item">
                  <div className="min-item-header">
                    <span className="min-role">{proj.title}</span>
                  </div>
                  {proj.description && <p className="min-desc">{proj.description}</p>}
                </div>
              ))}
            </div>
          )}
          
          {skills && skills.length > 0 && (
            <div className="min-section">
              <div className="res-sec-title">Skills</div>
              <p style={{ margin: 0, letterSpacing: "0.03em" }}>{skills.join(", ")}</p>
            </div>
          )}
          
          {education && education.length > 0 && (
            <div className="min-section">
              <div className="res-sec-title">Education</div>
              {education.map((edu, i) => (
                <div key={i} className="min-item" style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>{edu.degree} {edu.field_of_study ? `in ${edu.field_of_study}` : ""} — {edu.school}</span>
                  <span className="min-date">{edu.end_date}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
 
    if (templateName === "Student / Fresher" || templateName === "Student/Fresher" || templateName === "Fresher Pro") {
      const sections = ["education", "projects", "skills", "experience"];
      return (
        <div className="preview-student">
          <div className="res-header-centered">
            <div className="res-name">{name || "Candidate Name"}</div>
            <div className="res-contact">
              {email || "N/A"} | {phone || "N/A"}
            </div>
          </div>
          
          {summary_text && (
            <div style={{ marginTop: "0.5rem" }}>
              <div className="res-sec-title">Profile Summary</div>
              <p style={{ margin: "4px 0" }}>{summary_text}</p>
            </div>
          )}
          
          {sections.map(sec => {
            if (sec === "education" && education && education.length > 0) {
              return (
                <div key={sec} style={{ marginTop: "0.5rem" }}>
                  <div className="res-sec-title">EDUCATION & CREDENTIALS</div>
                  {education.map((edu, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", marginTop: "0.35rem" }}>
                      <span>
                        <strong>{edu.degree || "Degree"}</strong> {edu.field_of_study ? `in ${edu.field_of_study}` : ""} — {edu.school || "School"}
                      </span>
                      <span>{edu.end_date || ""}</span>
                    </div>
                  ))}
                </div>
              );
            }
            if (sec === "projects" && projects && projects.length > 0) {
              return (
                <div key={sec} style={{ marginTop: "0.5rem" }}>
                  <div className="res-sec-title">ACADEMIC & PERSONAL PROJECTS</div>
                  {projects.map((proj, i) => (
                    <div key={i} style={{ marginTop: "0.5rem" }}>
                      <div style={{ fontWeight: "bold" }}>
                        {proj.title}
                      </div>
                      {proj.technologies && proj.technologies.length > 0 && (
                        <div style={{ fontSize: "0.7rem", color: "#047857", fontWeight: "600" }}>
                          Technologies: {Array.isArray(proj.technologies) ? proj.technologies.join(", ") : proj.technologies}
                        </div>
                      )}
                      {proj.description && <p style={{ fontStyle: "italic", fontSize: "0.78rem", color: "#4B5563", marginTop: "2px" }}>{proj.description}</p>}
                    </div>
                  ))}
                </div>
              );
            }
            if (sec === "skills" && skills && skills.length > 0) {
              return (
                <div key={sec} style={{ marginTop: "0.5rem" }}>
                  <div className="res-sec-title">TECHNICAL SKILLS</div>
                  <p style={{ marginTop: "2px" }}>{skills.join(", ")}</p>
                </div>
              );
            }
            if (sec === "experience" && experience && experience.length > 0) {
              return (
                <div key={sec} style={{ marginTop: "0.5rem" }}>
                  <div className="res-sec-title">CO-OP & INTERNSHIP EXPERIENCE</div>
                  {experience.map((exp, i) => (
                    <div key={i} style={{ marginTop: "0.5rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
                        <span>{exp.role || "Role"} — {exp.company || "Company"}</span>
                        <span>{exp.start_date || "N/A"} - {exp.end_date || "Present"}</span>
                      </div>
                      {exp.description && <p style={{ fontSize: "0.78rem", marginTop: "2px" }}>{exp.description}</p>}
                    </div>
                  ))}
                </div>
              );
            }
            return null;
          })}
          
          {(certifications?.length > 0 || languages?.length > 0) && (
            <div style={{ marginTop: "0.5rem" }}>
              <div className="res-sec-title">ADDITIONAL INFORMATION & CERTIFICATIONS</div>
              {certifications && certifications.length > 0 && (
                <div>
                  <strong>Certifications:</strong> {certifications.map(c => c.name).join(", ")}
                </div>
              )}
              {languages && languages.length > 0 && (
                <div style={{ marginTop: "0.15rem" }}>
                  <strong>Languages:</strong> {languages.map(l => `${l.language || l.language}${l.proficiency ? ` (${l.proficiency})` : ""}`).join(", ")}
                </div>
              )}
            </div>
          )}
        </div>
      );
    }
    
    return (
      <div className="preview-ats">
        <div className="res-name">{name || "Candidate Name"}</div>
        <div className="res-contact">{email || "N/A"} | {phone || "N/A"}</div>
        
        {skills && skills.length > 0 && (
          <div>
            <div className="res-sec-title">TECHNICAL SKILLS</div>
            <p>{skills.join(", ")}</p>
          </div>
        )}
        
        {experience && experience.length > 0 && (
          <div>
            <div className="res-sec-title">PROFESSIONAL EXPERIENCE</div>
            {experience.map((exp, i) => (
              <div key={i} style={{ marginTop: "0.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span className="res-job-title">{exp.role}</span>
                  <span>{exp.start_date} - {exp.end_date}</span>
                </div>
                <div className="res-job-company">{exp.company}</div>
                {exp.description && (
                  <ul style={{ paddingLeft: "1.2rem", marginTop: "2px" }}>
                    {exp.description.split("\n").filter(Boolean).map((b, idx) => (
                      <li key={idx}>{b.replace(/^-\s*/, "").replace(/^•\s*/, "")}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
        
        {projects && projects.length > 0 && (
          <div>
            <div className="res-sec-title">REPRESENTATIVE PROJECTS</div>
            {projects.map((proj, i) => (
              <div key={i} style={{ marginTop: "0.5rem" }}>
                <div style={{ fontWeight: "bold" }}>
                  {proj.title}
                  {proj.technologies && proj.technologies.length > 0 && (
                    <span style={{ fontWeight: "normal", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                      {" "}— ({Array.isArray(proj.technologies) ? proj.technologies.join(", ") : proj.technologies})
                    </span>
                  )}
                </div>
                {proj.description && <p style={{ marginTop: "2px" }}>{proj.description}</p>}
              </div>
            ))}
          </div>
        )}
        
        {education && education.length > 0 && (
          <div>
            <div className="res-sec-title">EDUCATION</div>
            {education.map((edu, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", marginTop: "0.35rem" }}>
                <span><strong>{edu.degree}</strong> {edu.field_of_study ? `in ${edu.field_of_study}` : ""} — {edu.school}</span>
                <span>{edu.end_date}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderJdMatcherPanel = () => {
    const score = activeMatch ? activeMatch.match_score : 0;
    const radius = 30;
    const strokeDasharray = 2 * Math.PI * radius;
    const strokeDashoffset = strokeDasharray - (score / 100) * strokeDasharray;
    const scoreColor = score >= 80 ? "#10b981" : score >= 60 ? "#3b82f6" : score >= 40 ? "#f59e0b" : "#ef4444";

    const totalKeywords = activeMatch ? (activeMatch.matching_keywords?.length || 0) + (activeMatch.missing_keywords?.length || 0) : 0;
    const keywordRate = totalKeywords > 0 ? Math.round((activeMatch.matching_keywords.length / totalKeywords) * 100) : 100;

    let experienceRate = 75;
    const gapLower = activeMatch?.experience_match?.gap_analysis?.toLowerCase() || "";
    if (gapLower.includes("deficit") || gapLower.includes("deviation") || gapLower.includes("missing") || gapLower.includes("fewer")) {
      experienceRate = 50;
    } else if (gapLower.includes("meet") || gapLower.includes("stable") || gapLower.includes("match") || gapLower.includes("align")) {
      experienceRate = 100;
    }

    let certRate = 100;
    const reqCerts = activeMatch?.certification_match?.required_certifications || [];
    const detCerts = activeMatch?.certification_match?.detected_certifications || [];
    if (reqCerts.length > 0 && !reqCerts[0].toLowerCase().includes("no explicit") && !reqCerts[0].toLowerCase().includes("none")) {
      const matchedCerts = reqCerts.filter(c => detCerts.some(dc => dc.toLowerCase().includes(c.toLowerCase()) || c.toLowerCase().includes(dc.toLowerCase())));
      certRate = Math.round((matchedCerts.length / reqCerts.length) * 100);
    }

    const keywordAnalysisList = [];
    if (activeMatch) {
      (activeMatch.matching_keywords || []).forEach(kw => {
        keywordAnalysisList.push({ name: kw, matched: true, priority: "Matched" });
      });
      (activeMatch.missing_keywords || []).forEach(kw => {
        const isHigh = (activeMatch.most_important_missing_keywords || []).some(ikw => ikw.toLowerCase().includes(kw.toLowerCase()) || kw.toLowerCase().includes(ikw.toLowerCase()));
        keywordAnalysisList.push({ name: kw, matched: false, priority: isHigh ? "High" : "Medium" });
      });
    }

    return (
      <div className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "1.25rem", padding: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 className="explanation-title" style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            🎯 Job Description Matcher
          </h3>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <input 
              type="file" 
              id="jd-file-uploader-global" 
              style={{ display: "none" }} 
              accept=".pdf,.docx,.txt"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleJdUpload(e.target.files[0]);
                }
              }}
            />
            <button 
              className="btn-secondary" 
              style={{ padding: "0.35rem 0.75rem", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.35rem" }}
              onClick={() => document.getElementById("jd-file-uploader-global").click()}
              disabled={matchLoading}
            >
              <Icons.Upload /> Upload JD File
            </button>
          </div>
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <label htmlFor="jd-text-input-global" style={{ fontSize: "0.82rem", fontWeight: "600", color: "var(--color-text-muted)" }}>Paste or Upload Job Description</label>
          <textarea
            id="jd-text-input-global"
            className="form-control"
            style={{ width: "100%", minHeight: "120px", borderRadius: "8px", padding: "0.75rem", fontSize: "0.85rem", border: "1px solid var(--card-border)", background: "#FAFAFA", resize: "vertical" }}
            placeholder="Paste the target job description text here..."
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            disabled={matchLoading}
          />
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button 
              className="btn-primary" 
              onClick={() => runJdMatch(selectedResume.id)} 
              disabled={matchLoading || !jdText.trim()}
              style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
            >
              {matchLoading ? "Analyzing Match..." : "Analyze Match"}
            </button>
            <button 
              className="btn-secondary" 
              onClick={() => {
                setJdText("");
                setActiveMatch(null);
              }}
              disabled={matchLoading || !jdText}
            >
              Clear
            </button>
          </div>
        </div>

        {activeMatch && (
          <div style={{ marginTop: "1rem", borderTop: "1px solid var(--card-border)", paddingTop: "1.25rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            
            {/* JD Match Score, Gauge & Charts */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1.5rem", alignItems: "center" }} className="ats-dashboard-grid">
              <div style={{ padding: "1.25rem", background: "rgba(79, 70, 229, 0.03)", border: "1px solid var(--card-border)", borderRadius: "12px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ fontSize: "0.72rem", color: "var(--color-text-muted)", fontWeight: "600", textTransform: "uppercase" }}>JD Match Score</div>
                
                {/* SVG Gauge */}
                <div style={{ position: "relative", width: "80px", height: "80px" }}>
                  <svg width="80" height="80" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="30" fill="transparent" stroke="#e2e8f0" strokeWidth="6" />
                    <circle cx="40" cy="40" r="30" fill="transparent" stroke={scoreColor} strokeWidth="6" 
                            strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} strokeLinecap="round" 
                            transform="rotate(-90 40 40)" style={{ transition: "stroke-dashoffset 0.5s ease" }} />
                    <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fontSize="16" fontWeight="bold" fill="var(--color-text-main)">
                      {score}%
                    </text>
                  </svg>
                </div>
                
                <span className={`match-badge ${score >= 80 ? "badge-excellent" : score >= 60 ? "badge-good" : score >= 40 ? "badge-average" : "badge-poor"}`} style={{ fontSize: "0.72rem", padding: "0.2rem 0.55rem", borderRadius: "99px", fontWeight: "700" }}>
                  {score >= 80 ? "Excellent Match" : score >= 60 ? "Good Match" : score >= 40 ? "Average Match" : "Poor Match"}
                </span>

                <button 
                  className="btn-primary" 
                  style={{ marginTop: "0.5rem", fontSize: "0.75rem", padding: "0.35rem 0.65rem", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.25rem" }}
                  onClick={() => handleDownloadMatchPdfReport(activeMatch.id)}
                >
                  <Icons.Download /> Export Report
                </button>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ borderBottom: "1px solid var(--card-border)", paddingBottom: "0.5rem" }}>
                  <h4 style={{ fontSize: "1rem", fontWeight: "700", margin: "0 0 0.25rem 0", color: "var(--color-text-main)" }}>
                    {activeMatch.job_title || "Target Position"} Role Alignment
                  </h4>
                  <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", margin: 0 }}>
                    This scorecard evaluates your credentials against this JD across skills, domain experience, and certifications.
                  </p>
                </div>
                
                {/* Horizontal Progress Bars */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontWeight: "600", marginBottom: "2px" }}>
                      <span>Skills Match Rate</span>
                      <span>{keywordRate}%</span>
                    </div>
                    <div style={{ height: "6px", background: "#e2e8f0", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${keywordRate}%`, background: "#4f46e5", borderRadius: "3px" }}></div>
                    </div>
                  </div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontWeight: "600", marginBottom: "2px" }}>
                      <span>Experience Alignment</span>
                      <span>{experienceRate}%</span>
                    </div>
                    <div style={{ height: "6px", background: "#e2e8f0", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${experienceRate}%`, background: "#10b981", borderRadius: "3px" }}></div>
                    </div>
                  </div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontWeight: "600", marginBottom: "2px" }}>
                      <span>Certification Alignment</span>
                      <span>{certRate}%</span>
                    </div>
                    <div style={{ height: "6px", background: "#e2e8f0", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${certRate}%`, background: "#f59e0b", borderRadius: "3px" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Keyword Analysis Table */}
            <div style={{ padding: "1.25rem", background: "#F8FAFC", border: "1px solid var(--card-border)", borderRadius: "12px" }}>
              <strong style={{ display: "block", fontSize: "0.85rem", color: "var(--color-text-main)", marginBottom: "0.75rem" }}>
                📊 Detailed Keyword & Skill Analysis
              </strong>
              {keywordAnalysisList.length > 0 ? (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem", textAlign: "left" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid #e2e8f0", color: "var(--color-text-muted)" }}>
                        <th style={{ padding: "8px 6px", fontWeight: "600" }}>Keyword / Skill</th>
                        <th style={{ padding: "8px 6px", fontWeight: "600" }}>Match Status</th>
                        <th style={{ padding: "8px 6px", fontWeight: "600" }}>Action Priority</th>
                      </tr>
                    </thead>
                    <tbody>
                      {keywordAnalysisList.map((kw, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "8px 6px", fontWeight: "600", color: "var(--color-text-main)" }}>{kw.name}</td>
                          <td style={{ padding: "8px 6px" }}>
                            <span style={{ color: kw.matched ? "var(--color-success)" : "var(--color-danger)", fontWeight: "700" }}>
                              {kw.matched ? "✓ Matched" : "✗ Missing"}
                            </span>
                          </td>
                          <td style={{ padding: "8px 6px" }}>
                            <span style={{
                              padding: "0.15rem 0.45rem",
                              borderRadius: "4px",
                              fontSize: "0.68rem",
                              fontWeight: "600",
                              background: kw.priority === "Matched" ? "rgba(16, 185, 129, 0.08)" : kw.priority === "High" ? "rgba(239, 68, 68, 0.08)" : "rgba(245, 158, 11, 0.08)",
                              color: kw.priority === "Matched" ? "#065f46" : kw.priority === "High" ? "#991b1b" : "#92400e"
                            }}>
                              {kw.priority}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", fontStyle: "italic" }}>No keywords detected.</span>
              )}
            </div>

            {/* Recommendations checklist & suggestions */}
            <div style={{ padding: "1.25rem", background: "#F8FAFC", border: "1px solid var(--card-border)", borderRadius: "12px" }}>
              <strong style={{ display: "block", fontSize: "0.85rem", color: "var(--color-text-main)", marginBottom: "0.5rem" }}>
                🚀 Resume Improvement Checklist
              </strong>
              <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginBottom: "0.75rem" }}>
                Follow these target recommendations to enhance your compatibility index for this position:
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {(activeMatch.recommendations || []).map((rec, idx) => (
                  <div key={idx} style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start", fontSize: "0.82rem" }}>
                    <input type="checkbox" style={{ marginTop: "3px" }} id={`rec-check-${idx}`} />
                    <label htmlFor={`rec-check-${idx}`} style={{ color: "var(--color-text-main)", cursor: "pointer" }}>{rec}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* Experience Match */}
            {activeMatch.experience_match && (
              <div style={{ padding: "1.25rem", background: "#F8FAFC", border: "1px solid var(--card-border)", borderRadius: "12px" }}>
                <strong style={{ display: "block", fontSize: "0.85rem", color: "var(--color-primary)", marginBottom: "0.6rem" }}>
                  💼 Domain Experience Alignment
                </strong>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.8rem" }} className="ats-dashboard-grid">
                  <div>
                    <strong>Required Experience:</strong>
                    <p style={{ margin: "0.25rem 0 0 0", color: "var(--color-text-main)" }}>
                      {activeMatch.experience_match.required_experience || "N/A"}
                    </p>
                  </div>
                  <div>
                    <strong>Detected Experience:</strong>
                    <p style={{ margin: "0.25rem 0 0 0", color: "var(--color-text-main)" }}>
                      {activeMatch.experience_match.detected_experience || "N/A"}
                    </p>
                  </div>
                </div>
                <div style={{ borderTop: "1px dashed var(--card-border)", marginTop: "0.75rem", paddingTop: "0.5rem", fontSize: "0.8rem" }}>
                  <strong>Gap Analysis:</strong>
                  <p style={{ margin: "0.25rem 0 0 0", color: "var(--color-text-muted)" }}>
                    {activeMatch.experience_match.gap_analysis || "N/A"}
                  </p>
                </div>
              </div>
            )}

            {/* Certification Match */}
            {activeMatch.certification_match && (
              <div style={{ padding: "1.25rem", background: "#F8FAFC", border: "1px solid var(--card-border)", borderRadius: "12px" }}>
                <strong style={{ display: "block", fontSize: "0.85rem", color: "var(--color-primary)", marginBottom: "0.6rem" }}>
                  🏆 Upskilling & Certification Alignments
                </strong>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem", fontSize: "0.8rem" }} className="ats-dashboard-grid">
                  <div>
                    <strong style={{ display: "block", marginBottom: "0.25rem" }}>Required/Preferred:</strong>
                    <ul style={{ margin: 0, paddingLeft: "1.1rem" }}>
                      {(activeMatch.certification_match.required_certifications || []).map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                  </div>
                  <div>
                    <strong style={{ display: "block", marginBottom: "0.25rem" }}>Detected Certs:</strong>
                    <ul style={{ margin: 0, paddingLeft: "1.1rem" }}>
                      {(activeMatch.certification_match.detected_certifications || []).map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                  </div>
                  <div>
                    <strong style={{ display: "block", marginBottom: "0.25rem", color: "var(--color-danger)" }}>Missing Certs:</strong>
                    <ul style={{ margin: 0, paddingLeft: "1.1rem", color: "var(--color-danger)" }}>
                      {(activeMatch.certification_match.missing_certifications || []).map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Practice Q&As */}
            {activeMatch.interview_questions && activeMatch.interview_questions.length > 0 && (
              <div style={{ borderTop: "1px solid var(--card-border)", paddingTop: "1.25rem" }}>
                <h4 style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.35rem", color: "var(--color-primary)" }}>
                  💬 Custom Practice Interview Questions
                </h4>
                <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginBottom: "1rem" }}>
                  Prepare for screening questions based on detected experience gaps and JD requirements.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {activeMatch.interview_questions.map((q, idx) => (
                    <div key={idx} style={{ padding: "0.85rem 1rem", borderRadius: "10px", background: "#F8FAFC", border: "1px solid var(--card-border)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                        <span style={{ fontWeight: "700", fontSize: "0.85rem", color: "var(--color-text-main)" }}>
                          Q{idx + 1}: {q.question}
                        </span>
                        <span className={`difficulty-badge badge-${q.difficulty ? q.difficulty.toLowerCase() : "medium"}`}>
                          {q.difficulty}
                        </span>
                      </div>
                      {q.key_points && q.key_points.length > 0 && (
                        <div style={{ marginTop: "0.5rem", fontSize: "0.78rem" }}>
                          <strong>Key talking points to cover:</strong>
                          <ul style={{ margin: "0.15rem 0 0 0", paddingLeft: "1.1rem", color: "var(--color-text-muted)" }}>
                            {q.key_points.map((kp, i) => <li key={i}>{kp}</li>)}
                          </ul>
                        </div>
                      )}
                      {q.sample_answer_structure && (
                        <div style={{ marginTop: "0.4rem", fontSize: "0.78rem" }}>
                          <strong>Answer structure guideline:</strong>
                          <p style={{ margin: "0.15rem 0 0 0", color: "var(--color-text-muted)" }}>
                            {q.sample_answer_structure}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
          </div>
        )}
      </div>
    );
  };

  const renderAtsAnalysisTab = () => {
    if (!selectedResume || !selectedResume.ats_analysis) {
      return (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "0.5rem" }}>Analyze Resume ATS Compatibility</h3>
          <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "1rem" }}>
            Analyze your resume against standard ATS rules, calculate formatting scores, and check keyword density.
          </p>
          <button className="btn-primary" onClick={() => runAtsAudit(selectedResume.id)} disabled={loading}>
            {loading ? "Auditing..." : "Run ATS Audit"}
          </button>
        </div>
      );
    }

    const atsAnalysis = selectedResume.ats_analysis;
    const rating = getRatingDetails(selectedResume.ats_score || 0);
    const improvementScore = atsAnalysis.resume_improvement_score || 0;
    const improvementRating = getRatingDetails(improvementScore);
    const jobReadiness = atsAnalysis.job_readiness_score || 0;
    const jobReadinessRating = getRatingDetails(jobReadiness);
    const interviewReadiness = atsAnalysis.interview_readiness_score || 0;
    const interviewReadinessRating = getRatingDetails(interviewReadiness);

    const categories = [
      { name: "Contact Information", score: atsAnalysis.contact_score || 0, reason: atsAnalysis.contact_reason || "Check for phone, email, and professional links." },
      { name: "Executive Summary", score: atsAnalysis.summary_score || 0, reason: atsAnalysis.summary_reason || "Verify presence and quality of a career summary." },
      { name: "Skills Analysis", score: atsAnalysis.skills_score || 0, reason: atsAnalysis.skills_reason || "Analyze relevant keywords and skills match." },
      { name: "Work Experience", score: atsAnalysis.experience_score || 0, reason: atsAnalysis.experience_reason || "Analyze bullet metrics and action verbs." },
      { name: "Projects Portfolio", score: atsAnalysis.projects_score || 0, reason: atsAnalysis.projects_reason || "Assess representative project relevance and tech tags." },
      { name: "Education History", score: atsAnalysis.education_score || 0, reason: atsAnalysis.education_reason || "Verify degree credentials and school details." },
      { name: "Certifications & Awards", score: atsAnalysis.certifications_score || 0, reason: atsAnalysis.certifications_reason || "Analyze industry certifications and training entries." },
      { name: "Layout & Formatting", score: atsAnalysis.formatting_score || 0, reason: atsAnalysis.formatting_reason || "Detect margin width, layout complexity, and fonts." },
      { name: "Keyword Density", score: atsAnalysis.keyword_score || 0, reason: atsAnalysis.keyword_reason || "Measure industry keyword density and matches." },
    ];

    const parsedDeductions = (atsAnalysis.deductions || []).map(d => {
      const match = d.match(/(?:.*:\s*)?(.*)\s+\((-\d+)\)/);
      if (match) {
        return { desc: match[1], pts: parseInt(match[2]) };
      }
      return { desc: d, pts: -5 };
    });

    const credits = [];
    if ((atsAnalysis.contact_score || 0) >= 80) credits.push({ desc: "Valid contact details and professional links detected", pts: 10 });
    if ((atsAnalysis.summary_score || 0) >= 80) credits.push({ desc: "Strong executive summary with career branding", pts: 10 });
    if ((atsAnalysis.skills_score || 0) >= 80) credits.push({ desc: "Excellent technical skills index alignment", pts: 15 });
    if ((atsAnalysis.experience_score || 0) >= 80) credits.push({ desc: "Quantified work achievements with metrics", pts: 15 });
    if ((atsAnalysis.projects_score || 0) >= 80) credits.push({ desc: "Clear projects portfolio with technologies listed", pts: 10 });

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        
        {/* Scorecards row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
          
          {/* Card 1: ATS Score */}
          <div className={`score-metric-card ${rating.class}`}>
            <div className="score-card-title"><Icons.Cpu /> Overall ATS Score</div>
            <div className="score-card-value-row">
              <span className="score-card-val">{selectedResume.ats_score || 0}</span>
              <span className="score-card-max">/100</span>
              <span className={`score-card-lbl ${rating.class}`}>{rating.label}</span>
            </div>
            <div className="score-card-desc">Compatibility of resume layout, structure, and text content.</div>
            <div className="score-card-actions">
              <strong>Strengths</strong>
              <ul style={{ paddingLeft: "1.1rem", fontSize: "0.75rem", margin: "0.25rem 0", color: "var(--color-text-main)" }}>
                {(atsAnalysis.strengths || []).slice(0, 3).map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
                {(atsAnalysis.strengths || []).length === 0 && <li>Formatting is clean and parsed successfully.</li>}
              </ul>
              <strong style={{ marginTop: "0.5rem" }}>Weaknesses</strong>
              <ul style={{ paddingLeft: "1.1rem", fontSize: "0.75rem", margin: "0.25rem 0", color: "var(--color-text-main)" }}>
                {(atsAnalysis.weaknesses || []).slice(0, 3).map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
                {(atsAnalysis.weaknesses || []).length === 0 && <li>No critical weaknesses found.</li>}
              </ul>
            </div>
          </div>

          {/* Card 2: Improvement Score */}
          <div className={`score-metric-card ${improvementRating.class}`}>
            <div className="score-card-title"><Icons.TrendingUp /> Resume Upgrade</div>
            <div className="score-card-value-row">
              <span className="score-card-val">{improvementScore}</span>
              <span className="score-card-max">/100</span>
              <span className={`score-card-lbl ${improvementRating.class}`}>{improvementRating.label}</span>
            </div>
            <div className="score-card-desc">Score evaluating grammar, formatting improvements, and structural edits.</div>
          </div>

          {/* Card 3: Job Readiness */}
          <div className={`score-metric-card ${jobReadinessRating.class}`}>
            <div className="score-card-title"><Icons.Briefcase /> Job Match</div>
            <div className="score-card-value-row">
              <span className="score-card-val">{jobReadiness}</span>
              <span className="score-card-max">/100</span>
              <span className={`score-card-lbl ${jobReadinessRating.class}`}>{jobReadinessRating.label}</span>
            </div>
            <div className="score-card-desc">Score indicating how well this resume matches target job roles.</div>
          </div>

          {/* Card 4: Interview Readiness */}
          <div className={`score-metric-card ${interviewReadinessRating.class}`}>
            <div className="score-card-title"><Icons.Target /> Interview Prep</div>
            <div className="score-card-value-row">
              <span className="score-card-val">{interviewReadiness}</span>
              <span className="score-card-max">/100</span>
              <span className={`score-card-lbl ${interviewReadinessRating.class}`}>{interviewReadinessRating.label}</span>
            </div>
            <div className="score-card-desc">Estimated recruiter screening pass and interview callback rate.</div>
          </div>

        </div>

        {/* Job Description Matcher Card */}
        {renderJdMatcherPanel()}


        {/* Resume Overview Section */}
        <div className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <h3 className="explanation-title" style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Icons.FileText /> Resume Overview & Classification
          </h3>
          
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "1.5rem" }} className="ats-dashboard-grid">
            {/* Left Column: Summary & Profile */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <strong style={{ display: "block", fontSize: "0.82rem", color: "var(--color-primary)", marginBottom: "0.35rem" }}>Professional Summary</strong>
                <p style={{ fontSize: "0.82rem", color: "var(--color-text-main)", lineHeight: "1.5", margin: 0, padding: "0.75rem 1rem", background: "#F8FAFC", borderRadius: "8px", border: "1px solid var(--card-border)" }}>
                  {atsAnalysis.professional_summary || "No professional summary generated."}
                </p>
              </div>
              <div>
                <strong style={{ display: "block", fontSize: "0.82rem", color: "var(--color-primary)", marginBottom: "0.35rem" }}>Candidate Profile</strong>
                <p style={{ fontSize: "0.82rem", color: "var(--color-text-main)", lineHeight: "1.5", margin: 0, padding: "0.75rem 1rem", background: "#F8FAFC", borderRadius: "8px", border: "1px solid var(--card-border)" }}>
                  {atsAnalysis.candidate_profile || "No profile details generated."}
                </p>
              </div>
            </div>
            
            {/* Right Column: Spacing classification & tags */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div style={{ padding: "0.75rem", background: "#F8FAFC", borderRadius: "8px", border: "1px solid var(--card-border)", textAlign: "center" }}>
                  <div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", fontWeight: "600" }}>Career Level</div>
                  <div style={{ fontSize: "0.88rem", fontWeight: "700", color: "var(--color-primary)", marginTop: "0.25rem" }}>{atsAnalysis.career_level || "N/A"}</div>
                </div>
                <div style={{ padding: "0.75rem", background: "#F8FAFC", borderRadius: "8px", border: "1px solid var(--card-border)", textAlign: "center" }}>
                  <div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", fontWeight: "600" }}>Experience Level</div>
                  <div style={{ fontSize: "0.88rem", fontWeight: "700", color: "var(--color-primary)", marginTop: "0.25rem" }}>{atsAnalysis.experience_level || "N/A"}</div>
                </div>
                <div style={{ padding: "0.75rem", background: "#F8FAFC", borderRadius: "8px", border: "1px solid var(--card-border)", textAlign: "center", gridColumn: "span 2" }}>
                  <div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", fontWeight: "600" }}>Industry Classification</div>
                  <div style={{ fontSize: "0.88rem", fontWeight: "700", color: "var(--color-primary)", marginTop: "0.25rem" }}>{atsAnalysis.industry_classification || "N/A"}</div>
                </div>
              </div>
              
              <div>
                <strong style={{ display: "block", fontSize: "0.82rem", color: "var(--color-primary)", marginBottom: "0.35rem" }}>Top Detected Skills</strong>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                  {(atsAnalysis.current_skills && atsAnalysis.current_skills.length > 0 ? atsAnalysis.current_skills : (selectedResume.skills || [])).map((skill, idx) => (
                    <span key={idx} className="keyword-chip" style={{ background: "rgba(79, 70, 229, 0.05)", border: "1px solid rgba(79, 70, 229, 0.15)", color: "var(--color-primary)", fontSize: "0.75rem", padding: "0.25rem 0.55rem", borderRadius: "6px" }}>
                      {skill}
                    </span>
                  ))}
                  {(!atsAnalysis.current_skills || atsAnalysis.current_skills.length === 0) && (!selectedResume.skills || selectedResume.skills.length === 0) && (
                    <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", fontStyle: "italic" }}>No skills detected.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }} className="ats-dashboard-grid">
            <div style={{ padding: "1rem", background: "rgba(16, 185, 129, 0.03)", border: "1px solid rgba(16, 185, 129, 0.15)", borderRadius: "8px" }}>
              <strong style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.82rem", color: "var(--color-success)", marginBottom: "0.5rem" }}>
                <span>👍 Top Candidate Strengths</span>
              </strong>
              <ul style={{ paddingLeft: "1.2rem", fontSize: "0.8rem", color: "var(--color-text-main)", margin: 0, display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                {(atsAnalysis.strengths || []).map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
                {(atsAnalysis.strengths || []).length === 0 && (
                  <li>Structured format parser passed successfully.</li>
                )}
              </ul>
            </div>
            
            <div style={{ padding: "1rem", background: "rgba(239, 68, 68, 0.03)", border: "1px solid rgba(239, 68, 68, 0.15)", borderRadius: "8px" }}>
              <strong style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.82rem", color: "var(--color-danger)", marginBottom: "0.5rem" }}>
                <span>⚠️ Primary Weaknesses & Concerns</span>
              </strong>
              <ul style={{ paddingLeft: "1.2rem", fontSize: "0.8rem", color: "var(--color-text-main)", margin: 0, display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                {(atsAnalysis.weaknesses || []).map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
                {(atsAnalysis.weaknesses || []).length === 0 && (
                  <li>No high-risk red flags or timeline gaps detected.</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Dashboard split grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: "1.5rem" }} className="ats-dashboard-grid">
          
          {/* Left Column: Category Checklist */}
          <div className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <h3 className="explanation-title"><Icons.Briefcase /> Section Analysis & Audits</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {categories.map((cat, idx) => {
                const isGood = cat.score >= 80;
                const isMed = cat.score >= 50;
                return (
                  <div key={idx} style={{ padding: "0.85rem 1rem", borderRadius: "12px", background: "#F8FAFC", border: "1px solid var(--card-border)", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: "700", fontSize: "0.9rem", color: "var(--color-text-main)" }}>{cat.name}</span>
                      <span className={`audit-score-pill ${isGood ? "score-pill-high" : isMed ? "score-pill-med" : "score-pill-low"}`} style={{ margin: 0 }}>
                        Score: {cat.score}%
                      </span>
                    </div>
                    <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", lineHeight: "1.4" }}>{cat.reason}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Score explanation + Recruiter Intelligence */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            
            {/* Explanation panel */}
            <div className="explanation-panel">
              <h3 className="explanation-title">Why is my score {selectedResume.ats_score}?</h3>
              <div className="explanation-list">
                {credits.map((c, i) => (
                  <div key={`c-${i}`} className="explanation-item credit">
                    <span>✨ {c.desc}</span>
                    <span className="explanation-badge credit-badge">+{c.pts}</span>
                  </div>
                ))}
                {parsedDeductions.map((d, i) => (
                  <div key={`d-${i}`} className="explanation-item deduction">
                    <span>⚠️ {d.desc}</span>
                    <span className="explanation-badge deduction-badge">{d.pts}</span>
                  </div>
                ))}
                {credits.length === 0 && parsedDeductions.length === 0 && (
                  <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", textAlign: "center" }}>No score modifications detected.</p>
                )}
              </div>
            </div>

            {/* Recruiter Intelligence */}
            <div className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <h3 className="explanation-title"><Icons.User /> Recruiter Intelligence Audit</h3>
              
              <div style={{ display: "flex", gap: "1rem", fontSize: "0.8rem" }}>
                <div><strong>Confidence Level:</strong> <span style={{ textTransform: "uppercase", padding: "0.15rem 0.5rem", borderRadius: "99px", background: "rgba(79, 70, 229, 0.08)", color: "var(--color-primary)", fontWeight: "700" }}>{atsAnalysis.confidence_level || "Medium"}</span></div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.25rem" }}>
                <div>
                  <strong style={{ display: "block", fontSize: "0.85rem", color: "var(--color-success)", marginBottom: "0.25rem" }}>👍 What Recruiters Will Like:</strong>
                  <ul style={{ paddingLeft: "1.2rem", fontSize: "0.8rem", color: "var(--color-text-main)", display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                    {(atsAnalysis.recruiters_like && atsAnalysis.recruiters_like.length > 0 ? atsAnalysis.recruiters_like : ["Comprehensive education background", "Key technical keywords match standard profiles"]).map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <strong style={{ display: "block", fontSize: "0.85rem", color: "var(--color-warning)", marginBottom: "0.25rem" }}>⚠️ Recruiter Screening Concerns:</strong>
                  <ul style={{ paddingLeft: "1.2rem", fontSize: "0.8rem", color: "var(--color-text-main)", display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                    {(atsAnalysis.recruiters_reject && atsAnalysis.recruiters_reject.length > 0 ? atsAnalysis.recruiters_reject : ["Lacks detailed metrics in oldest roles", "No GitHub link found"]).map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <strong style={{ display: "block", fontSize: "0.85rem", color: "var(--color-danger)", marginBottom: "0.25rem" }}>🔥 High Risk Red Flags:</strong>
                  <ul style={{ paddingLeft: "1.2rem", fontSize: "0.8rem", color: "var(--color-text-main)", display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                    {(atsAnalysis.top_risks && atsAnalysis.top_risks.length > 0 ? atsAnalysis.top_risks : ["Potential timeline overlap", "Formatting density is high"]).map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    );
  };

  const renderResumeUpgradeTab = () => {
    if (!selectedResume || !selectedResume.ats_analysis) {
      return (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p>Please run the ATS Audit on the ATS Analysis tab to unlock recommendations.</p>
        </div>
      );
    }

    const keywordSuggestions = selectedResume.ats_analysis.keyword_suggestions || [];
    const improvedSummary = selectedResume.ats_analysis.improved_summary || "";
    const improvedExperience = selectedResume.ats_analysis.improved_experience || [];
    const improvedProjects = selectedResume.ats_analysis.improved_projects || [];
    const originalSummary = selectedResume.raw_text ? selectedResume.raw_text.split("\n").filter(Boolean).slice(0, 4).join(" ") : "Brief summary missing key achievements.";

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        
        {/* Keyword Suggestions Card */}
        <div className="glass-panel">
          <h3 className="panel-title">
            <span className="panel-title-text">🚀 High-Impact Keyword Suggestions</span>
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "0.85rem" }}>
            Add these targeted skills and keywords to increase your ATS keyword density and matching index.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {keywordSuggestions.length > 0 ? (
              keywordSuggestions.map((kw, idx) => (
                <span key={idx} className="keyword-chip" style={{ background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.2)", color: "var(--color-success)", fontWeight: "600", padding: "0.3rem 0.75rem", borderRadius: "99px", fontSize: "0.8rem" }}>
                  + {kw}
                </span>
              ))
            ) : (
              <p style={{ fontSize: "0.8rem", fontStyle: "italic" }}>No keyword suggestions available.</p>
            )}
          </div>
        </div>

        {/* Executive Summary Upgrade */}
        {improvedSummary && (
          <div className="glass-panel">
            <h3 className="panel-title">
              <span className="panel-title-text">📄 Executive Summary Upgrade</span>
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginTop: "1rem" }}>
              <div className="compare-pane original" style={{ background: "#FAFAFA", border: "1px solid #E5E7EB", borderRadius: "12px", padding: "1.25rem" }}>
                <strong style={{ display: "block", fontSize: "0.8rem", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>Original Summary</strong>
                <p style={{ fontSize: "0.85rem", lineHeight: "1.5" }}>{originalSummary}</p>
              </div>
              <div className="compare-pane enhanced" style={{ background: "#F0FDF4", border: "1px solid #DCFCE7", borderRadius: "12px", padding: "1.25rem" }}>
                <strong style={{ display: "block", fontSize: "0.8rem", textTransform: "uppercase", color: "var(--color-success)", marginBottom: "0.5rem" }}>Polished & Quantified (AI Suggested)</strong>
                <p style={{ fontSize: "0.85rem", lineHeight: "1.5" }}>{highlightEnhancements(improvedSummary)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Experience Polish */}
        {improvedExperience.length > 0 && (
          <div className="glass-panel">
            <h3 className="panel-title">
              <span className="panel-title-text">💼 Professional Experience Refinements</span>
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "1rem" }}>
              Compare original bullet points with polished versions optimized for active verbs and quantified impacts.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {improvedExperience.map((exp, idx) => (
                <div key={idx} style={{ borderBottom: idx < improvedExperience.length - 1 ? "1px solid var(--card-border)" : "none", paddingBottom: "1.5rem" }}>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "0.75rem" }}>{exp.role} at {exp.company}</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                    <div className="compare-pane original" style={{ background: "#FAFAFA", border: "1px solid #E5E7EB", borderRadius: "12px", padding: "1.25rem" }}>
                      <strong style={{ display: "block", fontSize: "0.8rem", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>Original Bullet Points</strong>
                      <ul style={{ paddingLeft: "1.2rem", fontSize: "0.85rem", lineHeight: "1.5" }}>
                        {(exp.original || "").split("\n").filter(Boolean).map((pt, i) => (
                          <li key={i} style={{ marginBottom: "0.35rem" }}>{pt.replace(/^-\s*/, "")}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="compare-pane enhanced" style={{ background: "#F0FDF4", border: "1px solid #DCFCE7", borderRadius: "12px", padding: "1.25rem" }}>
                      <strong style={{ display: "block", fontSize: "0.8rem", textTransform: "uppercase", color: "var(--color-success)", marginBottom: "0.5rem" }}>Polished (AI Highlighted Verbs)</strong>
                      <ul style={{ paddingLeft: "1.2rem", fontSize: "0.85rem", lineHeight: "1.5" }}>
                        {(exp.improved || "").split("\n").filter(Boolean).map((pt, i) => (
                          <li key={i} style={{ marginBottom: "0.35rem" }}>{highlightEnhancements(pt.replace(/^-\s*/, ""))}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Representative Projects Upgrade */}
        {improvedProjects.length > 0 && (
          <div className="glass-panel">
            <h3 className="panel-title">
              <span className="panel-title-text">🚀 Project Description Enhancements</span>
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "1rem" }}>
              Polish your project contributions to showcase design patterns, technologies, and scalability.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {improvedProjects.map((proj, idx) => (
                <div key={idx} style={{ borderBottom: idx < improvedProjects.length - 1 ? "1px solid var(--card-border)" : "none", paddingBottom: "1.5rem" }}>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "0.75rem" }}>{proj.title}</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                    <div className="compare-pane original" style={{ background: "#FAFAFA", border: "1px solid #E5E7EB", borderRadius: "12px", padding: "1.25rem" }}>
                      <strong style={{ display: "block", fontSize: "0.8rem", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>Original Summary</strong>
                      <p style={{ fontSize: "0.85rem", lineHeight: "1.5" }}>{proj.original}</p>
                    </div>
                    <div className="compare-pane enhanced" style={{ background: "#F0FDF4", border: "1px solid #DCFCE7", borderRadius: "12px", padding: "1.25rem" }}>
                      <strong style={{ display: "block", fontSize: "0.8rem", textTransform: "uppercase", color: "var(--color-success)", marginBottom: "0.5rem" }}>Polished (AI Suggested)</strong>
                      <p style={{ fontSize: "0.85rem", lineHeight: "1.5" }}>{highlightEnhancements(proj.improved)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    );
  };

  const renderCoverLetterTab = () => {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.25fr", gap: "1.5rem" }} className="ats-dashboard-grid">
        
        {/* Left Column: Generator Form & Version Switcher */}
        <div className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h3 className="panel-title">
            <span className="panel-title-text">✉ AI Cover Letter Generator</span>
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
            Generate three distinct versions of a tailored cover letter customized for a specific target company, role, and industry.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            <div className="auth-field">
              <label htmlFor="cover-job-title" className="auth-label">Target Job Title</label>
              <input 
                id="cover-job-title"
                type="text" 
                className="auth-input" 
                placeholder="e.g. Senior Software Engineer"
                value={coverJobTitle}
                onChange={(e) => setCoverJobTitle(e.target.value)}
              />
            </div>
            
            <div className="auth-field">
              <label htmlFor="cover-company-name" className="auth-label">Target Company Name</label>
              <input 
                id="cover-company-name"
                type="text" 
                className="auth-input" 
                placeholder="e.g. Google"
                value={coverCompanyName}
                onChange={(e) => setCoverCompanyName(e.target.value)}
              />
            </div>
            
            <div className="auth-field">
              <label htmlFor="cover-industry" className="auth-label">Target Industry (Optional)</label>
              <input 
                id="cover-industry"
                type="text" 
                className="auth-input" 
                placeholder="e.g. Technology"
                value={coverIndustry}
                onChange={(e) => setCoverIndustry(e.target.value)}
              />
            </div>

            <button 
              className="btn-primary" 
              style={{ width: "100%", padding: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }} 
              onClick={handleGenerateCoverLetter}
              disabled={coverLoading}
            >
              {coverLoading ? (
                <React.Fragment>
                  <div className="spinner-micro"></div>
                  <span>Generating Versions...</span>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <Icons.Cpu />
                  <span>Generate Cover Letter</span>
                </React.Fragment>
              )}
            </button>
          </div>

          {coverLetterVersions && (
            <div style={{ marginTop: "1rem", borderTop: "1px solid var(--card-border)", paddingTop: "1rem" }}>
              <strong style={{ display: "block", fontSize: "0.8rem", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>Select Cover Letter Style</strong>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <button 
                  className={`btn-secondary ${activeCoverVersion === "professional" ? "active" : ""}`}
                  style={{ justifyContent: "flex-start", width: "100%", background: activeCoverVersion === "professional" ? "rgba(79, 70, 229, 0.08)" : "", borderColor: activeCoverVersion === "professional" ? "var(--color-primary)" : "" }}
                  onClick={() => {
                    setActiveCoverVersion("professional");
                    setCoverLetterText(coverLetterVersions.professional);
                  }}
                >
                  💼 Professional Standard
                </button>
                <button 
                  className={`btn-secondary ${activeCoverVersion === "entry_level" ? "active" : ""}`}
                  style={{ justifyContent: "flex-start", width: "100%", background: activeCoverVersion === "entry_level" ? "rgba(79, 70, 229, 0.08)" : "", borderColor: activeCoverVersion === "entry_level" ? "var(--color-primary)" : "" }}
                  onClick={() => {
                    setActiveCoverVersion("entry_level");
                    setCoverLetterText(coverLetterVersions.entry_level);
                  }}
                >
                  🎓 Entry-Level / Graduate
                </button>
                <button 
                  className={`btn-secondary ${activeCoverVersion === "experienced" ? "active" : ""}`}
                  style={{ justifyContent: "flex-start", width: "100%", background: activeCoverVersion === "experienced" ? "rgba(79, 70, 229, 0.08)" : "", borderColor: activeCoverVersion === "experienced" ? "var(--color-primary)" : "" }}
                  onClick={() => {
                    setActiveCoverVersion("experienced");
                    setCoverLetterText(coverLetterVersions.experienced);
                  }}
                >
                  🚀 Experienced / Specialized
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Physical Paper Preview */}
        <div className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 className="panel-title" style={{ margin: 0 }}>
              <span className="panel-title-text">📄 Live Letter Preview</span>
            </h3>
            {coverLetterText && (
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button className="btn-secondary" onClick={handleCopyCoverLetter} title="Copy cover letter text">
                  Copy
                </button>
                <button className="btn-secondary" onClick={() => handleDownloadCoverLetter("pdf")} title="Download PDF format">
                  PDF
                </button>
                <button className="btn-secondary" onClick={() => handleDownloadCoverLetter("docx")} title="Download DOCX format">
                  Word
                </button>
              </div>
            )}
          </div>

          {coverLetterText ? (
            <div className="cover-letter-paper-preview" style={{ marginTop: "0.5rem" }}>
              <textarea 
                style={{ 
                  width: "100%", 
                  height: "500px", 
                  border: "none", 
                  outline: "none", 
                  background: "transparent", 
                  fontFamily: "'Inter', Georgia, serif", 
                  fontSize: "0.92rem", 
                  lineHeight: "1.6", 
                  color: "#1E293B",
                  resize: "vertical" 
                }}
                value={coverLetterText}
                onChange={(e) => setCoverLetterText(e.target.value)}
              />
            </div>
          ) : (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "350px", border: "2px dashed var(--card-border)", borderRadius: "12px", background: "#FAFBFD", color: "var(--color-text-muted)" }}>
              <Icons.FileText style={{ fontSize: "2.5rem", color: "rgba(79, 70, 229, 0.15)", marginBottom: "0.5rem" }} />
              <p style={{ fontSize: "0.9rem", fontWeight: "600" }}>No Cover Letter Generated Yet</p>
              <p style={{ fontSize: "0.8rem", textAlign: "center", padding: "0 2rem" }}>
                Fill out target details on the left pane and hit generate to draft.
              </p>
            </div>
          )}
        </div>

      </div>
    );
  };

  const renderResumeTemplatesTab = () => {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        
        {!editedResume && (
          <div className="glass-panel" style={{ display: "flex", gap: "1rem", alignItems: "center", borderLeft: "4px solid var(--color-primary)", padding: "1rem" }}>
            <span style={{ fontSize: "1.5rem" }}>💡</span>
            <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", textAlign: "left" }}>
              <strong>Interactive Demo:</strong> Previewing templates with dummy data. Please upload a resume on the Dashboard, or select an existing one, to customize content and export your own resume!
            </div>
          </div>
        )}

        {/* Template Selection Grid */}
        <div>
          <h3 className="panel-title" style={{ marginBottom: "0.85rem" }}>
            <span className="panel-title-text">📄 Canva-Style Resume Template Gallery</span>
          </h3>
          <div className="template-gallery-grid">
            {templatesList.map(tmpl => (
              <div 
                key={tmpl.name} 
                className={`template-card-premium ${selectedTemplate === tmpl.name ? "active" : ""}`}
                style={{ position: "relative", display: "flex", flexDirection: "column" }}
              >
                <div style={{ background: tmpl.accent, height: "4px", width: "100%", position: "absolute", top: 0, left: 0 }} />
                
                {/* Visual Mockup Thumbnail */}
                <div style={{ background: "var(--color-bg-alt)", borderRadius: "8px", border: "1px solid var(--card-border)", height: "100px", display: "flex", justifyContent: "center", alignItems: "center", overflow: "hidden", marginBottom: "0.75rem" }}>
                  {renderThumbnailMockup(tmpl.name)}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.25rem" }}>
                  <div style={{ fontWeight: "700", fontSize: "0.95rem", color: "var(--color-text-main)" }}>{tmpl.name}</div>
                  <span style={{ fontSize: "0.68rem", fontWeight: "700", padding: "0.15rem 0.45rem", borderRadius: "99px", background: "rgba(79, 70, 229, 0.08)", color: "var(--color-primary)", whiteSpace: "nowrap" }}>
                    {tmpl.badge}
                  </span>
                </div>
                
                <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", margin: "0 0 1rem 0", lineHeight: "1.3", flexGrow: 1 }}>
                  <strong>Best for:</strong> {tmpl.bestFor}
                </p>
                
                {/* Action Buttons */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", marginTop: "auto" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.35rem" }}>
                    <button 
                      className="btn-secondary" 
                      onClick={() => {
                        setPreviewModalTemplate(tmpl.name);
                        setIsDummyPreview(true); // Dummy data preview
                        setZoomScale(1.0);
                        setIsPreviewModalOpen(true);
                      }}
                      style={{ padding: "0.35rem 0.5rem", fontSize: "0.72rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.2rem" }}
                      title="Preview design with professional dummy profile"
                    >
                      🎨 Preview
                    </button>
                    <button 
                      className={`btn-primary ${selectedTemplate === tmpl.name ? "active" : ""}`} 
                      onClick={() => {
                        setSelectedTemplate(tmpl.name);
                        addToast(`Applied style: ${tmpl.name}`, "success");
                      }}
                      style={{ padding: "0.35rem 0.5rem", fontSize: "0.72rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.2rem" }}
                    >
                      {selectedTemplate === tmpl.name ? "✓ Selected" : "Use Style"}
                    </button>
                  </div>
                  <button 
                    className="btn-secondary" 
                    onClick={() => {
                      if (!editedResume) {
                        addToast("Please upload or edit a resume first.", "warning");
                        return;
                      }
                      setPreviewModalTemplate(tmpl.name);
                      setIsDummyPreview(false); // Actual user resume preview
                      setZoomScale(1.0);
                      setIsPreviewModalOpen(true);
                    }}
                    style={{ padding: "0.35rem 0.5rem", fontSize: "0.72rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.2rem", width: "100%" }}
                  >
                    👁️ View Resume
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Editor and Preview Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "1.5rem" }} className="ats-dashboard-grid">
          
          {/* Left: Form Editor Accordion */}
          <div className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "1.25rem", height: "fit-content" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 className="panel-title" style={{ margin: 0 }}>
                <span className="panel-title-text">⚙️ Resume Content Editor</span>
              </h3>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button className="btn-primary" onClick={handleSaveResume} disabled={loading} style={{ padding: "0.4rem 0.85rem", fontSize: "0.8rem" }}>
                  {loading ? "Saving..." : "Save Changes"}
                </button>
                <button className="btn-secondary" onClick={() => handleExportTemplate("pdf")} style={{ padding: "0.4rem 0.85rem", fontSize: "0.8rem" }}>
                  Export PDF
                </button>
                <button className="btn-secondary" onClick={() => handleExportTemplate("docx")} style={{ padding: "0.4rem 0.85rem", fontSize: "0.8rem" }}>
                  Export Word
                </button>
              </div>
            </div>

            {/* Accordion Sections */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              
              {/* Section 1: Contact Details */}
              <div style={{ border: "1px solid var(--card-border)", borderRadius: "8px", overflow: "hidden" }}>
                <div 
                  onClick={() => toggleSection("contact")}
                  style={{ background: "#F8FAFC", padding: "0.75rem 1rem", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", fontWeight: "700", fontSize: "0.85rem" }}
                >
                  <span>👤 Contact Details</span>
                  <span>{expandedSections.contact ? "▲" : "▼"}</span>
                </div>
                {expandedSections.contact && (
                  <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem", borderTop: "1px solid var(--card-border)" }}>
                    <div className="auth-field">
                      <label htmlFor="edit-resume-name" className="auth-label">Full Name</label>
                      <input id="edit-resume-name" type="text" className="auth-input" value={editedResume.name} onChange={e => updateField("name", e.target.value)} />
                    </div>
                    <div className="auth-field">
                      <label htmlFor="edit-resume-email" className="auth-label">Email Address</label>
                      <input id="edit-resume-email" type="email" className="auth-input" value={editedResume.email} onChange={e => updateField("email", e.target.value)} />
                    </div>
                    <div className="auth-field">
                      <label htmlFor="edit-resume-phone" className="auth-label">Phone Number</label>
                      <input id="edit-resume-phone" type="text" className="auth-input" value={editedResume.phone} onChange={e => updateField("phone", e.target.value)} />
                    </div>
                  </div>
                )}
              </div>

              {/* Section 2: Skills */}
              <div style={{ border: "1px solid var(--card-border)", borderRadius: "8px", overflow: "hidden" }}>
                <div 
                  onClick={() => toggleSection("skills")}
                  style={{ background: "#F8FAFC", padding: "0.75rem 1rem", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", fontWeight: "700", fontSize: "0.85rem" }}
                >
                  <span>🛠 Technical Skills</span>
                  <span>{expandedSections.skills ? "▲" : "▼"}</span>
                </div>
                {expandedSections.skills && (
                  <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem", borderTop: "1px solid var(--card-border)" }}>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <input 
                        aria-label="Add new skill tag"
                        type="text" 
                        className="auth-input" 
                        placeholder="Add skill tag..." 
                        value={newSkillInput} 
                        onChange={e => setNewSkillInput(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSkillTag(); } }}
                      />
                      <button className="btn-primary" onClick={addSkillTag} style={{ padding: "0.45rem 1rem" }}>Add</button>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginTop: "0.25rem" }}>
                      {editedResume.skills.map((s, idx) => (
                        <span key={idx} className="keyword-chip" style={{ display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.25rem 0.5rem", borderRadius: "6px" }}>
                          {s}
                          <button onClick={() => removeSkillTag(idx)} style={{ background: "transparent", border: "none", color: "var(--color-danger)", cursor: "pointer", fontWeight: "bold", padding: 0 }}>&times;</button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Section 3: Work Experience */}
              <div style={{ border: "1px solid var(--card-border)", borderRadius: "8px", overflow: "hidden" }}>
                <div 
                  onClick={() => toggleSection("experience")}
                  style={{ background: "#F8FAFC", padding: "0.75rem 1rem", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", fontWeight: "700", fontSize: "0.85rem" }}
                >
                  <span>💼 Work Experience</span>
                  <span>{expandedSections.experience ? "▲" : "▼"}</span>
                </div>
                {expandedSections.experience && (
                  <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "1rem", borderTop: "1px solid var(--card-border)" }}>
                    {editedResume.experience.map((exp, idx) => (
                      <div key={idx} style={{ padding: "0.75rem", border: "1px solid var(--card-border)", borderRadius: "6px", background: "#FAFBFD", position: "relative" }}>
                        <button 
                          onClick={() => removeListItem("experience", idx)} 
                          style={{ position: "absolute", top: "5px", right: "5px", background: "transparent", border: "none", color: "var(--color-danger)", cursor: "pointer", fontWeight: "bold" }}
                        >
                          Delete
                        </button>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginTop: "0.5rem" }}>
                          <div className="auth-field">
                            <label htmlFor={`edit-exp-role-${idx}`} className="auth-label">Role Title</label>
                            <input id={`edit-exp-role-${idx}`} type="text" className="auth-input" value={exp.role || ""} onChange={e => updateListField("experience", idx, "role", e.target.value)} />
                          </div>
                          <div className="auth-field">
                            <label htmlFor={`edit-exp-company-${idx}`} className="auth-label">Company Name</label>
                            <input id={`edit-exp-company-${idx}`} type="text" className="auth-input" value={exp.company || ""} onChange={e => updateListField("experience", idx, "company", e.target.value)} />
                          </div>
                          <div className="auth-field">
                            <label htmlFor={`edit-exp-start-${idx}`} className="auth-label">Start Date</label>
                            <input id={`edit-exp-start-${idx}`} type="text" className="auth-input" value={exp.start_date || ""} onChange={e => updateListField("experience", idx, "start_date", e.target.value)} />
                          </div>
                          <div className="auth-field">
                            <label htmlFor={`edit-exp-end-${idx}`} className="auth-label">End Date</label>
                            <input id={`edit-exp-end-${idx}`} type="text" className="auth-input" value={exp.end_date || ""} onChange={e => updateListField("experience", idx, "end_date", e.target.value)} />
                          </div>
                          <div className="auth-field" style={{ gridColumn: "span 2" }}>
                            <label htmlFor={`edit-exp-desc-${idx}`} className="auth-label">Bullet points (One per line)</label>
                            <textarea 
                              id={`edit-exp-desc-${idx}`}
                              className="auth-input" 
                              style={{ height: "100px", resize: "vertical", fontFamily: "inherit" }} 
                              value={exp.description || ""} 
                              onChange={e => updateListField("experience", idx, "description", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    <button className="btn-secondary" onClick={() => addListItem("experience", { role: "", company: "", start_date: "", end_date: "", description: "" })}>
                      + Add Position
                    </button>
                  </div>
                )}
              </div>

              {/* Section 4: Projects */}
              <div style={{ border: "1px solid var(--card-border)", borderRadius: "8px", overflow: "hidden" }}>
                <div 
                  onClick={() => toggleSection("projects")}
                  style={{ background: "#F8FAFC", padding: "0.75rem 1rem", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", fontWeight: "700", fontSize: "0.85rem" }}
                >
                  <span>📁 Projects Portfolio</span>
                  <span>{expandedSections.projects ? "▲" : "▼"}</span>
                </div>
                {expandedSections.projects && (
                  <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "1rem", borderTop: "1px solid var(--card-border)" }}>
                    {editedResume.projects.map((proj, idx) => (
                      <div key={idx} style={{ padding: "0.75rem", border: "1px solid var(--card-border)", borderRadius: "6px", background: "#FAFBFD", position: "relative" }}>
                        <button 
                          onClick={() => removeListItem("projects", idx)} 
                          style={{ position: "absolute", top: "5px", right: "5px", background: "transparent", border: "none", color: "var(--color-danger)", cursor: "pointer", fontWeight: "bold" }}
                        >
                          Delete
                        </button>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginTop: "0.5rem" }}>
                          <div className="auth-field">
                            <label htmlFor={`edit-proj-title-${idx}`} className="auth-label">Project Title</label>
                            <input id={`edit-proj-title-${idx}`} type="text" className="auth-input" value={proj.title || ""} onChange={e => updateListField("projects", idx, "title", e.target.value)} />
                          </div>
                          <div className="auth-field">
                            <label htmlFor={`edit-proj-tech-${idx}`} className="auth-label">Technologies (comma separated)</label>
                            <input id={`edit-proj-tech-${idx}`} type="text" className="auth-input" value={Array.isArray(proj.technologies) ? proj.technologies.join(", ") : proj.technologies || ""} onChange={e => updateListField("projects", idx, "technologies", e.target.value)} />
                          </div>
                          <div className="auth-field" style={{ gridColumn: "span 2" }}>
                            <label htmlFor={`edit-proj-desc-${idx}`} className="auth-label">Project Description</label>
                            <textarea 
                              id={`edit-proj-desc-${idx}`}
                              className="auth-input" 
                              style={{ height: "60px", resize: "vertical", fontFamily: "inherit" }} 
                              value={proj.description || ""} 
                              onChange={e => updateListField("projects", idx, "description", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    <button className="btn-secondary" onClick={() => addListItem("projects", { title: "", technologies: "", description: "" })}>
                      + Add Project
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Live Preview Panel */}
          <div className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 className="panel-title" style={{ margin: 0 }}>
                <span className="panel-title-text">🔍 Live Resume Preview</span>
              </h3>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <button 
                  className={`btn-secondary ${isCompareMode ? "active-indigo" : ""}`} 
                  onClick={() => setIsCompareMode(!isCompareMode)}
                  style={{ padding: "0.35rem 0.75rem", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.25rem" }}
                  title="Compare with another layout side-by-side"
                >
                  ⚔️ Compare
                </button>
                <button 
                  className="btn-primary" 
                  onClick={() => {
                    setPreviewModalTemplate(selectedTemplate);
                    setZoomScale(1.0);
                    setIsPreviewModalOpen(true);
                  }}
                  style={{ padding: "0.35rem 0.75rem", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.25rem" }}
                >
                  👁️ Fullscreen
                </button>
              </div>
            </div>
            
            {isCompareMode ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <div style={{ fontSize: "0.75rem", fontWeight: "700", marginBottom: "0.25rem", color: "var(--color-text-muted)" }}>
                    Current: {selectedTemplate}
                  </div>
                  <div style={{ border: "1px solid var(--card-border)", borderRadius: "12px", background: "#ffffff", padding: "1rem", maxHeight: "650px", overflowY: "auto" }}>
                    {renderLivePreview(selectedTemplate)}
                  </div>
                </div>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-primary)" }}>Compare:</span>
                    <select 
                      value={compareTemplate} 
                      onChange={(e) => setCompareTemplate(e.target.value)} 
                      className="builder-input" 
                      style={{ padding: "0.2rem 0.4rem", fontSize: "0.72rem", width: "auto", border: "1px solid var(--color-primary)" }}
                    >
                      {templatesList.filter(t => t.name !== selectedTemplate).map(t => (
                        <option key={t.name} value={t.name}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ border: "1px solid var(--card-border)", borderRadius: "12px", background: "#ffffff", padding: "1rem", maxHeight: "650px", overflowY: "auto" }}>
                    {renderLivePreview(compareTemplate)}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ border: "1px solid var(--card-border)", borderRadius: "12px", background: "#ffffff", padding: "1.25rem", maxHeight: "700px", overflowY: "auto" }}>
                {renderLivePreview(selectedTemplate)}
              </div>
            )}
          </div>

        </div>

      </div>
    );
  };

  const renderJobMatchTab = () => {
    if (!selectedResume || !selectedResume.ats_analysis) {
      return (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p>Please run the ATS Audit on the ATS Analysis tab to unlock Job Match insights.</p>
        </div>
      );
    }

    const atsAnalysis = selectedResume.ats_analysis;
    const topJobRoles = atsAnalysis.top_job_roles || [];
    const highGaps = atsAnalysis.high_priority_gaps || [];
    const medGaps = atsAnalysis.medium_priority_gaps || [];
    const lowGaps = atsAnalysis.low_priority_gaps || [];
    
    const day7 = atsAnalysis.seven_day_plan || [];
    const day30 = atsAnalysis.thirty_day_plan || [];
    const day60 = atsAnalysis.sixty_day_plan || [];
    const day90 = atsAnalysis.ninety_day_plan || [];

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        
        {/* Top Matching Roles Section */}
        <div>
          <h3 className="panel-title" style={{ marginBottom: "0.85rem" }}>
            <span className="panel-title-text">🎯 Target Industry Career Matching Roles</span>
          </h3>
          {topJobRoles.length > 0 ? (
            <div className="job-cards-grid">
              {topJobRoles.map((role, idx) => {
                const matchVal = role.match_score;
                const matchClass = matchVal >= 80 ? "high" : matchVal >= 50 ? "medium" : "low";
                return (
                  <div key={idx} className="job-match-card-premium">
                    <div className="job-match-card-header">
                      <h4 className="job-match-card-title">{role.role}</h4>
                      <span className={`job-match-card-badge ${matchClass}`}>{matchVal}% Match</span>
                    </div>
                    <div className="job-match-card-meta">
                      <span>💰 Salary: {role.expected_salary || "N/A"}</span>
                      <span>📈 Entry: {role.difficulty || "Medium"}</span>
                    </div>
                    {role.skill_gaps && role.skill_gaps.length > 0 && (
                      <div>
                        <strong className="job-match-card-gaps-title">Missing Skill Gaps:</strong>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem", marginTop: "0.25rem" }}>
                          {role.skill_gaps.slice(0, 3).map((gap, i) => (
                            <span key={i} className="keyword-chip miss" style={{ fontSize: "0.68rem", padding: "0.1rem 0.35rem" }}>{gap}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", fontStyle: "italic" }}>No matching job roles computed yet.</p>
          )}
        </div>

        {/* Skill Gaps Priorities Grid */}
        <div className="glass-panel">
          <h3 className="panel-title">
            <span className="panel-title-text">⚠️ Skill Gap Priority Mapping</span>
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "1rem" }}>
            Categorized skill gaps to prioritize based on industry demand and employer search volume.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
            
            {/* High Priority */}
            <div style={{ background: "rgba(239, 68, 68, 0.02)", border: "1px solid rgba(239, 68, 68, 0.1)", borderRadius: "12px", padding: "1rem" }}>
              <strong style={{ display: "block", color: "var(--color-danger)", fontSize: "0.85rem", marginBottom: "0.5rem" }}>🔥 High Priority (Add Immediately)</strong>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                {highGaps.length > 0 ? highGaps.map((g, i) => (
                  <span key={i} className="keyword-chip miss" style={{ fontSize: "0.72rem" }}>{g}</span>
                )) : <span style={{ fontSize: "0.75rem", fontStyle: "italic" }}>None identified</span>}
              </div>
            </div>

            {/* Medium Priority */}
            <div style={{ background: "rgba(245, 158, 11, 0.02)", border: "1px solid rgba(245, 158, 11, 0.1)", borderRadius: "12px", padding: "1rem" }}>
              <strong style={{ display: "block", color: "var(--color-warning)", fontSize: "0.85rem", marginBottom: "0.5rem" }}>⚠️ Medium Priority (Highly Recommended)</strong>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                {medGaps.length > 0 ? medGaps.map((g, i) => (
                  <span key={i} className="keyword-chip" style={{ background: "rgba(245, 158, 11, 0.08)", border: "1px solid rgba(245, 158, 11, 0.15)", color: "var(--color-warning)", fontSize: "0.72rem", padding: "0.2rem 0.5rem", borderRadius: "4px", fontWeight: "600" }}>{g}</span>
                )) : <span style={{ fontSize: "0.75rem", fontStyle: "italic" }}>None identified</span>}
              </div>
            </div>

            {/* Low Priority */}
            <div style={{ background: "rgba(59, 130, 246, 0.02)", border: "1px solid rgba(59, 130, 246, 0.1)", borderRadius: "12px", padding: "1rem" }}>
              <strong style={{ display: "block", color: "var(--color-secondary)", fontSize: "0.85rem", marginBottom: "0.5rem" }}>✨ Low Priority (Nice to Have)</strong>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                {lowGaps.length > 0 ? lowGaps.map((g, i) => (
                  <span key={i} className="keyword-chip" style={{ background: "rgba(59, 130, 246, 0.08)", border: "1px solid rgba(59, 130, 246, 0.15)", color: "var(--color-secondary)", fontSize: "0.72rem", padding: "0.2rem 0.5rem", borderRadius: "4px", fontWeight: "600" }}>{g}</span>
                )) : <span style={{ fontSize: "0.75rem", fontStyle: "italic" }}>None identified</span>}
              </div>
            </div>

          </div>
        </div>

        {/* Career Roadmap Timeline */}
        <div className="glass-panel">
          <h3 className="panel-title">
            <span className="panel-title-text">📅 Actionable Career Upgrade Roadmap</span>
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "1.25rem" }}>
            A structured roadmap to build missing skills, update projects, and prepare for interviews over a 90-day cycle.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            
            {/* 7 Days */}
            <div style={{ display: "flex", gap: "1rem" }}>
              <div style={{ minWidth: "80px", fontWeight: "800", color: "var(--color-primary)", fontSize: "0.85rem", textTransform: "uppercase" }}>7 Days</div>
              <div style={{ borderLeft: "2px solid var(--color-primary)", paddingLeft: "1rem" }}>
                <ul style={{ paddingLeft: "1rem", fontSize: "0.82rem", color: "var(--color-text-main)", display: "flex", flexDirection: "column", gap: "0.15rem" }}>
                  {day7.length > 0 ? day7.map((item, i) => <li key={i}>{item}</li>) : <li>Add missing contact coordinates and upload latest version.</li>}
                </ul>
              </div>
            </div>

            {/* 30 Days */}
            <div style={{ display: "flex", gap: "1rem" }}>
              <div style={{ minWidth: "80px", fontWeight: "800", color: "var(--color-secondary)", fontSize: "0.85rem", textTransform: "uppercase" }}>30 Days</div>
              <div style={{ borderLeft: "2px solid var(--color-secondary)", paddingLeft: "1rem" }}>
                <ul style={{ paddingLeft: "1rem", fontSize: "0.82rem", color: "var(--color-text-main)", display: "flex", flexDirection: "column", gap: "0.15rem" }}>
                  {day30.length > 0 ? day30.map((item, i) => <li key={i}>{item}</li>) : <li>Acquire core missing keywords through short courses.</li>}
                </ul>
              </div>
            </div>

            {/* 60 Days */}
            <div style={{ display: "flex", gap: "1rem" }}>
              <div style={{ minWidth: "80px", fontWeight: "800", color: "var(--color-warning)", fontSize: "0.85rem", textTransform: "uppercase" }}>60 Days</div>
              <div style={{ borderLeft: "2px solid var(--color-warning)", paddingLeft: "1rem" }}>
                <ul style={{ paddingLeft: "1rem", fontSize: "0.82rem", color: "var(--color-text-main)", display: "flex", flexDirection: "column", gap: "0.15rem" }}>
                  {day60.length > 0 ? day60.map((item, i) => <li key={i}>{item}</li>) : <li>Deploy a new projects showcase hosting your refined stack.</li>}
                </ul>
              </div>
            </div>

            {/* 90 Days */}
            <div style={{ display: "flex", gap: "1rem" }}>
              <div style={{ minWidth: "80px", fontWeight: "800", color: "var(--color-success)", fontSize: "0.85rem", textTransform: "uppercase" }}>90 Days</div>
              <div style={{ borderLeft: "2px solid var(--color-success)", paddingLeft: "1rem" }}>
                <ul style={{ paddingLeft: "1rem", fontSize: "0.82rem", color: "var(--color-text-main)", display: "flex", flexDirection: "column", gap: "0.15rem" }}>
                  {day90.length > 0 ? day90.map((item, i) => <li key={i}>{item}</li>) : <li>Trigger screening simulator checks and start active applications.</li>}
                </ul>
              </div>
            </div>

          </div>
        </div>

        {/* Target Job Description Matcher Block */}
        {renderJdMatcherPanel()}


      </div>
    );
  };

  const renderInterviewPrepTab = () => {
    if (!selectedResume || !selectedResume.ats_analysis) {
      return (
        <div style={{ textAlign: "center", padding: "3rem 2rem", background: "#ffffff", borderRadius: "12px", border: "1px dashed var(--card-border)" }}>
          <Icons.FileText style={{ fontSize: "3rem", color: "var(--color-primary)", opacity: 0.3, marginBottom: "1rem" }} />
          <p style={{ fontWeight: "600", fontSize: "1rem" }}>Please run the ATS Audit on the ATS Analysis tab to unlock Interview Preparation tools.</p>
        </div>
      );
    }

    const renderCircularIndicator = (score, label, colorHex) => {
      const radius = 30;
      const circumference = 2 * Math.PI * radius;
      const offset = circumference - (score / 100) * circumference;
      return (
        <div className="readiness-circle-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", padding: "1rem", background: "#FAFBFD", borderRadius: "12px", border: "1px solid var(--card-border)", minWidth: "110px", flex: "1" }}>
          <div style={{ position: "relative", width: "70px", height: "70px" }}>
            <svg width="70" height="70" viewBox="0 0 70 70">
              <circle 
                cx="35" 
                cy="35" 
                r={radius} 
                fill="transparent" 
                stroke="#e2e8f0" 
                strokeWidth="6" 
              />
              <circle 
                cx="35" 
                cy="35" 
                r={radius} 
                fill="transparent" 
                stroke={colorHex} 
                strokeWidth="6" 
                strokeDasharray={circumference} 
                strokeDashoffset={offset} 
                strokeLinecap="round" 
                transform="rotate(-90 35 35)"
                style={{ transition: "stroke-dashoffset 0.5s ease-in-out" }}
              />
            </svg>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: "0.95rem", fontWeight: "bold", color: "var(--color-primary)" }}>
              {score}%
            </div>
          </div>
          <span style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--color-text-muted)", textAlign: "center" }}>{label}</span>
        </div>
      );
    };

    const categories = {
      hr: { label: "HR & Screening", key: "hr_questions", icon: "👤" },
      tech: { label: "Technical & Coding", key: "technical_questions", icon: "💻" },
      jd: { label: "JD Specific", key: "jd_questions", icon: "🎯" },
      projects: { label: "Project Deep-Dive", key: "project_questions", icon: "📂" },
      resume: { label: "Resume Audit", key: "resume_questions", icon: "👔" },
      behavioral: { label: "STAR Behavioral", key: "behavioral_questions", icon: "✨" }
    };

    const allQuestions = (interviewPrep && interviewPrep[categories[activePrepCategory].key]) || [];
    const filteredQuestions = allQuestions.filter(q => {
      if (prepDifficultyFilter === "all") return true;
      return q.difficulty.toLowerCase() === prepDifficultyFilter.toLowerCase();
    });

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        
        {/* JD Configuration & Trigger Panel */}
        <div className="glass-panel">
          <h3 className="panel-title" style={{ marginBottom: "0.5rem" }}>
            <span className="panel-title-text">🎯 Target Job Description for Preparation</span>
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "1rem" }}>
            Paste the target Job Description (JD) below to tailor all interview questions and readiness scores directly to the job's core requirements. Leaving it blank compiles prep materials based on your resume only.
          </p>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <textarea 
              className="auth-input" 
              placeholder="Paste target job description here..."
              style={{ height: "120px", resize: "none", width: "100%", boxSizing: "border-box" }}
              value={recruiterJdText}
              onChange={(e) => setRecruiterJdText(e.target.value)}
            />
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <button 
                className="btn-primary" 
                onClick={() => runInterviewPrep(selectedResume.id)}
                disabled={generatingPrep}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", flex: "1", minWidth: "200px" }}
              >
                {generatingPrep ? (
                  <React.Fragment>
                    <div className="spinner-micro"></div>
                    <span>Generating Preparation Guide...</span>
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    <Icons.Cpu />
                    <span>{interviewPrep ? "Re-Generate Guide & Scores" : "Generate Interview Guide"}</span>
                  </React.Fragment>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Generated Prep Dashboard */}
        {interviewPrep ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            
            {/* Scores & Actions panel */}
            <div className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <h3 className="panel-title" style={{ margin: 0 }}>
                <span className="panel-title-text">📊 Mock Interview Readiness Audit</span>
              </h3>
              
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "space-between" }}>
                {renderCircularIndicator(interviewPrep.overall_readiness, "Overall Readiness", "var(--color-primary)")}
                {renderCircularIndicator(interviewPrep.technical_readiness, "Technical Skills", "#10b981")}
                {renderCircularIndicator(interviewPrep.hr_readiness, "HR & Background", "#3b82f6")}
                {renderCircularIndicator(interviewPrep.communication_readiness, "Communication", "#f59e0b")}
              </div>

              <div style={{ borderTop: "1px solid var(--card-border)", paddingTop: "1rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <button 
                  className="btn-secondary" 
                  onClick={() => downloadInterviewPDF(selectedResume.id, "questions")}
                  style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", padding: "0.6rem 1rem" }}
                >
                  <Icons.FileText />
                  <span>Download Questions Sheet (Practice)</span>
                </button>
                <button 
                  className="btn-secondary" 
                  onClick={() => downloadInterviewPDF(selectedResume.id, "guide")}
                  style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", padding: "0.6rem 1rem" }}
                >
                  <Icons.FileText />
                  <span>Download Prep Study Guide (Q&A)</span>
                </button>
              </div>
            </div>

            {/* Questions Explorer panel */}
            <div className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", borderBottom: "1px solid var(--card-border)", paddingBottom: "0.75rem" }}>
                <h3 className="panel-title" style={{ margin: 0 }}>
                  <span className="panel-title-text">📚 Personalized Question Sheets</span>
                </h3>
                
                {/* Difficulty Filters */}
                <div style={{ display: "flex", gap: "0.25rem", background: "#f1f5f9", padding: "0.25rem", borderRadius: "8px", border: "1px solid var(--card-border)" }}>
                  {["all", "easy", "medium", "hard"].map((level) => (
                    <button 
                      key={level}
                      onClick={() => setPrepDifficultyFilter(level)}
                      style={{ 
                        padding: "0.35rem 0.75rem", 
                        borderRadius: "6px", 
                        border: "none", 
                        fontSize: "0.75rem", 
                        fontWeight: "600",
                        cursor: "pointer",
                        background: prepDifficultyFilter === level ? "#ffffff" : "transparent",
                        color: prepDifficultyFilter === level ? "var(--color-primary)" : "var(--color-text-muted)",
                        boxShadow: prepDifficultyFilter === level ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                        transition: "all 0.2s ease"
                      }}
                    >
                      {level.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category tabs */}
              <div className="report-tabs" style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginBottom: "0.5rem" }}>
                {Object.entries(categories).map(([key, info]) => (
                  <button 
                    key={key}
                    className={`tab-btn ${activePrepCategory === key ? "active" : ""}`}
                    onClick={() => {
                      setActivePrepCategory(key);
                      setExpandedQuestionIndex(null);
                    }}
                    style={{ fontSize: "0.8rem", padding: "0.5rem 0.95rem" }}
                  >
                    <span>{info.icon} {info.label}</span>
                  </button>
                ))}
              </div>

              {/* Accordion Questions List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {filteredQuestions.length > 0 ? filteredQuestions.map((q, idx) => {
                  const isExpanded = expandedQuestionIndex === idx;
                  const difficultyColor = q.difficulty.toLowerCase() === "easy" ? "#10b981" : q.difficulty.toLowerCase() === "medium" ? "#f59e0b" : "#ef4444";
                  
                  return (
                    <div 
                      key={idx}
                      className="question-accordion-card"
                      style={{ 
                        border: "1px solid var(--card-border)", 
                        borderRadius: "10px", 
                        background: isExpanded ? "#fbfbfe" : "#ffffff", 
                        overflow: "hidden",
                        transition: "all 0.2s ease"
                      }}
                    >
                      {/* Accordion Header */}
                      <div 
                        onClick={() => setExpandedQuestionIndex(isExpanded ? null : idx)}
                        style={{ 
                          padding: "1rem", 
                          display: "flex", 
                          justifyContent: "space-between", 
                          alignItems: "center", 
                          cursor: "pointer",
                          userSelect: "none"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1, paddingRight: "1rem" }}>
                          <span 
                            style={{ 
                              fontSize: "0.7rem", 
                              fontWeight: "bold", 
                              padding: "0.2rem 0.5rem", 
                              borderRadius: "4px", 
                              background: `${difficultyColor}15`, 
                              color: difficultyColor,
                              border: `1px solid ${difficultyColor}30`,
                              textTransform: "uppercase"
                            }}
                          >
                            {q.difficulty}
                          </span>
                          <span style={{ fontSize: "0.88rem", fontWeight: "600", color: "var(--color-text-main)", lineHeight: "1.4" }}>
                            {q.question}
                          </span>
                        </div>
                        <div style={{ color: "var(--color-text-muted)", transition: "transform 0.2s ease", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>
                          ▼
                        </div>
                      </div>

                      {/* Accordion Body */}
                      {isExpanded && (
                        <div style={{ padding: "0 1.25rem 1.25rem 1.25rem", borderTop: "1px solid var(--card-border)", background: "#ffffff" }}>
                          {/* Talking points / Recruiter expectations */}
                          <div style={{ marginTop: "1rem" }}>
                            <strong style={{ display: "block", fontSize: "0.8rem", color: "var(--color-primary)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                              🎯 What Recruiters Look For / Key Points
                            </strong>
                            <ul style={{ paddingLeft: "1.2rem", fontSize: "0.82rem", lineHeight: "1.5", display: "flex", flexDirection: "column", gap: "0.35rem", margin: 0, color: "var(--color-text-main)" }}>
                              {q.key_points && q.key_points.map((pt, i) => (
                                <li key={i}>{pt}</li>
                              ))}
                            </ul>
                          </div>

                          {/* Sample answer structure */}
                          {q.sample_answer_structure && (
                            <div style={{ marginTop: "1rem", padding: "0.85rem", background: "#f8fafc", borderRadius: "8px", border: "1px solid var(--card-border)" }}>
                              <strong style={{ display: "block", fontSize: "0.8rem", color: "#2563eb", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                💡 Sample Answer & Story Structure
                              </strong>
                              <p style={{ fontSize: "0.82rem", lineHeight: "1.5", color: "#475569", margin: 0, whiteSpace: "pre-line" }}>
                                {q.sample_answer_structure}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                }) : (
                  <div style={{ textAlign: "center", color: "var(--color-text-muted)", padding: "2rem" }}>
                    No {prepDifficultyFilter !== "all" ? prepDifficultyFilter : ""} questions found in this category.
                  </div>
                )}
              </div>
            </div>

          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "4rem 2rem", background: "#FAFBFD", borderRadius: "12px", border: "2px dashed var(--card-border)", color: "var(--color-text-muted)" }}>
            <Icons.Cpu style={{ fontSize: "3rem", color: "rgba(79, 70, 229, 0.15)", marginBottom: "1rem" }} />
            <p style={{ fontWeight: "600", fontSize: "1rem", color: "var(--color-text-main)", marginBottom: "0.25rem" }}>
              Interview Preparation Guide Not Generated Yet
            </p>
            <p style={{ fontSize: "0.85rem", maxWidth: "480px", margin: "0 auto 1.5rem auto" }}>
              Generate custom mock interview questions, talk tracks, expected answers, and readiness indicators based on your profile and target JD.
            </p>
            <button 
              className="btn-primary" 
              onClick={() => runInterviewPrep(selectedResume.id)}
              disabled={generatingPrep}
              style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
            >
              {generatingPrep ? (
                <React.Fragment>
                  <div className="spinner-micro"></div>
                  <span>Generating...</span>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <Icons.Cpu />
                  <span>Generate Preparation Materials</span>
                </React.Fragment>
              )}
            </button>
          </div>
        )}

      </div>
    );
  };

  const renderDashboardStats = () => {
    // Extract job roles and missing skills from latest analyzed resume
    const latestResumeWithAnalysis = resumes.find(r => r.ats_analysis);
    const recommendedJobs = latestResumeWithAnalysis?.ats_analysis?.top_job_roles || [];
    const missingSkills = latestResumeWithAnalysis?.ats_analysis?.missing_keywords || 
                          latestResumeWithAnalysis?.ats_analysis?.resume_weaknesses || [];
    
    // Readiness calculations
    const latestCompleteness = latestResumeWithAnalysis ? calculateCompleteness(latestResumeWithAnalysis) : 0;
    const latestReadiness = latestResumeWithAnalysis?.ats_analysis?.interview_readiness_score || 0;

    return (
      <div className="dashboard-stats-view">
        <div className="dashboard-welcome">
          <h2>Welcome back, {currentUser.full_name}!</h2>
          <p style={{ color: "var(--color-text-muted)" }}>Here is your career development and resume intelligence overview.</p>
        </div>
        
        {/* KPI Grid */}
        <div className="kpi-grid" style={{ marginBottom: "2rem" }}>
          <div className="kpi-card">
            <div className="kpi-title"><Icons.Cpu /> ATS Score</div>
            <div className="kpi-value">
              {dashboardStats.total_resumes > 0 ? `${dashboardStats.average_ats_score}/100` : "0/100"}
            </div>
            <div className="kpi-desc">Average ATS compatibility score</div>
          </div>
          
          <div className="kpi-card">
            <div className="kpi-title"><Icons.User /> Resume Readiness</div>
            <div className="kpi-value">{latestCompleteness}%</div>
            <div className="kpi-desc">Latest profile structural audit</div>
          </div>
          
          <div className="kpi-card">
            <div className="kpi-title"><Icons.TrendingUp /> Interview Readiness</div>
            <div className="kpi-value">{latestReadiness}%</div>
            <div className="kpi-desc">Estimated screening pass rate</div>
          </div>
        </div>

        {/* Dashboard Content Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem" }} className="dashboard-columns">
          {/* Main recent uploads panel */}
          <div className="glass-panel">
            <h3 className="panel-title">
              <span className="panel-title-text"><Icons.History /> Recent Analyses</span>
            </h3>
            {resumes.length === 0 ? (
              <div style={{ textAlign: "center", color: "var(--color-text-muted)", padding: "3rem 1rem" }}>
                <Icons.FileText style={{ fontSize: "2rem", marginBottom: "1rem", color: "rgba(79, 70, 229, 0.2)" }} />
                <p style={{ fontSize: "0.9rem", fontWeight: "600", marginBottom: "0.25rem" }}>No Resumes Found</p>
                <p style={{ fontSize: "0.8rem" }}>Upload a resume file on the sidebar uploader to start.</p>
              </div>
            ) : (
              <div className="recent-analyses-table">
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--card-border)", color: "var(--color-text-muted)", textAlign: "left" }}>
                      <th style={{ padding: "0.75rem 0.5rem" }}>Filename</th>
                      <th style={{ padding: "0.75rem 0.5rem" }}>Candidate</th>
                      <th style={{ padding: "0.75rem 0.5rem" }}>ATS Score</th>
                      <th style={{ padding: "0.75rem 0.5rem" }}>Uploaded Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resumes.slice(0, 5).map(item => (
                      <tr 
                        key={item.id} 
                        onClick={() => fetchResumeDetails(item.id)}
                        className="recent-table-row"
                        style={{ borderBottom: "1px solid var(--card-border)" }}
                      >
                        <td style={{ padding: "0.75rem 0.5rem", color: "var(--color-primary)", fontWeight: "600" }}>{item.filename}</td>
                        <td style={{ padding: "0.75rem 0.5rem" }}>{item.name || "Unknown"}</td>
                        <td style={{ padding: "0.75rem 0.5rem" }}>
                          {item.ats_score !== null ? (
                            <span className={`audit-score-pill ${item.ats_score >= 80 ? "score-pill-high" : item.ats_score >= 50 ? "score-pill-med" : "score-pill-low"}`}>
                              {item.ats_score}
                            </span>
                          ) : (
                            <span style={{ color: "var(--color-text-muted)", fontStyle: "italic" }}>Not Checked</span>
                          )}
                        </td>
                        <td style={{ padding: "0.75rem 0.5rem", color: "var(--color-text-muted)" }}>{formatDate(item.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Secondary Job and Skill Widget rows */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
            {/* Recommended Jobs */}
            <div className="glass-panel">
              <h3 className="panel-title">
                <span className="panel-title-text"><Icons.TrendingUp /> Recommended Job Match Roles</span>
              </h3>
              {recommendedJobs.length === 0 ? (
                <p style={{ color: "var(--color-text-muted)", fontSize: "0.82rem", padding: "0.5rem 0" }}>
                  Upload a resume and run an ATS analysis to discover matched job roles.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem" }}>
                  {recommendedJobs.slice(0, 3).map((job, idx) => (
                    <div key={idx} style={{ padding: "0.65rem 0.85rem", borderRadius: "8px", background: "#F8FAFC", border: "1px solid var(--card-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: "700", fontSize: "0.82rem" }}>{job.role}</span>
                      <span className="audit-score-pill score-pill-high" style={{ margin: 0 }}>{job.match_score}% Match</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Skill Gaps */}
            <div className="glass-panel">
              <h3 className="panel-title">
                <span className="panel-title-text"><Icons.Award /> Top Missing Technical Skills</span>
              </h3>
              {missingSkills.length === 0 ? (
                <p style={{ color: "var(--color-text-muted)", fontSize: "0.82rem", padding: "0.5rem 0" }}>
                  Upload and review a resume to isolate potential skill keyword gaps.
                </p>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginTop: "0.5rem" }}>
                  {missingSkills.slice(0, 6).map((skill, idx) => (
                    <span key={idx} className="keyword-chip miss" style={{ fontSize: "0.72rem" }}>
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleSort = (key) => {
    if (historySortKey === key) {
      setHistorySortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setHistorySortKey(key);
      setHistorySortDirection("desc");
    }
  };

  const getSortedResumes = () => {
    const filtered = resumes.filter(res => {
      const nameMatch = (res.name || "").toLowerCase().includes(historySearchQuery.toLowerCase());
      const filenameMatch = (res.filename || "").toLowerCase().includes(historySearchQuery.toLowerCase());
      return nameMatch || filenameMatch;
    });

    return [...filtered].sort((a, b) => {
      let valA, valB;
      if (historySortKey === "name") {
        valA = a.name || "";
        valB = b.name || "";
      } else if (historySortKey === "date") {
        valA = new Date(a.created_at).getTime();
        valB = new Date(b.created_at).getTime();
      } else if (historySortKey === "score") {
        valA = a.ats_score !== null ? a.ats_score : -1;
        valB = b.ats_score !== null ? b.ats_score : -1;
      } else if (historySortKey === "match") {
        valA = a.latest_match_score !== null ? a.latest_match_score : -1;
        valB = b.latest_match_score !== null ? b.latest_match_score : -1;
      }

      if (valA < valB) return historySortDirection === "asc" ? -1 : 1;
      if (valA > valB) return historySortDirection === "asc" ? 1 : -1;
      return 0;
    });
  };

  const renderHistoryPage = () => {
    const sortedResumes = getSortedResumes();
    return (
      <div className="history-page-view" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        
        {/* Top: File Upload Dropzone in the page itself */}
        <div className="glass-panel">
          <div className="panel-title">
            <span className="panel-title-text"><Icons.Upload /> Parse and Upload Document</span>
          </div>
          {loading && uploadStatusMsg ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p style={{ fontSize: "0.85rem", color: "var(--color-accent)", marginTop: "0.5rem", fontWeight: "500", textAlign: "center" }}>
                {uploadStatusMsg}
              </p>
            </div>
          ) : (
            <div 
              className={`dropzone ${dragActive ? "drag-active" : ""}`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileInput}
              style={{ padding: "1.5rem" }}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                className="file-input" 
                accept=".pdf,.docx" 
                onChange={handleFileChange}
              />
              <div className="dropzone-icon" style={{ width: "36px", height: "36px" }}>
                <Icons.Upload />
              </div>
              <div>
                <p style={{ fontWeight: 600, color: "var(--color-text-main)", fontSize: "0.9rem" }}>Upload a new CV / Resume document</p>
                <p style={{ fontSize: "0.78rem", color: "var(--color-text-muted)", marginTop: "0.15rem" }}>
                  Drag & drop your PDF or DOCX file, or click to choose from disk
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom: Unified Resumes Table */}
        <div className="glass-panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: "800", margin: 0 }}>📊 Resume Management Database</h2>
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.8rem", margin: 0 }}>Search, sort, view intelligence reports, or delete historical profiles.</p>
            </div>
            {resumes.length > 0 && (
              <button 
                className="btn-delete-all" 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteAllConfirm(true);
                }}
                disabled={loading || deletingResumeId !== null}
              >
                Clear All Database Records
              </button>
            )}
          </div>

          {/* Search Box */}
          <div style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem" }}>
            <input
              type="text"
              placeholder="🔍 Search resumes by candidate name or filename..."
              value={historySearchQuery}
              onChange={(e) => setHistorySearchQuery(e.target.value)}
              className="form-control"
              style={{
                width: "100%",
                padding: "0.6rem 0.85rem",
                fontSize: "0.85rem",
                borderRadius: "8px",
                border: "1px solid var(--card-border)",
                background: "#FAFAFA"
              }}
            />
            {historySearchQuery && (
              <button className="btn-secondary" onClick={() => setHistorySearchQuery("")} style={{ fontSize: "0.8rem" }}>
                Clear
              </button>
            )}
          </div>

          {/* Main Table */}
          {resumes.length === 0 ? (
            <div style={{ textAlign: "center", color: "var(--color-text-muted)", padding: "3rem 1rem" }}>
              <Icons.FileText style={{ fontSize: "2.5rem", marginBottom: "1rem", color: "rgba(79, 70, 229, 0.15)" }} />
              <p style={{ fontSize: "0.9rem", fontWeight: "600" }}>No Resumes Found</p>
              <p style={{ fontSize: "0.8rem" }}>Upload a resume document using the dropzone uploader above to begin parsing.</p>
            </div>
          ) : sortedResumes.length === 0 ? (
            <div style={{ textAlign: "center", color: "var(--color-text-muted)", padding: "2rem" }}>
              <p>No search results matching your query: "<strong>{historySearchQuery}</strong>"</p>
            </div>
          ) : (
            <div className="recent-analyses-table" style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--card-border)", color: "var(--color-text-muted)", textAlign: "left" }}>
                    <th 
                      onClick={() => handleSort("name")}
                      style={{ padding: "0.75rem 0.5rem", cursor: "pointer", userSelect: "none" }}
                    >
                      Resume Name {historySortKey === "name" ? (historySortDirection === "asc" ? "▲" : "▼") : ""}
                    </th>
                    <th 
                      onClick={() => handleSort("date")}
                      style={{ padding: "0.75rem 0.5rem", cursor: "pointer", userSelect: "none" }}
                    >
                      Date Uploaded {historySortKey === "date" ? (historySortDirection === "asc" ? "▲" : "▼") : ""}
                    </th>
                    <th 
                      onClick={() => handleSort("score")}
                      style={{ padding: "0.75rem 0.5rem", cursor: "pointer", userSelect: "none" }}
                    >
                      ATS Score {historySortKey === "score" ? (historySortDirection === "asc" ? "▲" : "▼") : ""}
                    </th>
                    <th 
                      onClick={() => handleSort("match")}
                      style={{ padding: "0.75rem 0.5rem", cursor: "pointer", userSelect: "none" }}
                    >
                      JD Match Score {historySortKey === "match" ? (historySortDirection === "asc" ? "▲" : "▼") : ""}
                    </th>
                    <th style={{ padding: "0.75rem 0.5rem" }}>Quick Downloads</th>
                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedResumes.map(res => {
                    const latestScore = res.ats_score;
                    const jdMatchScore = res.latest_match_score;
                    const jdMatchTitle = res.latest_match_title;
                    const hasCover = res.ats_analysis && res.ats_analysis.professional_cover_letter;
                    
                    return (
                      <tr 
                        key={res.id} 
                        className="recent-table-row"
                        style={{ borderBottom: "1px solid var(--card-border)", transition: "var(--transition-smooth)" }}
                      >
                        {/* Name/File Details */}
                        <td 
                          style={{ padding: "0.85rem 0.5rem", cursor: "pointer" }}
                          onClick={() => fetchResumeDetails(res.id)}
                        >
                          <strong style={{ display: "block", color: "var(--color-primary)" }}>
                            {res.name || "Unknown Candidate"}
                          </strong>
                          <span style={{ fontSize: "0.72rem", color: "var(--color-text-muted)" }}>{res.filename}</span>
                        </td>
                        
                        {/* Upload Date */}
                        <td style={{ padding: "0.85rem 0.5rem", color: "var(--color-text-muted)" }}>
                          {formatDate(res.created_at)}
                        </td>
                        
                        {/* ATS Score */}
                        <td style={{ padding: "0.85rem 0.5rem" }}>
                          {latestScore !== null && latestScore !== undefined ? (
                            <span className={`audit-score-pill ${latestScore >= 80 ? "score-pill-high" : latestScore >= 50 ? "score-pill-med" : "score-pill-low"}`} style={{ margin: 0 }}>
                              {latestScore}/100
                            </span>
                          ) : (
                            <span style={{ color: "var(--color-text-muted)", fontStyle: "italic", fontSize: "0.78rem" }}>Pending Audit</span>
                          )}
                        </td>
                        
                        {/* JD Match */}
                        <td style={{ padding: "0.85rem 0.5rem" }}>
                          {jdMatchScore !== null && jdMatchScore !== undefined ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                              <span className="audit-score-pill score-pill-high" style={{ margin: 0, width: "fit-content" }}>
                                {jdMatchScore}% Match
                              </span>
                              {jdMatchTitle && (
                                <span style={{ fontSize: "0.72rem", color: "var(--color-text-muted)" }}>{jdMatchTitle}</span>
                              )}
                            </div>
                          ) : (
                            <span style={{ color: "var(--color-text-muted)", fontStyle: "italic", fontSize: "0.78rem" }}>N/A</span>
                          )}
                        </td>
                        
                        {/* Direct Downloads */}
                        <td style={{ padding: "0.85rem 0.5rem" }}>
                          <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                            <button 
                              className="btn-secondary" 
                              style={{ padding: "0.25rem 0.45rem", fontSize: "0.72rem", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
                              onClick={() => downloadResumeTemplate(res.id, res.name || "Candidate", "pdf")}
                              title="Download Resume PDF"
                            >
                              PDF
                            </button>
                            <button 
                              className="btn-secondary" 
                              style={{ padding: "0.25rem 0.45rem", fontSize: "0.72rem", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
                              onClick={() => downloadResumeTemplate(res.id, res.name || "Candidate", "docx")}
                              title="Download Resume Word"
                            >
                              Word
                            </button>
                            {hasCover && (
                              <button 
                                className="btn-secondary" 
                                style={{ padding: "0.25rem 0.45rem", fontSize: "0.72rem", background: "rgba(16, 185, 129, 0.05)", borderColor: "rgba(16, 185, 129, 0.2)", color: "var(--color-success)" }}
                                onClick={() => downloadCoverLetterRaw(res.ats_analysis.professional_cover_letter, res.name || "Candidate", "pdf")}
                                title="Download Cover Letter PDF"
                              >
                                Letter PDF
                              </button>
                            )}
                          </div>
                        </td>
                        
                        {/* Actions (Delete/View details) */}
                        <td style={{ padding: "0.85rem 0.5rem", textAlign: "right" }}>
                          <div style={{ display: "flex", gap: "0.35rem", justifyContent: "flex-end", alignItems: "center" }}>
                            <button 
                              className="btn-primary" 
                              style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                              onClick={() => fetchResumeDetails(res.id)}
                            >
                              View Intelligence
                            </button>
                            <button 
                              className={`btn-delete-item ${deletingResumeId === res.id ? "deleting" : ""}`}
                              style={{ position: "static", display: "inline-flex" }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirmId(res.id);
                              }}
                              disabled={deletingResumeId !== null}
                              title="Delete profile record"
                            >
                              {deletingResumeId === res.id ? (
                                <div className="spinner-micro" style={{ borderLeftColor: "var(--color-danger)" }}></div>
                              ) : (
                                <Icons.Trash />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCoverLetterGeneratorPage = () => {
    return (
      <div className="cover-letter-page-view" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        
        {/* Dropdown Candidate Selection Panel */}
        <div className="glass-panel">
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", marginBottom: "0.5rem" }}>✉ Cover Letter Workspace</h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
            Select a candidate profile from your database and customize the target job details to draft high-converting, tailored cover letters.
          </p>

          <div className="auth-field" style={{ maxWidth: "450px" }}>
            <label htmlFor="cover-letter-resume-select" className="auth-label">Active Candidate Profile</label>
            <select 
              id="cover-letter-resume-select"
              className="auth-input"
              value={selectedResume ? selectedResume.id : ""}
              onChange={(e) => {
                const resId = parseInt(e.target.value);
                const resObj = resumes.find(r => r.id === resId);
                if (resObj) {
                  setSelectedResume(resObj);
                  // Load its analysis if any
                  if (resObj.ats_analysis) {
                    setCoverLetterVersions({
                      professional: resObj.ats_analysis.professional_cover_letter || "",
                      entry_level: resObj.ats_analysis.short_cover_letter || "",
                      experienced: resObj.ats_analysis.email_application || ""
                    });
                    setCoverLetterText(resObj.ats_analysis.professional_cover_letter || "");
                    setActiveCoverVersion("professional");
                  } else {
                    setCoverLetterVersions(null);
                    setCoverLetterText("");
                  }
                } else {
                  setSelectedResume(null);
                  setCoverLetterVersions(null);
                  setCoverLetterText("");
                }
              }}
              style={{ padding: "0.5rem 0.75rem", fontSize: "0.85rem", background: "#fff", border: "1px solid var(--card-border)", borderRadius: "8px", width: "100%" }}
            >
              <option value="">-- Select Candidate Resume --</option>
              {resumes.map(r => (
                <option key={r.id} value={r.id}>
                  {r.name || "Unknown Candidate"} ({r.filename})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selection Details check */}
        {!selectedResume ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "350px", border: "2px dashed var(--card-border)", borderRadius: "12px", background: "#FAFBFD", color: "var(--color-text-muted)", padding: "2rem" }}>
            <Icons.FileText style={{ fontSize: "2.5rem", color: "rgba(79, 70, 229, 0.15)", marginBottom: "0.5rem" }} />
            <p style={{ fontSize: "0.95rem", fontWeight: "600" }}>No Candidate Selected</p>
            <p style={{ fontSize: "0.8rem", textAlign: "center" }}>
              Please select a candidate profile in the dropdown selector above to generate cover letters.
            </p>
          </div>
        ) : (
          /* Split grid containing generator inputs and preview */
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.25fr", gap: "1.5rem" }} className="ats-dashboard-grid">
            
            {/* Left Column: Generator Form */}
            <div className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <h3 className="panel-title" style={{ margin: 0, paddingBottom: "0.5rem" }}>
                <span className="panel-title-text">✨ Target Parameters</span>
              </h3>
              <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                These values are utilized to tailormake your cover letter bullet points and summaries.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                <div className="auth-field">
                  <label htmlFor="cover-job-title" className="auth-label">Target Job Title</label>
                  <input 
                    id="cover-job-title"
                    type="text" 
                    className="auth-input" 
                    placeholder="e.g. Senior Software Engineer"
                    value={coverJobTitle}
                    onChange={(e) => setCoverJobTitle(e.target.value)}
                  />
                </div>
                
                <div className="auth-field">
                  <label htmlFor="cover-company-name" className="auth-label">Target Company Name</label>
                  <input 
                    id="cover-company-name"
                    type="text" 
                    className="auth-input" 
                    placeholder="e.g. Google"
                    value={coverCompanyName}
                    onChange={(e) => setCoverCompanyName(e.target.value)}
                  />
                </div>
                
                <div className="auth-field">
                  <label htmlFor="cover-industry" className="auth-label">Target Industry (Optional)</label>
                  <input 
                    id="cover-industry"
                    type="text" 
                    className="auth-input" 
                    placeholder="e.g. Technology"
                    value={coverIndustry}
                    onChange={(e) => setCoverIndustry(e.target.value)}
                  />
                </div>

                <button 
                  className="btn-primary" 
                  style={{ width: "100%", padding: "0.7rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }} 
                  onClick={handleGenerateCoverLetter}
                  disabled={coverLoading}
                >
                  {coverLoading ? (
                    <React.Fragment>
                      <div className="spinner-micro"></div>
                      <span>Drafting cover letters...</span>
                    </React.Fragment>
                  ) : (
                    <React.Fragment>
                      <Icons.Cpu />
                      <span>Draft Cover Letter</span>
                    </React.Fragment>
                  )}
                </button>
              </div>

              {coverLetterVersions && (
                <div style={{ marginTop: "1rem", borderTop: "1px solid var(--card-border)", paddingTop: "1rem" }}>
                  <strong style={{ display: "block", fontSize: "0.8rem", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>Cover Letter Version</strong>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <button 
                      className={`btn-secondary ${activeCoverVersion === "professional" ? "active" : ""}`}
                      style={{ justifyContent: "flex-start", width: "100%", background: activeCoverVersion === "professional" ? "rgba(79, 70, 229, 0.08)" : "", borderColor: activeCoverVersion === "professional" ? "var(--color-primary)" : "" }}
                      onClick={() => {
                        setActiveCoverVersion("professional");
                        setCoverLetterText(coverLetterVersions.professional);
                      }}
                    >
                      💼 Professional Corporate
                    </button>
                    <button 
                      className={`btn-secondary ${activeCoverVersion === "entry_level" ? "active" : ""}`}
                      style={{ justifyContent: "flex-start", width: "100%", background: activeCoverVersion === "entry_level" ? "rgba(79, 70, 229, 0.08)" : "", borderColor: activeCoverVersion === "entry_level" ? "var(--color-primary)" : "" }}
                      onClick={() => {
                        setActiveCoverVersion("entry_level");
                        setCoverLetterText(coverLetterVersions.entry_level);
                      }}
                    >
                      🎓 Entry-Level / Academic
                    </button>
                    <button 
                      className={`btn-secondary ${activeCoverVersion === "experienced" ? "active" : ""}`}
                      style={{ justifyContent: "flex-start", width: "100%", background: activeCoverVersion === "experienced" ? "rgba(79, 70, 229, 0.08)" : "", borderColor: activeCoverVersion === "experienced" ? "var(--color-primary)" : "" }}
                      onClick={() => {
                        setActiveCoverVersion("experienced");
                        setCoverLetterText(coverLetterVersions.experienced);
                      }}
                    >
                      🚀 Experienced Specialist
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Physical Paper Preview */}
            <div className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 className="panel-title" style={{ margin: 0, paddingBottom: 0, borderBottom: "none" }}>
                  <span className="panel-title-text">📄 Live Letter Preview & Editor</span>
                </h3>
                {coverLetterText && (
                  <div style={{ display: "flex", gap: "0.35rem" }}>
                    <button className="btn-secondary" onClick={handleCopyCoverLetter} style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}>
                      Copy
                    </button>
                    <button className="btn-secondary" onClick={() => handleDownloadCoverLetter("pdf")} style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}>
                      PDF
                    </button>
                    <button className="btn-secondary" onClick={() => handleDownloadCoverLetter("docx")} style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}>
                      Word
                    </button>
                  </div>
                )}
              </div>

              {coverLetterText ? (
                <div className="cover-letter-paper-preview" style={{ marginTop: "0.5rem" }}>
                  <textarea 
                    style={{ 
                      width: "100%", 
                      height: "450px", 
                      border: "none", 
                      outline: "none", 
                      background: "transparent", 
                      fontFamily: "'Inter', Georgia, serif", 
                      fontSize: "0.9rem", 
                      lineHeight: "1.6", 
                      color: "#1E293B",
                      resize: "vertical" 
                    }}
                    value={coverLetterText}
                    onChange={(e) => setCoverLetterText(e.target.value)}
                  />
                </div>
              ) : (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "350px", border: "2px dashed var(--card-border)", borderRadius: "12px", background: "#FAFBFD", color: "var(--color-text-muted)" }}>
                  <Icons.FileText style={{ fontSize: "2.5rem", color: "rgba(79, 70, 229, 0.15)", marginBottom: "0.5rem" }} />
                  <p style={{ fontSize: "0.9rem", fontWeight: "600" }}>No Cover Letter Drafted Yet</p>
                  <p style={{ fontSize: "0.8rem", textAlign: "center", padding: "0 2rem" }}>
                    Provide job parameters on the left pane and hit Draft to generate copies.
                  </p>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    );
  };

  const renderDownloadsPage = () => {
    return (
      <div className="downloads-page-view">
        <div className="glass-panel">
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", marginBottom: "0.5rem" }}>📥 Downloads Manager</h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginBottom: "2rem" }}>
            Access and download all documents, resumes, cover letters, and preparation guides generated for your profile history.
          </p>
          
          {resumes.length === 0 ? (
            <div style={{ textAlign: "center", color: "var(--color-text-muted)", padding: "3rem 1rem" }}>
              <p>No documents available for download yet. Please upload a resume first.</p>
            </div>
          ) : (
            <div className="recent-analyses-table" style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--card-border)", color: "var(--color-text-muted)", textAlign: "left" }}>
                    <th style={{ padding: "0.75rem 0.5rem" }}>Candidate / Resume</th>
                    <th style={{ padding: "0.75rem 0.5rem" }}>Resume Exports</th>
                    <th style={{ padding: "0.75rem 0.5rem" }}>Cover Letters</th>
                    <th style={{ padding: "0.75rem 0.5rem" }}>Interview Prep Guides</th>
                  </tr>
                </thead>
                <tbody>
                  {resumes.map(res => {
                    const hasCover = res.ats_analysis && (res.ats_analysis.professional_cover_letter || res.ats_analysis.short_cover_letter);
                    const hasPrep = res.ats_analysis && res.ats_analysis.interview_prep;
                    return (
                      <tr key={res.id} style={{ borderBottom: "1px solid var(--card-border)" }}>
                        <td style={{ padding: "1rem 0.5rem" }}>
                          <strong style={{ display: "block", color: "var(--color-text-main)" }}>{res.name || "Unknown Candidate"}</strong>
                          <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{res.filename}</span>
                        </td>
                        <td style={{ padding: "1rem 0.5rem" }}>
                          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                            <button 
                              className="btn-secondary" 
                              style={{ padding: "0.3rem 0.5rem", fontSize: "0.72rem" }}
                              onClick={() => downloadResumeTemplate(res.id, res.name || "Candidate", "pdf")}
                            >
                              PDF Format
                            </button>
                            <button 
                              className="btn-secondary" 
                              style={{ padding: "0.3rem 0.5rem", fontSize: "0.72rem" }}
                              onClick={() => downloadResumeTemplate(res.id, res.name || "Candidate", "docx")}
                            >
                              Word Format
                            </button>
                            <button 
                              className="btn-secondary" 
                              style={{ padding: "0.3rem 0.5rem", fontSize: "0.72rem" }}
                              onClick={() => downloadResumeReportPdf(res.id, res.name || "Candidate")}
                            >
                              Audit Report
                            </button>
                          </div>
                        </td>
                        <td style={{ padding: "1rem 0.5rem" }}>
                          {hasCover ? (
                            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                              <button 
                                className="btn-secondary" 
                                style={{ padding: "0.3rem 0.5rem", fontSize: "0.72rem" }}
                                onClick={() => downloadCoverLetterRaw(res.ats_analysis.professional_cover_letter, res.name || "Candidate", "pdf")}
                              >
                                PDF Format
                              </button>
                              <button 
                                className="btn-secondary" 
                                style={{ padding: "0.3rem 0.5rem", fontSize: "0.72rem" }}
                                onClick={() => downloadCoverLetterRaw(res.ats_analysis.professional_cover_letter, res.name || "Candidate", "docx")}
                              >
                                Word Format
                              </button>
                            </div>
                          ) : (
                            <span style={{ color: "var(--color-text-muted)", fontStyle: "italic", fontSize: "0.75rem" }}>None generated</span>
                          )}
                        </td>
                        <td style={{ padding: "1rem 0.5rem" }}>
                          {hasPrep ? (
                            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                              <button 
                                className="btn-secondary" 
                                style={{ padding: "0.3rem 0.5rem", fontSize: "0.72rem" }}
                                onClick={() => downloadInterviewPDF(res.id, "guide", res.name || "Candidate")}
                              >
                                Study Guide
                              </button>
                              <button 
                                className="btn-secondary" 
                                style={{ padding: "0.3rem 0.5rem", fontSize: "0.72rem" }}
                                onClick={() => downloadInterviewPDF(res.id, "questions", res.name || "Candidate")}
                              >
                                Practice Sheet
                              </button>
                            </div>
                          ) : (
                            <span style={{ color: "var(--color-text-muted)", fontStyle: "italic", fontSize: "0.75rem" }}>None generated</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderProfilePage = () => {
    return (
      <div className="profile-page-view">
        <div className="glass-panel" style={{ maxWidth: "600px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", marginBottom: "0.5rem" }}>User Account Settings</h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginBottom: "2rem" }}>
            View account information, update profile metadata, and modify password.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            
            {/* Account Information Section */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", paddingBottom: "1.5rem", borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>Account Overview</h3>
              <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: "0.75rem", fontSize: "0.9rem" }}>
                <span style={{ color: "var(--color-text-muted)" }}>User ID:</span>
                <span style={{ color: "#fff", fontWeight: "600" }}>{currentUser.id}</span>
                
                <span style={{ color: "var(--color-text-muted)" }}>Registered On:</span>
                <span style={{ color: "#fff", fontWeight: "600" }}>{formatDate(currentUser.created_at)}</span>
              </div>
            </div>

            {/* Profile Update Form */}
            <form onSubmit={handleProfileUpdate} style={{ display: "flex", flexDirection: "column", gap: "1.25rem", paddingBottom: "1.5rem", borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>Update Personal Information</h3>
              
              <div className="auth-field">
                <label htmlFor="settings-profile-name" className="auth-label">Full Name</label>
                <input 
                  id="settings-profile-name"
                  type="text" 
                  className="auth-input" 
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  required 
                />
              </div>

              <div className="auth-field">
                <label htmlFor="settings-profile-email" className="auth-label">Email Address</label>
                <input 
                  id="settings-profile-email"
                  type="email" 
                  className="auth-input" 
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  required 
                />
              </div>

              {profileError && (
                <div className="auth-error" style={{ fontSize: "0.8rem", color: "var(--color-danger)" }}>
                  <Icons.AlertTriangle /> {profileError}
                </div>
              )}

              {profileSuccess && (
                <div style={{ fontSize: "0.8rem", color: "var(--color-success)", fontWeight: "500", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <Icons.Check /> {profileSuccess}
                </div>
              )}

              <button type="submit" className="btn-primary" style={{ width: "fit-content" }} disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </form>

            {/* Change Password Form */}
            <form onSubmit={handlePasswordChange} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>Update Account Password</h3>
              
              <div className="auth-field">
                <label htmlFor="settings-pwd-old" className="auth-label">Current Password</label>
                <input 
                  id="settings-pwd-old"
                  type="password" 
                  className="auth-input" 
                  placeholder="••••••••" 
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required 
                />
              </div>

              <div className="auth-field">
                <label htmlFor="settings-pwd-new" className="auth-label">New Password (min 6 chars)</label>
                <input 
                  id="settings-pwd-new"
                  type="password" 
                  className="auth-input" 
                  placeholder="••••••••" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required 
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: "fit-content" }} disabled={loading}>
                {loading ? "Changing..." : "Change Password"}
              </button>
            </form>

            <button 
              className="btn-secondary" 
              onClick={() => { setShowProfile(false); setProfileError(""); setProfileSuccess(""); setOldPassword(""); setNewPassword(""); }}
              style={{ alignSelf: "flex-start", marginTop: "1rem" }}
            >
              Back to Dashboard
            </button>

          </div>
        </div>
      </div>
    );
  };

  if (!currentUser) {
    return (
      <div className="landing-page">
        {/* Navbar */}
        <header className="landing-header">
          <div className="logo-section">
            <div className="logo-icon">RI</div>
            <div className="logo-text">
              <span className="logo-title">ResumeIQ AI</span>
              <p>AI Career Intelligence</p>
            </div>
          </div>
          <nav className="landing-nav">
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#testimonials">Testimonials</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="landing-auth-btns">
            <button className="btn-secondary" onClick={() => { setAuthView("login"); setShowAuthModal(true); }}>Sign In</button>
            <button className="btn-primary" onClick={() => { setAuthView("register"); setShowAuthModal(true); }}>Get Started</button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <span className="hero-badge">Spark your career with Gemini AI</span>
            <h1>Stop Sending Resumes Into the Black Hole</h1>
            <p>
              ResumeIQ is a premium, developer-friendly career platform that evaluates your resume's ATS compatibility, simulates recruiter decisions, drafts personalized cover letters, and optimizes your details to double your interview rates.
            </p>
            <div className="hero-ctas">
              <button className="btn-primary btn-large" onClick={() => { setAuthView("register"); setShowAuthModal(true); }}>
                Analyze Your Resume Free <Icons.ArrowRight style={{marginLeft: "0.5rem"}} />
              </button>
              <a href="#how-it-works" className="btn-secondary btn-large">See How It Works</a>
            </div>
            
            <div className="hero-preview-card">
              <div className="preview-header">
                <div className="preview-dot red"></div>
                <div className="preview-dot yellow"></div>
                <div className="preview-dot green"></div>
                <span className="preview-title">ResumeIQ Dashboard Preview</span>
              </div>
              <div className="preview-body">
                <div className="preview-grid">
                  <div className="preview-sidebar">
                    <div className="preview-menu-item active">ATS Compliance</div>
                    <div className="preview-menu-item">Resume Builder</div>
                    <div className="preview-menu-item">Cover Letter</div>
                  </div>
                  <div className="preview-content">
                    <div className="preview-metric-row">
                      <div className="preview-metric">
                        <span>ATS SCORE</span>
                        <strong>89/100</strong>
                      </div>
                      <div className="preview-metric">
                        <span>JOB FIT</span>
                        <strong>Excellent</strong>
                      </div>
                    </div>
                    <div className="preview-lines">
                      <div className="preview-line long"></div>
                      <div className="preview-line medium"></div>
                      <div className="preview-line short"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="features-section">
          <div className="section-title-wrap">
            <h2>High-Fidelity Features for Job Seekers</h2>
            <p>Everything you need to bypass automated screening filters and stand out to human hiring managers.</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-box blue"><Icons.Cpu /></div>
              <h3>Dynamic ATS Scorecard</h3>
              <p>Get a comprehensive rating across 9 criteria including keyword density, formatting, contact info, and structural completeness with explicit score deductions.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-box indigo"><Icons.Award /></div>
              <h3>Interactive Resume Builder</h3>
              <p>Edit your parsed profile details in real-time, view live HTML previews of 5 distinct styles (ATS, Modern, Fresher, Software, Data), and export directly to PDF or DOCX.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-box emerald"><Icons.FileText /></div>
              <h3>Three-Tier Cover Letters</h3>
              <p>Input target role, company, and industry to automatically generate Professional, Entry-Level, and Experienced versions. Tweak on the fly and download instantly.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-box purple"><Icons.TrendingUp /></div>
              <h3>Recruiter Simulator</h3>
              <p>Simulate a screening session where an AI recruiter decides to 'Shortlist', 'Maybe', or 'Reject' your profile based on job description alignment.</p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="how-it-works-section">
          <div className="section-title-wrap">
            <h2>How It Works</h2>
            <p>ResumeIQ guides you from upload to a polished application package in three simple steps.</p>
          </div>
          <div className="steps-container">
            <div className="step-item">
              <div className="step-number">1</div>
              <h3>Upload & Parse</h3>
              <p>Drag and drop your PDF or DOCX resume. Our parser instantly extracts work history, education, skills, and contact data.</p>
            </div>
            <div className="step-item">
              <div className="step-number">2</div>
              <h3>Analyze & Optimize</h3>
              <p>Review score deductions, recruiter concerns, and job description matches. Tweak skills or descriptions directly in the builder.</p>
            </div>
            <div className="step-item">
              <div className="step-number">3</div>
              <h3>Export & Apply</h3>
              <p>Download your tailored resume and matching cover letter in PDF or DOCX formats, fully optimized for recruiter parsing.</p>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="testimonials-section">
          <div className="section-title-wrap">
            <h2>Backed by Success</h2>
            <p>Hear from software engineers, data analysts, and career starters who used ResumeIQ to land interviews.</p>
          </div>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <p className="testimonial-quote">"The ATS scorecard pointed out that I was missing my GitHub and LinkedIn URLs, and that my bullet points lacked metrics. After making the suggested tweaks, I got my first callback in weeks!"</p>
              <div className="testimonial-author">
                <div className="author-avatar" style={{fontWeight: "bold"}}>AG</div>
                <div className="author-details">
                  <h4>Aashi Gupta</h4>
                  <p>Software Engineer</p>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <p className="testimonial-quote">"The three-version cover letter is amazing. I used the Experienced variant for senior positions and the Professional one for general submissions. Downloads in Word format made editing simple."</p>
              <div className="testimonial-author">
                <div className="author-avatar" style={{fontWeight: "bold"}}>KM</div>
                <div className="author-details">
                  <h4>Kunal Mehta</h4>
                  <p>Data Analyst</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="faq-section">
          <div className="section-title-wrap">
            <h2>Frequently Asked Questions</h2>
            <p>Have questions about ResumeIQ AI? We have answers.</p>
          </div>
          <div className="faq-list">
            <div className="faq-item">
              <h3>Does this app upload my data to third-party databases?</h3>
              <p>No. Your resumes are stored securely in a local database and processed privately using authorized secure API gateways. We never share or resell your private resume data.</p>
            </div>
            <div className="faq-item">
              <h3>How does the recruiter simulator compute my match probability?</h3>
              <p>It simulates a real human review process, analyzing structure, formatting, timeline gaps, and keyword relevance against the target Job Description to approximate interview conversion chances.</p>
            </div>
            <div className="faq-item">
              <h3>Can I edit the output cover letters?</h3>
              <p>Yes! Our advanced cover letter generator lets you modify any text in the interactive browser pane before exporting to PDF or Microsoft Word format.</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="landing-footer">
          <p>&copy; {new Date().getFullYear()} ResumeIQ AI - AI-Powered Resume Intelligence Platform. All rights reserved.</p>
        </footer>

        {/* Auth Modal Overlay */}
        {showAuthModal && (
          <div className="confirm-modal-overlay" onClick={() => setShowAuthModal(false)}>
            <div className="auth-card modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close-btn" onClick={() => setShowAuthModal(false)}>&times;</button>
              <div className="auth-header">
                <div className="auth-logo">RI</div>
                <h2 className="auth-title">
                  {authView === "login" && "Sign In to ResumeIQ"}
                  {authView === "register" && "Create Account"}
                  {authView === "forgot_password" && "Forgot Password"}
                  {authView === "reset_password" && "Reset Password"}
                </h2>
                <p className="auth-subtitle">
                  {authView === "login" && "Enter your credentials to access your resume intelligence dashboard"}
                  {authView === "register" && "Register a new account to parse, analyze, and track resumes"}
                  {authView === "forgot_password" && "Enter your registered email address to receive a password reset code"}
                  {authView === "reset_password" && "Enter the 6-digit code from your console and your new password"}
                </p>
              </div>
              
              {/* Form rendering */}
              {authView === "forgot_password" ? (
                <form className="auth-form" onSubmit={handleForgotPassword}>
                  <div className="auth-field">
                    <label htmlFor="forgot-email" className="auth-label">Email Address</label>
                    <input 
                      id="forgot-email"
                      type="email" 
                      className="auth-input" 
                      placeholder="you@example.com" 
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      required 
                    />
                  </div>
                  {authError && (
                    <div className="auth-error-global">
                      <Icons.AlertTriangle />
                      <span>{authError}</span>
                    </div>
                  )}
                  <button type="submit" className="auth-submit-btn" disabled={loading}>
                    {loading ? <div className="spinner-micro"></div> : "Send Reset Code"}
                  </button>
                  <div style={{ textAlign: "center", fontSize: "0.85rem", marginTop: "1rem" }}>
                    <a href="#" className="auth-link" onClick={(e) => { e.preventDefault(); setAuthView("login"); }}>Back to Sign In</a>
                  </div>
                </form>
              ) : authView === "reset_password" ? (
                <form className="auth-form" onSubmit={handleResetPassword}>
                  <div className="auth-field">
                    <label htmlFor="reset-code-input" className="auth-label">6-Digit Reset Code</label>
                    <input 
                      id="reset-code-input"
                      type="text" 
                      className="auth-input" 
                      placeholder="123456" 
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="auth-field">
                    <label htmlFor="reset-pwd-input" className="auth-label">New Password (min 6 chars)</label>
                    <input 
                      id="reset-pwd-input"
                      type="password" 
                      className="auth-input" 
                      placeholder="••••••••" 
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      required 
                    />
                  </div>
                  {authError && (
                    <div className="auth-error-global">
                      <Icons.AlertTriangle />
                      <span>{authError}</span>
                    </div>
                  )}
                  <button type="submit" className="auth-submit-btn" disabled={loading}>
                    {loading ? <div className="spinner-micro"></div> : "Reset Password"}
                  </button>
                </form>
              ) : (
                <form className="auth-form" onSubmit={handleAuthSubmit}>
                  {authView === "register" && (
                    <div className="auth-field">
                      <label htmlFor="register-name" className="auth-label">Full Name</label>
                      <input 
                        id="register-name"
                        type="text" 
                        className="auth-input" 
                        placeholder="John Doe" 
                        value={authFullName}
                        onChange={(e) => setAuthFullName(e.target.value)}
                        required 
                      />
                    </div>
                  )}
                  <div className="auth-field">
                    <label htmlFor="auth-email" className="auth-label">Email Address</label>
                    <input 
                      id="auth-email"
                      type="email" 
                      className="auth-input" 
                      placeholder="you@example.com" 
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="auth-field">
                    <label htmlFor="auth-password" className="auth-label">Password</label>
                    <input 
                      id="auth-password"
                      type="password" 
                      className="auth-input" 
                      placeholder="••••••••" 
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      required 
                    />
                  </div>
                  {authError && (
                    <div className="auth-error-global">
                      <Icons.AlertTriangle />
                      <span>{authError}</span>
                    </div>
                  )}
                  <button type="submit" className="auth-submit-btn" disabled={loading}>
                    {loading ? <div className="spinner-micro"></div> : (authView === "login" ? "Sign In" : "Create Account")}
                  </button>
                  
                  <div className="auth-footer-links" style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginTop: "1rem" }}>
                    {authView === "login" ? (
                      <>
                        <a href="#" className="auth-link" onClick={(e) => { e.preventDefault(); setAuthView("register"); }}>Create an account</a>
                        <a href="#" className="auth-link" onClick={(e) => { e.preventDefault(); setAuthView("forgot_password"); }}>Forgot password?</a>
                      </>
                    ) : (
                      <a href="#" className="auth-link" onClick={(e) => { e.preventDefault(); setAuthView("login"); }}>Already have an account? Sign In</a>
                    )}
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Email Verification View (If logged in but email is unverified)
  if (currentUser && !currentUser.is_verified) {
    return (
      <div className="auth-page-overlay">
        <div className="toast-container">
          {toasts.map(toast => (
            <div key={toast.id} className={`toast toast-${toast.type}`}>
              {toast.type === "success" ? <Icons.Check /> : <Icons.AlertTriangle />}
              <span>{toast.msg}</span>
            </div>
          ))}
        </div>
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">RI</div>
            <h2 className="auth-title">Verify Your Email</h2>
            <p className="auth-subtitle">
              A 6-digit verification code has been sent to <strong>{currentUser.email}</strong>. 
              Please enter the code printed in the server logs to activate your account.
            </p>
          </div>
          
          <form className="auth-form" onSubmit={handleVerifyEmail}>
            <div className="auth-field">
              <label htmlFor="verify-code-input" className="auth-label">6-Digit Verification Code</label>
              <input 
                id="verify-code-input"
                type="text" 
                className="auth-input" 
                placeholder="123456" 
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required 
              />
            </div>
            
            {authError && (
              <div className="auth-error-global">
                <Icons.AlertTriangle />
                <span>{authError}</span>
              </div>
            )}
            
            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? <div className="spinner-micro"></div> : "Verify Account"}
            </button>
          </form>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center", width: "100%", marginTop: "1.5rem" }}>
            <button 
              className="btn-secondary" 
              style={{ width: "100%", padding: "0.6rem" }} 
              onClick={handleResendVerification} 
              disabled={loading}
            >
              Resend Code
            </button>
            
            <a className="auth-link" style={{ fontSize: "0.85rem", color: "var(--color-danger)" }} onClick={handleSignOut}>
              Sign Out / Back to Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Toast Alert Container */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            {toast.type === "success" ? <Icons.Check /> : <Icons.AlertTriangle />}
            <span>{toast.msg}</span>
          </div>
        ))}
      </div>

      {/* HEADER SECTION */}
      <header className="app-header">
        <div className="logo-section" style={{ cursor: "pointer" }} onClick={() => { setSelectedResume(null); setCurrentNav("history"); }}>
          <div className="logo-icon">RI</div>
          <div className="logo-text">
            <span className="logo-title">ResumeIQ AI</span>
            <p>AI-Powered Resume Intelligence Platform</p>
          </div>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div className="api-status">
            <div className={`status-dot ${apiStatus.healthy ? "active" : ""}`}></div>
            <span>
              {apiStatus.healthy 
                ? "Engine Connected" 
                : "Connecting..."}
            </span>
          </div>

          <div className="header-user-badge">
            <div className="user-avatar">{currentUser.full_name.charAt(0).toUpperCase()}</div>
            <span className="user-name-text">{currentUser.full_name}</span>
            <button 
              className="btn-signout" 
              style={{ marginLeft: "0.5rem" }}
              onClick={() => {
                setProfileName(currentUser.full_name);
                setProfileEmail(currentUser.email);
                setCurrentNav("settings");
                setSelectedResume(null);
                setProfileError("");
                setProfileSuccess("");
                setOldPassword("");
                setNewPassword("");
              }}
              title="Profile Settings"
            >
              Profile
            </button>
            <span style={{ color: "rgba(255,255,255,0.15)" }}>|</span>
            <button className="btn-signout" onClick={handleSignOut}>
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* DASHBOARD SPLIT GRID */}
      <div className="dashboard-grid">
        
        {/* LEFT SIDEBAR NAVIGATION */}
        <aside className="sidebar">
          <div className="glass-panel" style={{ padding: "1rem" }}>
            <div className="sidebar-nav-menu" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <button 
                className={`nav-item-btn ${currentNav === "history" ? "active" : ""}`}
                onClick={() => {
                  setCurrentNav("history");
                  setSelectedResume(null); 
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  width: "100%",
                  padding: "0.75rem 1rem",
                  borderRadius: "8px",
                  border: "none",
                  background: currentNav === "history" ? "var(--color-primary)" : "transparent",
                  color: currentNav === "history" ? "#fff" : "var(--color-text-main)",
                  fontWeight: "600",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "var(--transition-smooth)"
                }}
              >
                📊 Resume History
              </button>
              <button 
                className={`nav-item-btn ${currentNav === "cover_letter" ? "active" : ""}`}
                onClick={() => {
                  setCurrentNav("cover_letter");
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  width: "100%",
                  padding: "0.75rem 1rem",
                  borderRadius: "8px",
                  border: "none",
                  background: currentNav === "cover_letter" ? "var(--color-primary)" : "transparent",
                  color: currentNav === "cover_letter" ? "#fff" : "var(--color-text-main)",
                  fontWeight: "600",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "var(--transition-smooth)"
                }}
              >
                ✉ Cover Letter Generator
              </button>
              <button 
                className={`nav-item-btn ${currentNav === "downloads" ? "active" : ""}`}
                onClick={() => {
                  setCurrentNav("downloads");
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  width: "100%",
                  padding: "0.75rem 1rem",
                  borderRadius: "8px",
                  border: "none",
                  background: currentNav === "downloads" ? "var(--color-primary)" : "transparent",
                  color: currentNav === "downloads" ? "#fff" : "var(--color-text-main)",
                  fontWeight: "600",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "var(--transition-smooth)"
                }}
              >
                📥 Downloads Manager
              </button>
              <button 
                className={`nav-item-btn ${currentNav === "settings" ? "active" : ""}`}
                onClick={() => {
                  setCurrentNav("settings");
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  width: "100%",
                  padding: "0.75rem 1rem",
                  borderRadius: "8px",
                  border: "none",
                  background: currentNav === "settings" ? "var(--color-primary)" : "transparent",
                  color: currentNav === "settings" ? "#fff" : "var(--color-text-main)",
                  fontWeight: "600",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "var(--transition-smooth)"
                }}
              >
                ⚙ Settings
              </button>
            </div>
          </div>
        </aside>

        {/* RIGHT CONTENT WORKSPACE */}
        <main className="active-viewer">
          {currentNav === "settings" ? (
            renderProfilePage()
          ) : currentNav === "cover_letter" ? (
            renderCoverLetterGeneratorPage()
          ) : currentNav === "downloads" ? (
            renderDownloadsPage()
          ) : selectedResume ? (
            <div className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              
              {/* Redesigned Premium Header Section */}
              <div className="report-header-banner">
                <div className="report-header-left">
                  <div className="report-header-title-row" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <button 
                      className="btn-secondary" 
                      onClick={() => { setSelectedResume(null); }}
                      style={{ padding: "0.35rem 0.75rem", fontSize: "0.78rem", display: "inline-flex", alignItems: "center", gap: "0.25rem", marginRight: "0.5rem" }}
                    >
                      ← Back to History
                    </button>
                    <h2 className="report-header-name" style={{ margin: 0 }}>{selectedResume.name || "Parsing Profile..."}</h2>
                    {selectedResume.ats_analysis && selectedResume.ats_analysis.readiness_level && (
                      <span className={`readiness-badge-pill level-${selectedResume.ats_analysis.readiness_level.toLowerCase().replace(" ", "-")}`}>
                        {selectedResume.ats_analysis.readiness_level}
                      </span>
                    )}
                  </div>
                  <div className="report-header-meta">
                    {selectedResume.email && (
                      <span className="contact-pill">
                        <Icons.Mail />
                        <a href={`mailto:${selectedResume.email}`}>{selectedResume.email}</a>
                      </span>
                    )}
                    {selectedResume.phone && (
                      <span className="contact-pill">
                        <Icons.Phone />
                        <a href={`tel:${selectedResume.phone}`}>{selectedResume.phone}</a>
                      </span>
                    )}
                    <span>
                      <Icons.FileText /> {selectedResume.filename}
                    </span>
                    <span>
                      📅 Updated: {new Date(selectedResume.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                </div>
                {/* Action Buttons */}
                <div className="header-action-container">
                  <button className="btn-secondary" onClick={handleShareReport} title="Copy quick share snippet">
                    <Icons.Share /> Share
                  </button>
                  <button className="btn-secondary" onClick={handleDownloadPdfReport} title="Download PDF evaluation report">
                    <Icons.Download /> Download PDF
                  </button>
                  <button className="btn-primary" onClick={handlePrint} title="Print / Export PDF ATS Report">
                    <Icons.Printer /> Export Report
                  </button>
                </div>
              </div>

              {/* Premium Tab Bar */}
              <div className="premium-tab-bar">
                <button className={`tab-btn ${activeTab === "ats" ? "active" : ""}`} onClick={() => setActiveTab("ats")}>
                  📊 ATS Analysis
                </button>
                <button className={`tab-btn ${activeTab === "enhance" ? "active" : ""}`} onClick={() => setActiveTab("enhance")}>
                  🚀 Resume Upgrade
                </button>
                <button className={`tab-btn ${activeTab === "cover_letter" ? "active" : ""}`} onClick={() => setActiveTab("cover_letter")}>
                  ✉ Cover Letter
                </button>
                <button className={`tab-btn ${activeTab === "templates" ? "active" : ""}`} onClick={() => setActiveTab("templates")}>
                  📄 Resume Templates
                </button>
                <button className={`tab-btn ${activeTab === "job_match" ? "active" : ""}`} onClick={() => setActiveTab("job_match")}>
                  🎯 Job Match
                </button>
                <button className={`tab-btn ${activeTab === "interview" ? "active" : ""}`} onClick={() => setActiveTab("interview")}>
                  🎤 Interview Prep
                </button>
              </div>

              {/* Tab Navigation Content Area */}
              <div className="active-tab-content">
                {activeTab === "ats" && renderAtsAnalysisTab()}
                {activeTab === "enhance" && renderResumeUpgradeTab()}
                {activeTab === "cover_letter" && renderCoverLetterTab()}
                {activeTab === "templates" && renderResumeTemplatesTab()}
                {activeTab === "job_match" && renderJobMatchTab()}
                {activeTab === "interview" && renderInterviewPrepTab()}
              </div>

            </div>
          ) : (
            renderHistoryPage()
          )}
        </main>

      </div>
      {/* Confirmation Modals */}
      {deleteConfirmId !== null && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal-container">
            <div className="confirm-modal-header">
              <Icons.AlertTriangle />
              <span>Delete Resume Analysis</span>
            </div>
            <div className="confirm-modal-body">
              Are you sure you want to permanently delete this resume analysis and all associated reports?
            </div>
            <div className="confirm-modal-actions">
              <button className="btn-modal-cancel" onClick={() => setDeleteConfirmId(null)}>Cancel</button>
              <button 
                className="btn-modal-delete" 
                onClick={() => {
                  const id = deleteConfirmId;
                  setDeleteConfirmId(null);
                  handleDeleteResume(id);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteAllConfirm && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal-container">
            <div className="confirm-modal-header">
              <Icons.AlertTriangle />
              <span>Delete All History</span>
            </div>
            <div className="confirm-modal-body">
              Are you sure you want to permanently delete all resume analyses and all associated reports? This action cannot be undone.
            </div>
            <div className="confirm-modal-actions">
              <button className="btn-modal-cancel" onClick={() => setShowDeleteAllConfirm(false)}>Cancel</button>
              <button 
                className="btn-modal-delete" 
                onClick={() => {
                  setShowDeleteAllConfirm(false);
                  handleDeleteAllHistory();
                }}
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Immersive View Resume Fullscreen Modal */}
      {isPreviewModalOpen && (
        <div className="fullscreen-preview-overlay">
          <div className="fullscreen-preview-container">
            {/* Modal Header */}
            <div className="fullscreen-preview-header">
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700" }}>Canva-Style Immersive Resume Editor</h2>
                <span className="badge-primary" style={{ padding: "0.25rem 0.65rem", borderRadius: "99px", fontSize: "0.72rem", background: "rgba(255,255,255,0.15)", color: "#fff" }}>
                  Active Style: {previewModalTemplate}
                </span>
              </div>
              
              {/* Template Switcher */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: "600" }}>Layout:</span>
                <select 
                  value={previewModalTemplate} 
                  onChange={(e) => setPreviewModalTemplate(e.target.value)}
                  className="builder-input"
                  style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem", background: "#1e293b", color: "#fff", border: "1px solid #475569" }}
                >
                  {templatesList.map(t => (
                    <option key={t.name} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </div>
              
              {/* Zoom Scale controls */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <button 
                  className="btn-secondary" 
                  onClick={() => setZoomScale(z => Math.max(0.5, z - 0.1))} 
                  style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem", minWidth: "28px" }}
                >
                  -
                </button>
                <input 
                  type="range" 
                  min="0.5" 
                  max="1.5" 
                  step="0.05"
                  value={zoomScale} 
                  onChange={(e) => setZoomScale(parseFloat(e.target.value))}
                  style={{ width: "80px", accentColor: "var(--color-primary)" }}
                />
                <button 
                  className="btn-secondary" 
                  onClick={() => setZoomScale(z => Math.min(1.5, z + 0.1))} 
                  style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem", minWidth: "28px" }}
                >
                  +
                </button>
                <button 
                  className="btn-secondary" 
                  onClick={() => setZoomScale(1.0)} 
                  style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}
                >
                  Reset
                </button>
              </div>
              
              {/* Download & Export actions */}
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button 
                  className="btn-secondary" 
                  onClick={() => handleExportTemplate("pdf", previewModalTemplate)} 
                  style={{ padding: "0.4rem 0.85rem", fontSize: "0.78rem", display: "flex", alignItems: "center", gap: "0.3rem" }}
                >
                  <Icons.FileText /> Export PDF
                </button>
                <button 
                  className="btn-secondary" 
                  onClick={() => handleExportTemplate("docx", previewModalTemplate)} 
                  style={{ padding: "0.4rem 0.85rem", fontSize: "0.78rem", display: "flex", alignItems: "center", gap: "0.3rem" }}
                >
                  <Icons.FileText /> Export Word
                </button>
                <button 
                  className="btn-primary" 
                  onClick={() => {
                    setSelectedTemplate(previewModalTemplate);
                    setIsPreviewModalOpen(false);
                    addToast(`Applied ${previewModalTemplate} style to workspace.`, "success");
                  }}
                  style={{ padding: "0.4rem 0.85rem", fontSize: "0.78rem" }}
                >
                  Apply & Use
                </button>
                <button 
                  className="btn-secondary" 
                  onClick={() => setIsPreviewModalOpen(false)} 
                  style={{ padding: "0.4rem 0.85rem", fontSize: "0.78rem", background: "var(--color-danger)", color: "#fff", border: "none" }}
                >
                  Close
                </button>
              </div>
            </div>
            
            {/* Viewport for previewing scaled A4 canvas */}
            <div className="fullscreen-preview-body">
              <div className="preview-paper-wrapper" style={{ transform: `scale(${zoomScale})`, transformOrigin: "top center" }}>
                {renderLivePreview(previewModalTemplate)}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Render root element
const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement);
root.render(<App />);
