from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routes import auth, questions, audits, projects, settings as settings_routes

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="SecureCheck – AI-Powered Security Auditor for Web Developers"
)

# Setup CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth.router)
app.include_router(questions.router)
app.include_router(audits.router)
app.include_router(projects.router)
app.include_router(settings_routes.router)

@app.get("/")
def root():
    return {
        "app": "SecureCheck Security Auditor API",
        "version": settings.VERSION,
        "docs_url": "/docs",
        "status": "active"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
