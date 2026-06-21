import re
import logging
import json
import google.generativeai as genai
from typing import List, Optional
from app.config import settings
from app.schemas import ResumeParsedSchema, EducationSchema, ExperienceSchema, ProjectSchema, CertificationSchema, LanguageSchema

# Configure logger
logger = logging.getLogger("app.services.parser")

HEADER_PATTERNS = {
    "skills": re.compile(r'^\s*(?:#+\s*|-+\s*|\*+\s*|\d+\.\s*)?(?:skills|technical toolkit|core competencies|technical skills|skills\s*&\s*tools|toolkit|competencies)\s*[:\.]*\s*$', re.IGNORECASE),
    "experience": re.compile(r'^\s*(?:#+\s*|-+\s*|\*+\s*|\d+\.\s*)?(?:experience|work experience|professional experience|employment history|work history|professional timeline|career history)\s*[:\.]*\s*$', re.IGNORECASE),
    "education": re.compile(r'^\s*(?:#+\s*|-+\s*|\*+\s*|\d+\.\s*)?(?:education|academic background|academic history|education\s*&\s*academic background|academic credentials|credentials)\s*[:\.]*\s*$', re.IGNORECASE),
    "projects": re.compile(r'^\s*(?:#+\s*|-+\s*|\*+\s*|\d+\.\s*)?(?:projects|highlighted projects|personal projects|academic projects|key projects)\s*[:\.]*\s*$', re.IGNORECASE),
    "summary": re.compile(r'^\s*(?:#+\s*|-+\s*|\*+\s*|\d+\.\s*)?(?:summary|objective|professional summary|about me|profile)\s*[:\.]*\s*$', re.IGNORECASE),
    "certifications": re.compile(r'^\s*(?:#+\s*|-+\s*|\*+\s*|\d+\.\s*)?(?:certifications|certification|certificates|certificate|licensing|credentials|courses|awards|accomplishments)\s*[:\.]*\s*$', re.IGNORECASE),
    "languages": re.compile(r'^\s*(?:#+\s*|-+\s*|\*+\s*|\d+\.\s*)?(?:languages|language|language skills|spoken languages)\s*[:\.]*\s*$', re.IGNORECASE),
    "leadership": re.compile(r'^\s*(?:#+\s*|-+\s*|\*+\s*|\d+\.\s*)?(?:leadership|leadership\s*(?:activities|experience|roles|involvement)|extracurricular\s*(?:activities|involvement)?|volunteer\s*(?:experience|work|service)?|volunteering)\s*[:\.]*\s*$', re.IGNORECASE),
    "interests": re.compile(r'^\s*(?:#+\s*|-+\s*|\*+\s*|\d+\.\s*)?(?:interests|hobbies|hobbies\s*&\s*interests|personal\s*interests|activities)\s*[:\.]*\s*$', re.IGNORECASE),
    "referees": re.compile(r'^\s*(?:#+\s*|-+\s*|\*+\s*|\d+\.\s*)?(?:referees|references|referee|reference|references\s*(?:available)?\s*(?:upon\s*request)?)\s*[:\.]*\s*$', re.IGNORECASE)
}

HELPER_PATTERNS = [
    re.compile(r'^\s*(?:tip|example|note|nb|optional|instruction|instructions|guidance|template\s*guidance)\s*:', re.IGNORECASE),
    re.compile(r'^\s*\[\s*(?:insert|describe|replace|enter|include|choose|write|optional)\b', re.IGNORECASE),
    re.compile(r'\b(?:insert\s+your\s+name|describe\s+your\s+responsibilities|enter\s+company\s+name|write\s+a\s+short\s+summary|how\s+to\s+write)\b', re.IGNORECASE)
]

def is_helper_line(line: str) -> bool:
    line_stripped = line.strip()
    if not line_stripped:
        return False
    for pat in HELPER_PATTERNS:
        if pat.search(line_stripped):
            return True
    return False

def clean_lines_of_helper_text(text: str) -> List[str]:
    """Cleans text by removing helper/instructional lines."""
    if not text.strip():
        return []
    cleaned = []
    for line in text.splitlines():
        if not is_helper_line(line):
            cleaned.append(line.strip())
    return cleaned

# Predefined dictionary of popular technical and soft skills for matching
SKILLS_DB = [
    # Languages
    "python", "javascript", "typescript", "java", "c++", "c#", "go", "rust", "ruby", "php", "sql", "html", "css", 
    "bash", "shell", "r", "scala", "swift", "kotlin", "objective-c", "perl", "dart", "matlab", "haskell",
    # Frameworks / Libraries
    "fastapi", "django", "flask", "react", "node.js", "nodejs", "angular", "vue.js", "vuejs", "vue", "next.js", "nextjs", 
    "express", "spring", "spring boot", "asp.net", "laravel", "rails", "pytorch", "tensorflow", "keras", "pandas", 
    "numpy", "scikit-learn", "sklearn", "scipy", "junit", "testng", "cypress", "selenium", "jest", "playwright",
    "tailwind", "tailwindcss", "bootstrap", "jquery", "flutter", "react native", "redux", "graphql", "apollo",
    # Databases / Storage
    "postgresql", "postgres", "mysql", "sqlite", "mongodb", "redis", "cassandra", "elasticsearch", "dynamodb", 
    "oracle", "sql server", "mariadb", "firebase", "firestore", "neo4j", "supabase",
    # Cloud / DevOps / Infrastructure
    "aws", "amazon web services", "azure", "gcp", "google cloud", "docker", "kubernetes", "jenkins", "git", 
    "github", "gitlab", "terraform", "ansible", "ci/cd", "circleci", "travisci", "prometheus", "grafana", 
    "nginx", "apache", "linux", "unix", "vagrant", "heroku", "netlify", "vercel",
    # Concepts / Architecture
    "rest", "restful", "microservices", "serverless", "oop", "mvc", "agile", "scrum", "kanban", "sdlc", 
    "tdd", "system design", "data structures", "algorithms", "machine learning", "deep learning", "nlp", 
    "natural language processing", "computer vision", "artificial intelligence", "ai", "cybersecurity", 
    "security", "devsecops", "cloud computing", "saas", "paas", "iaas", "api design", "rest api", "soap",
    # Soft Skills / Methodologies
    "communication", "leadership", "teamwork", "problem solving", "critical thinking", "time management", 
    "adaptability", "collaboration", "project management", "product management", "technical writing",
    # Nursing / Healthcare
    "cpr", "ehr", "patient care", "vital signs", "triage", "clinical", "nursing", "hipaa", "medication administration", "cpr certification", "patient safety", "clinical documentation", "ehr systems", "epic", "cerner", "first aid",
    # Sales
    "salesforce", "crm", "lead generation", "negotiation", "b2b sales", "client relations", "cold calling", "pipeline management", "account management", "business development", "contract negotiation", "b2b",
    # Marketing
    "seo", "google analytics", "social media", "email campaigns", "copywriting", "digital marketing", "content creation", "campaign optimization", "brand strategy", "market research", "content strategy", "advertising",
    # HR
    "talent acquisition", "onboarding", "employee relations", "ats", "labor law compliance", "interviewing", "recruiting", "human resources", "benefits administration", "offboarding", "labor law",
    # Teacher / Education
    "classroom management", "lesson planning", "curriculum design", "educational technology", "student assessment", "pedagogy", "tutor", "instructional design", "classroom instruction", "curriculum development",
    # Accountant / Finance
    "gaap compliance", "gaap", "general ledger", "quickbooks", "financial reconciliation", "tax preparation", "bookkeeping", "financial reporting", "ledger reconciliation", "auditing",
    # Graphic Design / Creative
    "adobe photoshop", "photoshop", "adobe illustrator", "illustrator", "figma", "ui/ux design", "ui/ux", "typography", "visual identity", "layouts", "adobe indesign", "indesign", "branding",
    # Customer Service
    "zendesk", "customer support", "conflict resolution", "ticketing", "empathy", "customer service", "helpdesk",
    # Hospitality
    "guest relations", "reservation systems", "front desk operations", "food safety", "guest services", "catering", "event planning", "front desk",
    # Banking
    "banking compliance", "financial services", "loan processing", "customer transactions", "banking", "credit analysis", "cash handling",
    # Student / Fresher / General Soft Skills
    "microsoft office", "ms office", "public speaking",
    # Mechanical Engineering
    "cad", "solidworks", "thermodynamics", "materials science", "product design", "cnc programming", "mechanical design",
    # Civil Engineering
    "autocad", "structural engineering", "project estimating", "site surveying", "concrete design", "safety protocols", "civil engineering",
    # Government
    "public policy", "community outreach", "regulatory compliance", "program administration", "public budgeting",
    # Legal
    "legal research", "contract drafting", "litigation support", "case documentation", "client consultation", "lexisnexis", "paralegal",
    # Healthcare Admin
    "medical terminology", "patient scheduling", "billing & insurance", "electronic health records", "office coordination", "medical records"
]

