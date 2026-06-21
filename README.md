# ResumeIQ AI - AI-Powered Resume Intelligence Platform

A premium, production-grade, local rule-based resume parser and scoring engine. It extracts raw text from PDF and DOCX CVs and structures it using an intelligent local pattern-matching engine. The results are stored in a database (SQLite locally, swappable to PostgreSQL) and rendered on a sleek, high-fidelity glassmorphism React-based Single Page Application.

---

## Features

- **Document Extraction**: Seamlessly extracts text from single/multi-column PDFs and DOCX files (including paragraph tables).
- **Local Structured Parsing**: Evaluates and parses `Name`, `Email`, `Phone`, `Skills`, `Education`, `Experience`, and `Projects` deterministically using robust local rule-based pattern matching.
- **Unified Engine**: Zero external API dependencies to run locally (uses SQLite and compiles React in the browser via CDN).
- **Aesthetic Dashboard**: Custom premium dark-themed glassmorphism interface with drag-and-drop support, animated upload progress, historical timelines, and interactive profile summaries.

---

## Tech Stack

- **Backend**: FastAPI, SQLAlchemy, Pydantic v2, PyPDF, Python-Docx
- **Database**: SQLite (default) / PostgreSQL (via environment variable)
- **Frontend**: React 18, Custom Vanilla CSS Grid and Variables, Babel Standalone (zero compilation steps)

---

## Quick Start (Local Run)

Follow these simple steps to launch the application:

### 1. Configure the Environment
Open the `.env` file in the root folder (optional configuration parameters can be added here):
```env
DATABASE_URL=sqlite:///./resumes.db
```

### 2. Run the Application
Start the FastAPI server. Because we set up a Python virtual environment (`.venv`), you can run the server directly using Uvicorn:
```powershell
# In PowerShell:
.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

### 3. Open the Dashboard
Open your browser and navigate to:
```text
http://127.0.0.1:8000
```
*Drag and drop your PDF or DOCX resume to start parsing!*

---

## API Endpoints

All APIs are prefixed with `/api/v1` and document shapes are validated using Pydantic:

- `POST /resumes/upload` - Upload a resume file (`multipart/form-data`) to extract, parse, and analyze it.
- `GET /resumes` - Fetch the resume list history with basic pagination parameters (`?skip=0&limit=10`).
- `GET /resumes/{id}` - Fetch full detail objects (skills, timelines, projects) of a specific candidate.
- `GET /health` - Checks backend connection integrity.

---

## Switching to PostgreSQL

To deploy this in production with a PostgreSQL database:
1. Ensure your PostgreSQL server is active.
2. In your `.env` file, change `DATABASE_URL`:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/your_database_name
   ```
3. Run the backend normally. SQLAlchemy will auto-generate all required schemas on boot!
