import logging
import json
import re
import google.generativeai as genai
from typing import List, Dict, Any, Optional

from app.config import settings
import app.models as models
from app.schemas import ATSAnalysisSchema, JobRoleMatchSchema, InterviewQuestion2Schema, InterviewPrepSchema
from app.services.parser import segment_sections, extract_skills_from_text
from app.services.industry_data import INDUSTRY_DATA_MAP

logger = logging.getLogger("app.services.scoring")

PROFESSION_ROLES_SKILLS_MAP = {
    "Software Engineer": {
        "Software Engineer": ["Python", "Java", "C++", "C#", "SQL", "Git", "Data Structures", "Algorithms", "System Design", "Unit Testing"],
        "Frontend Developer": ["React", "Next.js", "TypeScript", "JavaScript", "HTML", "CSS", "Tailwind CSS", "Redux", "GraphQL", "Bootstrap"],
        "Backend Developer": ["Python", "FastAPI", "Django", "Java", "Spring Boot", "Go", "PostgreSQL", "MySQL", "REST APIs", "SQL"],
        "Full Stack Developer": ["React", "Node.js", "JavaScript", "TypeScript", "Python", "SQL", "HTML", "CSS", "REST APIs", "Git"],
        "DevOps Engineer": ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform", "Jenkins", "Git", "Linux", "Nginx", "Ansible"]
    },
    "Android Developer": {
        "Android Developer": ["Kotlin", "Java", "Android SDK", "Jetpack Compose", "Retrofit", "Git", "Android Studio", "Gradle", "Coroutines", "MVVM"],
        "Mobile Application Developer": ["Swift", "Kotlin", "Java", "React Native", "Flutter", "Objective-C", "Git", "REST APIs", "Android", "iOS"],
        "iOS Developer": ["Swift", "Objective-C", "Xcode", "UIKit", "SwiftUI", "CocoaPods", "CoreData", "Git", "REST APIs", "iOS SDK"],
        "Mobile UI Engineer": ["Figma", "Android SDK", "Jetpack Compose", "SwiftUI", "UI/UX", "Material Design", "Human Interface Guidelines", "Kotlin", "Swift"],
        "Mobile Architect": ["System Design", "Kotlin", "Swift", "REST APIs", "Clean Architecture", "MVVM", "CI/CD", "Android SDK", "iOS SDK", "Git"]
    },
    "Data Analyst": {
        "Data Analyst": ["SQL", "Python", "Excel", "Tableau", "Power BI", "Statistics", "Data Cleaning", "Pandas", "R", "A/B Testing"],
        "Business Intelligence Analyst": ["Tableau", "Power BI", "SQL", "Data Warehousing", "ETL", "Data Modeling", "Excel", "Dashboards", "KPIs", "Business Analysis"],
        "Reporting Analyst": ["Excel", "SQL", "VBA", "Power BI", "Reporting", "Data Analysis", "KPIs", "Access", "SharePoint", "Word"],
        "Data Visualization Specialist": ["Tableau", "Power BI", "D3.js", "Python", "SQL", "Dashboards", "Graphic Design", "UI/UX", "Excel", "Data Storytelling"],
        "Quantitative Analyst": ["Python", "R", "SQL", "Mathematics", "Statistics", "Time Series", "Machine Learning", "Excel", "Pandas", "Matplotlib"]
    },
    "Business Analyst": {
        "Business Analyst": ["Requirements Gathering", "SQL", "Agile", "Scrum", "JIRA", "Process Mapping", "User Stories", "UML", "SDLC", "Tableau"],
        "Agile Business Analyst": ["Agile", "Scrum", "JIRA", "User Stories", "Product Backlog", "Sprint Planning", "Requirements Gathering", "Confluence", "SQL"],
        "Systems Analyst": ["SQL", "UML", "System Architecture", "Requirements Gathering", "SDLC", "Databases", "Data Flow", "APIs", "Agile", "JIRA"],
        "Product Analyst": ["SQL", "Tableau", "Product Analytics", "User Analytics", "Google Analytics", "A/B Testing", "Excel", "Requirements Gathering", "Agile"],
        "Operations Analyst": ["Process Improvement", "Excel", "SQL", "KPIs", "Data Analysis", "Process Mapping", "Visio", "Tableau", "Project Coordination", "Report Writing"]
    },
    "Customer Service": {
        "Customer Service Representative": ["Customer Support", "Communication", "CRM Tools", "Active Listening", "Problem Solving", "Phone Etiquette", "Email Support", "MS Office", "Data Entry", "Conflict Resolution"],
        "Customer Support Specialist": ["Zendesk", "Customer Support", "Troubleshooting", "CRM Tools", "Helpdesk Tickets", "Communication", "Live Chat", "Email Support", "SLA Management", "Technical Support"],
        "Client Services Coordinator": ["Client Relations", "Communication", "Project Coordination", "CRM Tools", "Scheduling", "Email Support", "Problem Solving", "MS Office", "Account Management"],
        "Call Center Agent": ["Phone Etiquette", "Communication", "Active Listening", "Multi-tasking", "Customer Support", "Data Entry", "Conflict Resolution", "CRM Tools", "Problem Solving", "Inbound Calls"],
        "Help Desk Support": ["Technical Support", "Troubleshooting", "Helpdesk Tickets", "Zendesk", "Active Directory", "Windows OS", "Communication", "Customer Support", "Hardware", "Network Basics"]
    },
    "HR": {
        "HR Generalist": ["Labor Laws", "HRIS Setup", "Employee Relations", "Onboarding", "Compliance", "Benefits Administration", "Recruiting", "Performance Management", "Payroll", "MS Office"],
        "Corporate Recruiter": ["Greenhouse ATS", "Sourcing", "Interviewing", "Applicant Tracking Systems", "LinkedIn Recruiter", "Candidate Experience", "Talent Acquisition", "Negotiation", "Networking", "Communication"],
        "Talent Acquisition Specialist": ["Negotiation", "Sourcing Tools", "Talent Acquisition", "Employer Branding", "Interviewing", "Greenhouse ATS", "LinkedIn Recruiter", "Applicant Tracking Systems", "ATS Systems", "Communication"],
        "HR Manager": ["Employee Relations", "Conflict Resolution", "HR Strategy", "Compliance", "Performance Management", "Leadership", "HRIS", "Onboarding", "Policy Development", "Recruiting"],
        "Learning & Development Coordinator": ["Course Design", "Onboarding", "Training Delivery", "LMS", "Employee Development", "Communication", "Event Planning", "Instructional Design", "Presentation Skills"]
    },
    "Marketing": {
        "Marketing Specialist": ["SEO", "Content Strategy", "Google Analytics", "Email Marketing", "Social Media Marketing", "Copywriting", "HubSpot", "Brand Management", "A/B Testing", "Campaign Optimization"],
        "Marketing Manager": ["A/B Testing", "CRM Automation", "Campaign Management", "Marketing Strategy", "Google Analytics", "Budget Management", "Content Strategy", "SEO", "Email Marketing", "Brand Management"],
        "Digital Strategist": ["GA4 Analytics", "SEO Strategy", "Digital Marketing", "PPC", "Social Media Marketing", "Content Strategy", "Google Ads", "Conversion Rate Optimization", "Email Marketing", "Copywriting"],
        "Content Marketing Lead": ["Copywriting", "Branding", "Content Strategy", "SEO", "Blogging", "Social Media", "Editing", "Content Creation", "WordPress", "Email Campaigns"],
        "Social Media Manager": ["Ad Campaigns", "Buffer", "Social Media Strategy", "Content Creation", "Community Management", "Analytics", "Copywriting", "Graphic Design", "Canva", "Video Editing"]
    },
    "Teacher": {
        "Teacher": ["Lesson Planning", "Classroom Management", "Curriculum Design", "Student Assessment", "Communication", "Parent-Teacher Relations", "Differentiated Instruction", "Pedagogy", "Educational Technology", "Child Development"],
        "Educator": ["Curriculum Development", "Student Engagement", "Classroom Management", "Instructional Strategies", "Educational Assessment", "Communication", "Differentiated Instruction", "Tutoring", "Subject Matter Expertise", "Pedagogy"],
        "Tutor": ["Tutoring", "One-on-One Instruction", "Academic Support", "Subject Matter Expertise", "Study Skills", "Student Assessment", "Communication", "Lesson Planning", "Test Preparation", "Patience"],
        "Curriculum Developer": ["Curriculum Design", "Instructional Design", "Educational Technology", "Learning Objectives", "Assessment Creation", "Content Writing", "Educational Research", "Standards Alignment", "Communication"],
        "Special Education Teacher": ["IEPs", "Differentiated Instruction", "Special Education", "Classroom Management", "Behavioral Intervention", "Student Assessment", "Collaboration", "Communication", "Assistive Technology", "Patience"]
    },
    "Nurse": {
        "Registered Nurse (RN)": ["Patient Care", "CPR", "EHR", "Medication Administration", "Vital Signs", "Triage", "Clinical Assessments", "Patient Education", "Wound Care", "HIPAA Compliance"],
        "Clinical Coordinator": ["HIPAA Codes", "Epic EHR", "Patient Care", "Clinical Operations", "Scheduling", "Staff Coordination", "Quality Assurance", "Compliance", "EHR Systems", "Communication"],
        "Nurse Manager": ["Ward Staffing", "Triages", "Leadership", "Patient Care", "Budgeting", "Compliance", "Employee Relations", "Epic EHR", "Conflict Resolution", "Quality Management"],
        "ICU Nurse": ["Patient Care", "Critical Care", "Vital Signs", "Medication Administration", "EHR", "Patient Assessment", "Emergency Response", "Ventilator Management", "CPR", "HIPAA Compliance"],
        "Emergency Room Nurse": ["Triage", "Patient Care", "Emergency Medicine", "CPR", "EHR", "Trauma Care", "Medication Administration", "Clinical Assessments", "HIPAA Compliance", "Vital Signs"]
    },
    "Accountant": {
        "Accountant": ["General Ledger", "GAAP", "QuickBooks", "Tax Preparation", "Financial Auditing", "Account Reconciliation", "Financial Statements", "Excel", "Accounts Payable", "Cost Accounting"],
        "Senior Accountant": ["GAAP", "General Ledger", "Financial Statements", "Account Reconciliation", "Financial Auditing", "Excel", "QuickBooks", "Tax Compliance", "Financial Analysis", "Leadership"],
        "Staff Accountant": ["General Ledger", "Account Reconciliation", "Accounts Payable", "Accounts Receivable", "QuickBooks", "Excel", "GAAP", "Data Entry", "Financial Statements", "Journal Entries"],
        "Tax Accountant": ["Tax Preparation", "Tax Compliance", "GAAP", "QuickBooks", "IRS Regulations", "Tax Filing", "Excel", "Financial Statements", "Account Reconciliation", "Auditing"],
        "Auditor": ["Financial Auditing", "Internal Controls", "GAAP", "Compliance", "Risk Assessment", "Account Reconciliation", "Financial Statements", "Excel", "Audit Reports", "Detail Oriented"]
    },
    "Graphic Designer": {
        "Graphic Designer": ["Photoshop", "Illustrator", "InDesign", "Figma", "Typography", "Visual Design", "Branding", "Layout Design", "Wireframing", "Adobe Creative Suite"],
        "UI/UX Designer": ["Figma", "Wireframing", "User Research", "Prototyping", "UI/UX", "Visual Design", "Typography", "Information Architecture", "Usability Testing", "Interaction Design", "Responsive Design"],
        "Visual Designer": ["Photoshop", "Illustrator", "Branding", "Typography", "Visual Design", "Layout Design", "Adobe Creative Suite", "Figma", "Color Theory", "Vector Illustration", "Digital Painting"],
        "Brand Designer": ["Branding", "Logo Design", "Typography", "Visual Identity", "Illustrator", "Photoshop", "InDesign", "Style Guides", "Marketing Collateral", "Graphic Design"],
        "Illustrator": ["Drawing", "Vector Illustration", "Photoshop", "Illustrator", "Character Design", "Branding", "Visual Design", "Typography", "Digital Painting", "Concept Art"]
    },
    "Sales": {
        "Sales Representative": ["Lead Generation", "CRM", "Salesforce", "Sales Pitching", "Negotiation", "Customer Relationship Management", "Cold Calling", "Pipeline Management", "Closing Deals", "B2B Sales"],
        "Account Executive": ["Salesforce", "Sales Strategy", "Account Management", "Negotiation", "B2B Sales", "Client Relations", "Pipeline Management", "Closing Deals", "Lead Qualification", "Product Demos"],
        "Business Development Representative": ["Lead Generation", "Cold Calling", "Salesforce", "Email Outreach", "Sales Pitching", "Market Research", "Negotiation", "CRM", "B2B Sales", "LinkedIn Sourcing"],
        "Sales Manager": ["Sales Strategy", "Leadership", "Pipeline Management", "CRM", "Salesforce", "Negotiation", "Target Achievement", "Sales Training", "Account Management", "B2B Sales"],
        "Account Manager": ["Account Management", "Client Relations", "Customer Success", "Upselling", "Salesforce", "CRM", "Negotiation", "Communication", "Retention", "B2B Sales"]
    },
    "Hospitality": {
        "Hospitality Manager": ["Customer Service", "Front Desk Operations", "Guest Relations", "Event Planning", "Hotel Management", "Point of Sale (POS)", "Reservation Systems", "Conflict Resolution", "Team Coordination", "Food & Beverage"],
        "Front Desk Receptionist": ["Customer Service", "Front Desk Operations", "Guest Relations", "Scheduling", "Phone Etiquette", "Reservation Systems", "Data Entry", "MS Office", "Multi-tasking", "Communication"],
        "Guest Services Agent": ["Customer Service", "Guest Relations", "Front Desk Operations", "Reservation Systems", "Conflict Resolution", "Communication", "Problem Solving", "Point of Sale (POS)", "Multi-tasking", "Check-in/Check-out"],
        "Restaurant Manager": ["Food & Beverage", "Staff Scheduling", "Inventory Management", "Customer Service", "Point of Sale (POS)", "Team Leadership", "Conflict Resolution", "Budgeting", "Food Safety", "Guest Relations"],
        "Hotel Coordinator": ["Hotel Management", "Reservation Systems", "Guest Relations", "Event Planning", "Scheduling", "Team Coordination", "Customer Service", "Front Desk Operations", "Communication", "Administrative Support"]
    },
    "Banking": {
        "Teller": ["Cash Handling", "Customer Service", "Banking Transactions", "Data Entry", "Banking Compliance", "Cross-selling", "Communication", "Detail Oriented", "Math Skills", "Balance Sheet"],
        "Personal Banker": ["Financial Services", "Customer Service", "Banking Compliance", "Cross-selling", "Loan Processing", "Credit Analysis", "Account Opening", "Relationship Management", "Wealth Management", "Financial Analysis"],
        "Loan Officer": ["Loan Processing", "Credit Analysis", "Underwriting", "Banking Compliance", "Customer Service", "Salesforce", "Financial Analysis", "Risk Assessment", "Mortgage Lending", "Communication"],
        "Financial Advisor": ["Wealth Management", "Financial Analysis", "Investment Strategy", "Customer Service", "Risk Assessment", "Portfolio Management", "Banking Compliance", "Retirement Planning", "Financial Planning", "Cross-selling"],
        "Credit Analyst": ["Credit Analysis", "Risk Assessment", "Financial Statements", "Banking Compliance", "Excel", "Data Analysis", "Underwriting", "Loan Processing", "GAAP", "Commercial Lending"]
    },
    "Student/Fresher": {
        "Intern": ["Teamwork", "Problem Solving", "Communication", "Time Management", "Adaptability", "Research", "Project Presentation", "MS Office", "Analytical Skills", "Technical Aptitude"],
        "Entry Level Associate": ["Communication", "Teamwork", "MS Office", "Problem Solving", "Time Management", "Research", "Adaptability", "Reporting", "Analytical Skills", "Data Entry"],
        "Junior Assistant": ["Office Administration", "Scheduling", "MS Office", "Data Entry", "Communication", "Teamwork", "Problem Solving", "Time Management", "Reporting", "Document Management"],
        "Graduate Trainee": ["Research", "Analytical Skills", "Presentation Skills", "Teamwork", "Problem Solving", "Communication", "Adaptability", "MS Office", "Project Coordination", "Time Management"],
        "Research Assistant": ["Research", "Data Collection", "Data Analysis", "Report Writing", "MS Office", "Analytical Skills", "Detail Oriented", "Communication", "Time Management", "Teamwork"]
    },
    "General Professional": {
        "Project Coordinator": ["Project Coordination", "Operations Support", "MS Office", "Office Administration", "Communication", "Problem Solving", "Scheduling", "Reporting", "Stakeholder Communication", "Time Management"],
        "Operations Associate": ["Operations Support", "Process Mapping", "Excel", "Asana", "Project Coordination", "Communication", "Problem Solving", "KPIs", "Reporting", "Customer Support"],
        "Office Administrator": ["Office Administration", "Scheduling", "MS Office", "Communication", "Data Entry", "Problem Solving", "Time Management", "Customer Service", "Record Keeping", "Billing"],
        "Business Associate": ["Communication", "Problem Solving", "Data Analysis", "Excel", "Project Coordination", "Reporting", "MS Office", "Stakeholder Communication", "Teamwork", "Research"],
        "Executive Assistant": ["Scheduling", "Travel Coordination", "MS Office", "Communication", "Calendar Management", "Office Administration", "Problem Solving", "Confidentiality", "Reporting", "Time Management"]
    }
}