SKILLS_MAP = {
    "python": "Python", "javascript": "JavaScript", "typescript": "TypeScript", "java": "Java", 
    "c++": "C++", "c#": "C#", "go": "Go", "rust": "Rust", "ruby": "Ruby", "php": "PHP", "sql": "SQL", 
    "html": "HTML", "css": "CSS", "bash": "Bash", "shell": "Shell", "r": "R", "scala": "Scala", 
    "swift": "Swift", "kotlin": "Kotlin", "objective-c": "Objective-C", "perl": "Perl", "dart": "Dart",
    "matlab": "MATLAB", "haskell": "Haskell",
    
    "fastapi": "FastAPI", "django": "Django", "flask": "Flask", "react": "React", 
    "node.js": "Node.js", "nodejs": "Node.js", "angular": "Angular", "vue.js": "Vue.js", 
    "vuejs": "Vue.js", "vue": "Vue", "next.js": "Next.js", "nextjs": "Next.js", "express": "Express", 
    "spring": "Spring", "spring boot": "Spring Boot", "asp.net": "ASP.NET", "laravel": "Laravel", 
    "rails": "Ruby on Rails", "pytorch": "PyTorch", "tensorflow": "TensorFlow", "keras": "Keras", 
    "pandas": "Pandas", "numpy": "NumPy", "scikit-learn": "Scikit-Learn", "sklearn": "Scikit-Learn", 
    "scipy": "SciPy", "junit": "JUnit", "testng": "TestNG", "cypress": "Cypress", "selenium": "Selenium", 
    "jest": "Jest", "playwright": "Playwright", "tailwind": "Tailwind CSS", "tailwindcss": "Tailwind CSS", 
    "bootstrap": "Bootstrap", "jquery": "jQuery", "flutter": "Flutter", "react native": "React Native", 
    "redux": "Redux", "graphql": "GraphQL", "apollo": "Apollo",
    
    "postgresql": "PostgreSQL", "postgres": "PostgreSQL", "mysql": "MySQL", "sqlite": "SQLite", 
    "mongodb": "MongoDB", "redis": "Redis", "cassandra": "Cassandra", "elasticsearch": "Elasticsearch", 
    "dynamodb": "DynamoDB", "oracle": "Oracle", "sql server": "SQL Server", "mariadb": "MariaDB", 
    "firebase": "Firebase", "firestore": "Firestore", "neo4j": "Neo4j", "supabase": "Supabase",
    
    "aws": "AWS", "amazon web services": "AWS", "azure": "Azure", "gcp": "GCP", 
    "google cloud": "GCP", "docker": "Docker", "kubernetes": "Kubernetes", "jenkins": "Jenkins", 
    "git": "Git", "github": "GitHub", "gitlab": "GitLab", "terraform": "Terraform", "ansible": "Ansible", 
    "ci/cd": "CI/CD", "circleci": "CircleCI", "travisci": "TravisCI", "prometheus": "Prometheus", 
    "grafana": "Grafana", "nginx": "Nginx", "apache": "Apache", "linux": "Linux", "unix": "Unix", 
    "vagrant": "Vagrant", "heroku": "Heroku", "netlify": "Netlify", "vercel": "Vercel",
    
    "rest": "REST", "restful": "RESTful", "microservices": "Microservices", "serverless": "Serverless", 
    "saas": "SaaS", "oop": "OOP", "mvc": "MVC", "agile": "Agile", "scrum": "Scrum", "kanban": "Kanban", 
    "sdlc": "SDLC", "tdd": "TDD", "system design": "System Design", "data structures": "Data Structures", 
    "algorithms": "Algorithms", "machine learning": "Machine Learning", "deep learning": "Deep Learning", 
    "nlp": "NLP", "natural language processing": "NLP", "computer vision": "Computer Vision", 
    "artificial intelligence": "AI", "ai": "AI", "cybersecurity": "Cybersecurity", 
    "security": "Security", "devsecops": "DevSecOps", "cloud computing": "Cloud Computing", 
    "paas": "PaaS", "iaas": "IaaS", "api design": "API Design", "rest api": "REST API", "soap": "SOAP",
    
    "communication": "Communication", "leadership": "Leadership", "teamwork": "Teamwork", 
    "problem solving": "Problem Solving", "critical thinking": "Critical Thinking", 
    "time management": "Time Management", "adaptability": "Adaptability", "collaboration": "Collaboration", 
    "project management": "Project Management", "product management": "Product Management", 
    "technical writing": "Technical Writing",

    "cpr": "CPR", "ehr": "EHR", "patient care": "Patient Care", "vital signs": "Vital Signs", "triage": "Triage",
    "clinical": "Clinical Care", "nursing": "Nursing", "hipaa": "HIPAA Compliance", "medication administration": "Medication Administration",
    "cpr certification": "CPR Certification", "patient safety": "Patient Safety", "clinical documentation": "Clinical Documentation",
    "ehr systems": "EHR Systems", "epic": "Epic EHR", "cerner": "Cerner EHR", "first aid": "First Aid",
    
    "salesforce": "Salesforce CRM", "crm": "CRM", "lead generation": "Lead Generation", "negotiation": "Negotiation",
    "b2b sales": "B2B Sales", "client relations": "Client Relations", "cold calling": "Cold Calling",
    "pipeline management": "Pipeline Management", "account management": "Account Management",
    "business development": "Business Development", "contract negotiation": "Contract Negotiation", "b2b": "B2B Sales",
    
    "seo": "SEO Optimization", "google analytics": "Google Analytics", "social media": "Social Media Marketing",
    "email campaigns": "Email Campaigns", "copywriting": "Copywriting", "digital marketing": "Digital Marketing",
    "content creation": "Content Creation", "campaign optimization": "Campaign Optimization", "brand strategy": "Brand Strategy",
    "market research": "Market Research", "content strategy": "Content Strategy", "advertising": "Advertising",
    
    "talent acquisition": "Talent Acquisition", "onboarding": "Employee Onboarding", "employee relations": "Employee Relations",
    "ats": "Applicant Tracking Systems", "labor law compliance": "Labor Law Compliance", "interviewing": "Interviewing",
    "recruiting": "Recruiting", "human resources": "Human Resources", "benefits administration": "Benefits Administration",
    "offboarding": "Employee Offboarding", "labor law": "Labor Law Compliance",
    
    "classroom management": "Classroom Management", "lesson planning": "Lesson Planning", "curriculum design": "Curriculum Design",
    "educational technology": "Educational Technology", "student assessment": "Student Assessment", "pedagogy": "Pedagogy",
    "tutor": "Tutoring", "instructional design": "Instructional Design", "classroom instruction": "Classroom Instruction",
    "curriculum development": "Curriculum Development",
    
    "gaap compliance": "GAAP Compliance", "gaap": "GAAP", "general ledger": "General Ledger", "quickbooks": "QuickBooks",
    "financial reconciliation": "Financial Reconciliation", "tax preparation": "Tax Preparation", "bookkeeping": "Bookkeeping",
    "financial reporting": "Financial Reporting", "ledger reconciliation": "Ledger Reconciliation", "auditing": "Auditing",
    
    "adobe photoshop": "Adobe Photoshop", "photoshop": "Adobe Photoshop", "adobe illustrator": "Adobe Illustrator",
    "illustrator": "Adobe Illustrator", "figma": "Figma", "ui/ux design": "UI/UX Design", "ui/ux": "UI/UX",
    "typography": "Typography", "visual identity": "Visual Identity", "layouts": "Layout Design",
    "adobe indesign": "Adobe InDesign", "indesign": "Adobe InDesign", "branding": "Branding",
    
    "zendesk": "Zendesk", "customer support": "Customer Support", "conflict resolution": "Conflict Resolution",
    "ticketing": "Support Ticketing", "empathy": "Empathy", "customer service": "Customer Service", "helpdesk": "Helpdesk",
    
    "guest relations": "Guest Relations", "reservation systems": "Reservation Systems", "front desk operations": "Front Desk Operations",
    "food safety": "Food Safety", "guest services": "Guest Services", "catering": "Catering", "event planning": "Event Planning",
    "front desk": "Front Desk Operations",
    
    "banking compliance": "Banking Compliance", "financial services": "Financial Services", "loan processing": "Loan Processing",
    "customer transactions": "Customer Transactions", "banking": "Banking", "credit analysis": "Credit Analysis",
    "cash handling": "Cash Handling",
    
    "teamwork": "Teamwork", "problem solving": "Problem Solving", "time management": "Time Management",
    "analytical research": "Analytical Research", "microsoft office": "Microsoft Office", "ms office": "Microsoft Office",
    "public speaking": "Public Speaking",
    
    "cad": "CAD Design", "solidworks": "SolidWorks", "thermodynamics": "Thermodynamics", "materials science": "Materials Science",
    "product design": "Product Design", "cnc programming": "CNC Programming", "mechanical design": "Mechanical Design",
    
    "autocad": "AutoCAD", "structural engineering": "Structural Engineering", "project estimating": "Project Estimating",
    "site surveying": "Site Surveying", "concrete design": "Concrete Design", "safety protocols": "Safety Protocols",
    "civil engineering": "Civil Engineering",
    
    "public policy": "Public Policy", "community outreach": "Community Outreach", "regulatory compliance": "Regulatory Compliance",
    "program administration": "Program Administration", "public budgeting": "Public Budgeting",
    
    "legal research": "Legal Research", "contract drafting": "Contract Drafting", "litigation support": "Litigation Support",
    "case documentation": "Case Documentation", "client consultation": "Client Consultation", "lexisnexis": "LexisNexis",
    "paralegal": "Paralegal Studies",
    
    "medical terminology": "Medical Terminology", "patient scheduling": "Patient Scheduling", "billing & insurance": "Billing & Insurance",
    "electronic health records": "Electronic Health Records", "office coordination": "Office Coordination",
    "medical records": "Medical Records"
}

