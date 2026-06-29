import json
import logging
import re
import google.generativeai as genai
from typing import List, Dict, Any, Optional, Tuple
from app.config import settings

logger = logging.getLogger("app.services.ai_engine")

class ResumeParserService:
    @staticmethod
    def parse_resume(raw_text: str) -> Dict[str, Any]:
        """
        Parses raw resume text into structured fields using Gemini.
        """
        if not settings.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is not set.")

        prompt = (
            "You are an expert resume parsing agent. Extract all structured details from the following resume text:\n\n"
            f"{raw_text}\n\n"
            "Return a valid JSON object matching the following schema. Ensure no markdown formatting or code block wrappers are present in the response:\n"
            "{\n"
            "  \"name\": \"Full name of the candidate\",\n"
            "  \"email\": \"Email address\",\n"
            "  \"phone\": \"Phone number\",\n"
            "  \"summary\": \"Professional summary or career profile\",\n"
            "  \"profession\": \"Specific detected profession (e.g., Computer Science Teacher, Registered Nurse, Backend Developer, Accountant, Sales Executive, Civil Engineer). Be specific, do not default to Software Engineer.\",\n"
            "  \"industry\": \"Detected industry (e.g., Education, Healthcare, Technology, Finance, Construction, Hospitality)\",\n"
            "  \"seniority\": \"Seniority level (Intern, Junior, Mid, Senior, Lead, Manager, Director, Executive)\",\n"
            "  \"experience_level\": \"Experience duration (Fresher, 1-3 Years, 3-5 Years, 5+ Years)\",\n"
            "  \"specialization\": \"Area of specialization or domain focus\",\n"
            "  \"education\": [\n"
            "    {\n"
            "      \"school\": \"Institution name\",\n"
            "      \"degree\": \"Degree earned\",\n"
            "      \"field_of_study\": \"Field of study\",\n"
            "      \"start_date\": \"Start date\",\n"
            "      \"end_date\": \"End date/Present\",\n"
            "      \"grade\": \"GPA/Grade\"\n"
            "    }\n"
            "  ],\n"
            "  \"certifications\": [\n"
            "    {\n"
            "      \"name\": \"Certification name\",\n"
            "      \"issuer\": \"Issuing organization\",\n"
            "      \"date\": \"Earned date\"\n"
            "    }\n"
            "  ],\n"
            "  \"skills\": [\"List of general skills/competencies\"],\n"
            "  \"tools\": [\"List of specific software/tools used (e.g., QuickBooks, Salesforce, Zendesk, Figma)\"],\n"
            "  \"programming_languages\": [\"List of programming languages if applicable (e.g. Python, Java)\"],\n"
            "  \"projects\": [\n"
            "    {\n"
            "      \"title\": \"Project title\",\n"
            "      \"description\": \"Description of achievements and details\",\n"
            "      \"technologies\": [\"Tools/tech used\"]\n"
            "    }\n"
            "  ],\n"
            "  \"achievements\": [\"List of major career accomplishments/metrics\"],\n"
            "  \"responsibilities\": [\"List of core responsibilities highlighted\"],\n"
            "  \"soft_skills\": [\"List of soft skills (communication, leadership, etc.)\"],\n"
            "  \"leadership_experience\": [\"Any explicit leadership accomplishments\"],\n"
            "  \"teaching_experience\": [\"Any explicit teaching/training accomplishments\"],\n"
            "  \"management_experience\": [\"Any explicit management/coordination accomplishments\"],\n"
            "  \"research_experience\": [\"Any research or scientific accomplishments\"],\n"
            "  \"publications\": [\"List of published papers/articles\"],\n"
            "  \"awards\": [\"Awards or recognitions\"],\n"
            "  \"languages\": [\n"
            "    {\n"
            "      \"language\": \"Language name\",\n"
            "      \"proficiency\": \"Proficiency level\"\n"
            "    }\n"
            "  ]\n"
            "}"
        )

        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        return json.loads(response.text)

