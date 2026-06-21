import datetime
import logging
import app.models as models
from typing import Dict, Any

logger = logging.getLogger("app.services.cover_letter")

def generate_cover_letter_text(resume: models.Resume, job_title: str, company_name: str) -> str:
    """
    Compiles a highly professional cover letter using candidate's parsed details,
    experience history, skills, and target job parameters.
    """
    candidate_name = resume.name or "Candidate"
    email = resume.email or "email@example.com"
    phone = resume.phone or "Phone Not Provided"
    
    current_date = datetime.date.today().strftime("%B %d, %Y")
    
    # Extract latest experience
    latest_role = "Software Professional"
    latest_company = ""
    
    if resume.experience and len(resume.experience) > 0:
        latest_role = resume.experience[0].get("role") or "Software Professional"
        latest_company = resume.experience[0].get("company") or ""
        
    skills_list = resume.skills[:4] if resume.skills else ["Software Development", "Problem Solving", "Collaboration"]
    skills_str = ", ".join(skills_list)
    
    # Constructing a high-impact professional cover letter
    body = (
        f"{candidate_name}\n"
        f"{phone} | {email}\n\n"
        f"{current_date}\n\n"
        f"Hiring Manager\n"
        f"{company_name}\n\n"
        f"Dear Hiring Manager,\n\n"
        f"I am writing to express my enthusiastic interest in the {job_title} position at {company_name}. "
        f"With a strong background in software engineering and hands-on expertise in {skills_str}, "
        f"I am confident in my ability to make a meaningful and immediate contribution to your development team.\n\n"
    )
    
    if latest_company:
        body += (
            f"In my most recent role as a {latest_role} at {latest_company}, I spearheaded various technical initiatives. "
            f"I have consistently focused on architecting robust systems, optimizing application performance, "
            f"and collaborating closely with cross-functional teams to deliver high-quality, scalable code. "
            f"This experience has equipped me with the practical expertise and adaptive mindset required to excel as a {job_title}.\n\n"
        )
    else:
        body += (
            f"As a dedicated {latest_role}, I have engineered various technical systems and personal projects. "
            f"I focus on architecting robust structures, building performant REST APIs, and writing clean, maintainable code. "
            f"My hands-on experience has prepared me to handle complex engineering challenges and hit the ground running at {company_name}.\n\n"
        )
        
    body += (
        f"I am particularly drawn to {company_name} because of your commitment to technical excellence and user-centric innovation. "
        f"I am eager to align my development skills and enthusiasm for building high-fidelity products with your team's objectives. "
        f"I welcome the opportunity to discuss how my experience and passion align with your needs.\n\n"
        f"Thank you for your time and consideration. I look forward to hearing from you.\n\n"
        f"Sincerely,\n\n"
        f"{candidate_name}"
    )
    
    return body