def enrich_ats_report_with_gemini(resume: models.Resume, base_data: dict) -> dict:
    """
    Enriches the base ATS scores and parsed resume with premium career intelligence from ReportGenerator.
    """
    from app.services.ai_engine import ReportGenerator
    
    resume_data = {
        "name": resume.name,
        "email": resume.email,
        "phone": resume.phone,
        "summary": resume.summary,
        "profession": getattr(resume, "profession", "General Professional") or "General Professional",
        "industry": getattr(resume, "industry", "General Business") or "General Business",
        "seniority": getattr(resume, "seniority", "Mid") or "Mid",
        "experience_level": getattr(resume, "experience_level", "1-3 Years") or "1-3 Years",
        "skills": resume.skills or [],
        "education": resume.education or [],
        "experience": resume.experience or [],
        "projects": resume.projects or [],
        "certifications": resume.certifications or []
    }
    
    try:
        return ReportGenerator.generate_full_report(resume_data, base_data)
    except Exception as e:
        logger.error(f"ReportGenerator.generate_full_report failed: {str(e)}")
        # Fall back to local enrichment if generator fails
        return enrich_ats_report_local(resume, base_data)


def clean_fabricated_metrics(original_desc: str, improved_desc: str) -> str:
    """
    Ensures no new numbers, percentages, or dollar metrics are introduced in the improved description.
    """
    if not improved_desc:
        return improved_desc
    if not original_desc:
        improved_desc = re.sub(r'\b\d+%\b|\b\d+\s*(?:percent|%)\b', "", improved_desc, flags=re.IGNORECASE)
        improved_desc = re.sub(r'\$\d+|\b\d+\s*(?:usd|dollars|million|billion)\b', "", improved_desc, flags=re.IGNORECASE)
        improved_desc = re.sub(r'\b\d{2,}\b', "", improved_desc)
        return improved_desc

    orig_nums = set(re.findall(r'\b\d+\b', original_desc))
    improved_sentences = improved_desc.splitlines()
    cleaned_sentences = []
    
    for sent in improved_sentences:
        sent_clean = sent
        sent_nums = re.findall(r'\b\d+\b', sent_clean)
        has_new_num = False
        for num in sent_nums:
            if num not in orig_nums and int(num) > 5:
                has_new_num = True
                break
                
        has_new_pct = ('%' in sent_clean or 'percent' in sent_clean.lower()) and not ('%' in original_desc or 'percent' in original_desc.lower())
        has_new_dlr = ('$' in sent_clean or 'usd' in sent_clean.lower() or 'dollar' in sent_clean.lower()) and not ('$' in original_desc or 'usd' in original_desc.lower() or 'dollar' in original_desc.lower())
        
        if has_new_num or has_new_pct or has_new_dlr:
            sent_clean = re.sub(r'\b\d+%\b|\b\d+\s*(?:percent|%)\b', "", sent_clean, flags=re.IGNORECASE)
            sent_clean = re.sub(r'\$\d+|\b\d+\s*(?:usd|dollars|million|billion)\b', "", sent_clean, flags=re.IGNORECASE)
            words = sent_clean.split()
            filtered_words = []
            for w in words:
                digit_match = re.search(r'\d+', w)
                if digit_match:
                    num_val = digit_match.group(0)
                    if num_val not in orig_nums and int(num_val) > 5:
                        continue
                filtered_words.append(w)
            sent_clean = " ".join(filtered_words)
            
        cleaned_sentences.append(sent_clean)
        
    return "\n".join(cleaned_sentences)