class JDParserService:
    @staticmethod
    def parse_jd(jd_text: str) -> Dict[str, Any]:
        """
        Parses Job Description text into structured fields using Gemini.
        """
        if not settings.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is not set.")

        prompt = (
            "You are an expert recruiter parsing a Job Description. Extract all key requirements:\n\n"
            f"{jd_text}\n\n"
            "Return a valid JSON object matching the following schema. Ensure no markdown formatting or code block wrappers are present in the response:\n"
            "{\n"
            "  \"job_title\": \"Official job title\",\n"
            "  \"industry\": \"Target industry\",\n"
            "  \"department\": \"Department/Team name\",\n"
            "  \"responsibilities\": [\"List of key job responsibilities\"],\n"
            "  \"required_skills\": [\"List of required/mandatory skills\"],\n"
            "  \"preferred_skills\": [\"List of optional/preferred skills\"],\n"
            "  \"experience\": \"Experience requirements description (e.g. 3+ years)\",\n"
            "  \"education\": \"Education requirements (e.g. Bachelor's in CS)\",\n"
            "  \"certifications\": [\"Certifications mentioned\"],\n"
            "  \"tools\": [\"Tools, software or platforms mentioned\"],\n"
            "  \"technologies\": [\"Core technologies/frameworks mentioned\"],\n"
            "  \"domain\": \"Domain focus (e.g., primary education, critical care, corporate finance)\",\n"
            "  \"keywords\": [\"List of other critical industry/role keywords\"],\n"
            "  \"soft_skills\": [\"Required soft skills\"],\n"
            "  \"hard_skills\": [\"Required hard/technical skills\"],\n"
            "  \"leadership_requirements\": [\"Any leadership or mentoring requirements\"],\n"
            "  \"management_requirements\": [\"Any project/team management requirements\"]\n"
            "}"
        )

        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        return json.loads(response.text)

class ProfessionClassifier:
    @staticmethod
    def classify(resume_text: str, jd_text: Optional[str] = None) -> Dict[str, Any]:
        """
        Classifies the exact profession, industry, seniority level, and specialization.
        Dynamically infers the closest match if it's a new or rare profession, and never defaults to Software Engineer.
        """
        if not settings.GEMINI_API_KEY:
            return {
                "profession": "General Professional",
                "industry": "Business",
                "seniority": "Mid",
                "confidence": 50.0,
                "validation_passed": True,
                "validation_reason": "No Gemini API Key"
            }

        prompt = (
            "You are an expert career classification agent. Analyze the following candidate background and optional target job to determine the candidate's professional profile.\n\n"
            f"Candidate Resume/Profile:\n{resume_text}\n\n"
        )
        if jd_text:
            prompt += f"Target Job Description:\n{jd_text}\n\n"

        prompt += (
            "Your task is to classify this candidate into a highly accurate, dynamic profession. Do NOT default to Software Engineer. "
            "If the candidate is a Teacher, Nurse, Doctor, Accountant, Mechanical Engineer, Graphic Designer, etc., classify them accurately. "
            "For example, a 'Senior Computer Science Teacher (Primary School)' has a profession of 'Computer Science Teacher' and industry of 'Education'. "
            "Return a valid JSON object matching this schema:\n"
            "{\n"
            "  \"profession\": \"Dynamic profession name (e.g. Mathematics Teacher, Civil Engineer, Tax Accountant, Registered Nurse, UI/UX Designer)\",\n"
            "  \"industry\": \"Industry name (e.g. Education, Healthcare, Construction, Finance, Design, Technology)\",\n"
            "  \"seniority\": \"Seniority level (Intern, Junior, Mid, Senior, Lead, Manager, Director, Executive)\",\n"
            "  \"experience_level\": \"Experience level (Fresher, 1-3 Years, 3-5 Years, 5+ Years)\",\n"
            "  \"confidence\": 0-100 (numeric confidence value),\n"
            "  \"validation_passed\": true/false,\n"
            "  \"validation_reason\": \"Justification for the classification and validation checks\"\n"
            "}"
        )

        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        return json.loads(response.text)

class SkillExtractor:
    @staticmethod
    def extract_skills(text: str) -> Dict[str, List[str]]:
        """
        Extracts semantic skills, categorizing them into hard skills, soft skills, and tools.
        """
        if not settings.GEMINI_API_KEY:
            return {"hard_skills": [], "soft_skills": [], "tools": []}

        prompt = (
            "Extract and group all professional/technical skills and tools mentioned in this text:\n\n"
            f"{text}\n\n"
            "Return a valid JSON object matching this schema:\n"
            "{\n"
            "  \"hard_skills\": [\"list of hard/domain skills\"],\n"
            "  \"soft_skills\": [\"list of soft/interpersonal skills\"],\n"
            "  \"tools\": [\"list of software, tools, hardware or platforms used\"]\n"
            "}"
        )

        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        return json.loads(response.text)