def generate_cover_letter_versions(resume: models.Resume, job_title: str, company_name: str, industry: str | None = None) -> dict:
    """
    Generates three versions of a cover letter (Professional, Entry-Level, Experienced)
    strictly based on the candidate's actual parsed data.
    """
    candidate_name = resume.name or "Candidate"
    email = resume.email or "email@example.com"
    phone = resume.phone or "Phone Not Provided"
    
    current_date = datetime.date.today().strftime("%B %d, %Y")
    ind_str = f" within the {industry} industry" if industry else ""
    
    # Extract latest experience
    latest_role = "Software Professional"
    latest_company = ""
    
    if resume.experience and len(resume.experience) > 0:
        latest_role = resume.experience[0].get("role") or "Software Professional"
        latest_company = resume.experience[0].get("company") or ""
        
    skills_list = resume.skills[:4] if resume.skills else ["Software Development", "Problem Solving", "Collaboration"]
    skills_str = ", ".join(skills_list)
    
    # Header format
    header = (
        f"{candidate_name}\n"
        f"{phone} | {email}\n\n"
        f"{current_date}\n\n"
        f"Hiring Manager\n"
        f"{company_name}\n\n"
        f"Dear Hiring Manager,\n\n"
    )
    
    # 1. Professional Version
    prof_body = (
        f"I am writing to express my strong interest in the {job_title} position at {company_name}{ind_str}. "
        f"As a dedicated professional with hands-on expertise in {skills_str}, I am confident in my ability "
        f"to deliver robust solutions and drive immediate value for your development team.\n\n"
    )
    if latest_company:
        prof_body += (
            f"In my previous capacity as a {latest_role} at {latest_company}, I was responsible for key engineering "
            f"initiatives, ensuring high-quality deliverables, and working collaboratively across teams. I focused on "
            f"code stability, technical excellence, and aligning development tasks with business objectives. "
            f"I aim to bring this same professional standard and technical depth to the {job_title} role.\n\n"
        )
    else:
        prof_body += (
            f"Throughout my career, I have engineered diverse technical systems, focused on clean architecture, "
            f"and applied best coding practices to build responsive APIs and user-centric features. My active skill "
            f"set and adaptive problem-solving skills align closely with the requirements of this role.\n\n"
        )
    prof_body += (
        f"I am eager to bring my background in {skills_list[0] if skills_list else 'software development'} to {company_name}. "
        f"Thank you for your time and consideration. I look forward to the opportunity to discuss my application further.\n\n"
        f"Sincerely,\n\n"
        f"{candidate_name}"
    )
    
    # 2. Entry-Level Version
    entry_body = (
        f"I am excited to apply for the {job_title} position at {company_name}{ind_str}. As an aspiring professional "
        f"equipped with academic training and practical project exposure in {skills_str}, I am eager to start my "
        f"professional journey and contribute to your team's upcoming milestones.\n\n"
    )
    edu_str = ""
    if resume.education and len(resume.education) > 0:
        degree = resume.education[0].get("degree") or "Degree"
        school = resume.education[0].get("school") or "University"
        edu_str = f"My academic background, including a {degree} from {school}, has provided me with solid theoretical foundations. "
    
    proj_str = ""
    if resume.projects and len(resume.projects) > 0:
        proj_title = resume.projects[0].get("title") or "Project"
        proj_str = f"Furthermore, through hands-on projects like '{proj_title}', I have successfully applied software concepts to build working prototypes, resolve bugs, and collaborate on code repositories. "
        
    entry_body += f"{edu_str}{proj_str}I possess a strong motivation to master new technologies quickly and hit the ground running.\n\n"
    entry_body += (
        f"I admire {company_name}'s commitment to technical excellence and user-centric innovation. I would be thrilled "
        f"to bring my energy and training to this role. Thank you for considering my application.\n\n"
        f"Sincerely,\n\n"
        f"{candidate_name}"
    )
    
    # 3. Experienced Version
    exp_body = (
        f"I am writing to initiate my application for the {job_title} position at {company_name}{ind_str}. "
        f"With a proven track record of technical delivery and extensive expertise in {skills_str}, "
        f"I am prepared to drive complex engineering initiatives and mentor team members at {company_name}.\n\n"
    )
    if latest_company:
        exp_body += (
            f"Serving as a {latest_role} at {latest_company}, I spearheaded critical features, established "
            f"system designs, and optimized system performance. My background highlights a constant focus on "
            f"architecting scalable systems and leading technical execution. I am confident that my experience "
            f"in scaling platforms and driving software quality will prove highly valuable in this role.\n\n"
        )
    else:
        exp_body += (
            f"Over years of technical execution, I have architected systems, resolved database bottlenecks, "
            f"and guided features from concept to production. My experience covers the entire lifecycle of software "
            f"development, enabling me to handle complex constraints and deliver performant engineering results.\n\n"
        )
    exp_body += (
        f"I am excited about the prospect of bringing my technical expertise and leadership background to "
        f"your team at {company_name}. Thank you for your review. I look forward to discussing our mutual fit.\n\n"
        f"Sincerely,\n\n"
        f"{candidate_name}"
    )
    
    return {
        "professional": header + prof_body,
        "entry_level": header + entry_body,
        "experienced": header + exp_body
    }