def classify_resume_industry(resume: models.Resume) -> str:
    text_lower = (resume.raw_text or "").lower()
    skills_lower = [s.lower() for s in (resume.skills or [])]
    
    tech_keywords = ["python", "javascript", "typescript", "java", "c++", "c#", "go", "rust", "react", "fastapi", "django", "aws", "docker", "kubernetes", "devops", "cloud", "software engineer", "developer", "backend", "frontend", "sql", "git", "linux", "mongodb", "postgresql", "mysql", "redis", "next.js", "node.js"]
    tech_score = sum(1 for kw in tech_keywords if kw in text_lower) + sum(3 for kw in tech_keywords if kw in skills_lower)
    
    pm_keywords = ["product manager", "project manager", "agile", "scrum", "scrum master", "jira", "sprint", "roadmap", "stakeholder", "backlog", "user stories", "prd", "program manager", "product owner", "capm", "pmp", "asana", "trello"]
    pm_score = sum(1 for kw in pm_keywords if kw in text_lower) + sum(3 for kw in pm_keywords if kw in skills_lower)
    
    marketing_keywords = ["marketing", "sales", "seo", "sem", "adwords", "campaign", "copywriter", "email marketing", "hubspot", "salesforce", "conversion", "leads", "revenue", "brand manager", "customer success", "market research", "cold call", "branding"]
    marketing_score = sum(1 for kw in marketing_keywords if kw in text_lower) + sum(3 for kw in marketing_keywords if kw in skills_lower)
    
    finance_keywords = ["accounting", "finance", "audit", "tax", "budget", "ledger", "quickbooks", "excel", "financial analyst", "risk manager", "controller", "cpa", "cfa", "modeling", "bookkeeping", "treasury"]
    finance_score = sum(1 for kw in finance_keywords if kw in text_lower) + sum(3 for kw in finance_keywords if kw in skills_lower)
    
    hr_keywords = ["recruiting", "hr", "talent", "hiring", "onboarding", "employee relations", "benefits", "compensation", "shrm", "hris", "workday", "greenhouse", "payroll", "personnel"]
    hr_score = sum(1 for kw in hr_keywords if kw in text_lower) + sum(3 for kw in hr_keywords if kw in skills_lower)
    
    healthcare_keywords = ["clinical", "medical", "healthcare", "patient", "nursing", "nurse", "doctor", "laboratory", "pharmacy", "hipaa", "epic", "cerner", "hospital", "clinic"]
    healthcare_score = sum(1 for kw in healthcare_keywords if kw in text_lower) + sum(3 for kw in healthcare_keywords if kw in skills_lower)
    
    scores = {
        "Tech": tech_score,
        "Management": pm_score,
        "Marketing": marketing_score,
        "Finance": finance_score,
        "HR": hr_score,
        "Healthcare": healthcare_score
    }
    
    best_industry = max(scores, key=lambda k: scores[k])
    if scores[best_industry] == 0:
        return "General"
    return best_industry

