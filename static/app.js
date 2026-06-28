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
  },
  { 
    name: "Academic CV", 
    icon: "🏛️", 
    badge: "ATS: 95%", 
    bestFor: "Postdocs, researchers, professors, and academic fellowships.",
    accent: "#475569"
  },
  { 
    name: "Sales Specialist", 
    icon: "💰", 
    badge: "ATS: 87%", 
    bestFor: "Sales managers, account executives, and business development.",
    accent: "#059669"
  },
  { 
    name: "Healthcare Professional", 
    icon: "🏥", 
    badge: "ATS: 93%", 
    bestFor: "Doctors, nurses, clinicians, and medical administrators.",
    accent: "#0891b2"
  },
  { 
    name: "Project Manager", 
    icon: "📅", 
    badge: "ATS: 94%", 
    bestFor: "Scrum masters, PMs, operations managers, and coordinators.",
    accent: "#6366f1"
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
  const [activePrepCategory, setActivePrepCategory] = useState("resume"); // Default to "resume"
  const [prepDifficultyFilter, setPrepDifficultyFilter] = useState("all");
  const [recruiterJobRole, setRecruiterJobRole] = useState("");
  const [practiceMode, setPracticeMode] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
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
      setRecruiterJobRole(selectedResume.profession || "");
      setPracticeMode(false);
      setCurrentQuestionIndex(0);
    } else {
      setInterviewPrep(null);
      setRecruiterJobRole("");
      setPracticeMode(false);
      setCurrentQuestionIndex(0);
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

  // Phase 6 Upgraded States
  const [builderTab, setBuilderTab] = useState("content"); // "content", "design", "ai", "versions"
  const [versionsList, setVersionsList] = useState([]);
  const [versionsLoading, setVersionsLoading] = useState(false);
    const [newVersionName, setNewVersionName] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [activeEditField, setActiveEditField] = useState(null);
  const [pastStates, setPastStates] = useState([]);
  const [futureStates, setFutureStates] = useState([]);
  const [mobileTab, setMobileTab] = useState("builder"); // "builder", "templates", "preview", "export"
  
  // Undo/Redo Engine
  const pushToHistory = (state) => {
    setPastStates(prev => [...prev, JSON.parse(JSON.stringify(state))]);
    setFutureStates([]);
  };

  const handleUndo = () => {
    if (pastStates.length === 0) return;
    const previous = pastStates[pastStates.length - 1];
    setPastStates(prev => prev.slice(0, -1));
    setFutureStates(prev => [JSON.parse(JSON.stringify(editedResume)), ...prev]);
    setEditedResume(previous);
    addToast("Undo successful", "info");
  };

  const handleRedo = () => {
    if (futureStates.length === 0) return;
    const next = futureStates[0];
    setFutureStates(prev => prev.slice(1));
    setPastStates(prev => [...prev, JSON.parse(JSON.stringify(editedResume))]);
    setEditedResume(next);
    addToast("Redo successful", "info");
  };

  // Keyboard Shortcuts listener (Ctrl+B, Ctrl+I, Ctrl+Z, Ctrl+Y)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!editMode) return;
      if (e.ctrlKey || e.metaKey) {
        if (e.key.toLowerCase() === "z") {
          e.preventDefault();
          handleUndo();
        } else if (e.key.toLowerCase() === "y") {
          e.preventDefault();
          handleRedo();
        } else if (e.key.toLowerCase() === "b") {
          // execCommand bold is handled natively by browser inside contenteditable
        } else if (e.key.toLowerCase() === "i") {
          // execCommand italic is handled natively
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editMode, pastStates, futureStates, editedResume]);

  // Drag and Drop Sections handlers
  const handleDragStart = (e, index) => {
    e.dataTransfer.setData("text/plain", index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleCanvasDrop = (e, targetIndex) => {
    const sourceIndex = parseInt(e.dataTransfer.getData("text/plain"));
    if (isNaN(sourceIndex) || sourceIndex === targetIndex) return;
    pushToHistory(editedResume);
    const newOrder = [...(editedResume.section_order || ["summary", "skills", "experience", "projects", "education", "certifications", "languages", "achievements", "interests", "referees"])];
    const [removed] = newOrder.splice(sourceIndex, 1);
    newOrder.splice(targetIndex, 0, removed);
    setEditedResume(prev => ({
      ...prev,
      section_order: newOrder,
      customization: {
        ...(prev.customization || {}),
        section_order: newOrder
      }
    }));
    addToast("Section layout order updated", "success");
  };

  // Direct Inline Canvas blur save
  const handleInlineBlur = (field, index, subfield, value) => {
    pushToHistory(editedResume);
    setEditedResume(prev => {
      const updated = { ...prev };
      if (index === undefined) {
        updated[field] = value;
      } else {
        const list = [...(updated[field] || [])];
        if (subfield) {
          list[index] = { ...list[index], [subfield]: value };
        } else {
          list[index] = value;
        }
        updated[field] = list;
      }
      return updated;
    });
    addToast("Inline updates saved", "success");
  };

  const [aiImproveJd, setAiImproveJd] = useState("");
  const [aiImproveLoading, setAiImproveLoading] = useState(false);
  const [aiImproveResults, setAiImproveResults] = useState(null);
  const [skillSuggestions, setSkillSuggestions] = useState(null);
  const [skillSuggestionsLoading, setSkillSuggestionsLoading] = useState(false);
  const [skillSuggestionsRole, setSkillSuggestionsRole] = useState("");

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
  
  // Custom auth states for QA verification, persistent session and password visibility
  const [isSessionChecking, setIsSessionChecking] = useState(true);
  const [rememberMe, setRememberMe] = useState(localStorage.getItem("remember_me") === "true");
  const [verificationCountdown, setVerificationCountdown] = useState(0);
  const [devOtp, setDevOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  
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

  const updateStringListItem = (field, index, val) => {
    setEditedResume(prev => {
      const newList = [...(prev[field] || [])];
      newList[index] = val;
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

  // Auth countdown timer for resend OTP
  useEffect(() => {
    let timer;
    if (verificationCountdown > 0) {
      timer = setInterval(() => {
        setVerificationCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [verificationCountdown]);

  // Start countdown on loading verification view
  useEffect(() => {
    if (currentUser && !currentUser.is_verified) {
      setVerificationCountdown(60);
    }
  }, [currentUser?.email, currentUser?.is_verified]);

  useEffect(() => {
    if (selectedResume) {
      const defaultCustomization = {
        fontFamily: "DejaVuSans",
        fontSize: 9.5,
        primaryColor: "#0f172a",
        accentColor: "#2563eb",
        marginSize: 54,
        lineSpacing: 1.15,
        sectionSpacing: 10,
        headerLayout: "left",
        sidebarLayout: "left",
        showIcons: true,
        section_order: ["summary", "skills", "experience", "projects", "education", "certifications", "languages", "achievements", "interests", "referees"]
      };

      setEditedResume({
        id: selectedResume.id,
        name: selectedResume.name || "",
        email: selectedResume.email || "",
        phone: selectedResume.phone || "",
        professional_summary: selectedResume.summary || selectedResume.professional_summary || "",
        summary: selectedResume.summary || selectedResume.professional_summary || "",
        skills: selectedResume.skills ? [...selectedResume.skills] : [],
        education: selectedResume.education ? JSON.parse(JSON.stringify(selectedResume.education)) : [],
        experience: selectedResume.experience ? JSON.parse(JSON.stringify(selectedResume.experience)) : [],
        projects: selectedResume.projects ? JSON.parse(JSON.stringify(selectedResume.projects)) : [],
        certifications: selectedResume.certifications ? JSON.parse(JSON.stringify(selectedResume.certifications)) : [],
        languages: selectedResume.languages ? JSON.parse(JSON.stringify(selectedResume.languages)) : [],
        leadership: selectedResume.leadership ? [...selectedResume.leadership] : [],
        interests: selectedResume.interests ? [...selectedResume.interests] : [],
        referees: selectedResume.referees ? [...selectedResume.referees] : [],
        achievements: selectedResume.achievements ? [...selectedResume.achievements] : [],
        section_order: (selectedResume.section_order && selectedResume.section_order.length > 0)
          ? [...selectedResume.section_order]
          : [...defaultCustomization.section_order],
        customization: {
          ...defaultCustomization,
          ...(selectedResume.customization || {})
        }
      });
      // Fetch versions for this resume
      fetchVersions(selectedResume.id);
    } else {
      setEditedResume(null);
    }
  }, [selectedResume]);

  const handleApiUnauthorized = () => {
    if (currentUser) {
      setCurrentUser(null);
      addToast("Your session has expired. Please sign in again.", "error");
      setAuthView("login");
      setShowAuthModal(true);
    }
  };

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
    } finally {
      setIsSessionChecking(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const res = await fetch("/api/v1/users/dashboard/stats");
      if (res.status === 401) {
        handleApiUnauthorized();
        return;
      }
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
      if (res.status === 401) {
        handleApiUnauthorized();
        return;
      }
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
      const payload = {
        jd_text: recruiterJdText.trim() || null,
        job_role: recruiterJobRole.trim() || null
      };
      const res = await fetch(`/api/v1/resumes/${resumeId}/interview-prep`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const atsData = await res.json();
        setSelectedResume(prev => ({
          ...prev,
          ats_analysis: atsData
        }));
        setInterviewPrep(atsData.interview_prep);
        addToast("Interview Questions generated successfully!", "success");
      } else {
        const errData = await res.json();
        setError(errData.detail || "Failed to generate Interview Questions.");
      }
    } catch (err) {
      setError("Network error during Interview Prep generation.");
      console.error(err);
    } finally {
      setGeneratingPrep(false);
    }
  };

  const toggleQuestionStatus = async (resumeId, categoryKey, questionIdx, statusType) => {
    // Optimistic UI update
    setInterviewPrep(prev => {
      if (!prev) return prev;
      const updated = { ...prev };
      const list = [...updated[categoryKey]];
      list[questionIdx] = {
        ...list[questionIdx],
        [statusType]: !list[questionIdx][statusType]
      };
      updated[categoryKey] = list;
      return updated;
    });

    try {
      const res = await fetch(`/api/v1/resumes/${resumeId}/interview-prep/toggle-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: categoryKey,
          question_idx: questionIdx,
          status_type: statusType
        })
      });
      if (res.ok) {
        const atsData = await res.json();
        setSelectedResume(prev => ({
          ...prev,
          ats_analysis: atsData
        }));
        setInterviewPrep(atsData.interview_prep);
      } else {
        addToast("Failed to update question status", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Network error updating question status", "error");
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
        if (data.otp) {
          setDevOtp(data.otp);
        }
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
        body: JSON.stringify({ email: currentUser.email, token: verificationCode, remember_me: rememberMe })
      });
      const data = await res.json();
      if (res.ok) {
        addToast("Email verified successfully!", "success");
        setCurrentUser(data.user);
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
        setVerificationCountdown(60);
        if (data.otp) {
          setDevOtp(data.otp);
        }
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

  const fetchVersions = async (resumeId) => {
    setVersionsLoading(true);
    try {
      const res = await fetch(`/api/v1/resumes/${resumeId}/versions`);
      if (res.ok) {
        const data = await res.json();
        setVersionsList(data);
      }
    } catch (err) {
      console.error("Failed to fetch versions:", err);
    } finally {
      setVersionsLoading(false);
    }
  };

  const handleSaveVersion = async () => {
    if (!newVersionName.trim()) {
      addToast("Please enter a version name.", "warning");
      return;
    }
    setVersionsLoading(true);
    try {
      const res = await fetch(`/api/v1/resumes/${selectedResume.id}/version?version_name=${encodeURIComponent(newVersionName)}`, {
        method: "POST"
      });
      if (res.ok) {
        addToast(`Version '${newVersionName}' saved successfully!`, "success");
        setNewVersionName("");
        await fetchVersions(selectedResume.id);
      } else {
        const err = await res.json();
        addToast(`Failed to save version: ${err.detail || "Error"}`, "error");
      }
    } catch (err) {
      addToast("Network error saving version.", "error");
    } finally {
      setVersionsLoading(false);
    }
  };

  const handleRestoreVersion = async (versionId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/resumes/${selectedResume.id}/restore/${versionId}`, {
        method: "POST"
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedResume(updated);
        addToast("Resume restored to selected version successfully!", "success");
        await Promise.all([fetchHistory(), fetchDashboardStats(), fetchEnhancements(selectedResume.id)]);
      } else {
        const err = await res.json();
        addToast(`Failed to restore version: ${err.detail || "Error"}`, "error");
      }
    } catch (err) {
      addToast("Network error restoring version.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRenameVersion = async (versionId, targetName) => {
    if (!targetName.trim()) return;
    try {
      const res = await fetch(`/api/v1/resumes/${versionId}/rename?name=${encodeURIComponent(targetName)}`, {
        method: "PUT"
      });
      if (res.ok) {
        addToast("Version renamed successfully!", "success");
        await fetchVersions(selectedResume.id);
      } else {
        addToast("Failed to rename version.", "error");
      }
    } catch (err) {
      addToast("Network error renaming version.", "error");
    }
  };

  const handleDuplicateResume = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/resumes/${selectedResume.id}/duplicate`, {
        method: "POST"
      });
      if (res.ok) {
        const duplicated = await res.json();
        addToast("Resume duplicated successfully!", "success");
        await fetchHistory();
        setSelectedResume(duplicated); // switch context to the copy
      } else {
        addToast("Failed to duplicate resume.", "error");
      }
    } catch (err) {
      addToast("Network error duplicating resume.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBlankResume = async () => {
    setLoading(true);
    try {
      const blankResume = {
        name: "New Resume",
        email: "",
        phone: "",
        summary: "Professional summary goes here...",
        skills: ["Communication"],
        education: [{ school: "University", degree: "Bachelor of Science", field_of_study: "Field", end_date: "2026" }],
        experience: [{ role: "Job Title", company: "Company Name", start_date: "2024", end_date: "Present", description: "• Bullet point detail" }],
        projects: [{ title: "Project Name", technologies: ["Tech Stack"], description: "Detail about the project" }],
        certifications: [],
        languages: [],
        leadership: [],
        interests: [],
        referees: [],
        achievements: [],
        section_order: ["summary", "skills", "experience", "projects", "education"],
        customization: {
          fontFamily: "DejaVuSans",
          fontSize: 9.5,
          primaryColor: "#0f172a",
          accentColor: "#2563eb",
          marginSize: 54,
          lineSpacing: 1.15,
          sectionSpacing: 10,
          headerLayout: "left",
          sidebarLayout: "left",
          showIcons: true,
          section_order: ["summary", "skills", "experience", "projects", "education", "certifications", "languages", "achievements", "interests", "referees"]
        }
      };
      const res = await fetch("/api/v1/resumes/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(blankResume)
      });
      if (res.ok) {
        const created = await res.json();
        setSelectedResume(created);
        addToast("Created blank resume workspace!", "success");
        await Promise.all([fetchHistory(), fetchDashboardStats()]);
        setActiveTab("templates"); // Go to resume editor
      } else {
        const err = await res.json();
        addToast(`Failed to create resume: ${err.detail || "Error"}`, "error");
      }
    } catch (err) {
      addToast("Network error creating blank resume.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleImproveResumeAI = async () => {
    setAiImproveLoading(true);
    setAiImproveResults(null);
    try {
      const res = await fetch(`/api/v1/resumes/${selectedResume.id}/ai-improve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jd_text: aiImproveJd })
      });
      if (res.ok) {
        const data = await res.json();
        setAiImproveResults(data);
        addToast("AI suggestions generated successfully!", "success");
      } else {
        const err = await res.json();
        addToast(`Failed to generate improvements: ${err.detail || "Error"}`, "error");
      }
    } catch (err) {
      addToast("Network error during AI improvement.", "error");
    } finally {
      setAiImproveLoading(false);
    }
  };

  const handleGetSkillSuggestions = async () => {
    setSkillSuggestionsLoading(true);
    setSkillSuggestions(null);
    try {
      const res = await fetch(`/api/v1/resumes/${selectedResume.id}/suggest-skills?role=${encodeURIComponent(skillSuggestionsRole)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jd_text: aiImproveJd })
      });
      if (res.ok) {
        const data = await res.json();
        setSkillSuggestions(data);
        addToast("Smart skill suggestions retrieved!", "success");
      } else {
        const err = await res.json();
        addToast(`Failed to get suggestions: ${err.detail || "Error"}`, "error");
      }
    } catch (err) {
      addToast("Network error fetching skill suggestions.", "error");
    } finally {
      setSkillSuggestionsLoading(false);
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
          resume_data: editedResume,
          customization: editedResume.customization || null
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
          body: JSON.stringify({ email: authEmail, password: authPassword, remember_me: rememberMe })
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
        const regData = await res.json();
        if (res.ok) {
          if (regData.otp) {
            setDevOtp(regData.otp);
          }
          addToast("Account created successfully! Logging in...", "success");
          const loginRes = await fetch("/api/v1/users/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: authEmail, password: authPassword, remember_me: false })
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
    Eye: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
    ),
    EyeOff: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
    ),
    Download: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
    ),
    Share: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
    ),
    Printer: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
    ),
    Star: ({ fill = "none", color = "currentColor" }) => (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
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
  const handlePreviewClick = (secName) => {
    // Switch to Content tab
    setBuilderTab("content");
    
    // Map section name to accordion keys
    const sectionMapping = {
      "contact": "contact",
      "summary": "summary",
      "skills": "skills",
      "experience": "experience",
      "projects": "projects",
      "education": "education",
      "certifications": "certifications",
      "languages": "languages",
      "achievements": "achievements",
      "interests": "interests",
      "referees": "referees"
    };
    
    const key = sectionMapping[secName] || secName;
    setExpandedSections(prev => ({ ...prev, [key]: true }));
    
    // Scroll to the input group inside the left accordion
    setTimeout(() => {
      const el = document.getElementById(`editor-section-${key}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        el.classList.add("editor-section-pulse");
        setTimeout(() => el.classList.remove("editor-section-pulse"), 1500);
      }
    }, 150);
  };

  const renderLivePreview = (templateName = selectedTemplate, forceDummy = false) => {
    const isMobile = window.innerWidth < 768;
    const useDummy = forceDummy || (isPreviewModalOpen && isDummyPreview);
    const data = useDummy ? dummyResumeData : editedResume;
    if (!data) return <div style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-muted)" }}>Please upload/select a resume to view live preview.</div>;
    
    const { name, email, phone, skills, education, experience, projects, certifications, languages, leadership, interests, referees, achievements } = data;
    const summary_text = data.summary || data.professional_summary || "";
    
    const customization = data.customization || {};
    const fontFamily = customization.fontFamily || "DejaVuSans";
    const fontSize = customization.fontSize || 9.5;
    const primaryColor = customization.primaryColor || "#0f172a";
    const accentColor = customization.accentColor || "#2563eb";
    const marginSize = customization.marginSize !== undefined ? customization.marginSize : 54;
    const lineSpacing = customization.lineSpacing || 1.15;
    const sectionSpacing = customization.sectionSpacing !== undefined ? customization.sectionSpacing : 10;
    const headerLayout = customization.headerLayout || "left";
    const sidebarLayout = customization.sidebarLayout || "left";
    const showIcons = customization.showIcons !== undefined ? customization.showIcons : true;
    const section_order = customization.section_order || ["summary", "skills", "experience", "projects", "education", "certifications", "languages", "achievements", "interests", "referees"];
    const scale = customization.scale || 1.0;

    const fontMapping = {
      "DejaVuSans": "'Inter', 'DejaVu Sans', sans-serif",
      "DejaVuSerif": "'Outfit', 'DejaVu Serif', 'Georgia', serif",
      "Courier": "'Courier New', Courier, monospace"
    };

    const containerStyle = {
      fontFamily: fontMapping[fontFamily] || "sans-serif",
      fontSize: `${(fontSize / 9.5) * 0.85 * scale}rem`,
      lineHeight: lineSpacing,
      padding: `${marginSize}px`,
      color: "#1e293b",
      background: "#ffffff",
      position: "relative",
      boxSizing: "border-box",
      width: isMobile ? "100%" : "800px",
      margin: isMobile ? "0" : "0 auto",
      minHeight: "842px",
      textAlign: "left"
    };

    const pColor = primaryColor;
    const aColor = accentColor;

    const emailIcon = showIcons ? "✉ " : "";
    const phoneIcon = showIcons ? "☎ " : "";

    // Image Upload handler for Profile Photo (Part 8)
    const handlePhotoUpload = (e) => {
      if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (uploadEvent) => {
          updateCustomizationField("profilePhoto", uploadEvent.target.result);
          addToast("Profile photo uploaded", "success");
        };
        reader.readAsDataURL(e.target.files[0]);
      }
    };

    // Spacing slider handle adjustments (Part 6)
    const handleSpacingMouseDown = (e, spacingType) => {
      e.preventDefault();
      const startY = e.clientY;
      const initialSpacing = spacingType === "sectionSpacing" ? sectionSpacing : marginSize;
      
      const handleMouseMove = (moveEvent) => {
        const deltaY = moveEvent.clientY - startY;
        const newSpacing = Math.max(5, Math.min(100, initialSpacing + deltaY));
        updateCustomizationField(spacingType, newSpacing);
      };

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    };

    const renderHeaderBlock = () => {
      if (headerLayout === "center") {
        return (
          <div 
            style={{ textAlign: "center", borderBottom: `2px solid ${aColor}`, paddingBottom: "0.75rem", marginBottom: `${sectionSpacing * 1.5}px` }} 
            className="preview-header-center"
          >
            <h1 
              contentEditable={editMode}
              suppressContentEditableWarning={true}
              onBlur={e => handleInlineBlur("name", undefined, undefined, e.target.innerText)}
              className={`preview-editable-element ${editMode ? "editing" : ""}`}
              style={{ color: pColor, margin: "0 0 0.35rem 0", fontSize: "1.8rem", fontWeight: "800", outline: "none" }}
            >
              {name || "Candidate Name"}
            </h1>
            <div style={{ fontSize: "0.85rem", color: "#64748b", display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
              <span 
                contentEditable={editMode}
                suppressContentEditableWarning={true}
                onBlur={e => handleInlineBlur("email", undefined, undefined, e.target.innerText)}
                className={`preview-editable-element ${editMode ? "editing" : ""}`}
                style={{ outline: "none" }}
              >
                {email || "email@example.com"}
              </span>
              <span>•</span>
              <span 
                contentEditable={editMode}
                suppressContentEditableWarning={true}
                onBlur={e => handleInlineBlur("phone", undefined, undefined, e.target.innerText)}
                className={`preview-editable-element ${editMode ? "editing" : ""}`}
                style={{ outline: "none" }}
              >
                {phone || "123-456-7890"}
              </span>
            </div>
          </div>
        );
      }
      
      if (headerLayout === "split") {
        return (
          <div 
            style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: `2px solid ${aColor}`, paddingBottom: "0.75rem", marginBottom: `${sectionSpacing * 1.5}px` }}
            className="preview-header-split"
          >
            <div>
              <h1 
                contentEditable={editMode}
                suppressContentEditableWarning={true}
                onBlur={e => handleInlineBlur("name", undefined, undefined, e.target.innerText)}
                className={`preview-editable-element ${editMode ? "editing" : ""}`}
                style={{ color: pColor, margin: 0, fontSize: "1.9rem", fontWeight: "800", outline: "none" }}
              >
                {name || "Candidate Name"}
              </h1>
            </div>
            <div style={{ textAlign: "right", fontSize: "0.85rem", color: "#64748b" }}>
              <div 
                contentEditable={editMode}
                suppressContentEditableWarning={true}
                onBlur={e => handleInlineBlur("email", undefined, undefined, e.target.innerText)}
                className={`preview-editable-element ${editMode ? "editing" : ""}`}
                style={{ outline: "none" }}
              >
                {email || "email@example.com"}
              </div>
              <div 
                contentEditable={editMode}
                suppressContentEditableWarning={true}
                onBlur={e => handleInlineBlur("phone", undefined, undefined, e.target.innerText)}
                className={`preview-editable-element ${editMode ? "editing" : ""}`}
                style={{ marginTop: "0.15rem", outline: "none" }}
              >
                {phone || "123-456-7890"}
              </div>
            </div>
          </div>
        );
      }

      // Default left header
      return (
        <div 
          style={{ borderBottom: `2px solid ${aColor}`, paddingBottom: "0.75rem", marginBottom: `${sectionSpacing * 1.5}px` }}
          className="preview-header-left"
        >
          <h1 
            contentEditable={editMode}
            suppressContentEditableWarning={true}
            onBlur={e => handleInlineBlur("name", undefined, undefined, e.target.innerText)}
            className={`preview-editable-element ${editMode ? "editing" : ""}`}
            style={{ color: pColor, margin: "0 0 0.25rem 0", fontSize: "2rem", fontWeight: "800", outline: "none" }}
          >
            {name || "Candidate Name"}
          </h1>
          <div style={{ fontSize: "0.85rem", color: "#64748b", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <span 
              contentEditable={editMode}
              suppressContentEditableWarning={true}
              onBlur={e => handleInlineBlur("email", undefined, undefined, e.target.innerText)}
              className={`preview-editable-element ${editMode ? "editing" : ""}`}
              style={{ outline: "none" }}
            >
              {email || "email@example.com"}
            </span>
            <span>|</span>
            <span 
              contentEditable={editMode}
              suppressContentEditableWarning={true}
              onBlur={e => handleInlineBlur("phone", undefined, undefined, e.target.innerText)}
              className={`preview-editable-element ${editMode ? "editing" : ""}`}
              style={{ outline: "none" }}
            >
              {phone || "123-456-7890"}
            </span>
          </div>
        </div>
      );
    };

    const renderPreviewSection = (secName) => {
      const spacingStyle = { marginBottom: `${sectionSpacing}px`, marginTop: `${sectionSpacing}px` };

      switch (secName) {
        case "summary":
          if (!summary_text && !editMode) return null;
          return (
            <div key="summary" style={spacingStyle} className="preview-section-container">
              <div className="res-sec-title" style={{ color: pColor, borderBottom: `1px solid ${aColor}`, fontWeight: "700", paddingBottom: "2px", marginBottom: "4px" }}>SUMMARY</div>
              <p 
                contentEditable={editMode}
                suppressContentEditableWarning={true}
                onBlur={e => handleInlineBlur("summary", undefined, undefined, e.target.innerText)}
                className={`preview-editable-element ${editMode ? "editing" : ""}`}
                style={{ margin: "4px 0", whiteSpace: "pre-line", fontSize: "0.85rem", outline: "none" }}
              >
                {summary_text || "Summarize your career highlights..."}
              </p>
            </div>
          );
        case "skills":
          if ((!skills || skills.length === 0) && !editMode) return null;
          return (
            <div key="skills" style={spacingStyle} className="preview-section-container">
              <div className="res-sec-title" style={{ color: pColor, borderBottom: `1px solid ${aColor}`, fontWeight: "700", paddingBottom: "2px", marginBottom: "6px" }}>SKILLS</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginTop: "4px" }}>
                {skills.map((s, i) => (
                  <span 
                    key={i} 
                    contentEditable={editMode}
                    suppressContentEditableWarning={true}
                    onBlur={e => handleInlineBlur("skills", i, undefined, e.target.innerText)}
                    className={`preview-skill-tag preview-editable-element ${editMode ? "editing" : ""}`} 
                    style={{ background: `${aColor}12`, color: aColor, border: `1px solid ${aColor}22`, borderRadius: "4px", padding: "0.15rem 0.45rem", fontSize: "0.75rem", fontWeight: "600", outline: "none" }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          );
        case "experience":
          if ((!experience || experience.length === 0) && !editMode) return null;
          return (
            <div key="experience" style={spacingStyle} className="preview-section-container">
              <div className="res-sec-title" style={{ color: pColor, borderBottom: `1px solid ${aColor}`, fontWeight: "700", paddingBottom: "2px", marginBottom: "6px" }}>EXPERIENCE</div>
              {experience.map((exp, i) => (
                <div key={i} style={{ marginTop: "0.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "0.85rem" }}>
                    <span style={{ color: pColor }}>
                      <span 
                        contentEditable={editMode}
                        suppressContentEditableWarning={true}
                        onBlur={e => handleInlineBlur("experience", i, "role", e.target.innerText)}
                        className={`preview-editable-element ${editMode ? "editing" : ""}`}
                        style={{ outline: "none" }}
                      >
                        {exp.role}
                      </span>
                      <span> at </span>
                      <span 
                        contentEditable={editMode}
                        suppressContentEditableWarning={true}
                        onBlur={e => handleInlineBlur("experience", i, "company", e.target.innerText)}
                        className={`preview-editable-element ${editMode ? "editing" : ""}`}
                        style={{ outline: "none" }}
                      >
                        {exp.company}
                      </span>
                    </span>
                    <span style={{ fontWeight: "normal", color: "#64748b" }}>
                      <span 
                        contentEditable={editMode}
                        suppressContentEditableWarning={true}
                        onBlur={e => handleInlineBlur("experience", i, "start_date", e.target.innerText)}
                        className={`preview-editable-element ${editMode ? "editing" : ""}`}
                        style={{ outline: "none" }}
                      >
                        {exp.start_date}
                      </span>
                      <span> - </span>
                      <span 
                        contentEditable={editMode}
                        suppressContentEditableWarning={true}
                        onBlur={e => handleInlineBlur("experience", i, "end_date", e.target.innerText)}
                        className={`preview-editable-element ${editMode ? "editing" : ""}`}
                        style={{ outline: "none" }}
                      >
                        {exp.end_date}
                      </span>
                    </span>
                  </div>
                  {exp.description && (
                    <ul style={{ paddingLeft: "1.2rem", marginTop: "2px", fontSize: "0.82rem" }}>
                      {exp.description.split("\n").filter(Boolean).map((bullet, bulletIdx) => (
                        <li 
                          key={bulletIdx} 
                          contentEditable={editMode}
                          suppressContentEditableWarning={true}
                          onBlur={e => {
                            const newBullet = e.target.innerText;
                            const bullets = exp.description.split("\n").filter(Boolean);
                            bullets[bulletIdx] = newBullet;
                            handleInlineBlur("experience", i, "description", bullets.join("\n"));
                          }}
                          className={`preview-editable-element ${editMode ? "editing" : ""}`}
                          style={{ marginBottom: "2px", outline: "none" }}
                        >
                          {bullet.replace(/^-*\s*/, "").replace(/^•\s*/, "")}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          );
        case "projects":
          if ((!projects || projects.length === 0) && !editMode) return null;
          return (
            <div key="projects" style={spacingStyle} className="preview-section-container">
              <div className="res-sec-title" style={{ color: pColor, borderBottom: `1px solid ${aColor}`, fontWeight: "700", paddingBottom: "2px", marginBottom: "6px" }}>PROJECTS</div>
              {projects.map((proj, i) => (
                <div key={i} style={{ marginTop: "0.5rem" }}>
                  <div style={{ fontWeight: "bold", display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                    <span 
                      contentEditable={editMode}
                      suppressContentEditableWarning={true}
                      onBlur={e => handleInlineBlur("projects", i, "title", e.target.innerText)}
                      className={`preview-editable-element ${editMode ? "editing" : ""}`}
                      style={{ color: pColor, outline: "none" }}
                    >
                      {proj.title}
                    </span>
                    <span 
                      contentEditable={editMode}
                      suppressContentEditableWarning={true}
                      onBlur={e => {
                        const newTech = e.target.innerText.split(",").map(t => t.trim());
                        handleInlineBlur("projects", i, "technologies", newTech);
                      }}
                      className={`preview-editable-element ${editMode ? "editing" : ""}`}
                      style={{ fontWeight: "normal", fontSize: "0.75rem", color: aColor, fontFamily: "monospace", outline: "none" }}
                    >
                      {Array.isArray(proj.technologies) ? proj.technologies.join(", ") : proj.technologies}
                    </span>
                  </div>
                  <p 
                    contentEditable={editMode}
                    suppressContentEditableWarning={true}
                    onBlur={e => handleInlineBlur("projects", i, "description", e.target.innerText)}
                    className={`preview-editable-element ${editMode ? "editing" : ""}`}
                    style={{ margin: "2px 0", fontSize: "0.82rem", outline: "none" }}
                  >
                    {proj.description}
                  </p>
                </div>
              ))}
            </div>
          );
        case "education":
          if ((!education || education.length === 0) && !editMode) return null;
          return (
            <div key="education" style={spacingStyle} className="preview-section-container">
              <div className="res-sec-title" style={{ color: pColor, borderBottom: `1px solid ${aColor}`, fontWeight: "700", paddingBottom: "2px", marginBottom: "6px" }}>EDUCATION</div>
              {education.map((edu, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", marginTop: "0.35rem", fontSize: "0.85rem" }}>
                  <span>
                    <strong 
                      contentEditable={editMode}
                      suppressContentEditableWarning={true}
                      onBlur={e => handleInlineBlur("education", i, "degree", e.target.innerText)}
                      className={`preview-editable-element ${editMode ? "editing" : ""}`}
                      style={{ outline: "none" }}
                    >
                      {edu.degree}
                    </strong>
                    <span> in </span>
                    <span 
                      contentEditable={editMode}
                      suppressContentEditableWarning={true}
                      onBlur={e => handleInlineBlur("education", i, "field_of_study", e.target.innerText)}
                      className={`preview-editable-element ${editMode ? "editing" : ""}`}
                      style={{ outline: "none" }}
                    >
                      {edu.field_of_study}
                    </span>
                    <span> — </span>
                    <span 
                      contentEditable={editMode}
                      suppressContentEditableWarning={true}
                      onBlur={e => handleInlineBlur("education", i, "school", e.target.innerText)}
                      className={`preview-editable-element ${editMode ? "editing" : ""}`}
                      style={{ outline: "none" }}
                    >
                      {edu.school}
                    </span>
                  </span>
                  <span 
                    contentEditable={editMode}
                    suppressContentEditableWarning={true}
                    onBlur={e => handleInlineBlur("education", i, "end_date", e.target.innerText)}
                    className={`preview-editable-element ${editMode ? "editing" : ""}`}
                    style={{ color: "#64748b", outline: "none" }}
                  >
                    {edu.end_date}
                  </span>
                </div>
              ))}
            </div>
          );
        case "certifications":
          if ((!certifications || certifications.length === 0) && !editMode) return null;
          return (
            <div key="certifications" style={spacingStyle} className="preview-section-container">
              <div className="res-sec-title" style={{ color: pColor, borderBottom: `1px solid ${aColor}`, fontWeight: "700", paddingBottom: "2px", marginBottom: "6px" }}>CERTIFICATIONS</div>
              {certifications.map((cert, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", marginTop: "0.25rem", fontSize: "0.85rem" }}>
                  <span>
                    🏆 
                    <strong 
                      contentEditable={editMode}
                      suppressContentEditableWarning={true}
                      onBlur={e => handleInlineBlur("certifications", i, "name", e.target.innerText)}
                      className={`preview-editable-element ${editMode ? "editing" : ""}`}
                      style={{ outline: "none", marginLeft: "4px" }}
                    >
                      {cert.name}
                    </strong>
                  </span>
                  <span 
                    contentEditable={editMode}
                    suppressContentEditableWarning={true}
                    onBlur={e => handleInlineBlur("certifications", i, "date", e.target.innerText)}
                    className={`preview-editable-element ${editMode ? "editing" : ""}`}
                    style={{ color: "#64748b", outline: "none" }}
                  >
                    {cert.date}
                  </span>
                </div>
              ))}
            </div>
          );
        case "languages":
          if ((!languages || languages.length === 0) && !editMode) return null;
          return (
            <div key="languages" style={spacingStyle} className="preview-section-container">
              <div className="res-sec-title" style={{ color: pColor, borderBottom: `1px solid ${aColor}`, fontWeight: "700", paddingBottom: "2px", marginBottom: "6px" }}>LANGUAGES</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginTop: "4px" }}>
                {(languages || []).map((l, i) => (
                  <span 
                    key={i} 
                    contentEditable={editMode}
                    suppressContentEditableWarning={true}
                    onBlur={e => {
                      const text = e.target.innerText;
                      const parts = text.split(":");
                      const language = parts[0]?.trim() || "";
                      const proficiency = parts[1]?.trim() || "";
                      handleInlineBlur("languages", i, undefined, { language, proficiency });
                    }}
                    className={`preview-skill-tag preview-editable-element ${editMode ? "editing" : ""}`} 
                    style={{ background: "#f1f5f9", padding: "0.15rem 0.45rem", fontSize: "0.75rem", outline: "none", borderRadius: "4px" }}
                  >
                    {l.language}{l.proficiency ? `: ${l.proficiency}` : ""}
                  </span>
                ))}
              </div>
            </div>
          );
        case "achievements":
          if ((!achievements || achievements.length === 0) && !editMode) return null;
          return (
            <div key="achievements" style={spacingStyle} className="preview-section-container">
              <div className="res-sec-title" style={{ color: pColor, borderBottom: `1px solid ${aColor}`, fontWeight: "700", paddingBottom: "2px", marginBottom: "6px" }}>ACHIEVEMENTS</div>
              <ul style={{ paddingLeft: "1.2rem", marginTop: "4px", fontSize: "0.82rem" }}>
                {(achievements || []).map((ach, i) => (
                  <li 
                    key={i}
                    contentEditable={editMode}
                    suppressContentEditableWarning={true}
                    onBlur={e => handleInlineBlur("achievements", i, undefined, e.target.innerText)}
                    className={`preview-editable-element ${editMode ? "editing" : ""}`}
                    style={{ marginBottom: "2px", outline: "none" }}
                  >
                    {ach}
                  </li>
                ))}
              </ul>
            </div>
          );
        case "leadership":
          if ((!leadership || leadership.length === 0) && !editMode) return null;
          return (
            <div key="leadership" style={spacingStyle} className="preview-section-container">
              <div className="res-sec-title" style={{ color: pColor, borderBottom: `1px solid ${aColor}`, fontWeight: "700", paddingBottom: "2px", marginBottom: "6px" }}>LEADERSHIP</div>
              <ul style={{ paddingLeft: "1.2rem", marginTop: "4px", fontSize: "0.82rem" }}>
                {(leadership || []).map((lead, i) => (
                  <li 
                    key={i}
                    contentEditable={editMode}
                    suppressContentEditableWarning={true}
                    onBlur={e => handleInlineBlur("leadership", i, undefined, e.target.innerText)}
                    className={`preview-editable-element ${editMode ? "editing" : ""}`}
                    style={{ marginBottom: "2px", outline: "none" }}
                  >
                    {lead}
                  </li>
                ))}
              </ul>
            </div>
          );
        case "interests":
          if ((!interests || interests.length === 0) && !editMode) return null;
          return (
            <div key="interests" style={spacingStyle} className="preview-section-container">
              <div className="res-sec-title" style={{ color: pColor, borderBottom: `1px solid ${aColor}`, fontWeight: "700", paddingBottom: "2px", marginBottom: "6px" }}>INTERESTS</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginTop: "4px" }}>
                {(interests || []).map((int, i) => (
                  <span 
                    key={i} 
                    contentEditable={editMode}
                    suppressContentEditableWarning={true}
                    onBlur={e => handleInlineBlur("interests", i, undefined, e.target.innerText)}
                    className={`preview-skill-tag preview-editable-element ${editMode ? "editing" : ""}`} 
                    style={{ background: "#f8fafc", color: "#475569", border: "1px solid #e2e8f0", padding: "0.15rem 0.45rem", fontSize: "0.75rem", outline: "none", borderRadius: "4px" }}
                  >
                    {int}
                  </span>
                ))}
              </div>
            </div>
          );
        case "referees":
          if ((!referees || referees.length === 0) && !editMode) return null;
          return (
            <div key="referees" style={spacingStyle} className="preview-section-container">
              <div className="res-sec-title" style={{ color: pColor, borderBottom: `1px solid ${aColor}`, fontWeight: "700", paddingBottom: "2px", marginBottom: "6px" }}>REFERENCES</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginTop: "4px" }}>
                {(referees || []).map((ref, i) => (
                  <div 
                    key={i} 
                    contentEditable={editMode}
                    suppressContentEditableWarning={true}
                    onBlur={e => handleInlineBlur("referees", i, undefined, e.target.innerText)}
                    className={`preview-editable-element ${editMode ? "editing" : ""}`}
                    style={{ outline: "none", padding: "0.35rem", border: "1px solid #e2e8f0", borderRadius: "4px", fontSize: "0.8rem", background: "#f8fafc", whiteSpace: "pre-line" }}
                  >
                    {ref}
                  </div>
                ))}
              </div>
            </div>
          );
        default:
          return null;
      }
    };

    // Wrap section with HTML5 drag and drop (Part 4)
    const renderPreviewSectionWithDrag = (secName, idx) => {
      const innerSec = renderPreviewSection(secName);
      if (!innerSec) return null;

      return (
        <div
          key={secName}
          draggable={editMode}
          onDragStart={(e) => handleDragStart(e, idx)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleCanvasDrop(e, idx)}
          style={{
            position: "relative",
            border: editMode ? "1px dashed rgba(79, 70, 229, 0.15)" : "none",
            borderRadius: "4px",
            padding: editMode ? "6px" : "0",
            margin: editMode ? "6px 0" : "0",
            cursor: editMode ? "grab" : "default"
          }}
          className={editMode ? "draggable-canvas-section" : ""}
        >
          {editMode && (
            <div style={{ position: "absolute", right: "2px", top: "-10px", fontSize: "8px", background: "var(--color-primary)", color: "#ffffff", padding: "1px 4px", borderRadius: "3px", zIndex: 100, opacity: 0.8, pointerEvents: "none" }}>
              ☰ {secName.toUpperCase()}
            </div>
          )}
          {innerSec}
        </div>
      );
    };

    // Sidebar-focused Template Layout (Modern / Creative)
    if (templateName === "Modern Professional" || templateName === "Creative") {
      const isCreative = templateName === "Creative";
      const actualAccentColor = isCreative ? "#db2777" : aColor;
      const actualPrimaryColor = isCreative ? "#1e1b4b" : pColor;
      const tClass = isCreative ? "preview-creative" : "preview-modern";

      return (
        <div style={{ position: "relative" }}>
          {editMode && (
            <ResumeRuler 
              marginSize={marginSize} 
              setMarginSize={(val) => updateCustomizationField("marginSize", val)} 
              scale={scale} 
            />
          )}
          <div style={containerStyle} className={tClass}>
            <div style={{ display: "flex", flexDirection: sidebarLayout === "right" ? "row-reverse" : "row", gap: "1.5rem" }}>
              {/* Sidebar Column */}
              <div style={{ width: "32%", borderRight: sidebarLayout === "left" ? "1px solid #cbd5e1" : "none", borderLeft: sidebarLayout === "right" ? "1px solid #cbd5e1" : "none", paddingRight: sidebarLayout === "left" ? "1rem" : "0", paddingLeft: sidebarLayout === "right" ? "1rem" : "0" }}>
                
                {/* Profile Photo Uploader (Part 8) */}
                <div style={{ marginBottom: "1rem", textAlign: "center", position: "relative" }} className="profile-photo-canvas-container">
                  <input 
                    type="file" 
                    id="profile-photo-uploader-canvas" 
                    style={{ display: "none" }} 
                    accept="image/*" 
                    onChange={handlePhotoUpload}
                  />
                  <div 
                    onClick={() => document.getElementById("profile-photo-uploader-canvas").click()}
                    style={{ 
                      width: "80px", 
                      height: "80px", 
                      borderRadius: "50%", 
                      border: "2px dashed #cbd5e1", 
                      margin: "0 auto", 
                      cursor: "pointer", 
                      overflow: "hidden",
                      background: "#f8fafc",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative"
                    }}
                    title="Click to upload profile picture"
                  >
                    {customization.profilePhoto ? (
                      <img 
                        src={customization.profilePhoto} 
                        style={{ 
                          width: "100%", 
                          height: "100%", 
                          objectFit: "cover",
                          transform: `scale(${customization.profilePhotoScale || 1.0}) translate(${customization.profilePhotoTranslateX || 0}px, ${customization.profilePhotoTranslateY || 0}px)`,
                          transition: "transform 0.1s ease-out"
                        }} 
                      />
                    ) : (
                      <span style={{ fontSize: "1.5rem", color: "#94a3b8" }}>👤</span>
                    )}
                    <div className="photo-upload-overlay" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", color: "#ffffff", fontSize: "8px", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.2s" }}>
                      Upload
                    </div>
                  </div>
                  {editMode && customization.profilePhoto && (
                    <div className="photo-crop-overlay-panel" onClick={e => e.stopPropagation()} style={{ display: "flex", flexDirection: "column", gap: "0.25rem", margin: "0.5rem auto 0 auto" }}>
                      <label style={{ fontSize: "0.62rem" }}>🔍 Zoom ({customization.profilePhotoScale || 1.0}x)</label>
                      <input 
                        type="range" 
                        min="1" 
                        max="3" 
                        step="0.1" 
                        value={customization.profilePhotoScale || 1.0} 
                        onChange={e => updateCustomizationField("profilePhotoScale", parseFloat(e.target.value))} 
                        style={{ width: "100%" }}
                      />
                      <label style={{ fontSize: "0.62rem" }}>↔ Pan X ({customization.profilePhotoTranslateX || 0}px)</label>
                      <input 
                        type="range" 
                        min="-50" 
                        max="50" 
                        step="1" 
                        value={customization.profilePhotoTranslateX || 0} 
                        onChange={e => updateCustomizationField("profilePhotoTranslateX", parseInt(e.target.value))} 
                        style={{ width: "100%" }}
                      />
                      <label style={{ fontSize: "0.62rem" }}>↕ Pan Y ({customization.profilePhotoTranslateY || 0}px)</label>
                      <input 
                        type="range" 
                        min="-50" 
                        max="50" 
                        step="1" 
                        value={customization.profilePhotoTranslateY || 0} 
                        onChange={e => updateCustomizationField("profilePhotoTranslateY", parseInt(e.target.value))} 
                        style={{ width: "100%" }}
                      />
                    </div>
                  )}
                  {customization.profilePhoto && (
                    <button 
                      onClick={() => {
                        updateCustomizationField("profilePhoto", null);
                        updateCustomizationField("profilePhotoScale", 1.0);
                        updateCustomizationField("profilePhotoTranslateX", 0);
                        updateCustomizationField("profilePhotoTranslateY", 0);
                      }}
                      style={{ border: "none", background: "transparent", color: "var(--color-danger)", fontSize: "0.68rem", cursor: "pointer", marginTop: "0.25rem" }}
                    >
                      Remove Photo
                    </button>
                  )}
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <h3 style={{ color: actualAccentColor, fontSize: "0.78rem", fontWeight: "700", letterSpacing: "0.05em", marginBottom: "0.35rem" }}>CONTACT</h3>
                  <div 
                    contentEditable={editMode}
                    suppressContentEditableWarning={true}
                    onBlur={e => handleInlineBlur("email", undefined, undefined, e.target.innerText)}
                    className={`preview-editable-element ${editMode ? "editing" : ""}`}
                    style={{ fontSize: "0.78rem", wordBreak: "break-all", marginBottom: "4px", outline: "none" }}
                  >
                    {email || "N/A"}
                  </div>
                  <div 
                    contentEditable={editMode}
                    suppressContentEditableWarning={true}
                    onBlur={e => handleInlineBlur("phone", undefined, undefined, e.target.innerText)}
                    className={`preview-editable-element ${editMode ? "editing" : ""}`}
                    style={{ fontSize: "0.78rem", outline: "none" }}
                  >
                    {phone || "N/A"}
                  </div>
                </div>

                {skills && skills.length > 0 && (
                  <div style={{ marginBottom: "1rem" }}>
                    <h3 style={{ color: actualAccentColor, fontSize: "0.78rem", fontWeight: "700", letterSpacing: "0.05em", marginBottom: "0.35rem" }}>SKILLS</h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
                      {skills.map((s, idx) => (
                        <span key={idx} style={{ background: "#f1f5f9", padding: "0.15rem 0.35rem", borderRadius: "4px", fontSize: "0.7rem", color: "#334155" }}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {languages && languages.length > 0 && (
                  <div style={{ marginBottom: "1rem" }}>
                    <h3 style={{ color: actualAccentColor, fontSize: "0.78rem", fontWeight: "700", letterSpacing: "0.05em", marginBottom: "0.35rem" }}>LANGUAGES</h3>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: "0.75rem" }}>
                      {languages.map((l, i) => <li key={i} style={{ marginBottom: "2px" }}>• {l.language}</li>)}
                    </ul>
                  </div>
                )}
              </div>

              {/* Main Content Column */}
              <div style={{ width: "68%" }}>
                <div style={{ marginBottom: "1rem" }}>
                  <h1 style={{ color: actualPrimaryColor, fontSize: "1.8rem", fontWeight: "800", margin: "0 0 0.15rem 0" }}>{name || "Candidate"}</h1>
                  <div style={{ color: actualAccentColor, fontSize: "0.8rem", fontWeight: "700", textTransform: "uppercase" }}>Professional Profile</div>
                </div>

                {/* Section spacing drag line (Part 6) */}
                {editMode && (
                  <div 
                    style={{ height: "6px", cursor: "ns-resize", background: "rgba(79, 70, 229, 0.15)", borderRadius: "3px", margin: "8px 0" }} 
                    onMouseDown={(e) => handleSpacingMouseDown(e, "sectionSpacing")}
                    title="Drag vertically to adjust sections gap"
                  />
                )}

                {section_order.filter(s => !["skills", "languages", "certifications"].includes(s)).map((sec, idx) => renderPreviewSectionWithDrag(sec, idx))}
              </div>
            </div>
          </div>
          
          <RichTextToolbar 
            activeElementId={activeEditField} 
            onUndo={handleUndo} 
            onRedo={handleRedo} 
            canUndo={pastStates.length > 0} 
            canRedo={futureStates.length > 0} 
          />
        </div>
      );
    }

    // Default Customizer Template Layout
    let templateClass = "preview-customizer-container";
    if (templateName === "ATS Professional") templateClass = "preview-ats";
    else if (templateName === "Software Engineer") templateClass = "preview-software";
    else if (templateName === "Data Analyst") templateClass = "preview-data";
    else if (templateName === "Executive") templateClass = "preview-executive";
    else if (templateName === "Minimal Elegant") templateClass = "preview-minimal";
    else if (templateName === "Student/Fresher") templateClass = "preview-student";
    else if (templateName === "Healthcare Professional") templateClass = "preview-healthcare";

    return (
      <div style={{ position: "relative" }}>
        {editMode && (
          <ResumeRuler 
            marginSize={marginSize} 
            setMarginSize={(val) => updateCustomizationField("marginSize", val)} 
            scale={scale} 
          />
        )}
        <div style={containerStyle} className={templateClass}>
          {renderHeaderBlock()}
          
          {/* Section spacing drag line (Part 6) */}
          {editMode && (
            <div 
              style={{ height: "6px", cursor: "ns-resize", background: "rgba(79, 70, 229, 0.15)", borderRadius: "3px", margin: "8px 0" }} 
              onMouseDown={(e) => handleSpacingMouseDown(e, "sectionSpacing")}
              title="Drag vertically to adjust sections gap"
            />
          )}

          {section_order.map((secName, idx) => renderPreviewSectionWithDrag(secName, idx))}
        </div>
        
        <RichTextToolbar 
          activeElementId={activeEditField} 
          onUndo={handleUndo} 
          onRedo={handleRedo} 
          canUndo={pastStates.length > 0} 
          canRedo={futureStates.length > 0} 
        />
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
    if (!editedResume) {
      return (
        <div style={{ textAlign: "center", padding: "3rem 1rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "450px" }} className="glass-panel">
          <span style={{ fontSize: "3rem", marginBottom: "1rem" }}>💡</span>
          <h3 style={{ fontWeight: "700", fontSize: "1.1rem", color: "var(--color-text-main)" }}>No Resume Selected</h3>
          <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", maxWidth: "400px", margin: "0.25rem 0 1.5rem 0", lineHeight: "1.4" }}>
            Please select an existing resume from your history dashboard, upload a PDF/Word file, or create a brand new profile from scratch to use the builder.
          </p>
          <button className="btn-primary" onClick={() => setCurrentNav("history")}>
            Go to Dashboard
          </button>
        </div>
      );
    }

    const updateCustomizationField = (field, val) => {
      pushToHistory(editedResume);
      setEditedResume(prev => ({
        ...prev,
        customization: {
          ...(prev.customization || {}),
          [field]: val
        }
      }));
    };

    const handleSwapItems = (field, index, dir) => {
      pushToHistory(editedResume);
      setEditedResume(prev => {
        const items = [...(prev[field] || [])];
        const target = index + dir;
        if (target < 0 || target >= items.length) return prev;
        const temp = items[index];
        items[index] = items[target];
        items[target] = temp;
        return { ...prev, [field]: items };
      });
      addToast("Item re-ordered", "info");
    };

    const handleSwapSections = (index, dir) => {
      pushToHistory(editedResume);
      setEditedResume(prev => {
        const order = [...(prev.section_order || ["summary", "skills", "experience", "projects", "education", "certifications", "languages", "achievements", "interests", "referees"])];
        const target = index + dir;
        if (target < 0 || target >= order.length) return prev;
        const temp = order[index];
        order[index] = order[target];
        order[target] = temp;
        return {
          ...prev,
          section_order: order,
          customization: {
            ...(prev.customization || {}),
            section_order: order
          }
        };
      });
      addToast("Section layout order updated", "success");
    };

    const handleAcceptSummary = (rewritten) => {
      pushToHistory(editedResume);
      setEditedResume(prev => ({
        ...prev,
        summary: rewritten,
        professional_summary: rewritten
      }));
      setAiImproveResults(prev => {
        if (!prev) return null;
        return {
          ...prev,
          improvements: {
            ...prev.improvements,
            improved_summary: null
          }
        };
      });
      addToast("AI improved summary applied!", "success");
    };

    const handleAcceptExperience = (idx, rewritten) => {
      pushToHistory(editedResume);
      setEditedResume(prev => {
        const updated = [...prev.experience];
        updated[idx] = { ...updated[idx], description: rewritten };
        return { ...prev, experience: updated };
      });
      setAiImproveResults(prev => {
        if (!prev) return null;
        const remaining = prev.improvements.improved_experience.filter((_, i) => i !== idx);
        return {
          ...prev,
          improvements: {
            ...prev.improvements,
            improved_experience: remaining
          }
        };
      });
      addToast("AI bullet points applied to experience!", "success");
    };

    const handleAcceptProject = (idx, rewritten) => {
      pushToHistory(editedResume);
      setEditedResume(prev => {
        const updated = [...prev.projects];
        updated[idx] = { ...updated[idx], description: rewritten };
        return { ...prev, projects: updated };
      });
      setAiImproveResults(prev => {
        if (!prev) return null;
        const remaining = prev.improvements.improved_projects.filter((_, i) => i !== idx);
        return {
          ...prev,
          improvements: {
            ...prev.improvements,
            improved_projects: remaining
          }
        };
      });
      addToast("AI description applied to project!", "success");
    };

    const handleAddSuggestedSkill = (skill) => {
      pushToHistory(editedResume);
      if (!editedResume.skills.includes(skill)) {
        setEditedResume(prev => ({
          ...prev,
          skills: [...prev.skills, skill]
        }));
        addToast(`Added: ${skill}`, "success");
      }
    };

    const handleAddSuggestedCert = (certName) => {
      pushToHistory(editedResume);
      const alreadyHas = editedResume.certifications.some(c => c.name.toLowerCase() === certName.toLowerCase());
      if (!alreadyHas) {
        setEditedResume(prev => ({
          ...prev,
          certifications: [...prev.certifications, { name: certName, authority: "Recommended", date: "2026" }]
        }));
        addToast(`Added certification suggestion: ${certName}`, "success");
      } else {
        addToast("Certification already present in resume.", "info");
      }
    };

    // Responsive Mobile check
    const isMobile = window.innerWidth < 768;

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        
        {/* Visual Header Workspace Toolbar (Part 9 Clean Toolbar) */}
        <div className="glass-panel" style={{ padding: "0.85rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <button 
              className={`btn-secondary ${editMode ? "active-indigo" : ""}`} 
              onClick={() => {
                setEditMode(!editMode);
                addToast(editMode ? "Switched to Preview Mode" : "Switched to Interactive Edit Mode", "info");
              }}
              style={{ padding: "0.4rem 0.75rem", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.3rem", fontWeight: "700" }}
            >
              {editMode ? "👁️ Preview Mode" : "✏️ Edit Mode"}
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <span style={{ fontSize: "0.72rem", fontWeight: "bold" }}>Zoom:</span>
              <select 
                value={zoomScale} 
                onChange={(e) => setZoomScale(parseFloat(e.target.value))} 
                className="builder-input" 
                style={{ padding: "0.25rem 0.5rem", fontSize: "0.7rem", width: "auto", minHeight: "auto" }}
              >
                <option value="0.8">80%</option>
                <option value="1.0">100%</option>
                <option value="1.2">120%</option>
              </select>
            </div>
          </div>

          {/* Center: Undo/Redo */}
          <div style={{ display: "flex", gap: "0.25rem" }}>
            <button 
              className="btn-secondary" 
              onClick={handleUndo} 
              disabled={pastStates.length === 0} 
              style={{ padding: "0.4rem", fontSize: "0.75rem", minHeight: "auto", minWidth: "36px" }}
              title="Undo change (Ctrl+Z)"
            >
              ↩️
            </button>
            <button 
              className="btn-secondary" 
              onClick={handleRedo} 
              disabled={futureStates.length === 0} 
              style={{ padding: "0.4rem", fontSize: "0.75rem", minHeight: "auto", minWidth: "36px" }}
              title="Redo change (Ctrl+Y)"
            >
              ↪️
            </button>
          </div>

          {/* Right: Export & Save */}
          <div style={{ display: "flex", gap: "0.35rem" }}>
            <button className="btn-primary" onClick={handleSaveResume} disabled={loading} style={{ padding: "0.4rem 0.75rem", fontSize: "0.75rem", minHeight: "auto" }}>
              {loading ? "Saving..." : "Save Snapshot"}
            </button>
            <button className="btn-secondary" onClick={() => handleExportTemplate("pdf")} style={{ padding: "0.4rem 0.75rem", fontSize: "0.75rem", minHeight: "auto" }} title="Export PDF">
              PDF Export
            </button>
            <button className="btn-secondary" onClick={() => handleExportTemplate("docx")} style={{ padding: "0.4rem 0.75rem", fontSize: "0.75rem", minHeight: "auto" }} title="Export Word">
              Word Export
            </button>
          </div>
        </div>

        {/* Visual Mobile Bottom Action Dock (Part 14) */}
        {isMobile && (
          <div className="mobile-action-dock" style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            background: "#ffffff",
            borderTop: "1px solid #cbd5e1",
            boxShadow: "0 -4px 15px rgba(0,0,0,0.06)",
            zIndex: 99999,
            display: "flex",
            justifyContent: "space-around",
            padding: "0.5rem 0"
          }}>
            <button onClick={() => setMobileTab("builder")} style={{ background: "transparent", border: "none", fontSize: "0.72rem", display: "flex", flexDirection: "column", alignItems: "center", color: mobileTab === "builder" ? "var(--color-primary)" : "#64748b" }}>
              <span>✍️</span><span>Builder</span>
            </button>
            <button onClick={() => setMobileTab("templates")} style={{ background: "transparent", border: "none", fontSize: "0.72rem", display: "flex", flexDirection: "column", alignItems: "center", color: mobileTab === "templates" ? "var(--color-primary)" : "#64748b" }}>
              <span>📄</span><span>Templates</span>
            </button>
            <button onClick={() => setMobileTab("preview")} style={{ background: "transparent", border: "none", fontSize: "0.72rem", display: "flex", flexDirection: "column", alignItems: "center", color: mobileTab === "preview" ? "var(--color-primary)" : "#64748b" }}>
              <span>👁️</span><span>Preview</span>
            </button>
          </div>
        )}

        {/* Main Workspace Layout */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          
          {/* Template switcher rendering */}
          {(!isMobile || mobileTab === "templates") && (
            <VisualTemplateGallery 
              selectedTemplate={selectedTemplate}
              setSelectedTemplate={setSelectedTemplate}
              templatesList={templatesList}
              renderThumbnailMockup={renderThumbnailMockup}
              setIsPreviewModalOpen={setIsPreviewModalOpen}
              setIsDummyPreview={setIsDummyPreview}
              setPreviewModalTemplate={setPreviewModalTemplate}
              setZoomScale={setZoomScale}
              addToast={addToast}
            />
          )}

          {/* Desktop Dual/Triple Column Workspace Grid */}
          <div 
            style={{ 
              display: "grid", 
              gridTemplateColumns: isMobile ? "1fr" : "1.1fr 1.2fr 0.8fr", 
              gap: "1.25rem" 
            }} 
            className="ats-dashboard-grid"
          >
            
            {/* Left Column: Form Editor Controls */}
            {(!isMobile || mobileTab === "builder") && (
              <div className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "1rem", height: "fit-content" }}>
                <div style={{ display: "flex", gap: "0.35rem", background: "rgba(15, 23, 42, 0.03)", padding: "0.25rem", borderRadius: "8px" }}>
                  <button className={`tab-btn-mini ${builderTab === "content" ? "active" : ""}`} onClick={() => setBuilderTab("content")} style={{ flex: 1 }}>✍️ Content</button>
                  <button className={`tab-btn-mini ${builderTab === "design" ? "active" : ""}`} onClick={() => setBuilderTab("design")} style={{ flex: 1 }}>🎨 Design</button>
                  <button className={`tab-btn-mini ${builderTab === "ai" ? "active" : ""}`} onClick={() => setBuilderTab("ai")} style={{ flex: 1 }}>🤖 AI Optimize</button>
                  <button className={`tab-btn-mini ${builderTab === "versions" ? "active" : ""}`} onClick={() => setBuilderTab("versions")} style={{ flex: 1 }}>📁 Versions</button>
                </div>

                {builderTab === "content" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem", maxHeight: "600px", overflowY: "auto" }} className="scroll-y-styled">
                    {/* Identity Accordion */}
                    <div style={{ border: "1px solid var(--card-border)", borderRadius: "8px", overflow: "hidden" }}>
                      <div onClick={() => toggleSection("contact")} style={{ background: "#F8FAFC", padding: "0.65rem 0.85rem", display: "flex", justifyContent: "space-between", cursor: "pointer", fontWeight: "700", fontSize: "0.82rem" }}>
                        <span>👤 Personal Identity Details</span>
                        <span>{expandedSections.contact ? "▲" : "▼"}</span>
                      </div>
                      {expandedSections.contact && (
                        <div style={{ padding: "0.85rem", display: "flex", flexDirection: "column", gap: "0.75rem", borderTop: "1px solid var(--card-border)" }}>
                          <div className="auth-field"><label className="auth-label">Full Name</label><input type="text" className="auth-input" value={editedResume.name} onChange={e => updateField("name", e.target.value)} /></div>
                          <div className="auth-field"><label className="auth-label">Email</label><input type="email" className="auth-input" value={editedResume.email} onChange={e => updateField("email", e.target.value)} /></div>
                          <div className="auth-field"><label className="auth-label">Phone</label><input type="text" className="auth-input" value={editedResume.phone} onChange={e => updateField("phone", e.target.value)} /></div>
                        </div>
                      )}
                    </div>

                    {/* Summary Accordion */}
                    <div style={{ border: "1px solid var(--card-border)", borderRadius: "8px", overflow: "hidden" }}>
                      <div onClick={() => toggleSection("summary")} style={{ background: "#F8FAFC", padding: "0.65rem 0.85rem", display: "flex", justifyContent: "space-between", cursor: "pointer", fontWeight: "700", fontSize: "0.82rem" }}>
                        <span>📝 Summary</span>
                        <span>{expandedSections.summary ? "▲" : "▼"}</span>
                      </div>
                      {expandedSections.summary && (
                        <div style={{ padding: "0.85rem", borderTop: "1px solid var(--card-border)" }}>
                          <textarea className="auth-input" style={{ height: "90px" }} value={editedResume.summary || editedResume.professional_summary || ""} onChange={e => { updateField("summary", e.target.value); updateField("professional_summary", e.target.value); }} />
                        </div>
                      )}
                    </div>

                    {/* Skills Accordion */}
                    <div style={{ border: "1px solid var(--card-border)", borderRadius: "8px", overflow: "hidden" }}>
                      <div onClick={() => toggleSection("skills")} style={{ background: "#F8FAFC", padding: "0.65rem 0.85rem", display: "flex", justifyContent: "space-between", cursor: "pointer", fontWeight: "700", fontSize: "0.82rem" }}>
                        <span>🛠️ Skills Toolkit ({editedResume.skills.length})</span>
                        <span>{expandedSections.skills ? "▲" : "▼"}</span>
                      </div>
                      {expandedSections.skills && (
                        <div style={{ padding: "0.85rem", display: "flex", flexDirection: "column", gap: "0.75rem", borderTop: "1px solid var(--card-border)" }}>
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <input type="text" className="auth-input" placeholder="Add Skill..." value={newSkillInput} onChange={e => setNewSkillInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") addSkillTag(); }} />
                            <button className="btn-primary" onClick={addSkillTag}>Add</button>
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                            {editedResume.skills.map((s, idx) => (
                              <span key={idx} className="keyword-chip" style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>{s}
                                <button onClick={() => removeSkillTag(idx)} style={{ background: "transparent", border: "none", color: "var(--color-danger)", cursor: "pointer" }}>&times;</button>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Experience Accordion */}
                    <div style={{ border: "1px solid var(--card-border)", borderRadius: "8px", overflow: "hidden" }}>
                      <div onClick={() => toggleSection("experience")} style={{ background: "#F8FAFC", padding: "0.65rem 0.85rem", display: "flex", justifyContent: "space-between", cursor: "pointer", fontWeight: "700", fontSize: "0.82rem" }}>
                        <span>💼 Experience History ({editedResume.experience.length})</span>
                        <span>{expandedSections.experience ? "▲" : "▼"}</span>
                      </div>
                      {expandedSections.experience && (
                        <div style={{ padding: "0.85rem", display: "flex", flexDirection: "column", gap: "0.85rem", borderTop: "1px solid var(--card-border)" }}>
                          {editedResume.experience.map((exp, idx) => (
                            <div key={idx} style={{ padding: "0.65rem", border: "1px solid var(--card-border)", borderRadius: "6px", background: "#FAFBFD" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                                <div style={{ display: "flex", gap: "0.25rem" }}>
                                  <button className="btn-secondary" style={{ padding: "0.15rem 0.35rem", fontSize: "0.7rem", minHeight: "auto" }} disabled={idx === 0} onClick={() => handleSwapItems("experience", idx, -1)}>↑</button>
                                  <button className="btn-secondary" style={{ padding: "0.15rem 0.35rem", fontSize: "0.7rem", minHeight: "auto" }} disabled={idx === editedResume.experience.length - 1} onClick={() => handleSwapItems("experience", idx, 1)}>↓</button>
                                </div>
                                <button onClick={() => removeListItem("experience", idx)} style={{ background: "transparent", border: "none", color: "var(--color-danger)", cursor: "pointer", fontSize: "0.75rem" }}>Delete</button>
                              </div>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.35rem" }}>
                                <input type="text" className="auth-input" placeholder="Role" value={exp.role || ""} onChange={e => updateListField("experience", idx, "role", e.target.value)} />
                                <input type="text" className="auth-input" placeholder="Company" value={exp.company || ""} onChange={e => updateListField("experience", idx, "company", e.target.value)} />
                                <input type="text" className="auth-input" placeholder="Start" value={exp.start_date || ""} onChange={e => updateListField("experience", idx, "start_date", e.target.value)} />
                                <input type="text" className="auth-input" placeholder="End" value={exp.end_date || ""} onChange={e => updateListField("experience", idx, "end_date", e.target.value)} />
                                <textarea className="auth-input" placeholder="Bullet points" style={{ gridColumn: "span 2", height: "60px" }} value={exp.description || ""} onChange={e => updateListField("experience", idx, "description", e.target.value)} />
                              </div>
                            </div>
                          ))}
                          <button className="btn-secondary" onClick={() => addListItem("experience", { role: "New Role", company: "Company", start_date: "2024", end_date: "Present", description: "• Focus achievement details" })}>+ Add Position</button>
                        </div>
                      )}
                    </div>

                    {/* Education Accordion */}
                    <div style={{ border: "1px solid var(--card-border)", borderRadius: "8px", overflow: "hidden" }}>
                      <div onClick={() => toggleSection("education")} style={{ background: "#F8FAFC", padding: "0.65rem 0.85rem", display: "flex", justifyContent: "space-between", cursor: "pointer", fontWeight: "700", fontSize: "0.82rem" }}>
                        <span>🎓 Education ({editedResume.education.length})</span>
                        <span>{expandedSections.education ? "▲" : "▼"}</span>
                      </div>
                      {expandedSections.education && (
                        <div style={{ padding: "0.85rem", display: "flex", flexDirection: "column", gap: "0.5rem", borderTop: "1px solid var(--card-border)" }}>
                          {editedResume.education.map((edu, idx) => (
                            <div key={idx} style={{ padding: "0.5rem", border: "1px solid var(--card-border)", borderRadius: "6px" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                                <span style={{ fontSize: "0.75rem", fontWeight: "bold" }}>Degree #{idx+1}</span>
                                <button onClick={() => removeListItem("education", idx)} style={{ background: "transparent", border: "none", color: "var(--color-danger)", cursor: "pointer", fontSize: "0.72rem" }}>Delete</button>
                              </div>
                              <input type="text" className="auth-input" placeholder="Degree" value={edu.degree || ""} onChange={e => updateListField("education", idx, "degree", e.target.value)} style={{ marginBottom: "0.25rem" }} />
                              <input type="text" className="auth-input" placeholder="School" value={edu.school || ""} onChange={e => updateListField("education", idx, "school", e.target.value)} />
                            </div>
                          ))}
                          <button className="btn-secondary" onClick={() => addListItem("education", { degree: "Bachelor of Science", school: "University", field_of_study: "Major", end_date: "2026" })}>+ Add Education</button>
                        </div>
                      )}
                    </div>

                    {/* Projects Accordion */}
                    <div style={{ border: "1px solid var(--card-border)", borderRadius: "8px", overflow: "hidden" }}>
                      <div onClick={() => toggleSection("projects")} style={{ background: "#F8FAFC", padding: "0.65rem 0.85rem", display: "flex", justifyContent: "space-between", cursor: "pointer", fontWeight: "700", fontSize: "0.82rem" }}>
                        <span>📂 Projects ({editedResume.projects?.length || 0})</span>
                        <span>{expandedSections.projects ? "▲" : "▼"}</span>
                      </div>
                      {expandedSections.projects && (
                        <div style={{ padding: "0.85rem", display: "flex", flexDirection: "column", gap: "0.5rem", borderTop: "1px solid var(--card-border)" }}>
                          {(editedResume.projects || []).map((proj, idx) => (
                            <div key={idx} style={{ padding: "0.5rem", border: "1px solid var(--card-border)", borderRadius: "6px" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                                <span style={{ fontSize: "0.75rem", fontWeight: "bold" }}>Project #{idx+1}</span>
                                <button onClick={() => removeListItem("projects", idx)} style={{ background: "transparent", border: "none", color: "var(--color-danger)", cursor: "pointer", fontSize: "0.72rem" }}>Delete</button>
                              </div>
                              <input type="text" className="auth-input" placeholder="Project Title" value={proj.title || ""} onChange={e => updateListField("projects", idx, "title", e.target.value)} style={{ marginBottom: "0.25rem" }} />
                              <input type="text" className="auth-input" placeholder="Technologies (comma separated)" value={Array.isArray(proj.technologies) ? proj.technologies.join(", ") : (proj.technologies || "")} onChange={e => updateProjectTech(idx, e.target.value)} style={{ marginBottom: "0.25rem" }} />
                              <textarea className="auth-input" placeholder="Description" value={proj.description || ""} onChange={e => updateListField("projects", idx, "description", e.target.value)} style={{ height: "60px" }} />
                            </div>
                          ))}
                          <button className="btn-secondary" onClick={() => addListItem("projects", { title: "New Project", description: "Project description", technologies: ["React"] })}>+ Add Project</button>
                        </div>
                      )}
                    </div>

                    {/* Certifications Accordion */}
                    <div style={{ border: "1px solid var(--card-border)", borderRadius: "8px", overflow: "hidden" }}>
                      <div onClick={() => toggleSection("certifications")} style={{ background: "#F8FAFC", padding: "0.65rem 0.85rem", display: "flex", justifyContent: "space-between", cursor: "pointer", fontWeight: "700", fontSize: "0.82rem" }}>
                        <span>🏆 Certifications ({editedResume.certifications?.length || 0})</span>
                        <span>{expandedSections.certifications ? "▲" : "▼"}</span>
                      </div>
                      {expandedSections.certifications && (
                        <div style={{ padding: "0.85rem", display: "flex", flexDirection: "column", gap: "0.5rem", borderTop: "1px solid var(--card-border)" }}>
                          {(editedResume.certifications || []).map((cert, idx) => (
                            <div key={idx} style={{ padding: "0.5rem", border: "1px solid var(--card-border)", borderRadius: "6px" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                                <span style={{ fontSize: "0.75rem", fontWeight: "bold" }}>Cert #{idx+1}</span>
                                <button onClick={() => removeListItem("certifications", idx)} style={{ background: "transparent", border: "none", color: "var(--color-danger)", cursor: "pointer", fontSize: "0.72rem" }}>Delete</button>
                              </div>
                              <input type="text" className="auth-input" placeholder="Certification Name" value={cert.name || ""} onChange={e => updateListField("certifications", idx, "name", e.target.value)} style={{ marginBottom: "0.25rem" }} />
                              <input type="text" className="auth-input" placeholder="Issuer" value={cert.issuer || ""} onChange={e => updateListField("certifications", idx, "issuer", e.target.value)} style={{ marginBottom: "0.25rem" }} />
                              <input type="text" className="auth-input" placeholder="Date" value={cert.date || ""} onChange={e => updateListField("certifications", idx, "date", e.target.value)} />
                            </div>
                          ))}
                          <button className="btn-secondary" onClick={() => addListItem("certifications", { name: "New Certification", issuer: "Authority", date: "2026" })}>+ Add Certification</button>
                        </div>
                      )}
                    </div>

                    {/* Languages Accordion */}
                    <div style={{ border: "1px solid var(--card-border)", borderRadius: "8px", overflow: "hidden" }}>
                      <div onClick={() => toggleSection("languages")} style={{ background: "#F8FAFC", padding: "0.65rem 0.85rem", display: "flex", justifyContent: "space-between", cursor: "pointer", fontWeight: "700", fontSize: "0.82rem" }}>
                        <span>🌐 Languages ({editedResume.languages?.length || 0})</span>
                        <span>{expandedSections.languages ? "▲" : "▼"}</span>
                      </div>
                      {expandedSections.languages && (
                        <div style={{ padding: "0.85rem", display: "flex", flexDirection: "column", gap: "0.5rem", borderTop: "1px solid var(--card-border)" }}>
                          {(editedResume.languages || []).map((lang, idx) => (
                            <div key={idx} style={{ padding: "0.5rem", border: "1px solid var(--card-border)", borderRadius: "6px" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                                <span style={{ fontSize: "0.75rem", fontWeight: "bold" }}>Language #{idx+1}</span>
                                <button onClick={() => removeListItem("languages", idx)} style={{ background: "transparent", border: "none", color: "var(--color-danger)", cursor: "pointer", fontSize: "0.72rem" }}>Delete</button>
                              </div>
                              <input type="text" className="auth-input" placeholder="Language" value={lang.language || ""} onChange={e => updateListField("languages", idx, "language", e.target.value)} style={{ marginBottom: "0.25rem" }} />
                              <input type="text" className="auth-input" placeholder="Proficiency (e.g. Fluent)" value={lang.proficiency || ""} onChange={e => updateListField("languages", idx, "proficiency", e.target.value)} />
                            </div>
                          ))}
                          <button className="btn-secondary" onClick={() => addListItem("languages", { language: "New Language", proficiency: "Fluent" })}>+ Add Language</button>
                        </div>
                      )}
                    </div>

                    {/* Achievements Accordion */}
                    <div style={{ border: "1px solid var(--card-border)", borderRadius: "8px", overflow: "hidden" }}>
                      <div onClick={() => toggleSection("achievements")} style={{ background: "#F8FAFC", padding: "0.65rem 0.85rem", display: "flex", justifyContent: "space-between", cursor: "pointer", fontWeight: "700", fontSize: "0.82rem" }}>
                        <span>🏆 Achievements ({editedResume.achievements?.length || 0})</span>
                        <span>{expandedSections.achievements ? "▲" : "▼"}</span>
                      </div>
                      {expandedSections.achievements && (
                        <div style={{ padding: "0.85rem", display: "flex", flexDirection: "column", gap: "0.5rem", borderTop: "1px solid var(--card-border)" }}>
                          {(editedResume.achievements || []).map((ach, idx) => (
                            <div key={idx} style={{ display: "flex", gap: "0.35rem", alignItems: "center" }}>
                              <input type="text" className="auth-input" value={ach || ""} onChange={e => updateStringListItem("achievements", idx, e.target.value)} />
                              <button onClick={() => removeListItem("achievements", idx)} style={{ background: "transparent", border: "none", color: "var(--color-danger)", cursor: "pointer", fontSize: "1.2rem" }}>&times;</button>
                            </div>
                          ))}
                          <button className="btn-secondary" onClick={() => addListItem("achievements", "New achievement detail")}>+ Add Achievement</button>
                        </div>
                      )}
                    </div>

                    {/* Leadership Accordion */}
                    <div style={{ border: "1px solid var(--card-border)", borderRadius: "8px", overflow: "hidden" }}>
                      <div onClick={() => toggleSection("leadership")} style={{ background: "#F8FAFC", padding: "0.65rem 0.85rem", display: "flex", justifyContent: "space-between", cursor: "pointer", fontWeight: "700", fontSize: "0.82rem" }}>
                        <span>👥 Leadership ({editedResume.leadership?.length || 0})</span>
                        <span>{expandedSections.leadership ? "▲" : "▼"}</span>
                      </div>
                      {expandedSections.leadership && (
                        <div style={{ padding: "0.85rem", display: "flex", flexDirection: "column", gap: "0.5rem", borderTop: "1px solid var(--card-border)" }}>
                          {(editedResume.leadership || []).map((lead, idx) => (
                            <div key={idx} style={{ display: "flex", gap: "0.35rem", alignItems: "center" }}>
                              <input type="text" className="auth-input" value={lead || ""} onChange={e => updateStringListItem("leadership", idx, e.target.value)} />
                              <button onClick={() => removeListItem("leadership", idx)} style={{ background: "transparent", border: "none", color: "var(--color-danger)", cursor: "pointer", fontSize: "1.2rem" }}>&times;</button>
                            </div>
                          ))}
                          <button className="btn-secondary" onClick={() => addListItem("leadership", "New leadership experience")}>+ Add Leadership</button>
                        </div>
                      )}
                    </div>

                    {/* Interests Accordion */}
                    <div style={{ border: "1px solid var(--card-border)", borderRadius: "8px", overflow: "hidden" }}>
                      <div onClick={() => toggleSection("interests")} style={{ background: "#F8FAFC", padding: "0.65rem 0.85rem", display: "flex", justifyContent: "space-between", cursor: "pointer", fontWeight: "700", fontSize: "0.82rem" }}>
                        <span>🎨 Interests ({editedResume.interests?.length || 0})</span>
                        <span>{expandedSections.interests ? "▲" : "▼"}</span>
                      </div>
                      {expandedSections.interests && (
                        <div style={{ padding: "0.85rem", display: "flex", flexDirection: "column", gap: "0.5rem", borderTop: "1px solid var(--card-border)" }}>
                          {(editedResume.interests || []).map((interest, idx) => (
                            <div key={idx} style={{ display: "flex", gap: "0.35rem", alignItems: "center" }}>
                              <input type="text" className="auth-input" value={interest || ""} onChange={e => updateStringListItem("interests", idx, e.target.value)} />
                              <button onClick={() => removeListItem("interests", idx)} style={{ background: "transparent", border: "none", color: "var(--color-danger)", cursor: "pointer", fontSize: "1.2rem" }}>&times;</button>
                            </div>
                          ))}
                          <button className="btn-secondary" onClick={() => addListItem("interests", "New Interest")}>+ Add Interest</button>
                        </div>
                      )}
                    </div>

                    {/* Referees Accordion */}
                    <div style={{ border: "1px solid var(--card-border)", borderRadius: "8px", overflow: "hidden" }}>
                      <div onClick={() => toggleSection("referees")} style={{ background: "#F8FAFC", padding: "0.65rem 0.85rem", display: "flex", justifyContent: "space-between", cursor: "pointer", fontWeight: "700", fontSize: "0.82rem" }}>
                        <span>📋 References ({editedResume.referees?.length || 0})</span>
                        <span>{expandedSections.referees ? "▲" : "▼"}</span>
                      </div>
                      {expandedSections.referees && (
                        <div style={{ padding: "0.85rem", display: "flex", flexDirection: "column", gap: "0.5rem", borderTop: "1px solid var(--card-border)" }}>
                          {(editedResume.referees || []).map((ref, idx) => (
                            <div key={idx} style={{ padding: "0.5rem", border: "1px solid var(--card-border)", borderRadius: "6px" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                                <span style={{ fontSize: "0.75rem", fontWeight: "bold" }}>Reference #{idx+1}</span>
                                <button onClick={() => removeListItem("referees", idx)} style={{ background: "transparent", border: "none", color: "var(--color-danger)", cursor: "pointer", fontSize: "0.72rem" }}>Delete</button>
                              </div>
                              <textarea className="auth-input" placeholder="Reference Details" value={ref || ""} onChange={e => updateStringListItem("referees", idx, e.target.value)} style={{ height: "60px" }} />
                            </div>
                          ))}
                          <button className="btn-secondary" onClick={() => addListItem("referees", "John Doe, Manager at TechCorp (john@example.com)")}>+ Add Reference</button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {builderTab === "design" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div className="auth-field">
                      <label className="auth-label">🔤 Base Font style</label>
                      <select className="auth-input" value={editedResume.customization.fontFamily || "DejaVuSans"} onChange={e => updateCustomizationField("fontFamily", e.target.value)}>
                        <option value="DejaVuSans">Sans-Serif (DejaVu Sans / Inter)</option>
                        <option value="DejaVuSerif">Serif (DejaVu Serif / Outfit)</option>
                        <option value="Courier">Monospace (Courier New)</option>
                      </select>
                    </div>
                    {/* Expandable Advanced Design Settings (Part 5 Panel) */}
                    <AdvancedDesignPanel 
                      customization={editedResume.customization || {}}
                      updateCustomizationField={updateCustomizationField}
                      selectedTemplate={selectedTemplate}
                    />
                  </div>
                )}

                {builderTab === "ai" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxHeight: "600px", overflowY: "auto" }} className="scroll-y-styled">
                    <div style={{ border: "1px solid var(--card-border)", borderRadius: "8px", padding: "0.75rem", background: "rgba(79, 70, 229, 0.02)" }}>
                      <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "0.85rem", fontWeight: "700" }}>🤖 AI Copilot suggestions</h4>
                      <textarea className="auth-input" placeholder="Paste target Job Description details..." value={aiImproveJd} onChange={e => setAiImproveJd(e.target.value)} style={{ height: "80px", marginBottom: "0.5rem" }} />
                      <button className="btn-primary" onClick={handleImproveResumeAI} disabled={aiImproveLoading} style={{ width: "100%" }}>
                        {aiImproveLoading ? "Rewriting with AI..." : "Polish Resume text"}
                      </button>
                    </div>

                    {/* AI Suggestions check lists (Part 11 flow) */}
                    {aiImproveResults && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        <div style={{ padding: "0.5rem", borderRadius: "8px", background: "#f0fdf4", border: "1px solid #bbf7d0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "0.72rem", color: "#166534", fontWeight: "700" }}>Estimated post-AI score: {aiImproveResults.estimated_score}% (was {aiImproveResults.current_score}%)</span>
                          <button onClick={() => setAiImproveResults(null)} style={{ background: "transparent", border: "none", color: "#166534", cursor: "pointer", fontWeight: "700" }}>✕ Dismiss</button>
                        </div>

                        {/* Summary Comparison */}
                        {aiImproveResults.improvements?.improved_summary && (
                          <div className="ai-compare-card">
                            <div className="ai-compare-title">
                              <span>📝 Professional Summary Draft</span>
                            </div>
                            <div className="ai-compare-split">
                              <div className="ai-compare-original">
                                <strong>Original:</strong><br/>
                                {editedResume.summary || "N/A"}
                              </div>
                              <div className="ai-compare-improved">
                                <strong>Polished Suggestion:</strong><br/>
                                {aiImproveResults.improvements.improved_summary}
                              </div>
                            </div>
                            <div style={{ display: "flex", gap: "0.35rem", justifyContent: "flex-end", marginTop: "0.5rem" }}>
                              <button className="btn-secondary" style={{ padding: "0.25rem 0.5rem", fontSize: "0.68rem", minHeight: "auto" }} onClick={() => {
                                setAiImproveResults(prev => ({
                                  ...prev,
                                  improvements: { ...prev.improvements, improved_summary: null }
                                }));
                              }}>Reject</button>
                              <button className="btn-primary" style={{ padding: "0.25rem 0.5rem", fontSize: "0.68rem", minHeight: "auto" }} onClick={() => handleAcceptSummary(aiImproveResults.improvements.improved_summary)}>Accept Summary ✓</button>
                            </div>
                          </div>
                        )}

                        {/* Experience Comparison */}
                        {aiImproveResults.improvements?.improved_experience && aiImproveResults.improvements.improved_experience.length > 0 && (
                          <div className="ai-compare-card">
                            <div className="ai-compare-title">
                              <span>💼 Experience Bullet Points</span>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                              {aiImproveResults.improvements.improved_experience.map((impExp, idx) => {
                                // Find actual item index in original experience list
                                const originalIdx = editedResume.experience.findIndex(e => e.role === impExp.role && e.company === impExp.company);
                                if (originalIdx === -1) return null;
                                return (
                                  <div key={idx} style={{ borderBottom: "1px dashed var(--card-border)", paddingBottom: "0.5rem" }}>
                                    <div style={{ fontSize: "0.72rem", fontWeight: "700", marginBottom: "0.25rem", color: "var(--color-primary)" }}>{impExp.role} at {impExp.company}</div>
                                    <div className="ai-compare-split">
                                      <div className="ai-compare-original">
                                        {impExp.original || editedResume.experience[originalIdx].description}
                                      </div>
                                      <div className="ai-compare-improved">
                                        {impExp.improved}
                                      </div>
                                    </div>
                                    <div style={{ display: "flex", gap: "0.35rem", justifyContent: "flex-end", marginTop: "0.35rem" }}>
                                      <button className="btn-secondary" style={{ padding: "0.15rem 0.35rem", fontSize: "0.65rem", minHeight: "auto" }} onClick={() => {
                                        const remaining = aiImproveResults.improvements.improved_experience.filter((_, i) => i !== idx);
                                        setAiImproveResults(prev => ({
                                          ...prev,
                                          improvements: { ...prev.improvements, improved_experience: remaining }
                                        }));
                                      }}>Reject</button>
                                      <button className="btn-primary" style={{ padding: "0.15rem 0.35rem", fontSize: "0.65rem", minHeight: "auto" }} onClick={() => handleAcceptExperience(originalIdx, impExp.improved)}>Apply Bullets ✓</button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Projects Comparison */}
                        {aiImproveResults.improvements?.improved_projects && aiImproveResults.improvements.improved_projects.length > 0 && (
                          <div className="ai-compare-card">
                            <div className="ai-compare-title">
                              <span>📂 Project Descriptions</span>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                              {aiImproveResults.improvements.improved_projects.map((impProj, idx) => {
                                const originalIdx = editedResume.projects.findIndex(p => p.title === impProj.title);
                                if (originalIdx === -1) return null;
                                return (
                                  <div key={idx} style={{ borderBottom: "1px dashed var(--card-border)", paddingBottom: "0.5rem" }}>
                                    <div style={{ fontSize: "0.72rem", fontWeight: "700", marginBottom: "0.25rem", color: "var(--color-primary)" }}>{impProj.title}</div>
                                    <div className="ai-compare-split">
                                      <div className="ai-compare-original">
                                        {impProj.original || editedResume.projects[originalIdx].description}
                                      </div>
                                      <div className="ai-compare-improved">
                                        {impProj.improved}
                                      </div>
                                    </div>
                                    <div style={{ display: "flex", gap: "0.35rem", justifyContent: "flex-end", marginTop: "0.35rem" }}>
                                      <button className="btn-secondary" style={{ padding: "0.15rem 0.35rem", fontSize: "0.65rem", minHeight: "auto" }} onClick={() => {
                                        const remaining = aiImproveResults.improvements.improved_projects.filter((_, i) => i !== idx);
                                        setAiImproveResults(prev => ({
                                          ...prev,
                                          improvements: { ...prev.improvements, improved_projects: remaining }
                                        }));
                                      }}>Reject</button>
                                      <button className="btn-primary" style={{ padding: "0.15rem 0.35rem", fontSize: "0.65rem", minHeight: "auto" }} onClick={() => handleAcceptProject(originalIdx, impProj.improved)}>Apply Draft ✓</button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Suggested Keywords / Skills */}
                        {aiImproveResults.improvements?.keyword_suggestions && aiImproveResults.improvements.keyword_suggestions.length > 0 && (
                          <div className="ai-compare-card">
                            <div className="ai-compare-title" style={{ marginBottom: "0.35rem" }}>
                              <span>💡 Recommended Keywords ({aiImproveResults.improvements.keyword_suggestions.length})</span>
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
                              {aiImproveResults.improvements.keyword_suggestions.map((kw, i) => (
                                <span 
                                  key={i} 
                                  onClick={() => {
                                    handleAddSuggestedSkill(kw);
                                    const remaining = aiImproveResults.improvements.keyword_suggestions.filter((_, idx) => idx !== i);
                                    setAiImproveResults(prev => ({
                                      ...prev,
                                      improvements: { ...prev.improvements, keyword_suggestions: remaining }
                                    }));
                                  }}
                                  className="keyword-chip" 
                                  style={{ cursor: "pointer", fontSize: "0.68rem", padding: "0.15rem 0.35rem", background: "rgba(79, 70, 229, 0.04)", border: "1px dashed rgba(79, 70, 229, 0.3)", color: "var(--color-primary)", borderRadius: "4px" }}
                                  title="Click to add skill instantly"
                                >
                                  + {kw}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {builderTab === "versions" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div style={{ border: "1px solid var(--card-border)", borderRadius: "8px", padding: "0.75rem", background: "#f8fafc" }}>
                      <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "0.82rem" }}>📁 Save Snapshot</h4>
                      <div style={{ display: "flex", gap: "0.35rem" }}>
                        <input type="text" className="auth-input" placeholder="Snapshot label..." value={newVersionName} onChange={e => setNewVersionName(e.target.value)} style={{ fontSize: "0.8rem", height: "34px", minHeight: "auto" }} />
                        <button className="btn-primary" onClick={handleSaveVersion} disabled={versionsLoading} style={{ padding: "0.45rem 0.85rem", fontSize: "0.75rem", whiteSpace: "nowrap", minHeight: "auto" }}>Save</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Center Column: Live preview document canvas */}
            {(!isMobile || mobileTab === "preview") && (
              <div 
                style={{ 
                  border: "1px solid var(--card-border)", 
                  borderRadius: "12px", 
                  background: "#ffffff", 
                  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)",
                  overflowX: "auto",
                  padding: "0.5rem"
                }} 
                className="live-canvas-preview-wrapper"
              >
                <div style={{ transform: `scale(${zoomScale})`, transformOrigin: "top left", width: `${100 / zoomScale}%` }}>
                  {renderLivePreview(selectedTemplate)}
                </div>
              </div>
            )}

            {/* Right Column: ATS suggestions sidebar panel */}
            {!isMobile && (
              <AtsSuggestionsPanel 
                atsAnalysis={selectedResume ? selectedResume.ats_analysis : null}
                editedResume={editedResume}
                setEditedResume={setEditedResume}
                addToast={addToast}
              />
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
      resume: { label: "Resume-Based", key: "resume_questions", icon: "👔" },
      jd: { label: "Job Description-Based", key: "jd_questions", icon: "🎯" },
      tech: { label: "Technical", key: "technical_questions", icon: "💻" },
      hr: { label: "HR", key: "hr_questions", icon: "👤" },
      behavioral: { label: "Behavioral", key: "behavioral_questions", icon: "✨" },
      scenario: { label: "Scenario-Based", key: "scenario_questions", icon: "🎭" },
      projects: { label: "Project-Based", key: "project_questions", icon: "📂" },
      problem_solving: { label: "Problem Solving", key: "problem_solving_questions", icon: "🧩" }
    };

    const currentCategoryInfo = categories[activePrepCategory];
    const allQuestions = (interviewPrep && interviewPrep[currentCategoryInfo.key]) || [];
    const filteredQuestions = allQuestions.filter(q => {
      if (prepDifficultyFilter === "all") return true;
      return q.difficulty.toLowerCase() === prepDifficultyFilter.toLowerCase();
    });

    const activeQuestion = filteredQuestions[currentQuestionIndex];

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        
        {/* JD & Target Role Configuration Panel */}
        <div className="glass-panel">
          <h3 className="panel-title" style={{ marginBottom: "0.5rem" }}>
            <span className="panel-title-text">🎯 Target Setup for Preparation</span>
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "1rem" }}>
            Define your target Job Role and paste the Job Description (JD) below to customize mock interview questions and readiness scores.
          </p>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <label style={{ fontSize: "0.82rem", fontWeight: "700", color: "var(--color-text-main)" }}>Target Job Role</label>
              <input 
                type="text" 
                className="auth-input" 
                placeholder="e.g. Senior Software Engineer"
                style={{ width: "100%", boxSizing: "border-box" }}
                value={recruiterJobRole}
                onChange={(e) => setRecruiterJobRole(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <label style={{ fontSize: "0.82rem", fontWeight: "700", color: "var(--color-text-main)" }}>Job Description (Optional)</label>
              <textarea 
                className="auth-input" 
                placeholder="Paste target job description here..."
                style={{ height: "100px", resize: "none", width: "100%", boxSizing: "border-box" }}
                value={recruiterJdText}
                onChange={(e) => setRecruiterJdText(e.target.value)}
              />
            </div>
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
                    <span>Generating Interview Prep...</span>
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    <Icons.Cpu />
                    <span>{interviewPrep ? "Re-Generate Questions" : "Generate Questions"}</span>
                  </React.Fragment>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Generated Prep Dashboard */}
        {interviewPrep ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            
            {/* Scores & Export Actions */}
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

              <div style={{ borderTop: "1px solid var(--card-border)", paddingTop: "1rem", display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center" }}>
                <button 
                  className="btn-secondary" 
                  onClick={() => downloadInterviewPDF(selectedResume.id, "questions")}
                  style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", padding: "0.6rem 1rem" }}
                >
                  <Icons.Download />
                  <span>Download Questions Sheet (PDF)</span>
                </button>

                <button 
                  className="btn-primary"
                  onClick={() => {
                    setPracticeMode(!practiceMode);
                    setCurrentQuestionIndex(0);
                  }}
                  style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", padding: "0.6rem 1.25rem", background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)", border: "none" }}
                >
                  <Icons.Target />
                  <span>{practiceMode ? "Exit Practice Mode" : "Start Practice Mode"}</span>
                </button>
              </div>
            </div>

            {/* Questions Explorer */}
            {!practiceMode ? (
              <div className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", borderBottom: "1px solid var(--card-border)", paddingBottom: "0.75rem" }}>
                  <h3 className="panel-title" style={{ margin: 0 }}>
                    <span className="panel-title-text">📚 Practice Question Sheets</span>
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
                  {Object.entries(categories).map(([key, info]) => {
                    const count = (interviewPrep && interviewPrep[info.key] && interviewPrep[info.key].length) || 0;
                    return (
                      <button 
                        key={key}
                        className={`tab-btn ${activePrepCategory === key ? "active" : ""}`}
                        onClick={() => {
                          setActivePrepCategory(key);
                        }}
                        style={{ fontSize: "0.8rem", padding: "0.5rem 0.95rem" }}
                      >
                        <span>{info.icon} {info.label} ({count})</span>
                      </button>
                    );
                  })}
                </div>

                {/* Questions List */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {filteredQuestions.length > 0 ? filteredQuestions.map((q, idx) => {
                    const difficultyColor = q.difficulty.toLowerCase() === "easy" ? "#10b981" : q.difficulty.toLowerCase() === "medium" ? "#f59e0b" : "#ef4444";
                    
                    return (
                      <div 
                        key={idx}
                        className="question-card-item"
                        style={{ 
                          border: "1px solid var(--card-border)", 
                          borderRadius: "10px", 
                          background: "#ffffff",
                          padding: "1rem 1.25rem",
                          display: "flex", 
                          justifyContent: "space-between", 
                          alignItems: "center",
                          gap: "1.5rem"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", flex: 1 }}>
                          <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--color-primary)", marginTop: "0.15rem" }}>#{idx + 1}</span>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                              <span 
                                style={{ 
                                  fontSize: "0.65rem", 
                                  fontWeight: "800", 
                                  padding: "0.15rem 0.45rem", 
                                  borderRadius: "4px", 
                                  background: `${difficultyColor}15`, 
                                  color: difficultyColor,
                                  border: `1px solid ${difficultyColor}25`,
                                  textTransform: "uppercase"
                                }}
                              >
                                {q.difficulty}
                              </span>
                              <span 
                                style={{ 
                                  fontSize: "0.65rem", 
                                  fontWeight: "800", 
                                  padding: "0.15rem 0.45rem", 
                                  borderRadius: "4px", 
                                  background: "#f1f5f9", 
                                  color: "#475569",
                                  border: "1px solid #cbd5e1"
                                }}
                              >
                                {currentCategoryInfo.label}
                              </span>
                            </div>
                            <span style={{ fontSize: "0.88rem", fontWeight: "600", color: "var(--color-text-main)", lineHeight: "1.4" }}>
                              {q.question}
                            </span>
                          </div>
                        </div>

                        {/* Interactive Status Badges/Buttons */}
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                          {/* Completed Button */}
                          <button 
                            onClick={() => toggleQuestionStatus(selectedResume.id, currentCategoryInfo.key, idx, "completed")}
                            title={q.completed ? "Mark as Incomplete" : "Mark as Completed"}
                            style={{
                              border: "1px solid var(--card-border)",
                              borderRadius: "6px",
                              padding: "0.4rem",
                              cursor: "pointer",
                              background: q.completed ? "#10b981" : "#ffffff",
                              color: q.completed ? "#ffffff" : "#64748b",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transition: "all 0.2s ease"
                            }}
                          >
                            <Icons.Check />
                          </button>

                          {/* Favorite Button */}
                          <button 
                            onClick={() => toggleQuestionStatus(selectedResume.id, currentCategoryInfo.key, idx, "favorite")}
                            title={q.favorite ? "Unfavorite" : "Favorite"}
                            style={{
                              border: "1px solid var(--card-border)",
                              borderRadius: "6px",
                              padding: "0.4rem",
                              cursor: "pointer",
                              background: q.favorite ? "#fbbf24" : "#ffffff",
                              color: q.favorite ? "#ffffff" : "#64748b",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transition: "all 0.2s ease"
                            }}
                          >
                            <Icons.Star fill={q.favorite ? "#ffffff" : "none"} />
                          </button>

                          {/* Needs Practice Button */}
                          <button 
                            onClick={() => toggleQuestionStatus(selectedResume.id, currentCategoryInfo.key, idx, "needs_practice")}
                            title={q.needs_practice ? "Needs Practice (Active)" : "Mark as Needs Practice"}
                            style={{
                              border: "1px solid var(--card-border)",
                              borderRadius: "6px",
                              padding: "0.4rem",
                              cursor: "pointer",
                              background: q.needs_practice ? "#ef4444" : "#ffffff",
                              color: q.needs_practice ? "#ffffff" : "#64748b",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transition: "all 0.2s ease"
                            }}
                          >
                            <Icons.AlertTriangle />
                          </button>
                        </div>
                      </div>
                    );
                  }) : (
                    <div style={{ textAlign: "center", color: "var(--color-text-muted)", padding: "2rem" }}>
                      No {prepDifficultyFilter !== "all" ? prepDifficultyFilter : ""} questions found in this category.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Practice Mode Interface */
              <div className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "1.25rem", minHeight: "280px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--card-border)", paddingBottom: "0.75rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontSize: "1.2rem" }}>⚡</span>
                    <h3 className="panel-title" style={{ margin: 0 }}>
                      <span className="panel-title-text">{currentCategoryInfo.label} Practice Session</span>
                    </h3>
                  </div>
                  <button 
                    className="btn-secondary"
                    onClick={() => setPracticeMode(false)}
                    style={{ fontSize: "0.75rem", padding: "0.3rem 0.75rem" }}
                  >
                    Exit Practice
                  </button>
                </div>

                {filteredQuestions.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", flex: 1, justifyContent: "center" }}>
                    
                    {/* Progress Bar */}
                    <div style={{ width: "100%" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontWeight: "700", color: "var(--color-text-muted)", marginBottom: "0.3rem" }}>
                        <span>Progress</span>
                        <span>{currentQuestionIndex + 1} of {filteredQuestions.length} ({Math.round(((currentQuestionIndex + 1) / filteredQuestions.length) * 100)}%)</span>
                      </div>
                      <div style={{ height: "6px", background: "#f1f5f9", borderRadius: "10px", overflow: "hidden", border: "1px solid var(--card-border)" }}>
                        <div style={{ height: "100%", width: `${((currentQuestionIndex + 1) / filteredQuestions.length) * 100}%`, background: "var(--color-primary)", transition: "width 0.3s ease" }}></div>
                      </div>
                    </div>

                    {/* Question Card */}
                    <div style={{ background: "#F8FAFC", borderRadius: "12px", border: "1px solid var(--card-border)", padding: "2rem", display: "flex", flexDirection: "column", gap: "1.25rem", minHeight: "150px", justifyContent: "space-between" }}>
                      
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                          <span 
                            style={{ 
                              fontSize: "0.7rem", 
                              fontWeight: "800", 
                              padding: "0.2rem 0.6rem", 
                              borderRadius: "4px", 
                              background: `${activeQuestion.difficulty.toLowerCase() === "easy" ? "#10b981" : activeQuestion.difficulty.toLowerCase() === "medium" ? "#f59e0b" : "#ef4444"}15`, 
                              color: activeQuestion.difficulty.toLowerCase() === "easy" ? "#10b981" : activeQuestion.difficulty.toLowerCase() === "medium" ? "#f59e0b" : "#ef4444",
                              border: `1px solid ${activeQuestion.difficulty.toLowerCase() === "easy" ? "#10b981" : activeQuestion.difficulty.toLowerCase() === "medium" ? "#f59e0b" : "#ef4444"}25`,
                              textTransform: "uppercase"
                            }}
                          >
                            {activeQuestion.difficulty}
                          </span>
                          <span 
                            style={{ 
                              fontSize: "0.7rem", 
                              fontWeight: "800", 
                              padding: "0.2rem 0.6rem", 
                              borderRadius: "4px", 
                              background: "#e0e7ff", 
                              color: "#4f46e5",
                              border: "1px solid #c7d2fe"
                            }}
                          >
                            {currentCategoryInfo.label}
                          </span>
                        </div>
                        <h2 style={{ fontSize: "1.3rem", fontWeight: "700", color: "var(--color-text-main)", margin: 0, lineHeight: "1.4" }}>
                          {activeQuestion.question}
                        </h2>
                      </div>

                      {/* Card Action Status Buttons */}
                      <div style={{ display: "flex", gap: "1rem", borderTop: "1px solid var(--card-border)", paddingTop: "1.25rem" }}>
                        <button 
                          onClick={() => toggleQuestionStatus(selectedResume.id, currentCategoryInfo.key, currentQuestionIndex, "completed")}
                          style={{
                            flex: 1,
                            border: "1px solid var(--card-border)",
                            borderRadius: "8px",
                            padding: "0.6rem",
                            cursor: "pointer",
                            fontWeight: "600",
                            fontSize: "0.82rem",
                            background: activeQuestion.completed ? "#10b981" : "#ffffff",
                            color: activeQuestion.completed ? "#ffffff" : "#475569",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.4rem",
                            transition: "all 0.2s ease"
                          }}
                        >
                          <Icons.Check />
                          <span>{activeQuestion.completed ? "Completed" : "Mark Completed"}</span>
                        </button>

                        <button 
                          onClick={() => toggleQuestionStatus(selectedResume.id, currentCategoryInfo.key, currentQuestionIndex, "favorite")}
                          style={{
                            flex: 1,
                            border: "1px solid var(--card-border)",
                            borderRadius: "8px",
                            padding: "0.6rem",
                            cursor: "pointer",
                            fontWeight: "600",
                            fontSize: "0.82rem",
                            background: activeQuestion.favorite ? "#fbbf24" : "#ffffff",
                            color: activeQuestion.favorite ? "#ffffff" : "#475569",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.4rem",
                            transition: "all 0.2s ease"
                          }}
                        >
                          <Icons.Star fill={activeQuestion.favorite ? "#ffffff" : "none"} />
                          <span>{activeQuestion.favorite ? "Favorited" : "Favorite"}</span>
                        </button>

                        <button 
                          onClick={() => toggleQuestionStatus(selectedResume.id, currentCategoryInfo.key, currentQuestionIndex, "needs_practice")}
                          style={{
                            flex: 1,
                            border: "1px solid var(--card-border)",
                            borderRadius: "8px",
                            padding: "0.6rem",
                            cursor: "pointer",
                            fontWeight: "600",
                            fontSize: "0.82rem",
                            background: activeQuestion.needs_practice ? "#ef4444" : "#ffffff",
                            color: activeQuestion.needs_practice ? "#ffffff" : "#475569",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.4rem",
                            transition: "all 0.2s ease"
                          }}
                        >
                          <Icons.AlertTriangle />
                          <span>{activeQuestion.needs_practice ? "Needs Practice (Active)" : "Needs Practice"}</span>
                        </button>
                      </div>

                    </div>

                    {/* Pagination Footer */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem" }}>
                      <button 
                        className="btn-secondary"
                        onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentQuestionIndex === 0}
                        style={{ display: "flex", alignItems: "center", gap: "0.5rem", opacity: currentQuestionIndex === 0 ? 0.5 : 1, cursor: currentQuestionIndex === 0 ? "not-allowed" : "pointer" }}
                      >
                        ◀ Previous
                      </button>

                      <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--color-text-muted)" }}>
                        {currentQuestionIndex + 1} / {filteredQuestions.length}
                      </span>

                      <button 
                        className="btn-secondary"
                        onClick={() => setCurrentQuestionIndex(prev => Math.min(filteredQuestions.length - 1, prev + 1))}
                        disabled={currentQuestionIndex === filteredQuestions.length - 1}
                        style={{ display: "flex", alignItems: "center", gap: "0.5rem", opacity: currentQuestionIndex === filteredQuestions.length - 1 ? 0.5 : 1, cursor: currentQuestionIndex === filteredQuestions.length - 1 ? "not-allowed" : "pointer" }}
                      >
                        Next ▶
                      </button>
                    </div>

                  </div>
                ) : (
                  <div style={{ textAlign: "center", color: "var(--color-text-muted)", padding: "3rem" }}>
                    No questions available to practice with this filter.
                  </div>
                )}

              </div>
            )}

          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "4rem 2rem", background: "#FAFBFD", borderRadius: "12px", border: "2px dashed var(--card-border)", color: "var(--color-text-muted)" }}>
            <Icons.Cpu style={{ fontSize: "3rem", color: "rgba(79, 70, 229, 0.15)", marginBottom: "1rem" }} />
            <p style={{ fontWeight: "600", fontSize: "1rem", color: "var(--color-text-main)", marginBottom: "0.25rem" }}>
              Interview Preparation Guide Not Generated Yet
            </p>
            <p style={{ fontSize: "0.85rem", maxWidth: "480px", margin: "0 auto 1.5rem auto" }}>
              Generate custom mock interview questions, difficulties, and readiness indicators based on your profile, selected job role, and target JD.
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
                  <span>Generate Preparation Questions</span>
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
            <div className="ats-dashboard-grid" style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "1.5rem" }}>
              <div 
                className={`dropzone ${dragActive ? "drag-active" : ""}`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={triggerFileInput}
                style={{ padding: "1.5rem", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="file-input" 
                  accept=".pdf,.docx" 
                  onChange={handleFileChange}
                />
                <div className="dropzone-icon" style={{ width: "36px", height: "36px", margin: "0 auto 0.5rem auto" }}>
                  <Icons.Upload />
                </div>
                <div>
                  <p style={{ fontWeight: 600, color: "var(--color-text-main)", fontSize: "0.9rem" }}>Upload a new CV / Resume document</p>
                  <p style={{ fontSize: "0.78rem", color: "var(--color-text-muted)", marginTop: "0.15rem" }}>
                    Drag & drop your PDF or DOCX file, or click to choose from disk
                  </p>
                </div>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", border: "2px dashed var(--card-border)", borderRadius: "12px", padding: "1.5rem", background: "linear-gradient(135deg, rgba(79, 70, 229, 0.02) 0%, rgba(16, 185, 129, 0.02) 100%)", textAlign: "center" }}>
                <span style={{ fontSize: "2.2rem", marginBottom: "0.5rem" }}>✍️</span>
                <h4 style={{ margin: "0 0 0.25rem 0", fontWeight: "700", fontSize: "0.95rem", color: "var(--color-text-main)" }}>Build from Scratch</h4>
                <p style={{ fontSize: "0.78rem", color: "var(--color-text-muted)", margin: "0 0 1rem 0", lineHeight: "1.4" }}>
                  Create an optimized blank CV. Fill in sections interactively and let AI improve your content.
                </p>
                <button 
                  className="btn-primary" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCreateBlankResume();
                  }}
                  disabled={loading}
                  style={{ padding: "0.55rem 1.25rem", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.35rem", background: "linear-gradient(135deg, var(--color-primary) 0%, #10b981 100%)", border: "none" }}
                >
                  <span>➕ Create New Resume</span>
                </button>
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

  if (isSessionChecking) {
    return (
      <div className="session-checking-overlay" style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "#0f172a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        gap: "1.5rem"
      }}>
        <div className="logo-icon" style={{
          width: "60px",
          height: "60px",
          borderRadius: "16px",
          background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "2rem",
          fontWeight: "bold",
          boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.4)"
        }}>RI</div>
        <div style={{
          width: "40px",
          height: "40px",
          border: "4px solid rgba(255, 255, 255, 0.1)",
          borderTopColor: "#3b82f6",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }}></div>
        <p style={{
          color: "#94a3b8",
          fontSize: "0.95rem",
          letterSpacing: "0.05em",
          fontWeight: "500"
        }}>RESTORING SESSION...</p>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

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
                    <a href="#" className="auth-link" onClick={(e) => { e.preventDefault(); setAuthView("login"); setAuthError(""); }}>Back to Sign In</a>
                  </div>
                </form>
              ) : authView === "reset_password" ? (
                <form className="auth-form" onSubmit={handleResetPassword}>
                  {devOtp && (
                    <div className="dev-otp-banner" style={{
                      background: "rgba(16, 185, 129, 0.1)",
                      border: "1px dashed #10b981",
                      borderRadius: "8px",
                      padding: "0.75rem",
                      marginBottom: "1rem",
                      color: "#10b981",
                      fontSize: "0.85rem",
                      fontWeight: "600",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      justifyContent: "center"
                    }}>
                      <Icons.Check style={{ stroke: "#10b981" }} />
                      <span>Development Mode - OTP: <strong>{devOtp}</strong></span>
                    </div>
                  )}
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
                    <div style={{ position: "relative" }}>
                      <input 
                        id="reset-pwd-input"
                        type={showResetPassword ? "text" : "password"} 
                        className="auth-input" 
                        placeholder="••••••••" 
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        required 
                        style={{ paddingRight: "2.5rem" }}
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowResetPassword(!showResetPassword)}
                        style={{
                          position: "absolute",
                          right: "0.75rem",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          color: "var(--color-text-muted, #a0aec0)",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: 0
                        }}
                      >
                        {showResetPassword ? <Icons.EyeOff /> : <Icons.Eye />}
                      </button>
                    </div>
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
                    <div style={{ position: "relative" }}>
                      <input 
                        id="auth-password"
                        type={showPassword ? "text" : "password"} 
                        className="auth-input" 
                        placeholder="••••••••" 
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        required 
                        style={{ paddingRight: "2.5rem" }}
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: "absolute",
                          right: "0.75rem",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          color: "var(--color-text-muted, #a0aec0)",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: 0
                        }}
                      >
                        {showPassword ? <Icons.EyeOff /> : <Icons.Eye />}
                      </button>
                    </div>
                  </div>
                  {authView === "login" && (
                    <div className="auth-field-row" style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", marginTop: "0.5rem" }}>
                      <input 
                        id="auth-remember-me"
                        type="checkbox" 
                        checked={rememberMe}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setRememberMe(val);
                          localStorage.setItem("remember_me", val ? "true" : "false");
                        }} 
                        style={{ width: "auto", cursor: "pointer" }}
                      />
                      <label htmlFor="auth-remember-me" className="auth-label" style={{ margin: 0, cursor: "pointer", fontSize: "0.85rem", fontWeight: "normal" }}>
                        Remember me for 30 days
                      </label>
                    </div>
                  )}
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
                        <a href="#" className="auth-link" onClick={(e) => { e.preventDefault(); setAuthView("register"); setAuthError(""); }}>Create an account</a>
                        <a href="#" className="auth-link" onClick={(e) => { e.preventDefault(); setAuthView("forgot_password"); setAuthError(""); }}>Forgot password?</a>
                      </>
                    ) : (
                      <a href="#" className="auth-link" onClick={(e) => { e.preventDefault(); setAuthView("login"); setAuthError(""); }}>Already have an account? Sign In</a>
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
              Please enter the code to activate your account.
            </p>
          </div>
          
          <form className="auth-form" onSubmit={handleVerifyEmail}>
            {devOtp && (
              <div className="dev-otp-banner" style={{
                background: "rgba(16, 185, 129, 0.1)",
                border: "1px dashed #10b981",
                borderRadius: "8px",
                padding: "0.75rem",
                marginBottom: "1rem",
                color: "#10b981",
                fontSize: "0.85rem",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                justifyContent: "center"
              }}>
                <Icons.Check style={{ stroke: "#10b981" }} />
                <span>Development Mode - OTP: <strong>{devOtp}</strong></span>
              </div>
            )}
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
              disabled={loading || verificationCountdown > 0}
            >
              {verificationCountdown > 0 ? `Resend Code (${verificationCountdown}s)` : "Resend Code"}
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
