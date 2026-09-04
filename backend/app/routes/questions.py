from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from app.models import QuestionnaireTemplate, Question, QuestionOption
from app.services.security_rules import QUESTIONS_BANK, PRESET_TEMPLATES
from app.services.ai_service import generate_ai_questionnaire

router = APIRouter(prefix="/api/questions", tags=["Questions & Templates"])

class AIQuestionGenRequest(BaseModel):
    tech_stack: str = "Node.js / Express"
    project_name: str = "Student Project"
    focus_areas: Optional[List[str]] = []

@router.get("/templates", response_model=List[Dict[str, Any]])
def get_templates():
    return PRESET_TEMPLATES

@router.get("/template/{template_id}", response_model=QuestionnaireTemplate)
def get_template_questions(template_id: str):
    template = next((t for t in PRESET_TEMPLATES if t["id"] == template_id), None)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    questions: List[Question] = []
    for q in QUESTIONS_BANK:
        if q["id"] in template["question_ids"]:
            options = [QuestionOption(**opt) for opt in q["options"]]
            questions.append(
                Question(
                    id=q["id"],
                    category=q["category"],
                    title=q["title"],
                    description=q["description"],
                    why_it_matters=q["why_it_matters"],
                    options=options,
                    type=q.get("type", "single_choice"),
                    tags=q.get("tags", [])
                )
            )

    return QuestionnaireTemplate(
        id=template["id"],
        title=template["title"],
        description=template["description"],
        icon=template["icon"],
        estimated_time=template["estimated_time"],
        categories=template["categories"],
        questions=questions
    )

@router.post("/generate-ai", response_model=QuestionnaireTemplate)
def generate_custom_ai_template(req: AIQuestionGenRequest):
    return generate_ai_questionnaire(
        tech_stack=req.tech_stack,
        project_name=req.project_name,
        focus_areas=req.focus_areas
    )