def extract_skills_from_text(text: str) -> List[str]:
    """Helper to extract skills from text using a predefined list of keyword matches."""
    text_lower = text.lower()
    matched = []
    for skill in SKILLS_DB:
        # Check boundary depending on characters
        pattern = rf'(?<![a-zA-Z0-9]){re.escape(skill)}(?![a-zA-Z0-9])'
        if re.search(pattern, text_lower):
            matched.append(SKILLS_MAP.get(skill, skill.title()))
    return sorted(list(set(matched)))

def segment_sections(raw_text: str) -> dict:
    """Split raw resume text into logical sections using common headers."""
    sections = {
        "header": [],
        "skills": [],
        "experience": [],
        "education": [],
        "projects": [],
        "summary": [],
        "certifications": [],
        "languages": [],
        "leadership": [],
        "interests": [],
        "referees": []
    }
    
    current_section = "header"
    
    for line in raw_text.splitlines():
        cleaned_line = line.strip()
        
        # Check if line matches any header (only if the line is not empty)
        matched_header = False
        if cleaned_line:
            for sec_name, regex in HEADER_PATTERNS.items():
                if regex.match(cleaned_line):
                    current_section = sec_name
                    matched_header = True
                    break
        
        if not matched_header:
            if not is_helper_line(line):
                sections[current_section].append(line)
            
    return {k: "\n".join(v).strip() for k, v in sections.items()}

def clean_field(val: Optional[str], date_pat) -> Optional[str]:
    """Helper to remove date ranges and leading/trailing formatting characters from text fields."""
    if not val:
        return val
    # Remove date
    val = re.sub(date_pat, "", val).strip()
    # Remove leading/trailing non-alphanumeric chars like - | , : @ •
    val = re.sub(r'^[\s\-\|\,\•\:\@\(\)]+|[\s\-\|\,\•\:\@\(\)]+$', "", val).strip()
    return val

