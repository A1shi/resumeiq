#  ResumeIQ

### Intelligent Resume Parsing & Analysis Platform

**ResumeIQ** is a full-stack resume processing platform that converts unstructured PDF and DOCX resumes into structured candidate information.

The application uses **React** for the frontend and **FastAPI** for the backend, with a rule-based parsing engine and relational database storage. It extracts information such as candidate details, skills, education, experience, and projects, making resumes easier to analyze, search, and manage.

---

##  Overview

ResumeIQ addresses the problem of manually processing large numbers of resumes.

Instead of reading and extracting information from every resume manually, ResumeIQ provides an automated pipeline:

```text
Resume Document
      │
      ▼
PDF / DOCX Extraction
      │
      ▼
Text Processing
      │
      ▼
Structured Resume Parsing
      │
      ▼
Candidate Information
      │
      ▼
Database Storage
      │
      ▼
Interactive Dashboard
```

---

##  Key Features

| Feature                 | Description                                                            |
| ----------------------- | ---------------------------------------------------------------------- |
|  Document Processing  | Extract text from PDF and DOCX resumes                                 |
|  Resume Parsing       | Identify candidate information from unstructured text                  |
|  Candidate Extraction | Extract name, email, phone, skills, education, experience and projects |
|  Rule-Based Engine    | Deterministic pattern-matching for structured extraction               |
|  Database Storage     | Persist processed resume information                                   |
|  Resume History       | Retrieve previously processed resumes                                  |
|  REST API             | FastAPI-based backend API                                              |
|  Dashboard            | Upload resumes and view extracted information                          |
|  Database Flexibility | SQLite for development with PostgreSQL support                         |

---

##  System Architecture

```text
                         ┌─────────────────────┐
                         │    React Frontend   │
                         │  Dashboard / Upload │
                         └──────────┬──────────┘
                                    │
                                REST API
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   FastAPI Backend   │
                         │                     │
                         │  API / Business     │
                         │      Logic          │
                         └──────────┬──────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
              ┌──────────┐   ┌──────────┐   ┌──────────────┐
              │ PDF      │   │ DOCX     │   │ Resume       │
              │ Parser   │   │ Parser   │   │ Parser       │
              └────┬─────┘   └────┬─────┘   └──────┬───────┘
                   │              │                 │
                   └──────────────┼─────────────────┘
                                  ▼
                         ┌─────────────────┐
                         │   SQLAlchemy    │
                         │ ORM / Database  │
                         └────────┬────────┘
                                  │
                         ┌────────┴────────┐
                         ▼                 ▼
                    ┌─────────┐      ┌────────────┐
                    │ SQLite  │      │ PostgreSQL │
                    └─────────┘      └────────────┘
```

---

##  Application Workflow

### 1. Resume Upload

The user uploads a resume through the React dashboard.

```text
PDF / DOCX
    ↓
Upload
```

### 2. Document Extraction

The FastAPI backend identifies the document type and extracts its text.

```text
PDF → PyPDF
DOCX → python-docx
```

### 3. Resume Parsing

The extracted text is processed by the rule-based parsing engine to identify structured fields.

```text
Raw Resume Text
       ↓
Pattern Matching
       ↓
Candidate Fields
```

Example:

```text
Name        → Aashi Gupta
Email       → aashi9gupta@gmail.com
Skills      → Python, SQL, FastAPI
Education   → B.Tech Computer Science
Experience  → Software Developer
Projects    → ResumeIQ, Data Pipeline
```

### 4. Database Storage

The structured candidate information is stored using SQLAlchemy.

```text
Parsed Resume
      ↓
SQLAlchemy
      ↓
SQLite / PostgreSQL
```

### 5. Dashboard

The frontend retrieves the processed information through REST APIs and presents it in a structured format.

---

##  Tech Stack

### Backend

* **Python**
* **FastAPI**
* **SQLAlchemy**
* **Pydantic**
* **Uvicorn**

### Document Processing

* **PyPDF**
* **python-docx**

### Database

* **SQLite**
* **PostgreSQL**

### Frontend

* **React**
* **JavaScript**
* **HTML**
* **CSS**

### API Architecture

* REST APIs
* JSON-based communication
* CRUD operations
* Environment-based configuration

---

##  Project Structure

```text
resumeiq/
│
├── app/
│   ├── main.py
│   ├── models/
│   ├── schemas/
│   ├── routers/
│   ├── services/
│   └── database/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── uploads/
│
├── requirements.txt
├── .env.example
├── .gitignore
└── README.md
```

> The exact structure may vary depending on the current repository implementation.

---

##  Screenshots

### Dashboard

Add your main dashboard screenshot here:

```markdown
![ResumeIQ Dashboard](screenshots/dashboard.png)
```

### Resume Upload

```markdown
![Resume Upload](screenshots/upload.png)
```

### Parsed Resume

```markdown
![Parsed Resume](screenshots/parsed-resume.png)
```

### Database / API

```markdown
![API Response](screenshots/api-response.png)
```

> **Tip:** Create a `screenshots/` folder in the repository and add 3–4 clean screenshots. This makes the repository much more visually convincing.

---

##  REST API

| Method | Endpoint          | Description                 |
| ------ | ----------------- | --------------------------- |
| `POST` | `/resumes/upload` | Upload and process a resume |
| `GET`  | `/resumes`        | Retrieve processed resumes  |
| `GET`  | `/resumes/{id}`   | Retrieve a specific resume  |
| `GET`  | `/health`         | Check application health    |

> Endpoint names should match the routes currently implemented in the FastAPI application.

---

##  Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/A1shi/resumeiq.git
cd resumeiq
```

### 2. Create a Virtual Environment

**Windows PowerShell**

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

**Linux / macOS**

```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create a `.env` file:

```env
DATABASE_URL=sqlite:///./resumes.db
```

For PostgreSQL:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/resumeiq
```

 **Never commit `.env`, database credentials, API keys, or other secrets to GitHub.**

### 5. Start the Backend

```bash
python -m uvicorn app.main:app --reload --port 8000
```

### 6. Start the Frontend

If the frontend is maintained separately:

```bash
cd frontend
npm install
npm run dev
```

### 7. Open the Application

Backend:

```text
http://127.0.0.1:8000
```

FastAPI documentation:

```text
http://127.0.0.1:8000/docs
```

---

##  Future Improvements

The project can be extended with AI-powered capabilities such as:

*  LLM-based resume analysis
*  Job description matching
*  ATS compatibility analysis
*  Skill-gap identification
*  AI-generated cover letters
*  Interview preparation
*  Semantic resume search
*  Candidate ranking and analytics

---

##  Learning Outcomes

Through this project, I worked with:

* REST API development using FastAPI
* Document processing and text extraction
* Structured data extraction from unstructured documents
* SQLAlchemy ORM and relational databases
* React-based frontend development
* API integration between frontend and backend
* Database persistence
* Environment-based application configuration
* Full-stack application architecture

---

##  Author

**Aashi Gupta**

Aspiring **GenAI & Software Developer**

Building projects around **Python, FastAPI, AI/LLM applications, Data Engineering, and Agentic AI**.

---

⭐ **If you find this project useful, consider giving the repository a star!**
