import logging
from typing import List, Dict, Any

from app.config import settings
from app.schemas import RecruiterSimulationSchema
from app.services.matcher import extract_jd_keywords, compare_resume_to_jd

logger = logging.getLogger("app.services.recruiter")

def simulate_candidate_recruitment(resume_text: str, jd_text: str) -> dict:
    """
    Analyzes the candidate's resume against a job description, acting as a real recruiter.
    Returns a dictionary matching RecruiterSimulationSchema.
    """
    if not resume_text.strip():
        raise ValueError("Resume text is empty.")
    if not jd_text.strip():
        raise ValueError("Job description text is empty.")

    try:
        # 1. Run local keyword extraction and comparison
        job_title, jd_keywords = extract_jd_keywords(jd_text)
        comparison = compare_resume_to_jd(resume_text, job_title, jd_keywords)
        
        matching = comparison.matching_keywords
        missing = comparison.missing_keywords
        
        # 2. Decision Logic
        overlap_ratio = len(matching) / len(jd_keywords) if jd_keywords else 1.0
        
        if overlap_ratio >= 0.65:
            decision = "Shortlist"
            base_prob = 75
        elif overlap_ratio < 0.30:
            decision = "Reject"
            base_prob = 15
        else:
            decision = "Maybe"
            base_prob = 45
            
        interview_probability = round(overlap_ratio * 60 + base_prob * 0.4)
        interview_probability = min(98, max(5, interview_probability))
        
        # 3. Reasoning generation
        reasoning_parts = [
            f"The candidate is a potential match for the {job_title} position."
        ]
        
        if matching:
            reasoning_parts.append(
                f"They demonstrate strong technical qualifications in several key target areas, matching keywords such as {', '.join(matching[:3])}."
            )
        else:
            reasoning_parts.append(
                "The profile does not list any of the primary technical skills required for this position."
            )
            
        if missing:
            reasoning_parts.append(
                f"However, there are noticeable gaps in their toolkit, specifically missing experience in {', '.join(missing[:3])}."
            )
            
        reasoning = " ".join(reasoning_parts)
        
        # 4. Strengths
        strengths = []
        if matching:
            strengths.append(f"Demonstrates alignment on key technical keywords: {', '.join(matching[:3])}.")
        else:
            strengths.append("Possesses basic layout structure.")
            
        if len(resume_text) > 1000:
            strengths.append("Provides a detailed description of past project responsibilities.")
        else:
            strengths.append("Concise resume layout that fits a single-page view.")
            
        if "@" in resume_text:
            strengths.append("Includes clear, direct email contact information.")
        else:
            strengths.append("Basic text formatting.")
            
        # Ensure exactly 3 strengths
        strengths = strengths[:3]
        while len(strengths) < 3:
            strengths.append("Clear section formatting.")
            
        # 5. Concerns
        concerns = []
        if missing:
            concerns.append(f"Lacks documented experience with: {', '.join(missing[:3])}.")
        else:
            concerns.append("Minimal technical gaps identified.")
            
        if len(resume_text) < 800:
            concerns.append("Short content length suggests limited project/work details.")
        elif len(resume_text) > 5500:
            concerns.append("Resume is long and wordy; layout may benefit from conciseness.")
        else:
            concerns.append("Could benefit from more quantitative achievement metrics.")
            
        if not matching:
            concerns.append("No technical skill overlap found with the target JD.")
            
        # Ensure exactly 3 concerns
        concerns = concerns[:3]
        while len(concerns) < 3:
            concerns.append("No direct domain-specific certifications listed.")

        # 6. Suggestions
        suggested_improvements = []
        if missing:
            suggested_improvements.append(
                f"Add specific examples of how you have applied or could apply '{missing[0]}' in your project portfolio."
            )
            if len(missing) > 1:
                suggested_improvements.append(
                    f"Integrate '{missing[1]}' into your professional experience descriptions to highlight hands-on exposure."
                )
        else:
            suggested_improvements.append("Refine the bullet points of past experiences to highlight leadership and scope.")
            
        suggested_improvements.append("Quantify the results of your projects (e.g., 'improved performance by 25%', 'reduced costs by $5k').")
        suggested_improvements.append("Add a concise professional summary at the very beginning of the resume tailored for this role.")
        suggested_improvements.append("Ensure consistent date formatting and chronological sequencing throughout the timeline.")
        
        # Ensure between 3 and 5 suggestions
        suggested_improvements = suggested_improvements[:5]
        
        return {
            "decision": decision,
            "reasoning": reasoning,
            "strengths": strengths,
            "concerns": concerns,
            "interview_probability": interview_probability,
            "suggested_improvements": suggested_improvements
        }
        
    except Exception as e:
        logger.error(f"Local Recruiter Simulation failed: {str(e)}")
        raise RuntimeError(f"Failed to run local Recruiter Simulator: {str(e)}")