def enrich_ats_report_local(resume: models.Resume, base_data: dict) -> dict:
    """
    High-fidelity rule-based career intelligence generator serving as a fallback.
    Categorizes the candidate dynamically and drafts highly tailored recruiter-grade content.
    """
    detected_profession = getattr(resume, "profession", None)
    detected_industry = getattr(resume, "industry", None)
    detected_seniority = getattr(resume, "seniority", None)
    detected_experience_level = getattr(resume, "experience_level", None)
    detected_objective = getattr(resume, "career_objective", None)

    if detected_profession:
        profession_to_old_industry = {
            "Software Engineer": "Tech",
            "Android Developer": "Tech",
            "Data Analyst": "Tech",
            "Business Analyst": "Management",
            "Customer Service": "General",
            "HR": "HR",
            "Marketing": "Marketing",
            "Teacher": "General",
            "Nurse": "Healthcare",
            "Accountant": "Finance",
            "Graphic Designer": "General",
            "Sales": "Marketing",
            "Hospitality": "General",
            "Banking": "Finance",
            "Student/Fresher": "General",
            "General Professional": "General"
        }
        mapped_old_ind = profession_to_old_industry.get(detected_profession, "General")
        ind_data = INDUSTRY_DATA_MAP.get(mapped_old_ind, INDUSTRY_DATA_MAP["General"])
        
        primary_title = detected_profession
        roles_raw = ind_data["roles_list"]
        
        career_level = detected_seniority or "Mid Level"
        industry_classification = detected_industry or "General Business"
        experience_level = detected_experience_level or "1-3 Years"
        candidate_profile = f"{career_level} specializing in {industry_classification}"
    else:
        industry = classify_resume_industry(resume)
        ind_data = INDUSTRY_DATA_MAP.get(industry, INDUSTRY_DATA_MAP["General"])
        
        primary_title = ind_data["primary_title"]
        roles_raw = ind_data["roles_list"]

        # Calculate career level and experience level locally
        titles_lower = [str(e.get("role", "")).lower() for e in (resume.experience or [])]
        if not titles_lower:
            career_level = "Entry Level"
            experience_level = "Fresher"
        else:
            num_roles = len(titles_lower)
            if num_roles == 1:
                experience_level = "Fresher" if not resume.experience[0].get("description") else "1-3 Years"
            elif num_roles == 2:
                experience_level = "1-3 Years"
            else:
                experience_level = "5+ Years"

            is_exec = any(any(kw in t for kw in ["director", "vp", "chief", "executive", "head", "president"]) for t in titles_lower)
            is_sr = any(any(kw in t for kw in ["senior", "lead", "principal", "architect", "sr.", "manager"]) for t in titles_lower)
            
            if is_exec:
                career_level = "Executive"
            elif is_sr:
                career_level = "Senior Level"
            else:
                career_level = "Entry Level" if num_roles <= 1 else "Mid Level"

        industry_map = {
            "Tech": "Software Development",
            "Management": "Product Management & Operations",
            "Marketing": "Marketing & Sales",
            "Finance": "Finance & Accounting",
            "HR": "Human Resources",
            "Healthcare": "Healthcare & Medicine",
            "General": "General Business"
        }
        industry_classification = industry_map.get(industry, "General Business")
        candidate_profile = f"{career_level} specializing in {industry_classification}"
        
    total_score = base_data.get("ats_score", 0)
    if total_score >= 90:
        readiness_level = "Interview Ready"
    elif total_score >= 75:
        readiness_level = "Strong Candidate"
    elif total_score >= 60:
        readiness_level = "Competitive"
    elif total_score >= 45:
        readiness_level = "Developing"
    else:
        readiness_level = "Beginner"

    # Category Justifications
    contact_reason = "Contact details are incomplete. Make sure to link your GitHub and LinkedIn profiles." if len(base_data.get("deductions", [])) > 0 and any("Contact" in d for d in base_data.get("deductions", [])) else "All critical contact credentials, including email, phone, and professional profile links, are complete."
    summary_reason = "Professional summary is generic or too brief. Enhance it with target keywords and a high-impact intro." if base_data.get("summary_score", 0) < 8 else "Professional summary is structured well, using appropriate action verbs."
    skills_reason = f"Low skill density ({len(resume.skills or [])} tools listed). Target 10+ standard technical skills to pass filters." if base_data.get("skills_score", 0) < 8 else "Skill keywords are well represented across target domains."
    experience_reason = "Experience section lacks measurable metrics (percentages, savings) or uses passive phrasing." if base_data.get("experience_score", 0) < 8 else "Experience entries outline responsibilities and projects, using action verbs."
    projects_reason = "Projects section is thin or missing. Include at least 2-3 detailed project showcases." if base_data.get("projects_score", 0) < 8 else "Representative projects are listed, outlining technical application and tools."
    education_reason = "Academic records are incomplete or missing degree information." if base_data.get("education_score", 0) < 8 else "Educational background is fully outlined with degrees and dates."
    certifications_reason = "No certifications found. Consider obtaining industry certificates to validate upskilling." if base_data.get("certifications_score", 0) < 8 else "Continuous learning is verified through the listed certifications."
    formatting_reason = "Resume length is suboptimal or section demarcations are cluttered." if base_data.get("formatting_score", 0) < 8 else "Clean document density, header margins, and formatting structure."
    keyword_reason = "Missing key industry tools and matching domain keywords." if base_data.get("keyword_score", 0) < 8 else "Excellent match rate against standard target job profiles."

    top_matching_roles = []
    for role, match_score, gaps, diff, sal in roles_raw:
        top_matching_roles.append({
            "role": role,
            "match_score": match_score,
            "skill_gaps": gaps,
            "learning_roadmap": [f"Complete training or build projects using {g} to build {role} capacity." for g in gaps[:2]],
            "expected_salary": sal,
            "difficulty": diff
        })

    candidate_name = resume.name or "Candidate Name"
    skills_list = resume.skills[:4] if resume.skills else ["Professional skills"]
    skills_str = ", ".join(skills_list)
    
    if detected_objective:
        improved_summary = detected_objective
    else:
        improved_summary = (
            f"Detail-oriented and results-driven {primary_title} with a proven track record of professional delivery. "
            f"Skilled in leveraging {skills_str} to drive performance, streamline workflows, and coordinate team efforts. "
            f"Passionate about continuous upskilling, solving complex operational challenges, and collaborating across "
            f"functional boundaries to deliver high-quality project outcomes."
        )

    improved_experience = []
    for exp in (resume.experience or []):
        role = exp.get("role") or "Specialist"
        comp = exp.get("company") or "Enterprise"
        orig_desc = exp.get("description") or ""
        
        bullets = [b.strip().lstrip("-•*+ ").strip() for b in orig_desc.splitlines() if b.strip()]
        if not bullets:
            bullets = [
                f"Contributed to core deliverables and process alignment as a {role} at {comp}.",
                "Collaborated with cross-functional partners to execute project milestones.",
                "Identified procedural bottlenecks and optimized standard workflows."
            ]
        
        polished = []
        for b in bullets:
            words = b.split()
            if words:
                first = words[0].lower()
                verbs = {
                    "write": "Wrote", "develop": "Developed", "work": "Collaborated", "build": "Engineered", 
                    "manage": "Managed", "help": "Assisted", "coordinate": "Coordinated", "lead": "Spearheaded",
                    "analyze": "Analyzed", "create": "Created", "improve": "Optimized", "handle": "Executed"
                }
                words[0] = verbs.get(first, words[0].capitalize())
            polished.append(" ".join(words))
            
        improved_bullets_str = "\n".join(f"• {p}" for p in polished)
        safe_improved = clean_fabricated_metrics(orig_desc, improved_bullets_str)
        
        improved_experience.append({
            "role": role,
            "company": comp,
            "original": orig_desc,
            "improved": safe_improved
        })

    improved_projects = []
    for proj in (resume.projects or []):
        title = proj.get("title") or "Portfolio Initiative"
        orig_desc = proj.get("description") or ""
        tech = proj.get("technologies") or []
        tech_suffix = f" utilizing {', '.join(tech)}" if tech else ""
        
        raw_improved = (
            f"• Coordinated and executed the {title} project{tech_suffix}, focusing on secure implementation, quality control, and standard procedures.\n"
            f"• Resolved procedural anomalies, documented system parameters, and collaborated with project partners to ensure on-time delivery."
        )
        safe_improved = clean_fabricated_metrics(orig_desc, raw_improved)
        
        improved_projects.append({
            "title": title,
            "original": orig_desc,
            "improved": safe_improved
        })

    email = resume.email or "candidate@example.com"
    phone = resume.phone or "Phone Not Provided"
    
    prof_letter = (
        f"{candidate_name}\n"
        f"{phone} | {email}\n\n"
        f"Dear Hiring Manager,\n\n"
        f"I am writing to express my enthusiastic interest in joining your organization. With a strong track record of delivery and hands-on expertise in {skills_str}, I am confident in my ability to drive valuable contributions.\n\n"
        f"In my professional experiences, I have focused on quality, team collaboration, and seamless execution. I look forward to bringing this same commitment and my skill set to your upcoming projects.\n\n"
        f"Sincerely,\n{candidate_name}"
    )
    
    short_letter = (
        f"Dear Hiring Manager,\n\n"
        f"I am highly interested in joining your team. With expertise in {skills_str}, I focus on process optimization, team collaboration, and delivering quality results. I am confident my hands-on background will add immediate value.\n\n"
        f"Sincerely,\n{candidate_name}"
    )
    
    email_app = (
        f"Subject: Application for Open Position - {candidate_name}\n\n"
        f"Dear Hiring Team,\n\n"
        f"I hope this email finds you well. I would like to submit my application for your open position. "
        f"I have attached my resume, which outlines my experience in {skills_str}. "
        f"I welcome the opportunity to discuss my qualifications in a call.\n\n"
        f"Best regards,\n{candidate_name}\n{phone}"
    )
    
    linkedin_msg = (
        f"Hi [Name], I noticed your team is expanding. As an experienced professional skilled in {skills_str}, "
        f"I would love to connect and learn more about potential matches. Thanks!"
    )
    
    recruiter_intro = (
        f"Dear [Recruiter Name],\n\n"
        f"I am reaching out to introduce myself. I am a specialist with focus on {skills_str}. "
        f"I am currently looking for new opportunities and wanted to share my resume for any suitable client mandates.\n\n"
        f"Best regards,\n{candidate_name}"
    )

    return {
        "readiness_level": readiness_level,
        "contact_reason": contact_reason,
        "summary_reason": summary_reason,
        "skills_reason": skills_reason,
        "experience_reason": experience_reason,
        "projects_reason": projects_reason,
        "education_reason": education_reason,
        "certifications_reason": certifications_reason,
        "formatting_reason": formatting_reason,
        "keyword_reason": keyword_reason,
        "recruiters_like": ind_data["recruiters_like"],
        "recruiters_reject": ind_data["recruiters_reject"],
        "top_risks": ind_data["top_risks"],
        "confidence_level": "High",
        "top_matching_roles": top_matching_roles,
        "current_skills": resume.skills or [],
        "missing_skills": ind_data["missing_skills"],
        "future_skills": ind_data["future_skills"],
        "high_priority_gaps": ind_data["high_priority_gaps"],
        "medium_priority_gaps": ind_data["medium_priority_gaps"],
        "low_priority_gaps": ind_data["low_priority_gaps"],
        "seven_day_plan": ind_data["seven_day_plan"],
        "thirty_day_plan": ind_data["thirty_day_plan"],
        "sixty_day_plan": ind_data["sixty_day_plan"],
        "ninety_day_plan": ind_data["ninety_day_plan"],
        "improved_summary": improved_summary,
        "improved_experience": improved_experience,
        "improved_projects": improved_projects,
        "improved_skills": resume.skills or [],
        "keyword_suggestions": ind_data["missing_skills"][:5],
        "professional_cover_letter": prof_letter,
        "short_cover_letter": short_letter,
        "email_application": email_app,
        "linkedin_outreach": linkedin_msg,
        "recruiter_intro": recruiter_intro,
        "hr_questions": ind_data["hr_questions"],
        "technical_questions": ind_data["technical_questions"],
        "resume_questions": ind_data["resume_questions"],
        "project_questions": ind_data["project_questions"],
        "behavioral_questions": ind_data["behavioral_questions"],
        "candidate_profile": candidate_profile,
        "career_level": career_level,
        "industry_classification": industry_classification,
        "experience_level": experience_level,
        "professional_summary": improved_summary
    }