class SemanticMatcher:
    @staticmethod
    def match(
        resume_data: Dict[str, Any],
        jd_data: Dict[str, Any],
        resume_text: str,
        jd_text: str
    ) -> Dict[str, Any]:
        """
        Performs semantic similarity matching of candidate resume against a job description.
        Computes match status (Strong Match, Partial Match, Weak Match, Missing), Confidence Score,
        and uses weighted scoring logic.
        """
        if not settings.GEMINI_API_KEY:
            return {
                "match_score": 50,
                "matching_keywords": [],
                "missing_keywords": [],
                "most_important_missing_keywords": [],
                "skill_gaps": ["Fallback due to missing API Key"],
                "experience_match": {"required_experience": "", "detected_experience": "", "gap_analysis": ""},
                "certification_match": {"required_certifications": [], "detected_certifications": [], "missing_certifications": []},
                "recommendations": ["Set GEMINI_API_KEY to enable full semantic matching."],
                "interview_questions": []
            }

        prompt = (
            "You are a professional recruiting coordinator and ATS semantic matching expert.\n"
            "Analyze the alignment of this candidate's parsed resume details and raw text against the target parsed job description details and raw text.\n\n"
            f"Candidate Parsed Resume Details:\n{json.dumps(resume_data, indent=2)}\n\n"
            f"Target Parsed Job Description Details:\n{json.dumps(jd_data, indent=2)}\n\n"
            f"Raw Candidate Resume Text:\n{resume_text}\n\n"
            f"Raw Target Job Description:\n{jd_text}\n\n"
            "CRITICAL MATCHING RULES:\n"
            "- Perform SEMANTIC MATCHING instead of strict keyword searches. If the JD requires 'Educational Technology' and the candidate mentions 'Digital Teaching Methods', they match semantically (Strong Match or Partial Match).\n"
            "- Match intent, concepts, and domain knowledge.\n"
            "- Do NOT compare unrelated skills. A Teacher should never lose score points for missing software engineering tools like 'Docker', 'Kubernetes', or 'Git' unless the JD is explicitly for a Software Developer role.\n"
            "- Compute 5 sub-scores (0-100 each):\n"
            "  1. resume_alignment_score: General domain compatibility of the resume content (40% weight)\n"
            "  2. jd_requirements_score: Fit against specific skills/responsibilities in the JD (40% weight)\n"
            "  3. experience_score: Match of work experience depth/years (10% weight)\n"
            "  4. education_score: Match of degree/field of study (5% weight)\n"
            "  5. certification_score: Match of requested certifications (5% weight)\n"
            "  (The final match_score must be mathematically computed as: (resume_alignment_score*0.4) + (jd_requirements_score*0.4) + (experience_score*0.1) + (education_score*0.05) + (certification_score*0.05))\n\n"
            "Return a valid JSON object matching the following schema. Ensure no markdown formatting or code block wrappers are present in the response:\n"
            "{\n"
            "  \"job_title\": \"Official job title category parsed from the JD\",\n"
            "  \"sub_scores\": {\n"
            "    \"resume_alignment_score\": 0-100,\n"
            "    \"jd_requirements_score\": 0-100,\n"
            "    \"experience_score\": 0-100,\n"
            "    \"education_score\": 0-100,\n"
            "    \"certification_score\": 0-100\n"
            "  },\n"
            "  \"match_score\": 0-100,\n"
            "  \"semantic_keyword_alignment\": [\n"
            "    {\n"
            "      \"job_requirement\": \"The required skill or qualification from the JD\",\n"
            "      \"match_status\": \"One of: Strong Match, Partial Match, Weak Match, Missing\",\n"
            "      \"confidence_score\": 0-100,\n"
            "      \"semantic_alignment_details\": \"Explanation of context, intent, meaning overlap (e.g., 'Digital Teaching Methods aligns with Educational Technology')\"\n"
            "    }\n"
            "  ],\n"
            "  \"matching_keywords\": [\"List of skills/keywords found in resume or matched semantically (string values)\"],\n"
            "  \"missing_keywords\": [\"List of required skills/keywords not matched in resume (string values)\"],\n"
            "  \"most_important_missing_keywords\": [\"List of 3-5 most critical missing skills/requirements\"],\n"
            "  \"skill_gaps\": [\"List of high-level gaps in candidate capability for this job description\"],\n"
            "  \"experience_match\": {\n"
            "    \"required_experience\": \"Summary of required experience from JD\",\n"
            "    \"detected_experience\": \"Summary of candidate experience from resume\",\n"
            "    \"gap_analysis\": \"Gap analysis details\"\n"
            "  },\n"
            "  \"certification_match\": {\n"
            "    \"required_certifications\": [\"Required certifications from JD\"],\n"
            "    \"detected_certifications\": [\"Found in resume\"],\n"
            "    \"missing_certifications\": [\"Missing certifications\"]\n"
            "  },\n"
            "  \"recommendations\": [\"Exactly 5 highly specific, actionable recommendations tailored STRICTLY to the candidate's profession to improve alignment (do not mention unrelated domain tools like Docker or AWS for non-tech roles)\"],\n"
            "  \"interview_questions\": [\n"
            "    {\n"
            "      \"question\": \"Custom interview question tailored specifically to this resume, addressing gaps or qualifications\",\n"
            "      \"difficulty\": \"Easy, Medium, or Hard\",\n"
            "      \"key_points\": [\"Key points to cover in response\"],\n"
            "      \"sample_answer_structure\": \"Structured framework for response\"\n"
            "    }\n"
            "  ]\n"
            "}"
        )

        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        
        result = json.loads(response.text)
        
        # Enforce mathematical weighted score calculation
        try:
            sub = result.get("sub_scores", {})
            r_score = float(sub.get("resume_alignment_score", 50))
            j_score = float(sub.get("jd_requirements_score", 50))
            e_score = float(sub.get("experience_score", 50))
            ed_score = float(sub.get("education_score", 50))
            c_score = float(sub.get("certification_score", 50))
            
            calc = (r_score * 0.40) + (j_score * 0.40) + (e_score * 0.10) + (ed_score * 0.05) + (c_score * 0.05)
            result["match_score"] = int(min(100, max(0, calc)))
        except Exception as e:
            logger.warning(f"Failed to calculate weighted math score: {str(e)}")
            
        return result

