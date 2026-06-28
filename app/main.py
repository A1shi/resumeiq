import os
import logging
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

from app.config import settings
from app.database import engine, Base
import app.routers.resume as resume
import app.routers.match as match
import app.routers.users as users
from app.migrations import run_migrations


# Configure logging format
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger("app.main")

# Auto-create SQLite database tables on boot (SQLAlchemy Base metadata mapper)
try:
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    
    run_migrations(engine)
    logger.info("Database initialized successfully.")
except Exception as e:
    logger.error(f"Failed to initialize database tables: {str(e)}")

# Initialize FastAPI App
app = FastAPI(
    title="ResumeIQ AI API",
    description="REST APIs to extract, parse, and analyze resume documents locally",
    version="1.0.0"
)

# Enable CORS (Cross-Origin Resource Sharing)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Broad settings for local MVP development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Router
app.include_router(resume.router, prefix="/api/v1")
app.include_router(match.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")


# Ensure static files directory exists
os.makedirs("static", exist_ok=True)

# Mount the static directory for images, custom CSS and JavaScript
app.mount("/assets", StaticFiles(directory="static"), name="assets")

# Route manifest.json directly
@app.get("/manifest.json")
async def serve_manifest():
    manifest_path = os.path.join("static", "manifest.json")
    if os.path.exists(manifest_path):
        return FileResponse(manifest_path, media_type="application/json")
    return JSONResponse(status_code=404, content={"message": "Manifest file missing."})

# Route sw.js directly
@app.get("/sw.js")
async def serve_sw():
    sw_path = os.path.join("static", "sw.js")
    if os.path.exists(sw_path):
        return FileResponse(sw_path, media_type="application/javascript")
    return JSONResponse(status_code=404, content={"message": "Service worker file missing."})

# Route root requests directly to the index.html page
@app.get("/")
async def serve_frontend():
    index_path = os.path.join("static", "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"message": "Frontend assets not generated yet. Static index.html is missing."}
    )

# Global validation exception handler to format Pydantic errors into a string
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    error_messages = []
    for err in exc.errors():
        msg = err.get("msg", "Validation error")
        # Clean up standard or internal messages
        if "value is not a valid email address" in msg:
            msg = "Please enter a valid email address"
        elif "string_too_short" in err.get("type", ""):
            field = str(err.get("loc", ["field"])[-1])
            msg = f"{field.replace('_', ' ').capitalize()} must be at least {err.get('ctx', {}).get('min_length', 6)} characters"
        elif msg.startswith("Value error, "):
            msg = msg.replace("Value error, ", "")
        error_messages.append(msg)
    
    detail_str = "; ".join(error_messages)
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": detail_str}
    )

# Global custom exception handling
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandeld error occurred: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": f"A critical internal server error occurred: {str(exc)}"
        }
    )

@app.get("/api/v1/health")
def health_check():
    """
    Service health check endpoint.
    """
    return {
        "status": "healthy",
        "gemini_api_configured": True,
        "database": settings.DATABASE_URL.split("://")[0]
    }