def evaluate_resume_ats(resume: models.Resume) -> ATSAnalysisSchema:
    """
    Computes a fully dynamic ATS score out of 100 for a parsed resume by scoring
    9 distinct categories (out of 10 each) and applying a weighted sum.
    Then enriches the score with Page 1-3 Universal Career Intelligence details.
    """
    detected_prof = getattr(resume, "profession", "General Professional") or "General Professional"
    deductions = []
    missing_sections = []
    
    # ----------------------------------------------------
    # 1. CATEGORY SCORING & DEDUCTIONS (Deterministic)
    # ----------------------------------------------------
    
    # Category A: Contact Information (Max 10)
    contact_score = 10
    if not resume.name:
        contact_score -= 2
        deductions.append("Contact Information: Missing candidate name in header (-2)")
    if not resume.email:
        contact_score -= 3
        deductions.append("Contact Information: Missing email address in header (-3)")
    if not resume.phone:
        contact_score -= 3
        deductions.append("Contact Information: Missing contact phone number (-3)")
        
    raw_text_lower = (resume.raw_text or "").lower()
    
    # Require GitHub only for technical profiles
    is_tech_profile = detected_prof in ["Software Engineer", "Android Developer", "Data Analyst", "Business Analyst", "Graphic Designer"]
    if is_tech_profile:
        has_github = "github.com" in raw_text_lower or "github" in raw_text_lower
        if not has_github:
            contact_score -= 1
            deductions.append("Contact Information: Missing GitHub profile link (-1)")
        
    has_linkedin = "linkedin.com" in raw_text_lower or "linkedin" in raw_text_lower
    if not has_linkedin:
        contact_score -= 1
        deductions.append("Contact Information: Missing LinkedIn profile link (-1)")
        
    contact_score = max(0, contact_score)
    if contact_score < 10:
        missing_sections.append("Contact Details Linkages")

    # Category B: Resume Summary (Max 10)
    summary_score = 10
    segmented = segment_sections(resume.raw_text or "")
    summary_text = segmented.get("summary", "").strip()
    
    if not summary_text:
        # Try to extract summary prose lines from header
        header_text = segmented.get("header", "")
        header_lines = [line.strip() for line in header_text.splitlines() if line.strip()]
        prose_lines = []
        for line in header_lines:
            # Skip name, email, phone, location/links
            if "@" in line or any(x in line.lower() for x in ["http", "www", ".com", ".org", "github", "linkedin", "phone"]):
                continue
            if re.search(r'\+?\d[\d\-\s\(\)]{8,}\d', line):
                continue
            if len(line.split()) < 5:
                continue
            prose_lines.append(line)
        if prose_lines:
            summary_text = " ".join(prose_lines)

    if not summary_text:
        summary_score -= 10
        deductions.append("Resume Summary: Missing professional summary or career profile segment (-10)")
    elif len(summary_text) < 80:
        summary_score -= 4
        deductions.append(f"Resume Summary: Profile summary is too brief ({len(summary_text)} chars, expected 80+), indicating weak introduction (-4)")
    else:
        weak_words = ["looking for", "hardworking", "motivated individual", "seeking a role", "result-oriented"]
        has_weak = any(w in summary_text.lower() for w in weak_words)
        if has_weak:
            summary_score -= 2
            deductions.append("Resume Summary: Professional summary contains generic buzzwords or passive phrasing (-2)")
            
    summary_score = max(0, summary_score)

    # Category C: Skills (Max 10)
    skills_score = 10
    skills_count = len(resume.skills) if resume.skills else 0
    if skills_count == 0:
        skills_score -= 10
        deductions.append("Skills: No technical or professional skills extracted from resume (-10)")
        missing_sections.append("Skills Section")
    elif skills_count < 5:
        skills_score -= 6
        deductions.append(f"Skills: Low skill density. Extracted only {skills_count} skills, target 10+ (-6)")
    elif skills_count < 10:
        skills_score -= 3
        deductions.append(f"Skills: Moderate skills list. Extracted {skills_count} skills, target 10+ for optimal ATS match (-3)")
        
    skills_score = max(0, skills_score)

    # Category D: Work Experience (Max 10)
    experience_score = 10
    exp_entries = resume.experience if resume.experience else []
    exp_count = len(exp_entries)
    
    if exp_count == 0:
        experience_score -= 10
        deductions.append("Work Experience: Missing professional experience section (-10)")
        missing_sections.append("Work Experience Section")
    else:
        if exp_count == 1:
            experience_score -= 3
            deductions.append("Work Experience: Only one employment entry listed. Add past roles or internships (-3)")
            
        has_metrics = False
        has_verbs = False
        thin_description = False
        metrics_pattern = re.compile(r'\b\d+%\b|\b\d+\s*(?:percent|million|billion|usd|multiplier|x)\b|\b\d+\+\b|\b\$\d+')
        action_verbs_check = {"developed", "designed", "implemented", "managed", "spearheaded", "built", "engineered", "optimized", "led", "created", "architected", "resolved", "improved", "automated", "facilitated"}
        
        for idx, exp in enumerate(exp_entries):
            desc = exp.get("description", "") or ""
            desc_clean = desc.strip()
            
            if len(desc_clean) < 30:
                thin_description = True
            if metrics_pattern.search(desc_clean) or any(c.isdigit() for c in desc_clean if c in ['%', '$']):
                has_metrics = True
            if any(verb in desc_clean.lower() for verb in action_verbs_check):
                has_verbs = True
                
        if thin_description:
            experience_score -= 2
            deductions.append("Work Experience: One or more experience items have thin or incomplete description texts (-2)")
        if not has_metrics:
            experience_score -= 2
            deductions.append("Work Experience: Missing measurable achievements or quantitative metrics in job summaries (-2)")
        if not has_verbs:
            experience_score -= 2
            deductions.append("Work Experience: Lack of action-oriented starting verbs in role descriptions (-2)")
            
    experience_score = max(0, experience_score)

    # Category E: Projects (Max 10)
    projects_score = 10
    proj_entries = resume.projects if resume.projects else []
    proj_count = len(proj_entries)
    
    if proj_count == 0:
        projects_score -= 10
        deductions.append("Projects: Missing projects section or no portfolio project items listed (-10)")
        missing_sections.append("Projects Section")
    else:
        if proj_count == 1:
            projects_score -= 3
            deductions.append("Projects: Only one project listed. A portfolio of at least 2-3 projects is recommended (-3)")
            
        thin_proj = False
        for proj in proj_entries:
            desc = proj.get("description", "") or ""
            if len(desc.strip()) < 30:
                thin_proj = True
        if thin_proj:
            projects_score -= 2
            deductions.append("Projects: One or more projects have thin details or descriptions (-2)")
            
    projects_score = max(0, projects_score)

    # Category F: Education (Max 10)
    education_score = 10
    edu_entries = resume.education if resume.education else []
    edu_count = len(edu_entries)
    
    if edu_count == 0:
        education_score -= 10
        deductions.append("Education: Missing educational history or academic degrees (-10)")
        missing_sections.append("Education Section")
    else:
        missing_school = False
        missing_degree = False
        for edu in edu_entries:
            if not edu.get("school"):
                missing_school = True
            
            # Check if this is a high school or secondary entry (bypass degree requirements)
            school_lower = (edu.get("school") or "").lower()
            degree_lower = (edu.get("degree") or "").lower()
            is_high_school = any(x in school_lower or x in degree_lower for x in ["high school", "secondary", "intermediate", "school", "matriculation"])
            
            if not is_high_school:
                if not edu.get("degree") and not edu.get("field_of_study"):
                    missing_degree = True
                
        if missing_school:
            education_score -= 3
            deductions.append("Education: Missing academic institution name (-3)")
        if missing_degree:
            education_score -= 3
            deductions.append("Education: Missing degree or field of study in academic history (-3)")
            
    education_score = max(0, education_score)

    # Category G: Certifications (Max 10)
    certifications_score = 10
    cert_entries = resume.certifications if resume.certifications else []
    cert_count = len(cert_entries)
    
    if cert_count == 0:
        certifications_score -= 8
        deductions.append("Certifications: No certifications listed to prove ongoing professional upskilling (-8)")
    elif cert_count == 1:
        certifications_score -= 3
        deductions.append("Certifications: Only one certification found. Aim to list at least 2 relevant credentials (-3)")
        
    certifications_score = max(0, certifications_score)

    # Category H: Formatting (Max 10)
    formatting_score = 10
    raw_text = resume.raw_text or ""
    text_len = len(raw_text)
    
    if text_len < 600:
        formatting_score -= 5
        deductions.append(f"Formatting: Resume text content is extremely short ({text_len} chars), failing standard density checks (-5)")
    elif text_len > 6000:
        formatting_score -= 3
        deductions.append(f"Formatting: Resume text is overly wordy ({text_len} chars), which can cause visual clustering and clutter (-3)")
        
    sections_found = 0
    if segmented.get("skills"):
        sections_found += 1
    if segmented.get("experience"):
        sections_found += 1
    if segmented.get("education"):
        sections_found += 1
    if segmented.get("projects"):
        sections_found += 1
        
    if sections_found < 3:
        formatting_score -= 3
        deductions.append(f"Formatting: Incomplete layout structure; ensure core sections are clearly demarcated (-3)")
        
    formatting_score = max(0, formatting_score)

    # Category I: Keyword Match (Max 10)
    keyword_score = 10
    
    if detected_prof not in PROFESSION_ROLES_SKILLS_MAP:
        import difflib
        closest = difflib.get_close_matches(detected_prof, PROFESSION_ROLES_SKILLS_MAP.keys(), n=1, cutoff=0.3)
        current_prof = closest[0] if closest else "General Professional"
    else:
        current_prof = detected_prof
        
    ROLE_SKILLS_MAP = PROFESSION_ROLES_SKILLS_MAP[current_prof]

    
    candidate_skills_lower = [s.strip().lower() for s in (resume.skills or [])]
    
    role_matches = []
    for role, req_skills in ROLE_SKILLS_MAP.items():
        matching = [s for s in req_skills if s.lower() in candidate_skills_lower]
        gaps = [s for s in req_skills if s.lower() not in candidate_skills_lower]
        score = int(len(matching) / len(req_skills) * 100) if req_skills else 100
        
        role_learning = []
        for gap in gaps[:3]:
            role_learning.append(f"Complete a structured course or build a project in {gap} to build {role} proficiency.")
            
        role_matches.append({
            "role": role,
            "match_score": score,
            "skill_gaps": gaps,
            "learning_roadmap": role_learning
        })
        
    role_matches.sort(key=lambda x: (x["match_score"], x["role"]), reverse=True)
    top_5_roles = role_matches[:5]
    
    best_match_score = top_5_roles[0]["match_score"] if top_5_roles else 0
    if best_match_score < 40:
        keyword_score -= 6
        deductions.append(f"Keyword Match: Primary match rate is very low ({best_match_score}%), missing key job-specific keywords (-6)")
    elif best_match_score < 60:
        keyword_score -= 3
        deductions.append(f"Keyword Match: Missing critical job-specific keywords for primary role ({best_match_score}% match) (-3)")
    elif best_match_score < 80:
        keyword_score -= 1
        deductions.append(f"Keyword Match: A few primary role keywords are missing on resume ({best_match_score}% match) (-1)")
        
    keyword_score = max(0, keyword_score)

    # ----------------------------------------------------
    # 2. OVERALL SCORE AGGREGATION (WEIGHTED SUM)
    # ----------------------------------------------------
    total_score = int(
        contact_score * 1.0 +
        summary_score * 1.0 +
        skills_score * 1.5 +
        experience_score * 2.0 +
        projects_score * 1.0 +
        education_score * 1.0 +
        certifications_score * 1.0 +
        formatting_score * 0.5 +
        keyword_score * 1.0
    )
    total_score = min(100, max(0, total_score))

    # Additional calculations
    resume_improvement_score = min(98, max(15, total_score + (10 if not deductions else -len(deductions) * 2)))
    job_readiness_score = min(98, max(20, int(best_match_score * 0.7 + min(28, len(resume.experience or []) * 5 + len(resume.skills or []) * 1.0))))
    
    readiness = total_score
    if exp_count >= 2:
        readiness += 10
    elif exp_count == 1:
        readiness += 5
    if len(resume.projects or []) >= 2:
        readiness += 5
    missing_keywords = top_5_roles[0]["skill_gaps"][:4] if top_5_roles else []
    readiness -= len(missing_keywords) * 2
    readiness = min(98, max(15, readiness))

    base_data = {
        "ats_score": total_score,
        "contact_score": contact_score,
        "summary_score": summary_score,
        "skills_score": skills_score,
        "experience_score": experience_score,
        "projects_score": projects_score,
        "education_score": education_score,
        "certifications_score": certifications_score,
        "formatting_score": formatting_score,
        "keyword_score": keyword_score,
        "deductions": deductions,
        "missing_sections": missing_sections,
        "resume_improvement_score": resume_improvement_score,
        "job_readiness_score": job_readiness_score,
        "interview_readiness_score": readiness
    }

    # ----------------------------------------------------
    # 3. ENRICH WITH CAREER INTELLIGENCE (Gemini / Local Fallback)
    # ----------------------------------------------------
    enriched = None
    if settings.GEMINI_API_KEY:
        try:
            logger.info("Enriching ATS report with Gemini AI...")
            enriched = enrich_ats_report_with_gemini(resume, base_data)
        except Exception as e:
            logger.warning(f"Failed to enrich ATS report with Gemini AI: {str(e)}. Falling back to local rules.")
            
    if not enriched:
        logger.info("Enriching ATS report with local rule-based fallback...")
        enriched = enrich_ats_report_local(resume, base_data)

    # ----------------------------------------------------
    # 4. MAP TO SCHEMAS
    # ----------------------------------------------------
    # Retrieve nested / flat values gracefully to support both flat local dictionary and nested Gemini JSON object
    sga = enriched.get("skill_gap_analysis") or {}
    if not isinstance(sga, dict):
        sga = {}
    are = enriched.get("ai_resume_enhancement") or {}
    if not isinstance(are, dict):
        are = {}
    jat = enriched.get("job_application_toolkit") or {}
    if not isinstance(jat, dict):
        jat = {}
    ipr = enriched.get("interview_preparation") or {}
    if not isinstance(ipr, dict):
        ipr = {}

    current_skills = enriched.get("current_skills") or sga.get("current_skills") or []
    missing_skills = enriched.get("missing_skills") or sga.get("missing_skills") or []
    future_skills = enriched.get("future_skills") or sga.get("future_skills") or []
    high_priority_gaps = enriched.get("high_priority_gaps") or sga.get("high_priority_gaps") or []
    medium_priority_gaps = enriched.get("medium_priority_gaps") or sga.get("medium_priority_gaps") or []
    low_priority_gaps = enriched.get("low_priority_gaps") or sga.get("low_priority_gaps") or []

    improved_summary = enriched.get("improved_summary") or are.get("improved_summary") or ""
    improved_experience = enriched.get("improved_experience") or are.get("improved_experience") or []
    improved_projects = enriched.get("improved_projects") or are.get("improved_projects") or []
    improved_skills = enriched.get("improved_skills") or are.get("improved_skills") or []
    keyword_suggestions = enriched.get("keyword_suggestions") or are.get("keyword_suggestions") or []

    professional_cover_letter = enriched.get("professional_cover_letter") or jat.get("professional_cover_letter") or ""
    short_cover_letter = enriched.get("short_cover_letter") or jat.get("short_cover_letter") or ""
    email_application = enriched.get("email_application") or jat.get("email_application") or ""
    linkedin_outreach = enriched.get("linkedin_outreach") or jat.get("linkedin_outreach") or ""
    recruiter_intro = enriched.get("recruiter_intro") or jat.get("recruiter_intro") or ""

    hr_questions = enriched.get("hr_questions") or ipr.get("hr_questions") or []
    technical_questions = enriched.get("technical_questions") or ipr.get("technical_questions") or []
    resume_questions = enriched.get("resume_questions") or ipr.get("resume_questions") or []
    project_questions = enriched.get("project_questions") or ipr.get("project_questions") or []
    behavioral_questions = enriched.get("behavioral_questions") or ipr.get("behavioral_questions") or []

    top_matching_roles_schemas = []
    for rm in enriched.get("top_matching_roles", []):
        top_matching_roles_schemas.append(JobRoleMatchSchema(
            role=rm.get("role", ""),
            match_score=rm.get("match_score", 0),
            skill_gaps=rm.get("skill_gaps", []),
            learning_roadmap=rm.get("learning_roadmap", []),
            expected_salary=rm.get("expected_salary", None),
            difficulty=rm.get("difficulty", None)
        ))

    # Fallback to recommended arrays for legacy fields
    strengths = enriched.get("recruiters_like", [])[:3]
    weaknesses = enriched.get("top_risks", [])[:3]
    recommended_skills = missing_skills[:4]
    recommended_job_roles = [rm.get("role", "") for rm in enriched.get("top_matching_roles", [])][:5]

    return ATSAnalysisSchema(
        ats_score=base_data["ats_score"],
        strengths=strengths,
        weaknesses=weaknesses,
        missing_keywords=base_data["deductions"],
        recommended_skills=recommended_skills,
        recommended_job_roles=recommended_job_roles,
        interview_readiness_score=base_data["interview_readiness_score"],
        missing_sections=base_data["missing_sections"],
        
        # Detailed scoring breakdown
        contact_score=base_data["contact_score"],
        summary_score=base_data["summary_score"],
        skills_score=base_data["skills_score"],
        experience_score=base_data["experience_score"],
        projects_score=base_data["projects_score"],
        education_score=base_data["education_score"],
        certifications_score=base_data["certifications_score"],
        formatting_score=base_data["formatting_score"],
        keyword_score=base_data["keyword_score"],
        deductions=base_data["deductions"],
        
        # Additional scores
        resume_improvement_score=base_data["resume_improvement_score"],
        job_readiness_score=base_data["job_readiness_score"],
        
        # Recruiter review
        recruiter_strengths=enriched.get("recruiters_like", []),
        recruiter_concerns=enriched.get("recruiters_reject", []),
        resume_weaknesses=enriched.get("top_risks", []),
        
        # Job roles & roadmaps
        top_job_roles=top_matching_roles_schemas,
        improvement_roadmap=enriched.get("seven_day_plan", []) + enriched.get("thirty_day_plan", []),
        personalized_learning_roadmap=enriched.get("thirty_day_plan", []) + enriched.get("sixty_day_plan", []),
        
        # Phase 4 Universal ATS Additions
        readiness_level=enriched.get("readiness_level", "Developing"),
        contact_reason=enriched.get("contact_reason", ""),
        summary_reason=enriched.get("summary_reason", ""),
        skills_reason=enriched.get("skills_reason", ""),
        experience_reason=enriched.get("experience_reason", ""),
        projects_reason=enriched.get("projects_reason", ""),
        education_reason=enriched.get("education_reason", ""),
        certifications_reason=enriched.get("certifications_reason", ""),
        formatting_reason=enriched.get("formatting_reason", ""),
        keyword_reason=enriched.get("keyword_reason", ""),
        
        recruiters_like=enriched.get("recruiters_like", []),
        recruiters_reject=enriched.get("recruiters_reject", []),
        top_risks=enriched.get("top_risks", []),
        confidence_level=enriched.get("confidence_level", "Medium"),
        
        current_skills=current_skills,
        missing_skills=missing_skills,
        future_skills=future_skills,
        high_priority_gaps=high_priority_gaps,
        medium_priority_gaps=medium_priority_gaps,
        low_priority_gaps=low_priority_gaps,
        
        seven_day_plan=enriched.get("seven_day_plan", []),
        thirty_day_plan=enriched.get("thirty_day_plan", []),
        sixty_day_plan=enriched.get("sixty_day_plan", []),
        ninety_day_plan=enriched.get("ninety_day_plan", []),
        
        improved_summary=improved_summary,
        improved_experience=improved_experience,
        improved_projects=improved_projects,
        improved_skills=improved_skills,
        keyword_suggestions=keyword_suggestions,
        
        professional_cover_letter=professional_cover_letter,
        short_cover_letter=short_cover_letter,
        email_application=email_application,
        linkedin_outreach=linkedin_outreach,
        recruiter_intro=recruiter_intro,
        
        hr_questions=hr_questions,
        technical_questions=technical_questions,
        resume_questions=resume_questions,
        project_questions=project_questions,
        behavioral_questions=behavioral_questions,
        
        # Phase 5 Resume Overview Additions
        candidate_profile=enriched.get("candidate_profile") or f"{enriched.get('career_level', 'Entry Level')} specializing in {enriched.get('industry_classification', 'General Business')}",
        career_level=enriched.get("career_level", "Entry Level"),
        industry_classification=enriched.get("industry_classification", "General Business"),
        experience_level=enriched.get("experience_level", "Fresher"),
        professional_summary=enriched.get("professional_summary") or enriched.get("improved_summary") or ""
    )

