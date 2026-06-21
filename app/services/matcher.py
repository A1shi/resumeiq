import re
import logging
import json
import google.generativeai as genai
from pydantic import BaseModel, Field
from typing import List, Tuple, Dict, Any

from app.config import settings
import app.models as models
from app.services.parser import extract_skills_from_text

logger = logging.getLogger("app.services.matcher")

class JDComparisonResponse(BaseModel):
    matching_keywords: List[str] = Field(..., description="Keywords required by the JD that are present in the resume.")
    missing_keywords: List[str] = Field(..., description="Keywords required by the JD that are absent in the resume.")
    skill_gaps: List[str] = Field(..., description="High-level gaps or missing domain experience.")
    recommendations: List[str] = Field(..., description="Concrete, actionable advice to align resume with JD.")
    semantic_fit_score: int = Field(..., description="An overall semantic alignment score from 0 to 20.")

def extract_jd_keywords(jd_text: str) -> Tuple[str, List[str]]:
    """
    Local Pass 1: Extracts the canonical keywords and job title from the JD text.
    """
    if not jd_text.strip():
        raise ValueError("Job description text is empty.")

    # 1. Job Title extraction from the first few lines
    lines = [line.strip() for line in jd_text.split("\n") if line.strip()]
    job_title = "Software Engineer" # Default
    
    title_indicators = ["job title:", "title:", "role:", "position:"]
    found_title = False
    
    for line in lines[:4]:
        line_lower = line.lower()
        for indicator in title_indicators:
            if line_lower.startswith(indicator):
                job_title = line[len(indicator):].strip()
                found_title = True
                break
        if found_title:
            break
            
    if not found_title and lines:
        # Check if first line is reasonable length to be a title
        first_line = lines[0]
        if len(first_line) < 80:
            # Clean leading markdown headers if any
            job_title = re.sub(r'^[#\-\*\•\s]+', "", first_line).strip()
        else:
            # If the first line is very long, try to find a line with role words
            role_keywords = ["engineer", "developer", "manager", "lead", "architect", "analyst", "intern", "specialist"]
            for line in lines[:3]:
                if any(kw in line.lower() for kw in role_keywords) and len(line) < 80:
                    job_title = line
                    break
                    
    # Clean up trailing punctuation
    job_title = re.sub(r'[:\-]+$', "", job_title).strip()
    
    # 2. Keyword extraction (using our robust skills extractor)
    jd_keywords = extract_skills_from_text(jd_text)
    if not jd_keywords:
        jd_keywords = ["Software Development", "Technical Skills"]

    return job_title, jd_keywords

def compare_resume_to_jd(resume_text: str, jd_title: str, jd_keywords: List[str]) -> JDComparisonResponse:
    """
    Local Pass 2: Compares candidate's resume text against extracted JD keywords and job title.
    """
    # Normalize resume skills first for robust synonym-aware matching
    resume_skills = extract_skills_from_text(resume_text)
    resume_skills_lower = {s.lower() for s in resume_skills}
    
    resume_text_lower = resume_text.lower()
    matching = []
    missing = []
    
    for kw in jd_keywords:
        # 1. Match by normalized skill representation (e.g. "nodejs" vs "Node.js")
        if kw.lower() in resume_skills_lower:
            matching.append(kw)
        else:
            # 2. Fallback to direct raw text search for custom keywords not in SKILLS_DB
            pattern = rf'(?<![a-zA-Z0-9]){re.escape(kw.lower())}(?![a-zA-Z0-9])'
            if re.search(pattern, resume_text_lower):
                matching.append(kw)
            else:
                missing.append(kw)
            
    # Gap analysis
    skill_gaps = []
    for miss in missing[:4]:
        skill_gaps.append(f"No direct mention of '{miss}' in the resume profile.")
    if not skill_gaps:
        skill_gaps.append("Candidate meets all extracted keyword requirements.")
        
    # Recommendations
    recommendations = []
    for miss in missing[:4]:
        recommendations.append(f"Add a project or detail work experience showcasing hands-on usage of '{miss}'.")
    recommendations.append("Tailor your professional summary to align with the core responsibilities of this role.")
    
    # Semantic fit score (out of 20)
    if jd_keywords:
        overlap_ratio = len(matching) / len(jd_keywords)
        semantic_fit_score = round(overlap_ratio * 20)
    else:
        semantic_fit_score = 20
        
    return JDComparisonResponse(
        matching_keywords=matching,
        missing_keywords=missing,
        skill_gaps=skill_gaps,
        recommendations=recommendations,
        semantic_fit_score=semantic_fit_score
    )