def parse_education_section(edu_text: str) -> List[EducationSchema]:
    """Parse education entries using a state-machine that splits on duplicate schools/degrees."""
    if not edu_text.strip():
        return []
        
    entries = []
    lines = [l.strip() for l in edu_text.splitlines() if l.strip()]
    
    current_school = None
    current_degree = None
    current_field = None
    current_start = None
    current_end = None
    
    date_range_pat = r'((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{1,2}/\d{2,4}|\d{4})\s*(?:-|to)\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{1,2}/\d{2,4}|\d{4}|Present|Current)'
    
    for line in lines:
        cleaned_line = line.strip()
        if not cleaned_line:
            continue
        if any(pat.match(cleaned_line) for pat in HEADER_PATTERNS.values()):
            break
        has_school = any(x in line.lower() for x in ["university", "college", "institute", "school", "academy", "polytechnic"]) or re.search(r'\b(?:MIT|IIT|Stanford|Harvard|Caltech|Berkeley|CMU)\b', line)
        
        has_degree = False
        degree_patterns = [
            r'\b(Bachelor|B\.S\.|B\.A\.|BS|BA|B\.Tech|BTech|B\.E\.|BE)\b',
            r'\b(Master|M\.S\.|M\.A\.|MS|MA|M\.Tech|MTech|M\.B\.A\.|MBA)\b',
            r'\b(Ph\.D\.|PhD|Doctor)\b',
            r'\b(Associate\s+Degree|Diploma|Certificate)\b'
        ]
        for pat in degree_patterns:
            if re.search(pat, line, re.IGNORECASE):
                has_degree = True
                break
                
        # Split when we hit a duplicate indicator
        if (has_school and current_school) or (has_degree and current_degree):
            entries.append(EducationSchema(
                school=clean_field(current_school, date_range_pat),
                degree=clean_field(current_degree, date_range_pat),
                field_of_study=clean_field(current_field, date_range_pat),
                start_date=current_start,
                end_date=current_end
            ))
            current_school = None
            current_degree = None
            current_field = None
            current_start = None
            current_end = None
            
        # Parse fields
        if has_school and not current_school:
            school_match = re.search(r'([a-zA-Z\s\.\-\,\&]+(?:University|College|Institute|School|Academy|Polytechnic)[a-zA-Z\s\.\-\,\&]*)', line, re.IGNORECASE)
            if school_match:
                current_school = school_match.group(1).strip()
            else:
                current_school = line
                
        if has_degree and not current_degree:
            for pat in degree_patterns:
                deg_match = re.search(pat, line, re.IGNORECASE)
                if deg_match:
                    current_degree = deg_match.group(1).strip()
                    full_deg_match = re.search(r'\b((?:Bachelor|Master|Doctor)\s+of\s+[a-zA-Z\s]+)\b', line, re.IGNORECASE)
                    if full_deg_match:
                        current_degree = full_deg_match.group(1).strip()
                    break
                    
        if not current_field:
            field_match = re.search(r'\bin\s+([a-zA-Z\s\&]{3,50})', line, re.IGNORECASE)
            if field_match:
                current_field = field_match.group(1).strip()
            elif "major" in line.lower():
                field_match = re.search(r'major\s*:?\s*([a-zA-Z\s\&]{3,50})', line, re.IGNORECASE)
                if field_match:
                    current_field = field_match.group(1).strip()
            else:
                majors = ["computer science", "software engineering", "data science", "information technology", 
                          "electrical engineering", "mechanical engineering", "mathematics", "physics", 
                          "chemistry", "biology", "business administration", "finance", "economics"]
                for maj in majors:
                    if maj in line.lower():
                        current_field = maj.title()
                        break
                        
        date_match = re.search(date_range_pat, line, re.IGNORECASE)
        if date_match:
            current_start = date_match.group(1).strip()
            current_end = date_match.group(2).strip()
        else:
            single_year_match = re.search(r'\b(19\d{2}|20\d{2})\b', line)
            if single_year_match and not current_start:
                current_start = single_year_match.group(1)
                
    if current_school or current_degree or current_field:
        entries.append(EducationSchema(
            school=clean_field(current_school, date_range_pat),
            degree=clean_field(current_degree, date_range_pat),
            field_of_study=clean_field(current_field, date_range_pat),
            start_date=current_start,
            end_date=current_end
        ))
        
    return entries

def parse_experience_section(exp_text: str) -> List[ExperienceSchema]:
    """Parse experience entries using a state-machine that splits on duplicate roles/dates."""
    if not exp_text.strip():
        return []
        
    entries = []
    lines = [l.strip() for l in exp_text.splitlines()]
    
    current_company = None
    current_role = None
    current_start = None
    current_end = None
    current_desc_lines = []
    
    date_range_pat = r'((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{1,2}/\d{2,4}|\d{4})\s*(?:-|to)\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{1,2}/\d{2,4}|\d{4}|Present|Current)'
    
    role_indicator = re.compile(
        r'\b(software engineer|developer|manager|lead|architect|analyst|intern|specialist|administrator|designer|consultant|data scientist|director|engineer)\b', 
        re.IGNORECASE
    )
    
    for line in lines:
        cleaned_line = line.strip()
        if not cleaned_line:
            continue
            
        if any(pat.match(cleaned_line) for pat in HEADER_PATTERNS.values()):
            break
            
        has_role = bool(role_indicator.search(cleaned_line))
        has_dates = bool(re.search(date_range_pat, cleaned_line, re.IGNORECASE))
        is_bullet = cleaned_line.startswith(("-", "*", "•", "o "))
        
        # Check if line is a description sentence to prevent splitting
        is_sentence = cleaned_line.endswith(".") or len(cleaned_line) > 60 or any(cleaned_line.lower().startswith(x) for x in ["worked", "developed", "managed", "led", "created", "designed", "responsible", "assisted", "collaborated", "built", "implemented", "optimized", "integrated"])
        
        # Split on duplicate role/dates indicator (ignoring bullet lines and description sentences)
        if not is_bullet and not is_sentence and ((has_role and current_role) or (has_dates and current_start)):
            entries.append(ExperienceSchema(
                company=clean_field(current_company, date_range_pat) or "Company",
                role=clean_field(current_role, date_range_pat) or "Professional Experience",
                start_date=current_start,
                end_date=current_end,
                description="\n".join(current_desc_lines).strip()
            ))
            current_company = None
            current_role = None
            current_start = None
            current_end = None
            current_desc_lines = []
            
        date_match = re.search(date_range_pat, cleaned_line, re.IGNORECASE)
        if date_match and not current_start:
            current_start = date_match.group(1).strip()
            current_end = date_match.group(2).strip()
            
        if not is_bullet:
            if is_pure_date(cleaned_line):
                date_match = re.search(date_range_pat, cleaned_line, re.IGNORECASE)
                if date_match and not current_start:
                    current_start = date_match.group(1).strip()
                    current_end = date_match.group(2).strip()
                continue
                
            parsed_line = False
            for sep in ["|", "@", " - ", " at "]:
                if sep in cleaned_line:
                    parts = cleaned_line.split(sep, 1)
                    p1 = clean_field(parts[0], date_range_pat)
                    p2 = clean_field(parts[1], date_range_pat)
                    
                    if p1 and p2:
                        if role_indicator.search(p1):
                            current_role = p1
                            current_company = p2
                        else:
                            current_role = p2
                            current_company = p1
                        parsed_line = True
                    elif p1:
                        if role_indicator.search(p1):
                            current_role = p1
                        else:
                            current_company = p1
                        parsed_line = True
                    elif p2:
                        if role_indicator.search(p2):
                            current_role = p2
                        else:
                            current_company = p2
                        parsed_line = True
                    break
            
            if not parsed_line:
                if role_indicator.search(cleaned_line) and not current_role:
                    current_role = clean_field(cleaned_line, date_range_pat)
                elif not current_company and not has_dates:
                    current_company = clean_field(cleaned_line, date_range_pat)
                else:
                    current_desc_lines.append(cleaned_line)
        else:
            current_desc_lines.append(cleaned_line)
            
    if current_role or current_company or current_desc_lines:
        entries.append(ExperienceSchema(
            company=clean_field(current_company, date_range_pat) or "Company",
            role=clean_field(current_role, date_range_pat) or "Professional Experience",
            start_date=current_start,
            end_date=current_end,
            description="\n".join(current_desc_lines).strip()
        ))
        
    return entries