def generate_interview_prep_with_gemini(
    resume: models.Resume,
    jd_text: Optional[str] = None,
    job_role: Optional[str] = None
) -> InterviewPrepSchema:
    """
    Generates a highly personalized, recruiter-grade list of interview questions using modular QuestionGenerator.
    """
    from app.services.ai_engine import QuestionGenerator
    
    resume_data = {
        "experience": resume.experience or [],
        "projects": resume.projects or []
    }
    
    profession = job_role or getattr(resume, "profession", "General Professional") or "General Professional"
    seniority = getattr(resume, "seniority", "Mid") or "Mid"
    exp_years = getattr(resume, "experience_level", "1-3 Years") or "1-3 Years"
    skills = resume.skills or []
    
    try:
        data = QuestionGenerator.generate_questions(
            resume_data=resume_data,
            profession=profession,
            seniority=seniority,
            experience_years=exp_years,
            skills=skills,
            jd_text=jd_text
        )
    except Exception as e:
        logger.error(f"QuestionGenerator.generate_questions failed: {str(e)}")
        # Fall back to local question generator
        return generate_interview_prep_local(resume, jd_text, job_role)
    
    return InterviewPrepSchema(
        technical_readiness=data.get("technical_readiness", 0),
        hr_readiness=data.get("hr_readiness", 0),
        communication_readiness=data.get("communication_readiness", 0),
        overall_readiness=data.get("overall_readiness", 0),
        resume_questions=[InterviewQuestion2Schema(**q) for q in data.get("resume_questions", [])],
        jd_questions=[InterviewQuestion2Schema(**q) for q in data.get("jd_questions", [])],
        technical_questions=[InterviewQuestion2Schema(**q) for q in data.get("technical_questions", [])],
        hr_questions=[InterviewQuestion2Schema(**q) for q in data.get("hr_questions", [])],
        behavioral_questions=[InterviewQuestion2Schema(**q) for q in data.get("behavioral_questions", [])],
        scenario_questions=[InterviewQuestion2Schema(**q) for q in data.get("scenario_questions", [])],
        project_questions=[InterviewQuestion2Schema(**q) for q in data.get("project_questions", [])],
        problem_solving_questions=[InterviewQuestion2Schema(**q) for q in data.get("problem_solving_questions", [])]
    )


