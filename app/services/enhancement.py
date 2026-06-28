import logging
import google.generativeai as genai
from app.config import settings
import app.models as models
from typing import List, Dict, Any, Optional
from app.services.scoring import clean_fabricated_metrics

logger = logging.getLogger("app.services.enhancement")

# Configure google-generativeai client once on import if key is set
if settings.GEMINI_API_KEY:
    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
    except Exception as e:
        logger.error(f"Failed to configure google.generativeai client: {e}")

def generate_resume_enhancements_with_gemini(resume: models.Resume, jd_text: Optional[str] = None) -> Dict[str, Any]:
    """Generates professional rephrasings strictly grounded in parsed content using Gemini."""
    prompt = (
        "You are an expert resume polisher. You will receive parsed resume content.\n"
        "Your task is to generate:\n"
        "1. An improved professional summary.\n"
        "2. Polish bullet points for each work experience entry.\n"
        "3. Polish descriptions for each project.\n"
        "4. A list of 5 technical keyword suggestions that the candidate does not have but should consider.\n\n"
        "CRITICAL RULES:\n"
        "- NEVER invent, assume, or fabricate any numbers, percentages, dollar amounts, metrics, timelines, companies, or accomplishments (e.g., do NOT add things like '25% increase', 'zero-downtime', 'scaled to 1M users', 'saved $50k' if they are not in the source text).\n"
        "- Only improve readability, use strong action verbs (e.g. 'Developed', 'Optimized', 'Designed'), correct grammar, and format as bullet points.\n"
        "- Ground every suggestion STRICTLY in the provided experience/project descriptions.\n\n"
    )
    if jd_text:
        prompt += f"Target Job Description:\n{jd_text}\n\nAlign all improvements to align with the job description requirements while strictly preserving truth.\n\n"

    prompt += (
        f"Candidate Name: {resume.name or 'Candidate'}\n"
        f"Current Skills: {', '.join(resume.skills or [])}\n"
        f"Work Experience:\n"
    )
    for exp in (resume.experience or []):
        prompt += f"- Role: {exp.get('role')} at {exp.get('company')}\n  Description: {exp.get('description')}\n"
    prompt += "\nProjects:\n"
    for proj in (resume.projects or []):
        prompt += f"- Project: {proj.get('title')}\n  Description: {proj.get('description')}\n  Technologies: {', '.join(proj.get('technologies', []))}\n"
        
    prompt += (
        "\n\nReturn your response as a strict JSON object with this exact structure:\n"
        "{\n"
        "  \"improved_summary\": \"string\",\n"
        "  \"improved_experience\": [\n"
        "    {\n"
        "      \"role\": \"string\",\n"
        "      \"company\": \"string\",\n"
        "      \"original\": \"string\",\n"
        "      \"improved\": \"string (bullet points separated by newlines, using action verbs, no fabricated numbers)\"\n"
        "    }\n"
        "  ],\n"
        "  \"improved_projects\": [\n"
        "    {\n"
        "      \"title\": \"string\",\n"
        "      \"original\": \"string\",\n"
        "      \"improved\": \"string (grounded narrative, no fabricated numbers)\"\n"
        "    }\n"
        "  ],\n"
        "  \"keyword_suggestions\": [\"string\"]\n"
        "}"
    )

    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(
        prompt,
        generation_config={"response_mime_type": "application/json"}
    )
    import json
    data = json.loads(response.text)
    
    raw_text = resume.raw_text or ""
    if "improved_summary" in data:
        data["improved_summary"] = clean_fabricated_metrics(raw_text, data["improved_summary"])
        
    if "improved_experience" in data and isinstance(data["improved_experience"], list):
        for exp in data["improved_experience"]:
            orig = exp.get("original", "")
            imp = exp.get("improved", "")
            exp["improved"] = clean_fabricated_metrics(orig, imp)
            
    if "improved_projects" in data and isinstance(data["improved_projects"], list):
        for proj in data["improved_projects"]:
            orig = proj.get("original", "")
            imp = proj.get("improved", "")
            proj["improved"] = clean_fabricated_metrics(orig, imp)
            
    return data