def parse_projects_section(proj_text: str) -> List[ProjectSchema]:
    """Parse projects using an advanced line-by-line boundary checker to prevent text fragmentation."""
    if not proj_text.strip():
        return []
        
    entries = []
    lines = [l.strip() for l in proj_text.splitlines() if l.strip()]
    
    current_title = None
    current_desc_lines = []
    
    action_verbs = {
        "develop", "developed", "developing", "implement", "implemented", "implementing",
        "create", "created", "creating", "design", "designed", "designing", "build", "built", "building",
        "work", "worked", "working", "manage", "managed", "managing", "use", "used", "using", "utilize", "utilized",
        "utilizing", "lead", "led", "leading", "integrate", "integrated", "integrating", "write", "wrote", "writing",
        "optimize", "optimized", "optimizing", "deploy", "deployed", "deploying", "configure", "configured",
        "configuring", "maintain", "maintained", "maintaining", "refactor", "refactored", "refactoring",
        "test", "tested", "testing", "collaborate", "collaborated", "collaborating", "support", "supported",
        "setup", "established", "enhance", "enhanced", "participate", "participated", "achieve", "achieved",
        "increase", "increased", "decrease", "decreased", "improve", "improved", "reduce", "reduced", "scale", "scaled"
    }
    
    tech_headers = ["technologies", "tech stack", "tech", "tools used", "tools", "languages", "stack"]
    
    for line in lines:
        cleaned_line = line.strip()
        if not cleaned_line:
            continue
        if any(pat.match(cleaned_line) for pat in HEADER_PATTERNS.values()):
            break
        is_bullet = line.startswith(("-", "*", "•", "o ", "+"))
        line_clean = re.sub(r'^(?:\d+\.|\-|\*|\•|\+)\s*', "", line).strip()
        line_lower = line_clean.lower()
        
        # Check if this line is a tech stack list line
        is_tech_line = any(line_lower.startswith(th) for th in tech_headers) or (":" in line and any(th in line_lower.split(":")[0] for th in tech_headers))
        
        # Check if this line is likely a description sentence
        words = set(re.findall(r'\b\w+\b', line_lower))
        has_action_verbs = bool(words & action_verbs)
        is_sentence = line_clean.endswith(".") or len(line_clean) > 85 or has_action_verbs
        
        # Determine if it's a new project title
        is_new_title = False
        if not is_bullet and not is_tech_line and not is_sentence and len(line_clean) < 70:
            if current_title:
                is_new_title = True
        
        if is_new_title:
            entries.append(ProjectSchema(
                title=current_title,
                description="\n".join(current_desc_lines).strip(),
                technologies=extract_skills_from_text("\n".join(current_desc_lines) + "\n" + (current_title or ""))
            ))
            current_title = line_clean
            current_desc_lines = []
        elif not current_title:
            if not is_bullet and not is_tech_line:
                current_title = line_clean
            else:
                current_title = "Project"
                current_desc_lines.append(line)
        else:
            current_desc_lines.append(line)
            
    if current_title:
        entries.append(ProjectSchema(
            title=current_title,
            description="\n".join(current_desc_lines).strip(),
            technologies=extract_skills_from_text("\n".join(current_desc_lines) + "\n" + (current_title or ""))
        ))
        
    return entries

def parse_certifications_section(cert_text: str) -> List[CertificationSchema]:
    """Parse certifications from text extracting name, issuer, date and score."""
    if not cert_text.strip():
        return []
    
    entries = []
    lines = [l.strip() for l in cert_text.splitlines() if l.strip()]
    
    date_pat = r'\b(19\d{2}|20\d{2})\b'
    score_pat = r'\b(?:score|grade|percent|passed)\s*[:\-]?\s*([a-zA-Z0-9\.\%\s]+)'
    
    for line in lines:
        cleaned_line = re.sub(r'^(?:\d+\.|\-|\*|\•|\+)\s*', "", line).strip()
        if not cleaned_line:
            continue
        
        name = cleaned_line
        issuer = None
        date = None
        score = None
        
        date_match = re.search(date_pat, cleaned_line)
        if date_match:
            date = date_match.group(1)
            name = name.replace(date, "").strip()
            name = name.replace("()", "").replace("( )", "").strip()
            
        score_match = re.search(score_pat, cleaned_line, re.IGNORECASE)
        if score_match:
            score = score_match.group(1).strip()
            name = re.sub(r'\(?\s*score\s*[:\-]?\s*[a-zA-Z0-9\.\%\s]+\s*\)?', "", name, flags=re.IGNORECASE).strip()
            name = re.sub(r'\(?\s*grade\s*[:\-]?\s*[a-zA-Z0-9\.\%\s]+\s*\)?', "", name, flags=re.IGNORECASE).strip()
            name = re.sub(r'\(?\s*passed\s*\)?', "", name, flags=re.IGNORECASE).strip()
            
        for sep in ["|", "@", " - ", " by ", " from "]:
            if sep in name:
                parts = name.split(sep, 1)
                name = parts[0].strip()
                issuer = parts[1].strip()
                break
                
        name = re.sub(r'^[\s\-\|\,\•\:\@]+|[\s\-\|\,\•\:\@]+$', "", name).strip()
        if issuer:
            issuer = re.sub(r'^[\s\-\|\,\•\:\@]+|[\s\-\|\,\•\:\@]+$', "", issuer).strip()
            
        if not issuer:
            issuers_db = ["Amazon Web Services", "AWS", "Google", "Microsoft", "Scrum Alliance", "Cisco", "CompTIA", "Oracle", "IBM", "Udemy", "Coursera", "edX"]
            for iss in issuers_db:
                if iss.lower() in name.lower():
                    issuer = iss
                    break
        
        if name:
            entries.append(CertificationSchema(
                name=name,
                issuer=issuer or "Verified Provider",
                date=date,
                score=score
            ))
            
    return entries

def parse_languages_section(lang_text: str) -> List[LanguageSchema]:
    """Parse languages from text extracting language and proficiency level."""
    if not lang_text.strip():
        return []
        
    entries = []
    lines = [l.strip() for l in lang_text.splitlines() if l.strip()]
    
    proficiencies = ["native", "bilingual", "professional", "fluent", "intermediate", "elementary", "basic", "conversational", "limited", "working proficiency", "full professional", "mother tongue"]
    
    for line in lines:
        cleaned_line = re.sub(r'^(?:\d+\.|\-|\*|\•|\+)\s*', "", line).strip()
        if not cleaned_line:
            continue
            
        language = cleaned_line
        proficiency = "Professional"
        
        found_prof = None
        for prof in proficiencies:
            match = re.search(rf'\b{re.escape(prof)}\b', cleaned_line, re.IGNORECASE)
            if match:
                found_prof = prof.title()
                break
                
        if found_prof:
            proficiency = found_prof
            lang_part = cleaned_line
            lang_part = re.sub(rf'\(?\s*{re.escape(found_prof)}\s*\)?', "", lang_part, flags=re.IGNORECASE).strip()
            lang_part = re.sub(r'[\-\:\,|]+$', "", lang_part).strip()
            if lang_part:
                language = lang_part
        else:
            for sep in ["-", ":", "|"]:
                if sep in cleaned_line:
                    parts = cleaned_line.split(sep, 1)
                    language = parts[0].strip()
                    proficiency = parts[1].strip()
                    break
        
        language = re.sub(r'^[\s\-\|\,\•\:\@]+|[\s\-\|\,\•\:\@]+$', "", language).strip()
        proficiency = re.sub(r'^[\s\-\|\,\•\:\@]+|[\s\-\|\,\•\:\@]+$', "", proficiency).strip()
        
        if language and len(language) < 45:
            entries.append(LanguageSchema(
                language=language,
                proficiency=proficiency
            ))
            
    return entries

def parse_summary_section(summary_text: str) -> Optional[str]:
    """Parse summary from segmented text."""
    if not summary_text.strip():
        return None
    lines = [l.strip() for l in summary_text.splitlines() if l.strip()]
    return "\n".join(lines).strip() if lines else None

