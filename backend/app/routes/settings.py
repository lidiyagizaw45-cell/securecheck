from typing import Dict, Any, Optional
from fastapi import APIRouter
from pydantic import BaseModel
from app.config import settings
from app.database import db_manager

router = APIRouter(prefix="/api/settings", tags=["Settings & Status"])

class UpdateSettingsRequest(BaseModel):
    openrouter_api_key: Optional[str] = None
    openrouter_model: Optional[str] = None
    gemini_api_key: Optional[str] = None
    openai_api_key: Optional[str] = None

@router.get("/status")
def get_system_status():
    db_status = db_manager.get_status()
    audits_col = db_manager.get_collection("audits")
    total_audits = audits_col.count_documents()
    
    return {
        "status": "online",
        "version": settings.VERSION,
        "database": db_status,
        "total_saved_audits": total_audits,
        "ai_keys_configured": {
            "openrouter": bool(settings.OPENROUTER_API_KEY),
            "openrouter_model": settings.OPENROUTER_MODEL,
            "gemini": bool(settings.GEMINI_API_KEY),
            "openai": bool(settings.OPENAI_API_KEY)
        }
    }

@router.post("")
def update_settings(req: UpdateSettingsRequest):
    if req.openrouter_api_key is not None:
        settings.OPENROUTER_API_KEY = req.openrouter_api_key
    if req.openrouter_model is not None:
        settings.OPENROUTER_MODEL = req.openrouter_model
    if req.gemini_api_key is not None:
        settings.GEMINI_API_KEY = req.gemini_api_key
    if req.openai_api_key is not None:
        settings.OPENAI_API_KEY = req.openai_api_key

    return {"status": "success", "message": "Settings updated successfully"}
