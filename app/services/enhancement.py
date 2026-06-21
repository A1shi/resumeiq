import logging
import google.generativeai as genai
from app.config import settings
import app.models as models
from typing import List, Dict, Any
from app.services.scoring import clean_fabricated_metrics

logger = logging.getLogger("app.services.enhancement")

# Configure google-generativeai client once on import if key is set
if settings.GEMINI_API_KEY:
    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
    except Exception as e:
        logger.error(f"Failed to configure google.generativeai client: {e}")

def generate_resume_enhancements_with_gemini(resume: models.Resume) -> Dict[str, Any]:
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

def generate_resume_enhancements_local(resume: models.Resume) -> Dict[str, Any]:
    """Generates local rephrasings strictly grounded in parsed content."""
    # 1. Professional Summary
    first_role = "Software Engineer"
    first_company = ""
    if resume.experience and len(resume.experience) > 0:
        first_role = resume.experience[0].get("role") or "Software Engineer"
        first_company = resume.experience[0].get("company") or ""

    skills_snippet = "modern software engineering practices"
    if resume.skills and len(resume.skills) > 0:
        skills_snippet = ", ".join(resume.skills[:3])

    if first_company:
        improved_summary = (
            f"Detail-oriented {first_role} with hands-on experience at {first_company}. "
            f"Proficient in leveraging {skills_snippet} to design and deploy reliable applications. "
            f"Skilled in collaborating with cross-functional teams, solving technical challenges, "
            f"and implementing maintainable software designs to support business objectives."
        )
    else:
        improved_summary = (
            f"Detail-oriented {first_role} with professional industry experience. "
            f"Proficient in leveraging {skills_snippet} to design and deploy reliable applications. "
            f"Skilled in collaborating with cross-functional teams, solving technical challenges, "
            f"and implementing maintainable software designs to support business objectives."
        )

    # 2. Experience Bullets (polishing sentences, no invented numbers/metrics)
    improved_experience = []
    for exp in (resume.experience or []):
        role = exp.get("role") or "Software Professional"
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
            action_verbs_set = {"developed", "designed", "implemented", "managed", "spearheaded", "built", "engineered", "optimized", "led", "created", "collaborated", "wrote", "tested"}
            if first_word not in action_verbs_set and len(words) > 1:
                s_clean = s_clean[0].upper() + s_clean[1:]
            
            polished_bullets.append(s_clean)
            
        if not polished_bullets:
            polished_bullets = [
                f"Contributed to core development and code maintenance as a {role} at {company}.",
                f"Collaborated with product teams to design features and resolve defects.",
                f"Applied best practices in software design and source control using industry standards."
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
        tech_str = f" built on {', '.join(techs)}" if techs else ""

        proj_sentences = [s.strip() for s in orig_desc.split(".") if s.strip()]
        if proj_sentences:
            imp_desc = f"Engineered a {title} application{tech_str}. " + ". ".join(proj_sentences) + "."
        else:
            imp_desc = f"Designed and engineered the {title} application{tech_str}, implementing functional modules and testing dependencies to ensure software quality."

        improved_projects.append({
            "title": title,
            "original": orig_desc,
            "improved": imp_desc
        })

    keyword_suggestions = ["CI/CD Pipelines", "Docker & Containerization", "Cloud Architectures (AWS/GCP)", "Automated Testing", "REST API Design"]
    if resume.skills:
        c_skills_lower = [s.lower() for s in resume.skills]
        keyword_suggestions = [ks for ks in keyword_suggestions if ks.lower() not in c_skills_lower]

    return {
        "improved_summary": improved_summary,
        "improved_experience": improved_experience,
        "improved_projects": improved_projects,
        "keyword_suggestions": keyword_suggestions
    }

def generate_resume_enhancements(resume: models.Resume) -> Dict[str, Any]:
    """Generates side-by-side resume improvement suggestions without faking metrics."""
    if settings.GEMINI_API_KEY:
        try:
            return generate_resume_enhancements_with_gemini(resume)
        except Exception as e:
            logger.warning(f"Gemini resume enhancement failed, falling back to local: {e}")
            return generate_resume_enhancements_local(resume)
    else:
        return generate_resume_enhancements_local(resume)
