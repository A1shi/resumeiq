import re
import logging
from typing import List, Optional
from app.schemas import ResumeParsedSchema, EducationSchema, ExperienceSchema, ProjectSchema, CertificationSchema, LanguageSchema

# Configure logger
logger = logging.getLogger("app.services.parser")

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
    "adaptability", "collaboration", "project management", "product management", "technical writing"
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
    "technical writing": "Technical Writing"
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
        "languages": []
    }
    
    header_patterns = {
        "skills": re.compile(r'^\s*(?:#+\s*|-+\s*|\*+\s*|\d+\.\s*)?(?:skills|technical toolkit|core competencies|technical skills|skills\s*&\s*tools|toolkit|competencies)\s*[:\.]*\s*$', re.IGNORECASE),
        "experience": re.compile(r'^\s*(?:#+\s*|-+\s*|\*+\s*|\d+\.\s*)?(?:experience|work experience|professional experience|employment history|work history|professional timeline|career history)\s*[:\.]*\s*$', re.IGNORECASE),
        "education": re.compile(r'^\s*(?:#+\s*|-+\s*|\*+\s*|\d+\.\s*)?(?:education|academic background|academic history|education\s*&\s*academic background|academic credentials|credentials)\s*[:\.]*\s*$', re.IGNORECASE),
        "projects": re.compile(r'^\s*(?:#+\s*|-+\s*|\*+\s*|\d+\.\s*)?(?:projects|highlighted projects|personal projects|academic projects|key projects)\s*[:\.]*\s*$', re.IGNORECASE),
        "summary": re.compile(r'^\s*(?:#+\s*|-+\s*|\*+\s*|\d+\.\s*)?(?:summary|objective|professional summary|about me|profile)\s*[:\.]*\s*$', re.IGNORECASE),
        "certifications": re.compile(r'^\s*(?:#+\s*|-+\s*|\*+\s*|\d+\.\s*)?(?:certifications|certification|certificates|certificate|licensing|credentials|courses|awards|accomplishments)\s*[:\.]*\s*$', re.IGNORECASE),
        "languages": re.compile(r'^\s*(?:#+\s*|-+\s*|\*+\s*|\d+\.\s*)?(?:languages|language|language skills|spoken languages)\s*[:\.]*\s*$', re.IGNORECASE)
    }
    
    current_section = "header"
    
    for line in raw_text.splitlines():
        cleaned_line = line.strip()
        
        # Check if line matches any header (only if the line is not empty)
        matched_header = False
        if cleaned_line:
            for sec_name, regex in header_patterns.items():
                if regex.match(cleaned_line):
                    current_section = sec_name
                    matched_header = True
                    break
        
        if not matched_header:
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
    single_date_pat = r'\b(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{1,2}/\d{2,4}|\b(?:19\d{2}|20\d{2})\b)'
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

    return parsed_data

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
        education = parse_education_section(sections.get("education", ""))
        experience = parse_experience_section(sections.get("experience", ""))
        projects = parse_projects_section(sections.get("projects", ""))
        certifications = parse_certifications_section(sections.get("certifications", ""))
        languages = parse_languages_section(sections.get("languages", ""))
        
        parsed_resume = ResumeParsedSchema(
            name=name,
            email=email,
            phone=phone,
            skills=skills,
            education=education,
            experience=experience,
            projects=projects,
            certifications=certifications,
            languages=languages
        )
        
        # 7. Post-parsing cleanup and validation
        cleaned_resume = cleanup_parsed_data(parsed_resume)
        return cleaned_resume

    except Exception as e:
        logger.error(f"Local rule-based resume parsing failure: {str(e)}")
        raise RuntimeError(f"Failed to parse resume locally: {str(e)}")