def generate_interview_prep_local(
    resume: models.Resume,
    jd_text: Optional[str] = None,
    job_role: Optional[str] = None
) -> InterviewPrepSchema:
    # 1. Compute mock readiness scores
    skills = resume.skills or []
    projects = resume.projects or []
    experience = resume.experience or []
    certs = resume.certifications or []
    
    tech_score = min(95, 45 + len(skills) * 3 + len(projects) * 5)
    hr_score = min(90, 50 + len(experience) * 8 + len(certs) * 4)
    comm_score = 80
    overall_score = int((tech_score + hr_score + comm_score) / 3)
    
    # Career level / industry info
    roles_lower = [str(e.get("role", "")).lower() for e in experience]
    career_level = "Entry Level"
    if len(roles_lower) > 2:
        career_level = "Mid Level"
    if any(any(kw in t for kw in ["senior", "lead", "principal", "architect", "manager"]) for t in roles_lower):
        career_level = "Senior Level"
        
    skills_str = ", ".join(skills[:3]) if skills else "relevant technologies"
    company_str = experience[0].get("company", "your previous employer") if experience else "your previous workplace"
    
    # 2. HR Questions (10)
    hr_list = [
        {
            "question": f"Tell me about yourself. How does your background as a {career_level} prepare you for this role?",
            "difficulty": "Easy"
        },
        {
            "question": "Why are you interested in this role and our company?",
            "difficulty": "Easy"
        },
        {
            "question": f"Why should we hire you? What makes your skill set in {skills_str} unique?",
            "difficulty": "Medium"
        },
        {
            "question": f"Tell me about a challenge you faced in your past role at {company_str}.",
            "difficulty": "Medium"
        },
        {
            "question": "Describe a situation where you worked under pressure or tight deadlines.",
            "difficulty": "Medium"
        },
        {
            "question": "Where do you see yourself in 5 years?",
            "difficulty": "Easy"
        },
        {
            "question": "What is your greatest professional strength?",
            "difficulty": "Easy"
        },
        {
            "question": "What do you consider your greatest weakness, and how are you working to improve it?",
            "difficulty": "Medium"
        },
        {
            "question": "How do you handle conflict or differing opinions within a project team?",
            "difficulty": "Medium"
        },
        {
            "question": "Why are you looking to leave your current role / why did you leave your last role?",
            "difficulty": "Medium"
        }
    ]

    # 3. Technical Questions (10) based on skills mapping or SWE catalog
    skill_q_catalog = {
        "python": [
            {
                "question": "Explain the difference between deep and shallow copying in Python.",
                "difficulty": "Easy"
            },
            {
                "question": "How does memory management and garbage collection work in Python?",
                "difficulty": "Medium"
            },
            {
                "question": "What are Python decorators, and how would you implement a rate-limiting decorator?",
                "difficulty": "Hard"
            }
        ],
        "sql": [
            {
                "question": "What is the difference between WHERE and HAVING clauses in SQL?",
                "difficulty": "Easy"
            },
            {
                "question": "Explain the difference between clustered and non-clustered indexes.",
                "difficulty": "Medium"
            },
            {
                "question": "How would you optimize a slow-running SQL query with multiple joins and aggregations?",
                "difficulty": "Hard"
            }
        ],
        "javascript": [
            {
                "question": "What is the difference between let, const, and var in JavaScript?",
                "difficulty": "Easy"
            },
            {
                "question": "Explain event delegation in JavaScript and why it is useful.",
                "difficulty": "Medium"
            },
            {
                "question": "What is the difference between the event loop, call stack, and microtask queue?",
                "difficulty": "Hard"
            }
        ],
        "react": [
            {
                "question": "What are React hooks, and what rules must you follow when using them?",
                "difficulty": "Easy"
            },
            {
                "question": "Explain React's Virtual DOM and reconciliation process.",
                "difficulty": "Medium"
            },
            {
                "question": "How do you optimize a large React application with slow rendering performance?",
                "difficulty": "Hard"
            }
        ]
    }

    swe_catalog = [
        {
            "question": "What is Git branching strategy, and how do you resolve merge conflicts?",
            "difficulty": "Easy"
        },
        {
            "question": "Explain the difference between REST and GraphQL APIs.",
            "difficulty": "Medium"
        },
        {
            "question": "What is system scalability, and what is the difference between horizontal and vertical scaling?",
            "difficulty": "Easy"
        },
        {
            "question": "How do you ensure web application security against OWASP Top 10 vulnerabilities like SQL Injection and XSS?",
            "difficulty": "Medium"
        },
        {
            "question": "What are SOLID design principles? Explain two of them.",
            "difficulty": "Hard"
        },
        {
            "question": "Describe the difference between Monolithic and Microservices architectures.",
            "difficulty": "Medium"
        },
        {
            "question": "What is CI/CD (Continuous Integration / Continuous Deployment) and why is it important?",
            "difficulty": "Easy"
        },
        {
            "question": "How do you design a database schema for a high-concurrency e-commerce order system?",
            "difficulty": "Hard"
        },
        {
            "question": "What is the purpose of unit testing, and how does it differ from integration testing?",
            "difficulty": "Easy"
        },
        {
            "question": "Explain Docker containerization and its benefits over traditional Virtual Machines.",
            "difficulty": "Medium"
        }
    ]

    tech_list = []
    matched_qs = []
    for skill_name in skills:
        skill_name_lower = skill_name.strip().lower()
        if skill_name_lower in skill_q_catalog:
            matched_qs.extend(skill_q_catalog[skill_name_lower])
            
    seen_questions = set()
    for q in matched_qs:
        if q["question"] not in seen_questions:
            tech_list.append(q)
            seen_questions.add(q["question"])
            
    for q in swe_catalog:
        if len(tech_list) >= 10:
            break
        if q["question"] not in seen_questions:
            tech_list.append(q)
            seen_questions.add(q["question"])
            
    while len(tech_list) < 10:
        idx = len(tech_list)
        tech_list.append({
            "question": f"Explain key architectural patterns you have used in your software projects (Pattern #{idx}).",
            "difficulty": "Medium"
        })
        
    tech_list = tech_list[:10]

    # 4. JD Questions (10)
    jd_list = []
    target_role = job_role or (resume.profession or "your target role")
    if jd_text:
        jd_keywords = extract_skills_from_text(jd_text)
        if not jd_keywords:
            jd_keywords = ["key requirements"]
            
        difficulties = ["Medium", "Hard", "Medium", "Easy", "Medium"]
        for idx, kw in enumerate(jd_keywords[:8]):
            diff = difficulties[idx % len(difficulties)]
            jd_list.append({
                "question": f"The job description highlights {kw.upper()} as a key requirement. Can you describe a project where you applied {kw.upper()} to solve a business problem?",
                "difficulty": diff
            })
    else:
        fallback_skills = skills[:5] if skills else ["relevant tools"]
        for idx, s in enumerate(fallback_skills[:5]):
            jd_list.append({
                "question": f"How do you align your expertise in {s.upper()} with the standard requirements for a {target_role} role?",
                "difficulty": "Easy"
            })
            
    generic_jd = [
        f"How do your qualifications align with the primary goals of the {target_role} position?",
        "Why is this company's domain or industry a strong fit for your career background?",
        "How would you approach your first 30 days in this role to ensure a smooth transition?",
        "Describe your experience collaborating with cross-functional teams (product, design, QA) as required in this role.",
        "The job description indicates a fast-paced environment. How do you manage stress and maintain quality under pressure?",
        "What unique value or perspective do you bring that directly addresses the key goals of this job?"
    ]
    for q_text in generic_jd:
        if len(jd_list) >= 10:
            break
        jd_list.append({
            "question": q_text,
            "difficulty": "Medium"
        })
    while len(jd_list) < 10:
        idx = len(jd_list)
        jd_list.append({
            "question": f"How do you prepare yourself to meet the key performance indicators for a {target_role} (KPI #{idx})?",
            "difficulty": "Medium"
        })
    jd_list = jd_list[:10]

    # 5. Project Questions (10)
    project_list = []
    if projects:
        for idx, proj in enumerate(projects[:10]):
            title = proj.get("title") or "listed project"
            tech = proj.get("technologies") or []
            tech_str = f" using {', '.join(tech)}" if tech else ""
            diff = "Medium" if idx % 2 == 0 else "Hard"
            project_list.append({
                "question": f"In your project '{title}'{tech_str}, what was the most complex technical challenge you faced and how did you resolve it?",
                "difficulty": diff
            })
            
    generic_projects = [
        "Describe a system architecture design you are proud of. What trade-offs did you evaluate?",
        "How do you handle project management, scoping, and estimating delivery timelines?",
        "What is your approach to handling legacy codebases or undocumented systems in projects?",
        "How do you ensure proper test coverage and automated QA in your software projects?",
        "Describe a time when you had to refactor a critical component in an active project without downtime.",
        "How do you manage configurations and secrets securely across development and production environments?",
        "What metrics or tools do you use to measure the quality and performance of your projects?",
        "Describe how you coordinate database migrations when releasing updates to your application.",
        "How do you design APIs that are easy to consume and backward-compatible for other teams?",
        "Describe how you implement logging, monitoring, and alerting in your production systems."
    ]
    for q_text in generic_projects:
        if len(project_list) >= 10:
            break
        project_list.append({
            "question": q_text,
            "difficulty": "Medium"
        })
    project_list = project_list[:10]

    # 6. Resume Questions (10)
    resume_list = []
    if certs:
        for c in certs[:3]:
            cert_name = c.get("name") or "certification"
            resume_list.append({
                "question": f"You completed the '{cert_name}' certification. How have you applied this knowledge to real-world projects?",
                "difficulty": "Medium"
            })
    
    if len(experience) >= 2:
        comp_a = experience[0].get("company", "recent employer")
        comp_b = experience[1].get("company", "previous employer")
        resume_list.append({
            "question": f"Walk me through the transition from your role at {comp_b} to your role at {comp_a}. What drove your decision?",
            "difficulty": "Easy"
        })
        
    generic_resume = [
        "If you look back at your resume, what is one area you plan to develop or improve next?",
        "How has your formal education or self-study influenced your technical approach in recent years?",
        "Explain how the skills list on your resume maps to the core responsibilities of your target role.",
        "Describe a role or experience listed on your resume where you had to quickly adapt to a new industry.",
        "In your most recent job, what was your most significant quantifiable achievement?",
        "How do you balance technical development with teamwork or leadership responsibilities shown on your resume?",
        "What is a tech stack choice on your resume that you would do differently today and why?",
        "Explain how you structured the description of your achievements on your resume to reflect business impact."
    ]
    for q_text in generic_resume:
        if len(resume_list) >= 10:
            break
        resume_list.append({
            "question": q_text,
            "difficulty": "Medium"
        })
    while len(resume_list) < 10:
        idx = len(resume_list)
        resume_list.append({
            "question": f"Walk me through a key highlight on your resume that demonstrates your ability to adapt (Highlight #{idx}).",
            "difficulty": "Medium"
        })
    resume_list = resume_list[:10]
        
    # 7. STAR Behavioral Questions (10)
    behavioral_list = [
        {
            "question": "Describe a time you had to learn a new technology or tool extremely quickly to complete a task.",
            "difficulty": "Medium"
        },
        {
            "question": "Tell me about a time you had a disagreement with a team member. How did you resolve it?",
            "difficulty": "Medium"
        },
        {
            "question": "Tell me about a project that failed or didn't go as planned. What did you do?",
            "difficulty": "Medium"
        },
        {
            "question": "Describe a situation where you went above and beyond what was expected of you.",
            "difficulty": "Easy"
        },
        {
            "question": "Give an example of how you set goals and achieve them in a project context.",
            "difficulty": "Easy"
        },
        {
            "question": "Describe a time you had to deliver bad news to a manager or a stakeholder. How did you handle it?",
            "difficulty": "Hard"
        },
        {
            "question": "Tell me about a time you had to handle multiple competing priorities under a tight schedule.",
            "difficulty": "Medium"
        },
        {
            "question": "Describe a time you had to work with someone who had a very different style or background than yours.",
            "difficulty": "Easy"
        },
        {
            "question": "Tell me about a time you noticed an inefficiency in a team process and took steps to improve it.",
            "difficulty": "Medium"
        },
        {
            "question": "Describe a time you received constructive feedback that was difficult to hear. How did you react?",
            "difficulty": "Medium"
        }
    ]

    # 8. Scenario-Based Questions (10)
    scenario_list = [
        {
            "question": "How would you handle a situation where a critical database goes down in production on a weekend?",
            "difficulty": "Hard"
        },
        {
            "question": "If you realize a day before release that a critical security vulnerability exists in your code, what do you do?",
            "difficulty": "Hard"
        },
        {
            "question": "How would you handle a product manager requesting a new feature that shifts the architecture mid-sprint?",
            "difficulty": "Medium"
        },
        {
            "question": "Describe how you would approach onboarding to a completely new legacy codebase with zero active documentation.",
            "difficulty": "Medium"
        },
        {
            "question": "If two senior developers are locked in a heated debate over system design choices, how do you help resolve it?",
            "difficulty": "Medium"
        },
        {
            "question": "You notice a team member is consistently missing sprint deliverables and seems disengaged. How do you handle it?",
            "difficulty": "Medium"
        },
        {
            "question": "How would you prioritize tasks if you were assigned three urgent bugs by different stakeholders at the same time?",
            "difficulty": "Medium"
        },
        {
            "question": "A customer reports a major bug that you cannot reproduce in your local or staging environments. What is your process?",
            "difficulty": "Hard"
        },
        {
            "question": "How do you handle a situation where your manager gives you a task with a deadline you believe is highly unrealistic?",
            "difficulty": "Medium"
        },
        {
            "question": "Describe how you would manage an API integration outage from a third-party partner that is blocking user signups.",
            "difficulty": "Medium"
        }
    ]

    # 9. Problem Solving Questions (10)
    problem_solving_list = [
        {
            "question": "Explain how you would design a rate limiter for a public API endpoint.",
            "difficulty": "Hard"
        },
        {
            "question": "How would you optimize a system that suffers from frequent database deadlocks under high write concurrency?",
            "difficulty": "Hard"
        },
        {
            "question": "Describe the algorithm and data structures you would use to find duplicate files in a massive filesystem.",
            "difficulty": "Medium"
        },
        {
            "question": "How do you detect memory leaks in a running long-term background daemon process?",
            "difficulty": "Medium"
        },
        {
            "question": "Explain how you would design a URL shortening service like Bitly, focusing on scalability.",
            "difficulty": "Hard"
        },
        {
            "question": "How would you design a distributed cache system that maintains consistency across multiple regions?",
            "difficulty": "Hard"
        },
        {
            "question": "What strategy would you use to process a 100GB text file on a machine with only 4GB of RAM?",
            "difficulty": "Hard"
        },
        {
            "question": "Describe how you would debug a slow memory footprint growth in a web application.",
            "difficulty": "Medium"
        },
        {
            "question": "How would you design a leaderboard system for a mobile game with millions of active users?",
            "difficulty": "Hard"
        },
        {
            "question": "Explain the trade-offs between using a SQL database vs. a NoSQL database for storing user session data.",
            "difficulty": "Medium"
        }
    ]

    return InterviewPrepSchema(
        technical_readiness=tech_score,
        hr_readiness=hr_score,
        communication_readiness=comm_score,
        overall_readiness=overall_score,
        resume_questions=[InterviewQuestion2Schema(
            question=str(q["question"]),
            difficulty=str(q["difficulty"])
        ) for q in resume_list],
        jd_questions=[InterviewQuestion2Schema(
            question=str(q["question"]),
            difficulty=str(q["difficulty"])
        ) for q in jd_list],
        technical_questions=[InterviewQuestion2Schema(
            question=str(q["question"]),
            difficulty=str(q["difficulty"])
        ) for q in tech_list],
        hr_questions=[InterviewQuestion2Schema(
            question=str(q["question"]),
            difficulty=str(q["difficulty"])
        ) for q in hr_list],
        behavioral_questions=[InterviewQuestion2Schema(
            question=str(q["question"]),
            difficulty=str(q["difficulty"])
        ) for q in behavioral_list],
        scenario_questions=[InterviewQuestion2Schema(
            question=str(q["question"]),
            difficulty=str(q["difficulty"])
        ) for q in scenario_list],
        project_questions=[InterviewQuestion2Schema(
            question=str(q["question"]),
            difficulty=str(q["difficulty"])
        ) for q in project_list],
        problem_solving_questions=[InterviewQuestion2Schema(
            question=str(q["question"]),
            difficulty=str(q["difficulty"])
        ) for q in problem_solving_list]
    )

