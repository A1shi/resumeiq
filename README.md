# 📄 ResumeIQ

## Intelligent Resume Parsing & Analysis Platform

ResumeIQ is a full-stack resume analysis application that extracts information from PDF and DOCX resumes, converts unstructured documents into structured candidate data, and stores the results for analysis and retrieval.

---

## ✨ Features

- 📄 **Document Extraction** — Extract text from PDF and DOCX resumes.
- 🔍 **Structured Resume Parsing** — Extract candidate information such as name, email, phone number, skills, education, experience, and projects.
- ⚙️ **Rule-Based Analysis Engine** — Process resume data using deterministic pattern-matching logic.
- 🗄️ **Database Storage** — Store and retrieve parsed resume information.
- 📜 **Resume History** — Access previously processed resumes.
- 🌐 **REST API** — Backend services built with FastAPI.
- 💻 **Interactive Dashboard** — Upload resumes and view structured candidate information.
- 🔄 **Database Flexibility** — SQLite for local development with PostgreSQL support.

---

## 🏗️ Architecture

```text
                ┌──────────────────┐
                │  React Frontend  │
                └────────┬─────────┘
                         │
                     REST API
                         │
                         ▼
                ┌──────────────────┐
                │ FastAPI Backend  │
                └────────┬─────────┘
                         │
              ┌──────────┼──────────┐
              ▼          ▼          ▼
        PDF Parser   DOCX Parser  Resume Parser
              │          │          │
              └──────────┼──────────┘
                         │
                         ▼
                    SQLAlchemy
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
           SQLite              PostgreSQL
Tech Stack
Backend
Python
FastAPI
SQLAlchemy
Pydantic
Document Processing
PyPDF
python-docx
Database
SQLite
PostgreSQL
Frontend
React
JavaScript
HTML
CSS
🔄 Application Workflow
Resume Upload
      ↓
PDF / DOCX Text Extraction
      ↓
Structured Information Parsing
      ↓
Candidate Data Extraction
      ↓
Database Storage
      ↓
Dashboard Visualization
Quick Start
1. Clone the Repository
git clone https://github.com/A1shi/resumeiq.git
cd resumeiq
2. Create a Virtual Environment

Windows PowerShell:

python -m venv .venv
.venv\Scripts\Activate.ps1
3. Install Dependencies
pip install -r requirements.txt
4. Configure Environment Variables

Create a .env file:

DATABASE_URL=sqlite:///./resumes.db

⚠️ Never commit your .env file or database credentials to GitHub.

5. Run the Application
python -m uvicorn app.main:app --reload --port 8000
6. Open the Application

Open:

http://127.0.0.1:8000
📡 API Endpoints
Method	Endpoint	Description
POST	/resumes/upload	Upload and parse a resume
GET	/resumes	Retrieve resume history
GET	/resumes/{id}	Retrieve detailed resume information
GET	/health	Check application health

Note: Verify the endpoint paths against the routes defined in the FastAPI application.

🔮 Planned Enhancements
AI-powered resume recommendations
Job description matching
ATS compatibility analysis
Skill gap analysis
LLM integration
AI-powered cover letter generation
Interview preparation
Advanced semantic resume analysis
👩‍💻 Author
-Aashi Gupta

Aspiring GenAI & Software Developer