def match_resume_with_jd_gemini(resume_text: str, jd_text: str) -> Dict[str, Any]:
    """
    Calls the Gemini 1.5 Flash API with a structured prompt requesting a JSON payload
    representing all matching metrics, experience/certification alignment, recommendations,
    and mock interview questions.
    """
    prompt = (
        f"You are a professional recruiting coordinator and ATS expert.\n"
        f"Compare the candidate's resume text against the target job description to evaluate alignment.\n\n"
        f"Candidate Resume Text:\n{resume_text}\n\n"
        f"Target Job Description:\n{jd_text}\n\n"
        f"Analyze the alignment and return a JSON object with the following structure:\n"
        f"{{\n"
        f"  \"job_title\": \"(string) Extracted job title or role category from the JD\",\n"
        f"  \"match_score\": (int) \"Overall compatibility score between 0 and 100 representing how well the resume matches the JD. Be realistic and objective based on required vs detected skills.\",\n"
        f"  \"matching_keywords\": [\"list of skills/technologies from the JD that the candidate has in their resume\"],\n"
        f"  \"missing_keywords\": [\"list of skills/technologies from the JD that are not explicitly found in the resume\"],\n"
        f"  \"most_important_missing_keywords\": [\"list of the top 3 to 5 most critical missing keywords or skills from the JD that are absent in the resume\"],\n"
        f"  \"skill_gaps\": [\"list of high-level functional or technical skill gaps\"],\n"
        f"  \"experience_match\": {{\n"
        f"    \"required_experience\": \"(string) What experience (years, roles, domains) does the JD ask for?\",\n"
        f"    \"detected_experience\": \"(string) What experience is shown in the resume?\",\n"
        f"    \"gap_analysis\": \"(string) Contrast required vs detected experience. Note any years-of-experience deficits or role deviations.\"\n"
        f"  }},\n"
        f"  \"certification_match\": {{\n"
        f"    \"required_certifications\": [\"list of certifications/trainings requested/preferred in the JD\"],\n"
        f"    \"detected_certifications\": [\"list of certifications/trainings found in the resume\"],\n"
        f"    \"missing_certifications\": [\"list of required/preferred certifications/trainings that are missing from the resume\"]\n"
        f"  }},\n"
        f"  \"recommendations\": [\"list of exactly 5 specific, actionable steps to improve the resume match score (e.g. 'Add Docker projects', 'Acquire AWS certified Cloud Practitioner certification')\"],\n"
        f"  \"interview_questions\": [\n"
        f"    {{\n"
        f"      \"question\": \"(string) A custom, non-generic interview question tailored specifically to this resume and this JD to test critical qualifications or address gaps.\",\n"
        f"      \"difficulty\": \"(string) Easy, Medium, or Hard\",\n"
        f"      \"key_points\": [\"list of key details/criteria candidate should include in a strong answer\"],\n"
        f"      \"sample_answer_structure\": \"(string) Brief structured guide on how candidate should frame their answer\"\n"
        f"    }}\n"
        f"  ]\n"
        f"}}\n\n"
        f"CRITICAL RULES:\n"
        f"- Return ONLY a valid JSON object. Do not wrap the JSON object in markdown blocks (like ```json ... ```) or prefix with any text. The output must be directly parseable by json.loads().\n"
        f"- Do not invent certifications or fabricate credentials for either party.\n"
        f"- Provide 3 to 5 highly relevant interview questions."
    )

    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(
        prompt,
        generation_config={"response_mime_type": "application/json"}
    )
    
    result = json.loads(response.text)
    
    # Validation/Sanitization of match_score
    if "match_score" in result:
        try:
            result["match_score"] = int(result["match_score"])
        except ValueError:
            result["match_score"] = 50
    else:
        result["match_score"] = 50
        
    return result