def parse_leadership_section(leadership_text: str) -> List[str]:
    """Parse leadership entries from segmented text."""
    if not leadership_text.strip():
        return []
    entries = []
    for line in leadership_text.splitlines():
        cleaned = re.sub(r'^(?:\d+\.|\-|\*|\•|\+)\s*', "", line).strip()
        if len(cleaned) >= 3:
            entries.append(cleaned)
    return entries

def parse_interests_section(interests_text: str) -> List[str]:
    """Parse interests/hobbies entries from segmented text."""
    if not interests_text.strip():
        return []
    entries = []
    for line in interests_text.splitlines():
        cleaned = re.sub(r'^(?:\d+\.|\-|\*|\•|\+)\s*', "", line).strip()
        if not cleaned:
            continue
        if "," in cleaned and len(cleaned) < 150:
            parts = [p.strip() for p in cleaned.split(",") if p.strip()]
            for p in parts:
                p_clean = re.sub(r'^[\s\-\|\,\•\:\@]+|[\s\-\|\,\•\:\@]+$', "", p).strip()
                if len(p_clean) >= 2:
                    entries.append(p_clean)
        else:
            if len(cleaned) >= 2:
                entries.append(cleaned)
    return entries

def parse_referees_section(referees_text: str) -> List[str]:
    """Parse referees/references details from segmented text."""
    if not referees_text.strip():
        return []
    entries = []
    for line in referees_text.splitlines():
        cleaned = re.sub(r'^(?:\d+\.|\-|\*|\•|\+)\s*', "", line).strip()
        if len(cleaned) >= 3:
            entries.append(cleaned)
    return entries

def is_pure_date(s: str) -> bool:
    if not s:
        return False
    s_clean = s.strip()
    date_word_pat = re.compile(
        r'^(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{1,2}/\d{2,4}|\d{4}|Present|Current|to|\s*[-–—/]\s*)+$',
        re.IGNORECASE
    )
    return bool(date_word_pat.match(s_clean))

def remove_embedded_dates(s: str) -> str:
    if not s:
        return s
    date_range_pat = r'((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{1,2}/\d{2,4}|\d{4})\s*(?:-|to|–|—)\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{1,2}/\d{2,4}|\d{4}|Present|Current)'
    s = re.sub(date_range_pat, "", s, flags=re.IGNORECASE)
    single_date_pat = r'\b(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov{2,4})|20\d{2})\b'
    s = re.sub(single_date_pat, "", s, flags=re.IGNORECASE)
    s = re.sub(r'^[\s\-\|\,\•\:\@\(\)–—]+|[\s\-\|\,\•\:\@\(\)–—]+$', "", s)
    return s.strip()

def cleanup_parsed_data(parsed_data: ResumeParsedSchema) -> ResumeParsedSchema:
    """Performs global deduplication, spaces normalization and merging of fragmented cards."""
    # 1. Clean Skills
    unique_skills = []
    seen_skills = set()
    for s in parsed_data.skills:
        s_clean = s.strip()
        if s_clean and s_clean.lower() not in seen_skills:
            seen_skills.add(s_clean.lower())
            unique_skills.append(s_clean)
    parsed_data.skills = unique_skills

    # 2. Clean Education
    unique_edu = []
    seen_edu = set()
    for edu in parsed_data.education:
        school = remove_embedded_dates(edu.school or "")
        degree = remove_embedded_dates(edu.degree or "")
        field = remove_embedded_dates(edu.field_of_study or "")
        
        if is_pure_date(school):
            school = ""
        if is_pure_date(degree):
            degree = ""
        if is_pure_date(field):
            field = ""
            
        if not school and not degree:
            continue
            
        key = (school.lower(), degree.lower(), field.lower())
        if key not in seen_edu:
            seen_edu.add(key)
            edu.school = school if school else None
            edu.degree = degree if degree else None
            edu.field_of_study = field if field else None
            unique_edu.append(edu)
    parsed_data.education = unique_edu

    # 3. Clean Experience
    unique_exp = []
    seen_exp = set()
    for exp in parsed_data.experience:
        company = remove_embedded_dates(exp.company or "")
        role = remove_embedded_dates(exp.role or "")
        desc = (exp.description or "").strip()
        
        if is_pure_date(company):
            company = ""
        if is_pure_date(role):
            role = ""
            
        if not company and not role and not desc:
            continue
            
        # Provide fallback if date-cleansing stripped the role or company name entirely
        if not role:
            role = "Professional Specialist"
        if not company:
            company = "Enterprise"
            
        key = (company.lower(), role.lower())
        if key not in seen_exp:
            seen_exp.add(key)
            exp.company = company
            exp.role = role
            exp.description = desc if desc else None
            unique_exp.append(exp)
        else:
            for existing in unique_exp:
                if (existing.company or "").lower() == company.lower() and (existing.role or "").lower() == role.lower():
                    if desc and desc not in (existing.description or ""):
                        existing.description = ((existing.description or "") + "\n" + desc).strip()
    parsed_data.experience = unique_exp

    # 4. Clean Projects
    unique_proj = []
    seen_proj = set()
    for proj in parsed_data.projects:
        title = (proj.title or "").strip()
        desc = (proj.description or "").strip()
        
        if not title:
            continue
            
        title = re.sub(r'^(?:\d+\.|\-|\*|\•|\+)\s*', "", title).strip()
        if len(title) < 3 or any(title.lower().startswith(x) for x in ["technologies", "tech stack", "tools", "responsibilities"]):
            continue
            
        key = title.lower()
        if key not in seen_proj:
            seen_proj.add(key)
            proj.title = title
            proj.description = desc if desc else None
            proj.technologies = [t.strip() for t in proj.technologies if t.strip()]
            unique_proj.append(proj)
        else:
            for existing in unique_proj:
                if existing.title.lower() == title.lower():
                    if desc and desc not in (existing.description or ""):
                        existing.description = ((existing.description or "") + "\n" + desc).strip()
                    existing.technologies = sorted(list(set(existing.technologies + proj.technologies)))
    parsed_data.projects = unique_proj

    # 5. Clean Certifications
    unique_certs = []
    seen_certs = set()
    for cert in parsed_data.certifications:
        name = (cert.name or "").strip()
        issuer = (cert.issuer or "").strip()
        
        if not name:
            continue
            
        key = name.lower()
        if key not in seen_certs:
            seen_certs.add(key)
            cert.name = name
            cert.issuer = issuer if issuer else "Verified Provider"
            unique_certs.append(cert)
    parsed_data.certifications = unique_certs

    # 6. Clean Languages
    unique_lang = []
    seen_lang = set()
    for lang in parsed_data.languages:
        name = (lang.language or "").strip()
        prof = (lang.proficiency or "").strip()
        
        if not name:
            continue
            
        key = name.lower()
        if key not in seen_lang:
            seen_lang.add(key)
            lang.language = name
            lang.proficiency = prof if prof else "Professional"
            unique_lang.append(lang)
    parsed_data.languages = unique_lang

    # 7. Clean Leadership
    unique_leader = []
    seen_leader = set()
    for l in parsed_data.leadership:
        l_clean = l.strip()
        if l_clean and l_clean.lower() not in seen_leader:
            seen_leader.add(l_clean.lower())
            unique_leader.append(l_clean)
    parsed_data.leadership = unique_leader

    # 8. Clean Interests
    unique_interests = []
    seen_interests = set()
    for i in parsed_data.interests:
        i_clean = i.strip()
        if i_clean and i_clean.lower() not in seen_interests:
            seen_interests.add(i_clean.lower())
            unique_interests.append(i_clean)
    parsed_data.interests = unique_interests

    # 9. Clean Referees
    unique_referees = []
    seen_referees = set()
    for r in parsed_data.referees:
        r_clean = r.strip()
        if r_clean and r_clean.lower() not in seen_referees:
            seen_referees.add(r_clean.lower())
            unique_referees.append(r_clean)
    parsed_data.referees = unique_referees

    return parsed_data