def get_profession_defaults(detected_prof: str) -> dict:
    defaults = {
        "Nurse": {
            "role": "Registered Nurse",
            "skills": "patient care and clinical documentation",
            "summary_focus": "deliver high-quality patient care, coordinate treatments, and implement patient safety guidelines",
            "experience_focus": "patient care delivery and clinical workflow",
            "experience": [
                "Delivered high-quality patient care and managed clinical treatments.",
                "Collaborated with healthcare professionals to implement patient treatment plans.",
                "Maintained regulatory compliance with HIPAA and clinical care standards."
            ],
            "project_focus": "patient care initiative, implementing clinical protocols and tracking patient outcomes",
            "keywords": ["Patient Care", "Clinical Documentation", "EHR Systems (Epic/Cerner)", "HIPAA Compliance", "Triage & Assessment"]
        },
        "Teacher": {
            "role": "Educator",
            "skills": "classroom instruction and curriculum design",
            "summary_focus": "deliver classroom instruction, coordinate student assessments, and implement educational techniques",
            "experience_focus": "classroom management and instructional design",
            "experience": [
                "Delivered classroom instruction and managed student learning plans.",
                "Collaborated with education professionals to develop curriculum guidelines.",
                "Maintained student performance logs and assessed learning outcomes."
            ],
            "project_focus": "curriculum design initiative, implementing educational guidelines and tracking student engagement",
            "keywords": ["Curriculum Development", "Classroom Management", "Student Assessment", "Educational Technology", "Parent-Teacher Communication"]
        },
        "Accountant": {
            "role": "Accountant",
            "skills": "financial reporting and GAAP compliance",
            "summary_focus": "manage general ledger accounting, coordinate audits, and ensure compliance with GAAP guidelines",
            "experience_focus": "financial ledger maintenance and accounting accuracy",
            "experience": [
                "Managed general ledger balances and financial account reconciliations.",
                "Collaborated with finance teams to compile balance sheets and tax filings.",
                "Ensured compliance with GAAP standards and corporate tax codes."
            ],
            "project_focus": "financial auditing initiative, implementing reconciliation protocols and tracking variances",
            "keywords": ["GAAP Compliance", "General Ledger Accounting", "QuickBooks ERP", "Financial Reconciliation", "Tax Preparation"]
        },
        "Customer Service": {
            "role": "Customer Service Representative",
            "skills": "client support and CRM ticket resolution",
            "summary_focus": "resolve customer inquiries, coordinate support tickets, and implement customer satisfaction workflows",
            "experience_focus": "customer support operations and relationship management",
            "experience": [
                "Resolved customer inquiries and managed support ticket queues.",
                "Collaborated with operations teams to improve customer satisfaction ratings.",
                "Maintained accurate customer accounts database records using CRM systems."
            ],
            "project_focus": "support ticket optimization project, implementing resolution guidelines and tracking SLA compliance",
            "keywords": ["Customer Support", "Zendesk CRM", "Conflict Resolution", "Email & Phone Etiquette", "Helpdesk Ticketing"]
        },
        "Sales": {
            "role": "Sales Representative",
            "skills": "lead generation and pipeline management",
            "summary_focus": "generate sales leads, coordinate client accounts, and manage pipeline conversions",
            "experience_focus": "business development pipelines and client acquisition",
            "experience": [
                "Generated new business leads and maintained CRM client profiles.",
                "Collaborated with account teams to present sales pitches and close deals.",
                "Managed pipeline performance and exceeded sales targets."
            ],
            "project_focus": "CRM pipeline initiative, implementing outreach strategies and tracking conversions",
            "keywords": ["Lead Generation", "Salesforce CRM", "B2B Sales", "Negotiation", "Pipeline Management"]
        },
        "HR": {
            "role": "HR Specialist",
            "skills": "talent acquisition and employee onboarding",
            "summary_focus": "coordinate recruiting pipelines, manage onboarding tasks, and implement compliance procedures",
            "experience_focus": "personnel management and recruitment cycles",
            "experience": [
                "Coordinated talent acquisition processes and conducted candidate interviews.",
                "Collaborated with department heads to design employee onboarding plans.",
                "Maintained personnel records compliance with local labor guidelines."
            ],
            "project_focus": "onboarding system upgrade, implementing structured interviews and tracking retention metrics",
            "keywords": ["Talent Acquisition", "Applicant Tracking Systems (ATS)", "Onboarding & Offboarding", "Labor Law Compliance", "Employee Relations"]
        },
        "Marketing": {
            "role": "Marketing Specialist",
            "skills": "campaign optimization and digital advertising",
            "summary_focus": "design marketing campaigns, coordinate content delivery, and analyze conversion metrics",
            "experience_focus": "campaign conversions and marketing channels",
            "experience": [
                "Developed marketing campaigns and analyzed lead generation results.",
                "Collaborated with creative teams to design conversion layouts.",
                "Optimized multi-channel outreach strategies to maximize customer reach."
            ],
            "project_focus": "digital campaign project, implementing brand guidelines and tracking conversions",
            "keywords": ["SEO Optimization", "Google Analytics", "Email Campaigns", "Social Media Strategy", "Copywriting"]
        },
        "Hospitality": {
            "role": "Guest Services Agent",
            "skills": "guest relations and front desk operations",
            "summary_focus": "coordinate hotel reservations, manage guest inquiries, and resolve client conflicts",
            "experience_focus": "hospitality services and check-in workflows",
            "experience": [
                "Managed front desk operations and processed reservation bookings.",
                "Collaborated with service teams to coordinate special event schedules.",
                "Resolved guest service requests and maintained positive client relations."
            ],
            "project_focus": "guest experience program, implementing check-in procedures and tracking feedback scores",
            "keywords": ["Customer Service", "Guest Relations", "Reservation Systems", "Front Desk Operations", "Conflict Resolution"]
        },
        "Banking": {
            "role": "Personal Banker",
            "skills": "banking compliance and financial transactions",
            "summary_focus": "process financial transactions, coordinate loan applications, and manage account openings",
            "experience_focus": "financial services and customer compliance",
            "experience": [
                "Processed customer banking transactions and balanced cash registers.",
                "Collaborated with underwriting teams to verify loan application details.",
                "Maintained compliance with federal banking regulations and privacy laws."
            ],
            "project_focus": "banking compliance auditing project, implementing validation routines and tracking discrepancies",
            "keywords": ["Cash Handling", "Banking Compliance", "Cross-selling", "Loan Processing", "Financial Services"]
        },
        "Student/Fresher": {
            "role": "Intern",
            "skills": "project presentation and analytical research",
            "summary_focus": "contribute to research tasks, coordinate class assignments, and deliver project presentations",
            "experience_focus": "academic projects and analytical support",
            "experience": [
                "Assisted in technical research tasks and data collection.",
                "Collaborated with peers to compile team project deliverables.",
                "Delivered final presentations to course advisors and stakeholders."
            ],
            "project_focus": "student research project, compiling data points and presenting findings to classmates",
            "keywords": ["Teamwork", "Problem Solving", "Time Management", "Analytical Research", "MS Office"]
        },
        "General Professional": {
            "role": "Operations Coordinator",
            "skills": "project coordination and business operations",
            "summary_focus": "coordinate project timelines, manage operational tasks, and optimize standard office procedures",
            "experience_focus": "operational workflows and business organization",
            "experience": [
                "Coordinated project milestones and managed operational tasks.",
                "Collaborated with cross-functional partners to execute deliverables.",
                "Identified workflow bottlenecks and optimized standard business procedures."
            ],
            "project_focus": "business operations alignment project, implementing workflow tracking and monitoring deliverables",
            "keywords": ["Project Coordination", "Operations Support", "Office Administration", "Spreadsheet Modeling", "Stakeholder Communication"]
        },
        "Software Engineer": {
            "role": "Software Engineer",
            "skills": "modern software engineering practices",
            "summary_focus": "design software architectures, coordinate backend APIs, and implement system improvements",
            "experience_focus": "software development cycles and database maintenance",
            "experience": [
                "Contributed to core development and code maintenance.",
                "Collaborated with product teams to design features and resolve defects.",
                "Applied best practices in software design and source control."
            ],
            "project_focus": "system interface, implementing functional modules and testing dependencies to ensure software quality",
            "keywords": ["REST API Design", "Git Version Control", "Data Structures", "Algorithms", "Unit Testing"]
        },
        "Android Developer": {
            "role": "Android Developer",
            "skills": "mobile application development and Android SDK",
            "summary_focus": "design Android application layouts, coordinate mobile APIs, and implement mobile UX improvements",
            "experience_focus": "mobile software development cycles and app store deployment",
            "experience": [
                "Developed native Android applications using Kotlin and Java.",
                "Collaborated with product managers to design interactive user interfaces.",
                "Optimized app performance and reduced crash rates in production."
            ],
            "project_focus": "Android mobile app design, implementing material design and testing activity cycles",
            "keywords": ["Android SDK", "Kotlin", "Java", "Retrofit", "Jetpack Compose"]
        },
        "Data Analyst": {
            "role": "Data Analyst",
            "skills": "data visualization and statistical analysis",
            "summary_focus": "design data dashboards, coordinate ETL pipelines, and translate data into actionable insights",
            "experience_focus": "data cleaning, metrics definition, and report generation",
            "experience": [
                "Performed ad-hoc database queries and clean datasets for analysis.",
                "Collaborated with business units to build interactive dashboards and reports.",
                "Identified trends and delivered statistical insights to guide strategy."
            ],
            "project_focus": "data analysis initiative, cleaning datasets and building dashboard visualizations",
            "keywords": ["SQL Queries", "Tableau", "Power BI", "Data Cleaning", "Excel Analytics"]
        },
        "Business Analyst": {
            "role": "Business Analyst",
            "skills": "requirements gathering and business process mapping",
            "summary_focus": "analyze business processes, draft functional requirements, and coordinate stakeholders",
            "experience_focus": "business workflows and user acceptance testing",
            "experience": [
                "Gathered business requirements and translated them into functional specifications.",
                "Collaborated with technical teams and business stakeholders to align goals.",
                "Conducted gap analysis and mapped standard operational procedures."
            ],
            "project_focus": "business process mapping project, documenting workflows and tracking user requirements",
            "keywords": ["Requirements Gathering", "Process Mapping", "SQL Basics", "Agile Methodologies", "User Stories"]
        },
        "Graphic Designer": {
            "role": "Graphic Designer",
            "skills": "visual design and brand identity",
            "summary_focus": "design visual assets, coordinate brand campaigns, and implement creative layouts",
            "experience_focus": "creative workflows and digital design assets",
            "experience": [
                "Created digital designs, icons, and illustrations for marketing campaigns.",
                "Collaborated with creative directors to align with brand guidelines.",
                "Polished user interface wireframes and visual design prototypes."
            ],
            "project_focus": "brand redesign initiative, creating layouts and optimizing digital assets",
            "keywords": ["Adobe Photoshop", "Adobe Illustrator", "Figma", "UI/UX Design", "Typography"]
        }
    }
    
    return defaults.get(detected_prof, defaults["General Professional"])

