from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Query, Response
from datetime import datetime, timezone
from app.models import (
    AuditRequest, AuditReport, CompareRequest, CompareResult, 
    CodeScanRequest, CodeScanResponse, Vulnerability, StrengthItem, 
    CategoryScore, CodeSnippet
)
from app.services.audit_engine import evaluate_audit, compare_audit_reports
from app.services.ai_service import scan_code_snippet_with_ai
from app.database import db_manager

router = APIRouter(prefix="/api/audits", tags=["Audits"])

@router.post("", response_model=AuditReport)
def create_audit(req: AuditRequest):
    # Perform evaluation
    report = evaluate_audit(req)
    doc = report.model_dump()
    
    # Save to database
    audits_col = db_manager.get_collection("audits")
    audits_col.insert_one(doc)

    return report

@router.post("/scan-code", response_model=CodeScanResponse)
def scan_code_snippet(req: CodeScanRequest):
    scan_result = scan_code_snippet_with_ai(req)

    # Convert to AuditReport and save in database so it shows in user history!
    now_iso = datetime.now(timezone.utc).isoformat()
    
    vuln_models: List[Vulnerability] = []
    for idx, v in enumerate(scan_result.vulnerabilities):
        snippets = []
        if v.fixed_code:
            snippets.append(CodeSnippet(
                language=req.language,
                title=f"Fix for {v.line_number}",
                code=v.fixed_code
            ))

        vuln_models.append(
            Vulnerability(
                id=f"scan_vuln_{idx}",
                title=f"[{v.line_number}] {v.title}",
                severity=v.severity,
                category=v.category,
                description=f"At {v.line_number}: {v.code_snippet_location}\n{v.description}",
                impact=v.impact,
                remediation_guide=v.remediation_guide,
                line_number=v.line_number,
                code_examples=snippets
            )
        )

    strength_models: List[StrengthItem] = [
        StrengthItem(id=f"str_{i}", title=s, category="Code Quality", description="Follows good structure")
        for i, s in enumerate(scan_result.strengths)
    ]

    cat_score = CategoryScore(
        category=f"{req.language.capitalize()} Code Security",
        score=scan_result.overall_score,
        max_score=100.0,
        percentage=scan_result.overall_score,
        status="Excellent" if scan_result.overall_score >= 85 else "Moderate" if scan_result.overall_score >= 50 else "Critical"
    )

    report_doc = AuditReport(
        id=scan_result.audit_id,
        project_name=req.project_name or "Code Snippet Review",
        auditor_name=req.auditor_name or "Student Developer",
        target_stack=f"Code Snippet ({req.language})",
        template_id="code_scan",
        user_id=req.user_id,
        user_email=req.user_email,
        overall_score=scan_result.overall_score,
        letter_grade=scan_result.letter_grade,
        summary=scan_result.risk_summary,
        created_at=now_iso,
        category_scores=[cat_score],
        strengths=strength_models,
        vulnerabilities=vuln_models,
        recommendations=scan_result.action_checklist,
        answers={},
        ai_generated=True,
        code_snippet_scan={
            "original_code": scan_result.original_code,
            "language": scan_result.language,
            "secure_refactored_code": scan_result.secure_refactored_code
        }
    )

    audits_col = db_manager.get_collection("audits")
    audits_col.insert_one(report_doc.model_dump())

    return scan_result

@router.get("", response_model=List[AuditReport])
def list_audits(
    project_name: Optional[str] = None,
    user_id: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: str = "created_at",
    reverse: bool = True
):
    audits_col = db_manager.get_collection("audits")
    query = {}
    if project_name:
        query["project_name"] = project_name
    if user_id:
        query["user_id"] = user_id

    results = audits_col.find(query, sort_by=sort_by, reverse=reverse)
    
    if search:
        search_lower = search.lower()
        results = [
            r for r in results 
            if search_lower in r.get("project_name", "").lower() 
            or search_lower in r.get("auditor_name", "").lower()
            or search_lower in r.get("target_stack", "").lower()
        ]

    reports = []
    for r in results:
        if "_id" in r and "id" not in r:
            r["id"] = str(r["_id"])
        reports.append(AuditReport(**r))
    return reports

@router.get("/{audit_id}", response_model=AuditReport)
def get_audit(audit_id: str):
    audits_col = db_manager.get_collection("audits")
    res = audits_col.find_one({"id": audit_id})
    if not res:
        res = audits_col.find_one({"_id": audit_id})
    if not res:
        raise HTTPException(status_code=404, detail="Audit report not found")
    
    if "_id" in res and "id" not in res:
        res["id"] = str(res["_id"])
    return AuditReport(**res)

@router.delete("/{audit_id}")
def delete_audit(audit_id: str):
    audits_col = db_manager.get_collection("audits")
    del_res = audits_col.delete_one({"id": audit_id})
    if del_res.deleted_count == 0:
        del_res = audits_col.delete_one({"_id": audit_id})
    if del_res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Audit report not found")
    return {"status": "success", "message": f"Audit {audit_id} deleted successfully"}

@router.post("/compare", response_model=CompareResult)
def compare_two_audits(req: CompareRequest):
    audits_col = db_manager.get_collection("audits")
    
    res1 = audits_col.find_one({"id": req.audit_id_1}) or audits_col.find_one({"_id": req.audit_id_1})
    res2 = audits_col.find_one({"id": req.audit_id_2}) or audits_col.find_one({"_id": req.audit_id_2})
    
    if not res1 or not res2:
        raise HTTPException(status_code=404, detail="One or both audits could not be found for comparison")
    
    if "_id" in res1 and "id" not in res1:
        res1["id"] = str(res1["_id"])
    if "_id" in res2 and "id" not in res2:
        res2["id"] = str(res2["_id"])

    audit_1 = AuditReport(**res1)
    audit_2 = AuditReport(**res2)

    return compare_audit_reports(audit_1, audit_2)

@router.get("/{audit_id}/export-markdown")
def export_markdown_report(audit_id: str):
    audit = get_audit(audit_id)
    
    md = f"""# SecureCheck Audit Report: {audit.project_name}

**Auditor:** {audit.auditor_name}  
**Target Stack:** {audit.target_stack}  
**Date:** {audit.created_at}  
**Overall Security Score:** **{audit.overall_score}%** (Grade: **{audit.letter_grade}**)

---

## Executive Summary
{audit.summary}

---

## Category Breakdown
"""
    for cat in audit.category_scores:
        md += f"- **{cat.category}**: {cat.percentage}% ({cat.status})\n"

    md += "\n---\n\n## Identified Vulnerabilities & Risks\n"
    if not audit.vulnerabilities:
        md += "*No critical vulnerabilities identified!*\n"
    else:
        for v in audit.vulnerabilities:
            md += f"""### [{v.severity}] {v.title}
- **Category:** {v.category}
- **Description:** {v.description}
- **Impact:** {v.impact}
- **Remediation:** {v.remediation_guide}

"""

    md += "\n---\n\n## Security Strengths & Passed Checks\n"
    for s in audit.strengths:
        md += f"- **{s.title}**: {s.description}\n"

    md += "\n---\n\n*Generated by SecureCheck AI Security Auditor for Developers*"
    return Response(content=md, media_type="text/markdown")