def detect_profession_with_gemini(raw_text: str) -> dict:
    """
    Classifies the candidate's profession, industry, seniority, experience level,
    skills, and career objective using Gemini API.
    Runs self-validation to reject unsupported assumptions.
    """
    prompt = (
        "You are an expert career classification agent. Analyze the following candidate resume text and extract the candidate's professional profile.\n\n"
        "Resume Text:\n"
        f"{raw_text}\n\n"
        "Your task is to detect the following details:\n"
        "1. Profession: Must be EXACTLY one of the following supported professions:\n"
        "   - Customer Service\n"
        "   - HR\n"
        "   - Marketing\n"
        "   - Teacher\n"
        "   - Nurse\n"
        "   - Accountant\n"
        "   - Software Engineer\n"
        "   - Android Developer\n"
        "   - Data Analyst\n"
        "   - Business Analyst\n"
        "   - Graphic Designer\n"
        "   - Sales\n"
        "   - Hospitality\n"
        "   - Banking\n"
        "   - Student/Fresher\n"
        "   - General Professional\n\n"
        "2. Industry: The industry classification (e.g. Technology, Healthcare, Finance, Education, Retail, Customer Support, Design & Creative, Hospitality, Academic, etc.)\n"
        "3. Seniority: The seniority level (e.g. Intern, Junior, Mid, Senior, Lead, Manager, Director, Executive)\n"
        "4. Experience Level: The experience duration/level (e.g. Fresher, 1-3 Years, 3-5 Years, 5+ Years)\n"
        "5. Skills: List of key professional/technical skills explicitly mentioned or directly supported by the resume. Do NOT fabricate skills.\n"
        "6. Career Objective: A summary of the candidate's career objective (either directly extracted or logically inferred).\n\n"
        "CRITICAL ASSUMPTION VALIDATION LAYER:\n"
        "You must run a validation check on your classification. Reject any unsupported assumptions.\n"
        "- Do NOT assume a candidate is a Software Engineer or Android Developer unless the resume contains direct evidence of software development skills (e.g., programming languages like Python, Java, Kotlin, React) and/or experience.\n"
        "- Do NOT default to 'Software Engineer'.\n"
        "- Look for direct, clear, objective evidence in the text.\n"
        "- If the evidence is weak, ambiguous, or if your confidence in the selected profession is below 70%, you MUST set the Profession to 'General Professional' and confidence to less than 70%.\n\n"
        "Return your output as a single, valid JSON object containing the following keys (no markdown formatting, no code block wrapper):\n"
        "{\n"
        '  "profession": "string, one of the supported professions",\n'
        '  "industry": "string",\n'
        '  "seniority": "string",\n'
        '  "experience_level": "string",\n'
        '  "skills": ["list of strings"],\n'
        '  "career_objective": "string",\n'
        '  "confidence": 0-100,\n'
        '  "validation_passed": true/false,\n'
        '  "validation_reason": "detailed explanation of why the validation passed or failed, explaining the evidence or lack thereof"\n'
        "}\n"
    )

    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-1.5-flash")
    
    # Generate content with JSON constraint
    response = model.generate_content(
        prompt,
        generation_config={"response_mime_type": "application/json"}
    )
    
    result = json.loads(response.text)
    
    # Apply strict requirements check
    confidence = result.get("confidence", 100)
    validation_passed = result.get("validation_passed", True)
    
    if confidence < 70 or not validation_passed:
        result["profession"] = "General Professional"
        result["validation_passed"] = False
        
    # Standardize selected profession to the allowed list (case-insensitive check)
    allowed_professions = [
        "Customer Service", "HR", "Marketing", "Teacher", "Nurse", "Accountant",
        "Software Engineer", "Android Developer", "Data Analyst", "Business Analyst",
        "Graphic Designer", "Sales", "Hospitality", "Banking", "Student/Fresher", "General Professional"
    ]
    
    detected = result.get("profession", "General Professional").strip()
    matched = None
    for p in allowed_professions:
        if p.lower() == detected.lower():
            matched = p
            break
            
    if not matched:
        result["profession"] = "General Professional"
    else:
        result["profession"] = matched
        
    return result