def match_resume_with_jd_local(resume_text: str, jd_text: str) -> Dict[str, Any]:
    """
    Local rule-based fallback matching engine if Gemini is not configured or fails.
    """
    # 1. Extract Keywords
    job_title, jd_keywords = extract_jd_keywords(jd_text)
    
    # 2. Compare resume
    comparison = compare_resume_to_jd(resume_text, job_title, jd_keywords)

    # 3. Calculate score based on formula:
    # Overlap Score (60% weight)
    total_keywords = len(comparison.matching_keywords) + len(comparison.missing_keywords)
    if total_keywords > 0:
        overlap_score = (len(comparison.matching_keywords) / total_keywords) * 60.0
    else:
        overlap_score = 60.0

    # Skill Gap Severity Score (20% weight)
    num_gaps = len(comparison.skill_gaps) if comparison.missing_keywords else 0
    gap_score = max(0, 20 - num_gaps * 4)

    # Subjective semantic fit score (20% weight)
    fit_score = min(20, max(0, comparison.semantic_fit_score))

    # Total Score
    total_score = round(overlap_score + gap_score + fit_score)
    total_score = min(100, max(0, total_score))

    # --- Local fallback calculations for new fields ---
    
    # most_important_missing_keywords
    most_important_missing = comparison.missing_keywords[:4]
    if not most_important_missing:
        most_important_missing = ["No critical missing keywords identified."]

    # experience_match local analysis
    req_years = "Not specified"
    year_match = re.search(r'(\d+)\+?\s*years?', jd_text, re.IGNORECASE)
    if year_match:
        req_years = f"{year_match.group(1)}+ years"
    
    det_years = "Not specified"
    resume_year_match = re.search(r'(\d+)\+?\s*years?', resume_text, re.IGNORECASE)
    if resume_year_match:
        det_years = f"{resume_year_match.group(1)}+ years"
        
    experience_match = {
        "required_experience": f"Target role calls for {req_years} of domain experience.",
        "detected_experience": f"Candidate profile indicates around {det_years} of experience.",
        "gap_analysis": "Local rule overlap detected. Alignment appears stable; check bullet points for scope."
    }

    # certification_match local analysis
    common_certs = ["AWS", "PMP", "CCNA", "CompTIA", "CISSP", "Certified", "Scrum", "Azure", "Google Cloud", "ITIL"]
    req_certs = []
    det_certs = []
    
    jd_lower = jd_text.lower()
    resume_lower = resume_text.lower()
    
    for c in common_certs:
        if c.lower() in jd_lower:
            req_certs.append(c)
        if c.lower() in resume_lower:
            det_certs.append(c)
            
    missing_certs = [c for c in req_certs if c not in det_certs]
    
    certification_match = {
        "required_certifications": req_certs if req_certs else ["No explicit certifications required."],
        "detected_certifications": det_certs if det_certs else ["No standard certifications detected."],
        "missing_certifications": missing_certs if missing_certs else ["No missing certifications found."]
    }

    # Generate 5 recommendations
    recs = []
    for miss in comparison.missing_keywords[:3]:
        recs.append(f"Add a project or detail work experience showcasing hands-on usage of '{miss}'.")
    recs.append("Quantify achievements (e.g., 'improved performance by 25%') in project details.")
    recs.append("Tailor your professional summary to highlight the core requirements of this position.")
    recs = recs[:5]
    while len(recs) < 5:
        recs.append("Ensure your contact info lists a GitHub profile link for technical roles.")

    # Generate 3 custom interview questions based on missing keywords
    interview_qs = []
    sample_skills = comparison.missing_keywords[:3]
    if not sample_skills:
        sample_skills = ["Software Development", "System Design", "Cloud Architecture"]
        
    difficulties = ["Medium", "Hard", "Medium"]
    for idx, skill in enumerate(sample_skills[:3]):
        diff = difficulties[idx % len(difficulties)]
        interview_qs.append({
            "question": f"Can you describe a scenario where you had to quickly learn or apply {skill} in a production environment?",
            "difficulty": diff,
            "key_points": [
                f"Describe your initial unfamiliarity with {skill}",
                "Detail the resources and strategy used to get up to speed",
                "Explain the concrete implementation and results achieved"
            ],
            "sample_answer_structure": "STAR method: Situation, Task, Action (emphasizing self-learning), Result."
        })

    return {
        "job_title": job_title,
        "match_score": total_score,
        "matching_keywords": comparison.matching_keywords,
        "missing_keywords": comparison.missing_keywords,
        "skill_gaps": comparison.skill_gaps,
        "recommendations": recs,
        "most_important_missing_keywords": most_important_missing,
        "experience_match": experience_match,
        "certification_match": certification_match,
        "interview_questions": interview_qs
    }

def match_resume_with_jd(resume_text: str, jd_text: str) -> Dict[str, Any]:
    """
    Executes the full matching engine and returns the final scoring and analysis.
    Uses Gemini AI if configured; otherwise falls back to local rule-based analysis.
    """
    if settings.GEMINI_API_KEY:
        try:
            logger.info("Matching resume with JD using Gemini API...")
            return match_resume_with_jd_gemini(resume_text, jd_text)
        except Exception as e:
            logger.warning(f"Failed to match resume with JD using Gemini: {str(e)}. Falling back to local match.")
            
    logger.info("Matching resume with JD using local rule-based engine...")
    return match_resume_with_jd_local(resume_text, jd_text)