class QuestionGenerator:
    @staticmethod
    def generate_questions(
        resume_data: Dict[str, Any],
        profession: str,
        seniority: str,
        experience_years: str,
        skills: List[str],
        jd_text: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generates exactly 80+ dynamic questions (10 per category) tailored strictly to the candidate's profession.
        """
        if not settings.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is not configured.")

        # Formatting sub-details for the prompt
        exp_list = resume_data.get("experience", [])
        exp_str = ""
        for exp in exp_list:
            exp_str += f"- {exp.get('role')} at {exp.get('company')}: {exp.get('description')}\n"

        proj_list = resume_data.get("projects", [])
        proj_str = ""
        for proj in proj_list:
            proj_str += f"- {proj.get('title')}: {proj.get('description')} ({', '.join(proj.get('technologies', []))})\n"

        prompt = (
            "You are an expert technical interviewer and recruiting coordinator.\n"
            f"Generate a customized list of interview questions for a candidate with the following profile:\n"
            f"- Profession: {profession}\n"
            f"- Seniority Level: {seniority}\n"
            f"- Experience Level: {experience_years}\n"
            f"- Skills & Tools: {', '.join(skills)}\n"
            f"- Experience Summary:\n{exp_str}\n"
            f"- Projects:\n{proj_str}\n"
        )
        if jd_text:
            prompt += f"- Target Job Description Requirements:\n{jd_text}\n"

        prompt += (
            "\nCRITICAL QUESTION GENERATION INSTRUCTIONS:\n"
            "1. You MUST customize every single question category to the candidate's exact profession. "
            "For example, if the profession is Teacher, questions MUST focus on teaching methods, student assessments, classroom management, and child psychology. "
            "Never use software engineering concepts (like APIs, git, docker, database normalization) for non-technical roles.\n"
            "2. Scenarios must reflect real situations in that field. (e.g. Teacher: disruptive student, parent complaint; Nurse: patient emergency, medication safety; Developer: server outage, database scaling).\n"
            "3. STAR questions must focus on leadership and actions matching their seniority level.\n"
            "4. Determine the difficulty (Easy, Medium, Hard) dynamically based on seniority and years of experience.\n"
            "5. Generate EXACTLY 10 questions per category (exactly 8 categories, total 80 questions):\n"
            "   - resume_questions: based on candidate's specific background, timeline transitions, education, and credentials.\n"
            "   - jd_questions: custom questions targeting specific job description responsibilities (if no JD provided, standard target role questions).\n"
            "   - technical_questions: domain technical questions (e.g. GAAP compliance for Accountants; medication administration for Nurses; classroom technologies for Teachers; system design/DSA for Developers).\n"
            "   - hr_questions: cultural, motivation, and screening questions customized to this profession.\n"
            "   - behavioral_questions: STAR format questions (Situation, Task, Action, Result) tailored to this profession's team dynamics.\n"
            "   - scenario_questions: hypothetical profession-specific situational challenges.\n"
            "   - project_questions: deep dive into projects, lessons learned, or portfolio implementations.\n"
            "   - problem_solving_questions: analytical or role-specific diagnostic problems.\n\n"
            "Return a valid JSON object matching the following structure (do not wrap in markdown or prefix with text):\n"
            "{\n"
            "  \"technical_readiness\": 0-100,\n"
            "  \"hr_readiness\": 0-100,\n"
            "  \"communication_readiness\": 0-100,\n"
            "  \"overall_readiness\": 0-100,\n"
            "  \"resume_questions\": [ { \"question\": \"text\", \"difficulty\": \"Easy|Medium|Hard\", \"sample_answer_structure\": \"structure text\" } ],\n"
            "  \"jd_questions\": [ { \"question\": \"text\", \"difficulty\": \"Easy|Medium|Hard\", \"sample_answer_structure\": \"structure text\" } ],\n"
            "  \"technical_questions\": [ { \"question\": \"text\", \"difficulty\": \"Easy|Medium|Hard\", \"sample_answer_structure\": \"structure text\" } ],\n"
            "  \"hr_questions\": [ { \"question\": \"text\", \"difficulty\": \"Easy|Medium|Hard\", \"sample_answer_structure\": \"structure text\" } ],\n"
            "  \"behavioral_questions\": [ { \"question\": \"text\", \"difficulty\": \"Easy|Medium|Hard\", \"sample_answer_structure\": \"structure text\" } ],\n"
            "  \"scenario_questions\": [ { \"question\": \"text\", \"difficulty\": \"Easy|Medium|Hard\", \"sample_answer_structure\": \"structure text\" } ],\n"
            "  \"project_questions\": [ { \"question\": \"text\", \"difficulty\": \"Easy|Medium|Hard\", \"sample_answer_structure\": \"structure text\" } ],\n"
            "  \"problem_solving_questions\": [ { \"question\": \"text\", \"difficulty\": \"Easy|Medium|Hard\", \"sample_answer_structure\": \"structure text\" } ]\n"
            "}"
        )

        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        return json.loads(response.text)

class RecommendationGenerator:
    @staticmethod
    def generate_recommendations(profession: str, skills: List[str], gaps: List[str]) -> List[str]:
        """
        Generates 5 highly professional, domain-appropriate recommendations.
        """
        if not settings.GEMINI_API_KEY:
            # Fallback recommendations if offline
            return [
                f"Obtain a premium industry certification in {profession}.",
                "Structure resume statements with quantitative results and metrics.",
                "Detail projects demonstrating practical utilization of key competencies.",
                "Refine summary section to target job role responsibilities.",
                "Mention recent continuing education courses or certifications."
            ]

        prompt = (
            "You are an expert career advisory coach. Generate exactly 5 concrete, actionable resume recommendations for the candidate.\n"
            f"- Candidate Profession: {profession}\n"
            f"- Current Skills: {', '.join(skills)}\n"
            f"- Missing Requirements/Gaps: {', '.join(gaps)}\n\n"
            "CRITICAL RULE:\n"
            "- The recommendations must be completely tailored to the profession. "
            "For example, a Teacher should be advised to learn Google Certified Educator, Classroom technology, or lesson planning. "
            "Do NOT recommend Docker, CI/CD, Git, Python, or database normalization unless the profession is technical/software development.\n"
            "Return a valid JSON array of strings containing exactly 5 items: [\"rec1\", \"rec2\", \"rec3\", \"rec4\", \"rec5\"]"
        )

        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        return json.loads(response.text)

class ReportGenerator:
    @staticmethod
    def generate_full_report(resume_data: Dict[str, Any], base_scores: Dict[str, Any]) -> Dict[str, Any]:
        """
        Synthesizes the dynamic data into a premium career intelligence report.
        """
        if not settings.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is not set.")

        prompt = (
            "You are an expert recruiter-grade career intelligence assistant. You are analyzing the following candidate resume parsing details and scores:\n\n"
            f"Candidate parsed data: {json.dumps(resume_data)}\n"
            f"Base scores: {json.dumps(base_scores)}\n\n"
            "Generate a complete career intelligence report. "
            "Return a valid JSON object matching the following structure:\n"
            "{\n"
            "  \"readiness_level\": \"Beginner|Developing|Competitive|Strong Candidate|Interview Ready\",\n"
            "  \"contact_reason\": \"justification\",\n"
            "  \"summary_reason\": \"justification\",\n"
            "  \"skills_reason\": \"justification\",\n"
            "  \"experience_reason\": \"justification\",\n"
            "  \"projects_reason\": \"justification\",\n"
            "  \"education_reason\": \"justification\",\n"
            "  \"certifications_reason\": \"justification\",\n"
            "  \"formatting_reason\": \"justification\",\n"
            "  \"keyword_reason\": \"justification\",\n"
            "  \"recruiters_like\": [\"strength 1\", \"strength 2\", \"strength 3\"],\n"
            "  \"recruiters_reject\": [\"objection 1\", \"objection 2\", \"objection 3\"],\n"
            "  \"top_risks\": [\"risk 1\", \"risk 2\", \"risk 3\"],\n"
            "  \"confidence_level\": \"Low|Medium|High\",\n"
            "  \"top_matching_roles\": [\n"
            "    {\n"
            "      \"role\": \"matching role title\",\n"
            "      \"match_score\": 0-100,\n"
            "      \"skill_gaps\": [\"gap 1\", \"gap 2\"],\n"
            "      \"learning_roadmap\": [\"step 1\", \"step 2\"],\n"
            "      \"expected_salary\": \"e.g., $90,000 - $110,000\",\n"
            "      \"difficulty\": \"Low|Medium|High\"\n"
            "    }\n"
            "  ],\n"
            "  \"skill_gap_analysis\": {\n"
            "    \"current_skills\": [\"skill 1\"],\n"
            "    \"missing_skills\": [\"skill 2\"],\n"
            "    \"future_skills\": [\"emerging skill 3\"],\n"
            "    \"high_priority_gaps\": [\"gap 1\"],\n"
            "    \"medium_priority_gaps\": [\"gap 2\"],\n"
            "    \"low_priority_gaps\": [\"gap 3\"]\n"
            "  },\n"
            "  \"seven_day_plan\": [\"task\"],\n"
            "  \"thirty_day_plan\": [\"task\"],\n"
            "  \"sixty_day_plan\": [\"task\"],\n"
            "  \"ninety_day_plan\": [\"task\"],\n"
            "  \"ai_resume_enhancement\": {\n"
            "    \"improved_summary\": \"polished career objective/summary suited strictly to the profession\",\n"
            "    \"improved_experience\": [ { \"role\": \"\", \"company\": \"\", \"original\": \"\", \"improved\": \"polished bullet points\" } ],\n"
            "    \"improved_projects\": [ { \"title\": \"\", \"original\": \"\", \"improved\": \"polished narrative\" } ],\n"
            "    \"improved_skills\": [\"polished skills\"],\n"
            "    \"keyword_suggestions\": [\"recommended dynamic keywords\"]\n"
            "  },\n"
            "  \"job_application_toolkit\": {\n"
            "    \"professional_cover_letter\": \"full letter text\",\n"
            "    \"short_cover_letter\": \"short letter\",\n"
            "    \"email_application\": \"email draft\",\n"
            "    \"linkedin_outreach\": \"linkedin note\",\n"
            "    \"recruiter_intro\": \"intro note\"\n"
            "  },\n"
            "  \"interview_preparation\": {\n"
            "    \"hr_questions\": [\"q 1\", \"q 2\"],\n"
            "    \"technical_questions\": [\"q 1\", \"q 2\"],\n"
            "    \"resume_questions\": [\"q 1\", \"q 2\"],\n"
            "    \"project_questions\": [\"q 1\", \"q 2\"],\n"
            "    \"behavioral_questions\": [\"q 1\", \"q 2\"]\n"
            "  },\n"
            "  \"candidate_profile\": \"dynamic category title matching candidate profession/seniority\",\n"
            "  \"career_level\": \"Entry Level|Mid Level|Senior Level|Executive\",\n"
            "  \"industry_classification\": \"dynamic industry category matching profession\",\n"
            "  \"experience_level\": \"Fresher|1-3 Years|3-5 Years|5+ Years\",\n"
            "  \"professional_summary\": \"polished summary\"\n"
            "}"
        )

        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        return json.loads(response.text)