def detect_profession_local(raw_text: str, parsed_skills: list) -> dict:
    """
    Rule-based local fallback to classify candidate's profession, industry, seniority, etc.
    """
    text_lower = raw_text.lower()
    skills_lower = [s.lower() for s in (parsed_skills or [])]

    # Predefined keywords for target professions
    keywords_map = {
        "Software Engineer": ["software engineer", "developer", "backend", "frontend", "fullstack", "programming", "algorithms", "c++", "java", "python", "software developer", "web developer", "systems architect", "react", "fastapi", "django"],
        "Android Developer": ["android", "kotlin", "mobile developer", "mobile app", "gradle", "apk", "android studio", "ios", "swift", "objective-c"],
        "Data Analyst": ["data analyst", "sql", "tableau", "power bi", "powerbi", "pandas", "data visualization", "excel", "analytics", "business intelligence"],
        "Business Analyst": ["business analyst", "requirements", "uml", "use cases", "stakeholders", "agile", "jira", "scrum", "process improvement"],
        "Customer Service": ["customer service", "help desk", "support", "call center", "client support", "troubleshooting", "customer success", "client relations"],
        "HR": ["hr", "human resources", "recruiting", "talent acquisition", "onboarding", "payroll", "employee relations", "benefits", "hiring"],
        "Marketing": ["marketing", "seo", "campaign", "digital marketing", "social media", "branding", "adwords", "market research", "content creator"],
        "Teacher": ["teacher", "teaching", "education", "classroom", "curriculum", "tutor", "pedagogy", "instructor", "lecturer"],
        "Nurse": ["nurse", "nursing", "rn", "patient care", "cpr", "triage", "registered nurse", "nurse practitioner"],
        "Accountant": ["accountant", "accounting", "ledger", "bookkeeping", "tax", "audit", "quickbooks", "cpa", "financial reporting"],
        "Graphic Designer": ["graphic designer", "photoshop", "illustrator", "indesign", "figma", "ui/ux", "visual design", "typography", "graphic design", "branding"],
        "Sales": ["sales", "account executive", "cold calling", "leads", "revenue", "b2b sales", "crm", "salesforce", "business development"],
        "Hospitality": ["hospitality", "hotel", "restaurant", "chef", "waiter", "event planning", "catering", "front desk"],
        "Banking": ["banking", "bank", "credit", "loan", "investment", "wealth management", "teller", "mortgage"],
        "Student/Fresher": ["student", "intern", "internship", "fresher", "graduate", "university", "college", "gpa", "academic project", "academic", "co-op"]
    }

    # Calculate match scores
    scores = {}
    for prof, kw_list in keywords_map.items():
        score = 0
        for kw in kw_list:
            # Count frequency in raw text (case-insensitive)
            count = len(re.findall(r'\b' + re.escape(kw) + r'\b', text_lower))
            score += count
            # Give extra weight if the keyword matches a parsed skill
            if kw in skills_lower:
                score += 3
        scores[prof] = score

    # Find highest score
    max_prof = max(scores, key=scores.get)
    max_score = scores[max_prof]

    # Decide confidence and profession based on rules
    if max_score >= 3:
        profession = max_prof
        confidence = 85.0
        validation_passed = True
        validation_reason = f"Strong local keyword matches found (score: {max_score}) for {profession}."
    else:
        profession = "General Professional"
        confidence = 50.0
        validation_passed = False
        validation_reason = f"No strong matching keywords for any specific profession. Defaulted to General Professional."

    # Map profession to industry
    industry_map = {
        "Software Engineer": "Technology",
        "Android Developer": "Technology",
        "Data Analyst": "Technology",
        "Business Analyst": "Business Services",
        "Customer Service": "Customer Support",
        "HR": "Human Resources",
        "Marketing": "Marketing & Advertising",
        "Teacher": "Education",
        "Nurse": "Healthcare",
        "Accountant": "Finance & Accounting",
        "Graphic Designer": "Design & Creative",
        "Sales": "Sales & Retail",
        "Hospitality": "Hospitality & Tourism",
        "Banking": "Finance & Banking",
        "Student/Fresher": "Academic",
        "General Professional": "General Business"
    }
    industry = industry_map.get(profession, "General Business")

    # Detect Seniority
    seniority = "Mid"
    if any(kw in text_lower for kw in ["director", "vp", "chief", "executive", "head", "president"]):
        seniority = "Executive"
    elif any(kw in text_lower for kw in ["senior", "lead", "principal", "architect", "manager"]):
        seniority = "Senior"
    elif any(kw in text_lower for kw in ["junior", "intern", "fresher", "trainee"]):
        seniority = "Junior"

    # Detect Experience Level
    if profession == "Student/Fresher" or seniority == "Intern":
        experience_level = "Fresher"
    else:
        # Check years of experience mentioned in text or base it on mentions
        years_matches = re.findall(r'(\d+)\+?\s*years?', text_lower)
        if years_matches:
            max_years = max(int(y) for y in years_matches if int(y) < 50)
            if max_years >= 5:
                experience_level = "5+ Years"
            elif max_years >= 3:
                experience_level = "3-5 Years"
            else:
                experience_level = "1-3 Years"
        else:
            experience_level = "1-3 Years"

    # Fallback career objective
    career_objective = (
        f"Detail-oriented professional seeking to leverage skills and experience in {industry} "
        f"as a {profession} to contribute to organizational goals."
    )

    return {
        "profession": profession,
        "industry": industry,
        "seniority": seniority,
        "experience_level": experience_level,
        "skills": parsed_skills,
        "career_objective": career_objective,
        "confidence": confidence,
        "validation_passed": validation_passed,
        "validation_reason": validation_reason
    }

def parse_resume_text(raw_text: str) -> ResumeParsedSchema:
    """
    Passes raw extracted resume text through our local rule-based parsing engine and returns
    a validated structured ResumeParsedSchema.
    """
    if not raw_text.strip():
        raise ValueError("No text extracted from the resume to parse.")

    try:
        # 1. Segment raw text into sections
        sections = segment_sections(raw_text)
        
        # 2. Extract name
        name = None
        header_lines = sections.get("header", "").splitlines()
        for line in header_lines:
            cleaned = line.strip()
            if not cleaned:
                continue
            if "@" in cleaned:
                continue
            if any(x in cleaned.lower() for x in ["http", "www", ".com", ".org", "github", "linkedin"]):
                continue
            if re.search(r'\d{3,}', cleaned):
                continue
            if re.match(r'^[a-zA-Z\s\.\-\'\’]+$', cleaned):
                words = cleaned.split()
                if 1 <= len(words) <= 4:
                    name = cleaned
                    break
        
        # Fallback name if header search was too strict
        if not name:
            for line in header_lines:
                cleaned = line.strip()
                if cleaned and "@" not in cleaned and "http" not in cleaned and "www" not in cleaned:
                    name = cleaned
                    break
        
        # 3. Extract email
        email = None
        email_match = re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', raw_text)
        if email_match:
            email = email_match.group(0).strip()
            
        # 4. Extract phone
        phone = None
        phone_patterns = [
            # standard US/intl formats with 3-digit area code: (123) 456-7890, 123-456-7890, +1 123 456 7890
            re.compile(r'(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'),
            # 10-digit continuous numbers or space separated: 9876543210, +91 98765 43210
            re.compile(r'(?:\+?\d{1,3}[-.\s]?)?\d{5}[-.\s]?\d{5}'),
            # general digits format: +44 7911 123456
            re.compile(r'\+?\d{1,4}[-.\s]?\d{3,4}[-.\s]?\d{3,4}[-.\s]?\d{1,4}')
        ]
        for pat in phone_patterns:
            m = pat.search(raw_text)
            if m:
                phone = m.group(0).strip()
                break
            
        # 5. Extract skills
        skills = extract_skills_from_text(raw_text)
        
        # 6. Parse education, experience, projects, certifications, and languages
        summary = parse_summary_section(sections.get("summary", ""))
        education = parse_education_section(sections.get("education", ""))
        experience = parse_experience_section(sections.get("experience", ""))
        projects = parse_projects_section(sections.get("projects", ""))
        certifications = parse_certifications_section(sections.get("certifications", ""))
        languages = parse_languages_section(sections.get("languages", ""))
        leadership = parse_leadership_section(sections.get("leadership", ""))
        interests = parse_interests_section(sections.get("interests", ""))
        referees = parse_referees_section(sections.get("referees", ""))
        
        parsed_resume = ResumeParsedSchema(
            name=name,
            email=email,
            phone=phone,
            summary=summary,
            skills=skills,
            education=education,
            experience=experience,
            projects=projects,
            certifications=certifications,
            languages=languages,
            leadership=leadership,
            interests=interests,
            referees=referees
        )
        
        # 7. Post-parsing cleanup and validation
        cleaned_resume = cleanup_parsed_data(parsed_resume)
        
        # 8. Phase 2 Profession detection
        prof_data = None
        if settings.GEMINI_API_KEY:
            try:
                logger.info("Detecting profession with Gemini AI...")
                prof_data = detect_profession_with_gemini(raw_text)
            except Exception as e:
                logger.warning(f"Failed to detect profession using Gemini: {str(e)}. Falling back to local rules.")
        
        if not prof_data:
            logger.info("Detecting profession using local rule-based fallback...")
            prof_data = detect_profession_local(raw_text, cleaned_resume.skills)
            
        cleaned_resume.profession = prof_data.get("profession")
        cleaned_resume.industry = prof_data.get("industry")
        cleaned_resume.seniority = prof_data.get("seniority")
        cleaned_resume.experience_level = prof_data.get("experience_level")
        cleaned_resume.career_objective = prof_data.get("career_objective")
        cleaned_resume.profession_confidence = float(prof_data.get("confidence", 0.0))
        cleaned_resume.validation_passed = bool(prof_data.get("validation_passed", False))
        cleaned_resume.validation_reason = prof_data.get("validation_reason", "")
        
        return cleaned_resume

    except Exception as e:
        logger.error(f"Local rule-based resume parsing failure: {str(e)}")
        raise RuntimeError(f"Failed to parse resume locally: {str(e)}")