def generate_resume_enhancements_local(resume: models.Resume, jd_text: Optional[str] = None) -> Dict[str, Any]:
    """Generates local rephrasings strictly grounded in parsed content."""
    from typing import Optional
    detected_prof = getattr(resume, "profession", "General Professional") or "General Professional"
    prof_defaults = get_profession_defaults(detected_prof)
    
    # 1. Professional Summary
    first_role = prof_defaults["role"]
    first_company = ""
    if resume.experience and len(resume.experience) > 0:
        first_role = resume.experience[0].get("role") or prof_defaults["role"]
        first_company = resume.experience[0].get("company") or ""

    skills_snippet = prof_defaults["skills"]
    if resume.skills and len(resume.skills) > 0:
        skills_snippet = ", ".join(resume.skills[:3])

    if first_company:
        improved_summary = (
            f"Detail-oriented {first_role} with hands-on experience at {first_company}. "
            f"Proficient in leveraging {skills_snippet} to {prof_defaults['summary_focus']}. "
            f"Skilled in collaborating with cross-functional partners, solving operational challenges, "
            f"and coordinating workflows to support key organizational objectives."
        )
    else:
        improved_summary = (
            f"Detail-oriented {first_role} with professional industry experience. "
            f"Proficient in leveraging {skills_snippet} to {prof_defaults['summary_focus']}. "
            f"Skilled in collaborating with cross-functional partners, solving operational challenges, "
            f"and coordinating workflows to support key organizational objectives."
        )

    # 2. Experience Bullets (polishing sentences, no invented numbers/metrics)
    improved_experience = []
    for exp in (resume.experience or []):
        role = exp.get("role") or prof_defaults["role"]
        company = exp.get("company") or "Company"
        orig_desc = exp.get("description") or ""

        polished_bullets = []
        sentences = [s.strip() for s in orig_desc.splitlines() if s.strip()]
        if not sentences:
            sentences = [s.strip() for s in orig_desc.split(".") if s.strip()]
            
        for s in sentences:
            s_clean = s.strip().lstrip("-*•o+ ").strip()
            if not s_clean:
                continue
            words = s_clean.split()
            first_word = words[0].lower() if words else ""
            action_verbs_set = {"developed", "designed", "implemented", "managed", "spearheaded", "built", "engineered", "optimized", "led", "created", "collaborated", "wrote", "tested", "coordinated", "delivered", "provided", "assisted", "monitored"}
            if first_word not in action_verbs_set and len(words) > 1:
                s_clean = s_clean[0].upper() + s_clean[1:]
            
            polished_bullets.append(s_clean)
            
        if not polished_bullets:
            polished_bullets = [
                f"Contributed to core tasks and {prof_defaults['experience_focus']} as a {role} at {company}.",
                "Collaborated with project partners to execute key milestones.",
                "Applied industry standards and best practices to ensure high-quality delivery."
            ]
            
        imp_desc = "\n".join(f"• {b}" for b in polished_bullets[:4])
        
        improved_experience.append({
            "role": role,
            "company": company,
            "original": orig_desc,
            "improved": imp_desc
        })

    # 3. Project Enhancements
    improved_projects = []
    for proj in (resume.projects or []):
        title = proj.get("title") or "Project"
        orig_desc = proj.get("description") or ""
        techs = proj.get("technologies") or []
        tech_str = f" utilizing {', '.join(techs)}" if techs else ""

        proj_sentences = [s.strip() for s in orig_desc.split(".") if s.strip()]
        if proj_sentences:
            imp_desc = f"Coordinated the {title} initiative{tech_str}. " + ". ".join(proj_sentences) + "."
        else:
            imp_desc = f"Designed and managed the {title} initiative{tech_str}, implementing functional modules and tracking metrics to ensure quality outcomes."

        improved_projects.append({
            "title": title,
            "original": orig_desc,
            "improved": imp_desc
        })

    keyword_suggestions = prof_defaults["keywords"]
    if jd_text:
        try:
            from app.services.matcher import extract_jd_keywords
            _, jd_keys = extract_jd_keywords(jd_text)
            c_skills_lower = [s.lower() for s in (resume.skills or [])]
            extra_keywords = [k for k in jd_keys if k.lower() not in c_skills_lower]
            if extra_keywords:
                keyword_suggestions = extra_keywords[:5]
        except Exception:
            pass
    elif resume.skills:
        c_skills_lower = [s.lower() for s in resume.skills]
        keyword_suggestions = [ks for ks in keyword_suggestions if ks.lower() not in c_skills_lower]

    return {
        "improved_summary": improved_summary,
        "improved_experience": improved_experience,
        "improved_projects": improved_projects,
        "keyword_suggestions": keyword_suggestions
    }

def generate_resume_enhancements(resume: models.Resume, jd_text: Optional[str] = None) -> Dict[str, Any]:
    """Generates side-by-side resume improvement suggestions without faking metrics."""
    if settings.GEMINI_API_KEY:
        try:
            return generate_resume_enhancements_with_gemini(resume, jd_text)
        except Exception as e:
            logger.warning(f"Gemini resume enhancement failed, falling back to local: {e}")
            return generate_resume_enhancements_local(resume, jd_text)
    else:
        return generate_resume_enhancements_local(resume, jd_text)
