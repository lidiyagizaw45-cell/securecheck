from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime

# --- User Auth Models ---
class UserRegister(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    email_or_username: str
    password: str

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    created_at: str
    token: str

class User(BaseModel):
    id: str
    username: str
    email: str
    password_hash: str
    salt: str
    created_at: str

# --- Questionnaire & Snippet Models ---
class CodeSnippet(BaseModel):
    language: str
    title: str
    code: str

class QuestionOption(BaseModel):
    id: str
    label: str
    score_weight: float = 1.0
    is_secure: bool = False
    feedback: str = ""

class Question(BaseModel):
    id: str
    category: str
    title: str
    description: str
    why_it_matters: str
    options: List[QuestionOption]
    type: str = "single_choice"
    tags: List[str] = []

class QuestionnaireTemplate(BaseModel):
    id: str
    title: str
    description: str
    icon: str
    estimated_time: str
    categories: List[str]
    questions: List[Question]

class AuditRequest(BaseModel):
    project_name: str
    auditor_name: Optional[str] = "Student Developer"
    target_stack: Optional[str] = "Node.js / Express"
    template_id: Optional[str] = "login_auth"
    user_id: Optional[str] = None
    user_email: Optional[str] = None
    answers: Dict[str, Any]
    questions: Optional[List[Question]] = None

class CodeScanRequest(BaseModel):
    code_snippet: str
    language: str = "javascript" # javascript, python, php, java, go, etc.
    project_name: Optional[str] = "Pasted Code Snippet"
    file_name: Optional[str] = "auth_handler.js"
    user_id: Optional[str] = None
    user_email: Optional[str] = None
    auditor_name: Optional[str] = "Student Developer"

class CodeScanVulnerability(BaseModel):
    title: str
    severity: str # Critical, High, Medium, Low
    category: str
    line_number: Optional[str] = "Line 1"
    code_snippet_location: Optional[str] = ""
    description: str
    impact: str
    remediation_guide: str
    fixed_code: Optional[str] = ""

class CodeScanResponse(BaseModel):
    audit_id: str
    project_name: str
    overall_score: float
    letter_grade: str
    risk_summary: str
    vulnerabilities: List[CodeScanVulnerability]
    strengths: List[str]
    action_checklist: List[str]
    secure_refactored_code: str
    original_code: str
    language: str

class Vulnerability(BaseModel):
    id: str
    title: str
    severity: str
    category: str
    description: str
    impact: str
    remediation_guide: str
    line_number: Optional[str] = None
    code_examples: List[CodeSnippet] = []

class StrengthItem(BaseModel):
    id: str
    title: str
    category: str
    description: str

class CategoryScore(BaseModel):
    category: str
    score: float
    max_score: float
    percentage: float
    status: str

class AuditReport(BaseModel):
    id: str
    project_name: str
    auditor_name: str
    target_stack: str
    template_id: str
    user_id: Optional[str] = None
    user_email: Optional[str] = None
    overall_score: float
    letter_grade: str
    summary: str
    created_at: str
    category_scores: List[CategoryScore]
    strengths: List[StrengthItem]
    vulnerabilities: List[Vulnerability]
    recommendations: List[str]
    answers: Dict[str, Any] = {}
    ai_generated: bool = False
    code_snippet_scan: Optional[Dict[str, Any]] = None

class CompareRequest(BaseModel):
    audit_id_1: str
    audit_id_2: str

class IssueDelta(BaseModel):
    title: str
    severity: str
    category: str
    description: str

class CompareResult(BaseModel):
    audit_1: AuditReport
    audit_2: AuditReport
    score_delta: float
    grade_changed_from: str
    grade_changed_to: str
    resolved_vulnerabilities: List[IssueDelta]
    new_vulnerabilities: List[IssueDelta]
    persistent_vulnerabilities: List[IssueDelta]
    summary_message: str

class ProjectStats(BaseModel):
    project_name: str
    total_audits: int
    latest_score: float
    latest_grade: str
    latest_audit_id: str
    highest_score: float
    first_audited_at: str
    last_audited_at: str
