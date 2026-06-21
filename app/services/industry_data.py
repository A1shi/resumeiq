# Industry-specific database for rule-based career intelligence fallbacks

INDUSTRY_DATA_MAP = {
    "Tech": {
        "primary_title": "Software Engineer",
        "roles_list": [
            ("Software Engineer", 88, ["System Design", "Testing Tools"], "Medium", "$105,000 - $140,000"),
            ("Backend Developer", 85, ["FastAPI", "Go"], "Medium", "$100,000 - $135,000"),
            ("Frontend Developer", 80, ["React", "TypeScript"], "Medium", "$95,000 - $130,000"),
            ("Full Stack Developer", 78, ["Node.js", "SQL"], "High", "$105,000 - $145,000"),
            ("DevOps Engineer", 72, ["AWS", "CI/CD"], "High", "$115,000 - $155,000"),
            ("Data Engineer", 68, ["Spark", "SQL Data Pipelines"], "High", "$120,000 - $160,000"),
            ("QA Engineer", 65, ["Automated Testing", "Selenium"], "Medium", "$80,000 - $110,000"),
            ("Product Manager (Tech)", 60, ["Product Roadmap", "Agile Management"], "High", "$115,000 - $145,000"),
            ("Solutions Engineer", 55, ["APIs", "Customer Success"], "Low", "$90,000 - $125,000"),
            ("Prompt Engineer", 50, ["LLMs", "Generative AI Prompting"], "Low", "$80,000 - $120,000")
        ],
        "missing_skills": ["Docker", "Kubernetes", "CI/CD", "AWS", "System Design", "Testing Tools"],
        "future_skills": ["TypeScript", "Next.js", "Serverless", "Terraform", "Kubernetes"],
        "high_priority_gaps": ["Docker", "CI/CD"],
        "medium_priority_gaps": ["AWS", "System Design"],
        "low_priority_gaps": ["Kubernetes"],
        "seven_day_plan": ["Complete header contact details with LinkedIn and GitHub links.", "Format professional summary with core programming keywords."],
        "thirty_day_plan": ["Complete a certified course on Docker or containerization.", "Integrate technical metrics to experience descriptions."],
        "sixty_day_plan": ["Draft a mock backend API deployed via containerization on your portfolio.", "Review system design guidelines and database indexing."],
        "ninety_day_plan": ["Set up CI/CD workflows for automated unit testing.", "Apply to technical software developer openings."],
        "recruiters_like": [
            "Consistent professional layout and readable sections.",
            "Strong alignment of keywords for Software Engineer positions.",
            "Complete contact coordinates facilitating recruiter outreach."
        ],
        "recruiters_reject": [
            "Lack of quantitative business metrics showing performance gains.",
            "Summary lacks specific, role-focused industry keywords."
        ],
        "top_risks": [
            "Thin description in some employment or projects entries.",
            "Low keyword match count for target DevOps and cloud tools."
        ],
        "hr_questions": [
            "Tell me about a challenging professional experience and how you handled it.",
            "What are your long-term career goals, and why are you interested in this position?",
            "Describe a situation where you had to work with a difficult teammate."
        ],
        "technical_questions": [
            "Explain the best practices you follow when developing with modern software frameworks.",
            "How do you approach scaling application databases and checking query performance?",
            "Explain the difference between a microservices architecture and a monolithic design."
        ],
        "resume_questions": [
            "Explain your primary responsibilities in your most recent professional role.",
            "Why did you choose the specific technology stack described in your resume?",
            "What was your strategy for identifying and fixing bugs in your past job?"
        ],
        "project_questions": [
            "What was the biggest technical challenge you faced in your personal projects, and how did you resolve it?",
            "How did you design the database schema and manage state in your projects?",
            "If you had more time, how would you optimize the projects listed on your resume?"
        ],
        "behavioral_questions": [
            "Describe a time when you had to adapt quickly to a major shift in project requirements.",
            "How do you prioritize deliverables when managing multiple deadlines?",
            "Give an example of a time when you went above and beyond your standard duties."
        ]
    },
    "Management": {
        "primary_title": "Technical Project Manager",
        "roles_list": [
            ("Technical Project Manager", 88, ["System Design", "Budgeting"], "Medium", "$110,000 - $145,000"),
            ("Scrum Master", 85, ["JIRA Administration", "Agile Cert"], "Medium", "$90,000 - $125,000"),
            ("Product Manager", 80, ["Product Roadmaps", "A/B Testing"], "High", "$115,000 - $150,000"),
            ("Agile Delivery Lead", 78, ["Sprint Planning", "JIRA"], "Medium", "$100,000 - $135,000"),
            ("Business Analyst", 72, ["SQL Queries", "Tableau"], "Low", "$80,000 - $110,000"),
            ("Program Manager", 70, ["Resource Planning", "Risk Metrics"], "High", "$120,000 - $160,000"),
            ("Product Owner", 68, ["User Stories", "PRD Writing"], "Medium", "$95,000 - $130,000"),
            ("Operations Manager", 60, ["Operational KPIs", "Budgets"], "Medium", "$85,000 - $115,000"),
            ("Strategy Consultant", 55, ["Market Analysis", "Valuation"], "High", "$125,000 - $170,000"),
            ("IT Director", 50, ["Infrastructure", "Budgeting"], "High", "$140,000 - $190,000")
        ],
        "missing_skills": ["JIRA Administration", "Agile Certifications", "Product Roadmaps", "Stakeholder Management", "SQL for Data", "OKR Frameworks"],
        "future_skills": ["Agile Scaled Framework (SAFe)", "Tableau Analytics", "Product Analytics (Amplitude)", "AI Product Management"],
        "high_priority_gaps": ["JIRA Administration", "Agile Certifications"],
        "medium_priority_gaps": ["Product Roadmaps", "Stakeholder Management"],
        "low_priority_gaps": ["SQL for Data"],
        "seven_day_plan": ["Format resume header with LinkedIn and portfolio links.", "Draft a clear, impact-driven professional summary outlining team scopes."],
        "thirty_day_plan": ["Complete a certified Scrum Master (CSM) or CAPM training.", "Rewrite experience bullet points using quantitative project deliverables."],
        "sixty_day_plan": ["Draft a sample Product Requirements Document (PRD) to showcase on portfolio.", "Review agile ceremony planning methodologies."],
        "ninety_day_plan": ["Learn basic SQL or Tableau to support data-driven tracking.", "Apply to target project/product delivery roles."],
        "recruiters_like": [
            "Clean formatting with clear professional experience sections.",
            "Strong keyword match for project management tools like JIRA and Agile.",
            "Clear structure demonstrating stakeholder coordination."
        ],
        "recruiters_reject": [
            "Lacks quantitative project metrics (budgets managed, delivery timelines).",
            "Missing professional agile certifications in header or education."
        ],
        "top_risks": [
            "Descriptions are generic and read like a list of tasks rather than achievements.",
            "Low density of data tracking or software development lifecycle keywords."
        ],
        "hr_questions": [
            "How do you handle scope creep when working with tight deadlines?",
            "Describe a conflict you resolved between engineering teams and product stakeholders.",
            "What is your approach to prioritizing a congested product backlog?"
        ],
        "technical_questions": [
            "Explain the difference between Scrum and Kanban frameworks.",
            "How do you define and track key project health metrics (velocity, burn-down)?",
            "How do you organize a sprint planning session for a distributed team?"
        ],
        "resume_questions": [
            "Walk me through the lifecycle of the most successful project listed on your resume.",
            "What specific methodologies did you apply to coordinate the deliverables listed?",
            "Why did you choose the specific project tracking stack mentioned?"
        ],
        "project_questions": [
            "What was the biggest roadmap bottleneck you faced, and how did you resolve it?",
            "How did you gather requirements and translate them into user stories?",
            "If you had to redo the projects listed, how would you change the resource management?"
        ],
        "behavioral_questions": [
            "Describe a time when a project deadline was missed and how you communicated it.",
            "How do you maintain team morale when sprint goals are compromised?",
            "Tell me about a time you had to influence a senior stakeholder without direct authority."
        ]
    },
    "Marketing": {
        "primary_title": "Marketing Specialist",
        "roles_list": [
            ("Marketing Manager", 88, ["A/B Testing", "CRM Automation"], "Medium", "$80,000 - $115,000"),
            ("Digital Strategist", 85, ["GA4 Analytics", "SEO Strategy"], "Medium", "$75,000 - $105,000"),
            ("Content Marketing Lead", 80, ["Copywriting", "Branding"], "Low", "$65,000 - $90,000"),
            ("Account Executive", 78, ["HubSpot CRM", "Sales Strategy"], "Medium", "$70,000 - $110,000"),
            ("SEO Specialist", 72, ["Semrush", "Keyword Research"], "Low", "$60,000 - $85,000"),
            ("Sales Manager", 70, ["B2B Sourcing", "Lead Gen"], "High", "$90,000 - $130,000"),
            ("Brand Manager", 68, ["PR Strategy", "Market Research"], "High", "$85,000 - $120,000"),
            ("Growth Strategist", 65, ["Conversion Funnels", "CRO"], "High", "$95,000 - $135,000"),
            ("Social Media Manager", 60, ["Ad Campaigns", "Buffer"], "Low", "$55,000 - $78,000"),
            ("Customer Success Lead", 55, ["Zendesk", "Churn Analysis"], "Low", "$70,000 - $98,000")
        ],
        "missing_skills": ["Google Analytics (GA4)", "Salesforce CRM", "A/B Testing", "Email Automation (HubSpot)", "SEO Optimization", "Copywriting"],
        "future_skills": ["AI Content Tools", "Marketing Automation", "GA4 Custom Event Tracking", "Data-driven CRO"],
        "high_priority_gaps": ["Google Analytics (GA4)", "Salesforce CRM"],
        "medium_priority_gaps": ["A/B Testing", "Email Automation (HubSpot)"],
        "low_priority_gaps": ["SEO Optimization"],
        "seven_day_plan": ["Format resume margins and add LinkedIn contact links.", "Revamp professional summary focusing on campaign conversions."],
        "thirty_day_plan": ["Complete a Google Analytics (GA4) or HubSpot CRM course.", "Integrate sales/conversion metrics to past job bullet points."],
        "sixty_day_plan": ["Develop 2 mock email marketing or social media ad campaigns.", "Build an online writing portfolio page."],
        "ninety_day_plan": ["Learn basic SEO keyword research with Semrush or Ahrefs.", "Apply to growth, account, or campaign manager roles."],
        "recruiters_like": [
            "Creative layout and clearly presented experience timeline.",
            "Broad skills listing covering copywriting and digital tools.",
            "Complete contact info with social/portfolio linkages."
        ],
        "recruiters_reject": [
            "Lacks quantitative marketing outcomes (leads generated, conversion rate gains).",
            "Missing analytics-focused tools (GA4, SQL) required for modern marketing."
        ],
        "top_risks": [
            "Content lists general responsibilities rather than lead conversion performance.",
            "Low density of automation and tracking tools."
        ],
        "hr_questions": [
            "Tell me about a campaign you launched that failed, and what you learned.",
            "How do you prioritize marketing budget allocations across channels?",
            "Describe how you handle tight content turnaround timelines."
        ],
        "technical_questions": [
            "Explain how you set up and measure a split A/B test for landing pages.",
            "What metrics do you track to calculate customer acquisition cost (CAC) and LTV?",
            "How does search engine indexing impact content design strategy?"
        ],
        "resume_questions": [
            "Explain the lead generation process you implemented at your last company.",
            "Which marketing automation stack did you leverage for the achievements listed?",
            "Why did you choose the specific target segment described?"
        ],
        "project_questions": [
            "What was the most successful marketing asset you built, and what was its impact?",
            "How did you design the distribution channels for the project campaigns?",
            "If you had more budget, how would you optimize the project conversion rates?"
        ],
        "behavioral_questions": [
            "Describe a time you had to adapt copy/branding based on customer feedback.",
            "How do you resolve creative differences with product designers?",
            "Describe a situation where you had to lead a cross-functional marketing launch."
        ]
    },
    "Finance": {
        "primary_title": "Financial Analyst",
        "roles_list": [
            ("Financial Analyst", 88, ["Accounting ERP", "Forecasting"], "Medium", "$78,000 - $108,000"),
            ("Business Analyst", 85, ["Data Models", "SQL Queries"], "Medium", "$80,000 - $110,000"),
            ("Accountant", 80, ["Tax Audits", "QuickBooks"], "Low", "$65,000 - $92,000"),
            ("Investment Banking Analyst", 78, ["Valuations", "CFA Entry"], "High", "$95,000 - $140,000"),
            ("Corporate Controller", 70, ["SOX Compliance", "Ledgers"], "High", "$110,000 - $150,000"),
            ("Operations Analyst", 68, ["Process Audits", "VBA Macros"], "Low", "$70,000 - $95,000"),
            ("Risk Manager", 65, ["Hedging", "Stress Testing"], "High", "$90,000 - $130,000"),
            ("Tax Specialist", 60, ["Filings", "IRS Codes"], "Medium", "$75,000 - $105,000"),
            ("Corporate Auditor", 58, ["Reconciliations", "SAP"], "Medium", "$68,000 - $95,000"),
            ("Treasury Analyst", 55, ["Cash Flows", "Liquidity"], "High", "$80,000 - $112,000")
        ],
        "missing_skills": ["Financial Modeling", "Advanced Excel (VBA/Macros)", "QuickBooks ERP", "SQL Databases", "Tableau/PowerBI", "CPA/CFA Progress"],
        "future_skills": ["Automated Financial Analytics", "Automated Reporting", "SAP ERP routines", "Predictive Modeling"],
        "high_priority_gaps": ["Financial Modeling", "Advanced Excel (VBA/Macros)"],
        "medium_priority_gaps": ["QuickBooks ERP", "SQL Databases"],
        "low_priority_gaps": ["Tableau/PowerBI"],
        "seven_day_plan": ["Format margins and verify LinkedIn link works correctly.", "Focus summary statement on asset/budget planning competencies."],
        "thirty_day_plan": ["Complete an advanced Excel VBA or Financial Modeling tutorial.", "Add specific capital/savings metric values to experience details."],
        "sixty_day_plan": ["Draft a mock budget allocation or company valuation dashboard.", "Practice financial statement reconciliation procedures."],
        "ninety_day_plan": ["Prepare for CPA/CFA exams or professional software certifications.", "Target business analyst or financial controller openings."],
        "recruiters_like": [
            "Clean, math-focused format with clear chronological dates.",
            "Comprehensive listing of accounting and spreadsheets exposure.",
            "Accurate contact coordinates and professional credentials."
        ],
        "recruiters_reject": [
            "Lacks quantitative metric justification (dollar size of budgets managed, cost savings).",
            "No indication of ERP tool experience (SAP, QuickBooks, Oracle)."
        ],
        "top_risks": [
            "Bullet points read like general bookkeeping rather than strategic analysis.",
            "Low density of data-querying tools like SQL or PowerBI."
        ],
        "hr_questions": [
            "How do you maintain concentration when reviewing massive financial logs?",
            "Describe a time you discovered a budget discrepancy and how you reported it.",
            "Why are you interested in corporate finance rather than public accounting?"
        ],
        "technical_questions": [
            "Explain how the three primary financial statements link together.",
            "How do you build a discounted cash flow (DCF) model in Excel?",
            "What is the difference between capital expenditures (CapEx) and operational expenditures (OpEx)?"
        ],
        "resume_questions": [
            "Explain the specific financial analysis tasks you performed at your last firm.",
            "What database tools did you leverage to fetch the data points mentioned?",
            "Why did you choose the specific budget modeling methodology?"
        ],
        "project_questions": [
            "What was the most complex financial model you built, and what did it prove?",
            "How did you clean the data inputs for your project analysis?",
            "If you had to optimize the project model, how would you account for variance?"
        ],
        "behavioral_questions": [
            "Describe a time you had to deliver difficult financial news to stakeholders.",
            "How do you prioritize deliverables during end-of-month financial closing?",
            "Tell me about a time you coordinated with auditors under a tight deadline."
        ]
    },
    "HR": {
        "primary_title": "HR Specialist",
        "roles_list": [
            ("HR Generalist", 88, ["Labor Laws", "HRIS Setup"], "Low", "$65,000 - $90,000"),
            ("Corporate Recruiter", 85, ["Greenhouse ATS", "Sourcing"], "Low", "$70,000 - $98,000"),
            ("Talent Acquisition Specialist", 80, ["Negotiation", "Sourcing Tools"], "Medium", "$72,000 - $100,000"),
            ("HR Manager", 78, ["Relations", "Conflict Resolution"], "Medium", "$85,000 - $120,000"),
            ("Compensation Specialist", 72, ["Payroll Systems", "KPIs"], "High", "$80,000 - $112,000"),
            ("HR Consultant", 70, ["Compliance Audits", "Workday"], "High", "$90,000 - $125,000"),
            ("Learning Coordinator", 65, ["Course Design", "Onboarding"], "Low", "$60,000 - $82,000"),
            ("Diversity Coordinator", 60, ["Compliance", "Cultural Audits"], "Medium", "$78,000 - $108,000"),
            ("Employee Experience Lead", 58, ["Feedback Metrics", "KPIs"], "Medium", "$75,000 - $102,000"),
            ("People Director", 50, ["Strategy", "HRIS Workday"], "High", "$135,000 - $185,000")
        ],
        "missing_skills": ["ATS Systems (Workday/Greenhouse)", "Labor Law compliance", "Conflict Resolution", "HRIS Database Management", "KPI Tracking", "Employee Engagement"],
        "future_skills": ["HR Analytics", "Automated Candidate Screening", "Modern Talent Management Platforms (BambooHR)"],
        "high_priority_gaps": ["ATS Systems (Workday/Greenhouse)", "Labor Law compliance"],
        "medium_priority_gaps": ["Conflict Resolution", "HRIS Database Management"],
        "low_priority_gaps": ["Employee Engagement"],
        "seven_day_plan": ["Format margins and update headers with LinkedIn profile.", "Craft a professional summary focusing on hiring/employee growth metrics."],
        "thirty_day_plan": ["Obtain a basic certification/experience in Greenhouse/Workday.", "Quantify experience details (employees onboarded, time-to-hire reduction)."],
        "sixty_day_plan": ["Draft a mock employee handbook or structured recruiting plan.", "Review local compliance guidelines and labor standards."],
        "ninety_day_plan": ["Begin preparation for SHRM-CP or PHR certifications.", "Apply to corporate recruiting or HR coordinator openings."],
        "recruiters_like": [
            "Clean section layout and readable font selections.",
            "Comprehensive details outlining recruiting and screening pipelines.",
            "Complete contact links and professional communication details."
        ],
        "recruiters_reject": [
            "Lacks numerical recruiting results (volume of hires, retention rate, employee count).",
            "Missing compliance/regulatory keywords required for HR administration."
        ],
        "top_risks": [
            "Experience description reads like a simple list of task logs.",
            "Low density of corporate HR metrics and applicant tracking tools."
        ],
        "hr_questions": [
            "How do you handle difficult conversations regarding employee termination?",
            "Describe a time you managed a major shift in employee benefit plans.",
            "What is your strategy for sourcing candidates for hard-to-fill technical roles?"
        ],
        "technical_questions": [
            "Explain key labor law guidelines (FLSA, FMLA, Title VII) that govern hiring.",
            "How do you calculate key recruiting metrics like Time-to-Hire and Cost-per-Hire?",
            "How do you configure applicant tracking systems to screen candidates fairly?"
        ],
        "resume_questions": [
            "Walk me through the employee onboarding plan you implemented at your last company.",
            "Which HRIS system did you utilize for database management in the roles listed?",
            "Why did you focus on the specific employee retention programs described?"
        ],
        "project_questions": [
            "What was the most successful HR initiative you led, and what was its employee rating?",
            "How did you structure the recruiting pipeline for the candidate hiring campaign?",
            "If you had more resources, how would you optimize the project employee experience?"
        ],
        "behavioral_questions": [
            "Describe a conflict you resolved between employees at different management levels.",
            "How do you handle confidential personal employee data under tight timelines?",
            "Describe a time you spearheaded a change in corporate culture or employee alignment."
        ]
    },
    "Healthcare": {
        "primary_title": "Clinical Coordinator",
        "roles_list": [
            ("Clinical Coordinator", 88, ["HIPAA Codes", "Epic EHR"], "Medium", "$70,000 - $98,000"),
            ("Healthcare Administrator", 85, ["Compliance", "Certifications"], "High", "$85,000 - $120,000"),
            ("Medical Record Specialist", 80, ["Cerner System", "EHR Sandbox"], "Low", "$50,000 - $72,000"),
            ("Patient Advocate", 78, ["Scheduling", "Safety Laws"], "Low", "$55,000 - $78,000"),
            ("Clinical Data Analyst", 72, ["SQL Queries", "BI Analytics"], "High", "$80,000 - $112,000"),
            ("Public Health Lead", 70, ["Research", "Statistics"], "Medium", "$68,000 - $95,000"),
            ("Clinical Operations Manager", 68, ["Budgets", "Logistics"], "High", "$115,000 - $160,000"),
            ("Medical Billing Analyst", 60, ["ICD-10 Code", "Invoicing"], "Low", "$52,000 - $75,000"),
            ("Nurse Manager", 58, ["Ward Staffing", "Triages"], "High", "$95,000 - $135,000"),
            ("Healthcare Compliance Lead", 55, ["SOX Rules", "Risk audits"], "High", "$88,000 - $122,000")
        ],
        "missing_skills": ["HIPAA Regulations", "EHR Systems (Epic/Cerner)", "Medical Coding", "Healthcare Compliance", "Resource Scheduling", "Patient Relations"],
        "future_skills": ["Digital EHR migration", "Clinical analytics", "Telehealth operations coordination", "Patient data security"],
        "high_priority_gaps": ["HIPAA Regulations", "EHR Systems (Epic/Cerner)"],
        "medium_priority_gaps": ["Medical Coding", "Healthcare Compliance"],
        "low_priority_gaps": ["Patient Relations"],
        "seven_day_plan": ["Format margins and add licensing/credential linkages to header.", "Revamp professional summary focusing on patient/clinical outcomes."],
        "thirty_day_plan": ["Complete HIPAA regulatory compliance certification.", "Quantify clinical experience details (patients managed, scheduling efficiency)."],
        "sixty_day_plan": ["Gain sandbox experience with Epic or Cerner EHR workflows.", "Review medical coding and healthcare billing protocols."],
        "ninety_day_plan": ["Prepare for administrative medical coding (CPC) or health records credentials.", "Apply to healthcare program or patient relations manager roles."],
        "recruiters_like": [
            "Clean layout highlighting educational credentials and licensing.",
            "Comprehensive breakdown of clinical tasks and patient interactions.",
            "Clear contact details and regulatory alignment."
        ],
        "recruiters_reject": [
            "Lacks quantitative operations metrics (patient volumes, scheduling/billing metrics).",
            "Missing EHR database tools (Epic, Cerner) widely required by clinical groups."
        ],
        "top_risks": [
            "Descriptions are generic and lack detail about specific clinical guidelines followed.",
            "Low density of database and compliance-specific systems."
        ],
        "hr_questions": [
            "How do you manage stress during sudden clinical emergencies or patient conflicts?",
            "Describe a situation where you had to coordinate care under strict resource constraints.",
            "How do you explain medical procedures clearly to anxious patients?"
        ],
        "technical_questions": [
            "Explain HIPAA regulations regarding patient health information (PHI) disclosure.",
            "How do you organize patient records using Epic EHR systems?",
            "How do you handle billing code discrepancies (ICD-10/CPT) in patient invoices?"
        ],
        "resume_questions": [
            "Walk me through the patient intake guidelines you managed in your last role.",
            "Which clinical systems did you use to manage schedules and data logs?",
            "Why did you focus on the specific care coordinator initiatives mentioned?"
        ],
        "project_questions": [
            "What was the most successful patient care project you structured, and what were the outcomes?",
            "How did you handle regulatory compliance in the clinical campaigns?",
            "If you had to redo the patient project, how would you optimize patient routing?"
        ],
        "behavioral_questions": [
            "Describe a conflict you resolved between patient families and clinical staff.",
            "How do you prioritize patient care items when managing multiple deadlines?",
            "Tell me about a time you went above and beyond to improve patient satisfaction."
        ]
    },
    "General": {
        "primary_title": "Operations Analyst",
        "roles_list": [
            ("Operations Coordinator", 88, ["Budget reports", "CRM Systems"], "Low", "$55,000 - $78,000"),
            ("Business Analyst", 85, ["Data Models", "KPI tracking"], "Medium", "$80,000 - $110,000"),
            ("Administrative Manager", 80, ["Office Policies", "Trello"], "Low", "$60,000 - $85,000"),
            ("Client Relationship Lead", 78, ["Sourcing CRM", "Outreach"], "Low", "$58,000 - $80,000"),
            ("Assistant Project Manager", 72, ["Agile tools", "Asana"], "Medium", "$70,000 - $95,000"),
            ("Operations Analyst", 70, ["Process mapping", "SQL Queries"], "Low", "$68,000 - $92,000"),
            ("Compliance Specialist", 68, ["Risk audits", "Audit codes"], "Medium", "$72,000 - $98,000"),
            ("Business Dev Rep (BDR)", 65, ["Lead Gen", "Salesforce"], "Low", "$60,000 - $88,000"),
            ("Customer Experience Lead", 60, ["Zendesk CRM", "Churn analytics"], "Low", "$55,000 - $75,000"),
            ("Operations Director", 55, ["Global Delivery", "Budgets"], "High", "$85,000 - $120,000")
        ],
        "missing_skills": ["Project Management Tools (Asana)", "Data Visualization (Excel/PowerBI)", "Business Writing", "Customer Relationship CRM", "Budgeting & Expenses", "KPI Analytics"],
        "future_skills": ["AI Productivity Tools", "Salesforce automation", "Multi-channel communication platforms", "Collaborative dashboarding"],
        "high_priority_gaps": ["Project Management Tools (Asana)", "Data Visualization (Excel/PowerBI)"],
        "medium_priority_gaps": ["Business Writing", "Customer Relationship CRM"],
        "low_priority_gaps": ["Budgeting & Expenses"],
        "seven_day_plan": ["Format resume sections cleanly; add professional LinkedIn profile link.", "Format summary focusing on operations/business organization skills."],
        "thirty_day_plan": ["Learn project management tools (Asana, Trello) or Excel dashboards.", "Quantify experience bullet points using project completion times or cost metrics."],
        "sixty_day_plan": ["Draft a mock business analytics report or workflow diagram.", "Coordinate project timelines and deliverables on digital sheets."],
        "ninety_day_plan": ["Explore introductory certifications in project management or business analysis.", "Apply to operations analyst or coordination openings."],
        "recruiters_like": [
            "Clean, standard section layout with clear headings.",
            "Versatile skill listing outlining broad administrative/operational tools.",
            "Complete contact links and professional summary introductory layout."
        ],
        "recruiters_reject": [
            "Lacks specific performance metrics (savings, volume of work managed, accuracy).",
            "Missing industry-specific software certifications or target system training."
        ],
        "top_risks": [
            "Bullet points read like general tasks rather than accomplishments with results.",
            "Low density of technical/querying tools."
        ],
        "hr_questions": [
            "How do you prioritize your daily task list when multiple managers request work?",
            "Describe a time you suggested an improvement to a company workflow.",
            "Why are you interested in this operations/coordination position?"
        ],
        "technical_questions": [
            "How do you organize projects and check task delivery using Asana/Trello?",
            "Explain how you use Excel formulas and pivot tables to analyze spreadsheets.",
            "What criteria do you use to evaluate vendor proposals and business expenses?"
        ],
        "resume_questions": [
            "Explain the operational tasks you carried out in your last job.",
            "Which CRM or database tools did you use to manage business details?",
            "Why did you follow the specific reporting schedule mentioned?"
        ],
        "project_questions": [
            "What was the most complex business/coordination project you ran, and what were the outcomes?",
            "How did you structure team communication for your project deliveries?",
            "If you had to redo the operations project, how would you improve resources?"
        ],
        "behavioral_questions": [
            "Describe a conflict you resolved with an external vendor or stakeholder.",
            "How do you coordinate deadlines when managing multiple projects?",
            "Tell me about a time you had to adapt quickly to changes in business procedures."
        ]
    }
}
