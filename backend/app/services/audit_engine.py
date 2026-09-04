import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Tuple, Optional
from app.models import (
    AuditRequest, AuditReport, CategoryScore, StrengthItem, 
    Vulnerability, CompareResult, IssueDelta, Question, CodeSnippet
)
from app.services.security_rules import QUESTIONS_BANK
from app.services.remediation_snippets import REMEDIATION_DATA, DEFAULT_SNIPPETS_BY_CATEGORY
from app.services.ai_service import enhance_audit_with_ai

def compute_grade(score: float) -> str:
    if score >= 95:
        return "A+"
    elif score >= 90:
        return "A"
    elif score >= 85:
        return "A-"
    elif score >= 80:
        return "B+"
    elif score >= 75:
        return "B"
    elif score >= 70:
        return "B-"
    elif score >= 65:
        return "C+"
    elif score >= 60:
        return "C"
    elif score >= 50:
        return "D"
    else:
        return "F"

def evaluate_audit(audit_req: AuditRequest) -> AuditReport:
    answers = audit_req.answers or {}
    category_totals: Dict[str, List[float]] = {}
    strengths: List[StrengthItem] = []
    vulnerabilities: List[Vulnerability] = []
    total_score = 0.0
    total_max = 0.0

    # Build question lookup map from both passed questions and default questions bank
    questions_map: Dict[str, Any] = {}
    if audit_req.questions:
        for q in audit_req.questions:
            q_dict = q.model_dump() if hasattr(q, "model_dump") else dict(q)
            questions_map[q_dict["id"]] = q_dict

    for q in QUESTIONS_BANK:
        if q["id"] not in questions_map:
            questions_map[q["id"]] = q

    # Evaluate each answered question
    for qid, selected_opt_id in answers.items():
        question = questions_map.get(qid)
        if not question:
            continue

        cat = question.get("category", "General Security")
        if cat not in category_totals:
            category_totals[cat] = [0.0, 0.0]

        # Find selected option
        selected_opt = None
        for opt in question.get("options", []):
            opt_dict = opt if isinstance(opt, dict) else (opt.model_dump() if hasattr(opt, "model_dump") else dict(opt))
            if opt_dict.get("id") == selected_opt_id:
                selected_opt = opt_dict
                break

        if not selected_opt:
            continue

        weight = float(selected_opt.get("score_weight", 0.0))
        category_totals[cat][0] += weight
        category_totals[cat][1] += 1.0
        total_score += weight
        total_max += 1.0

        if weight >= 0.8:
            strengths.append(
                StrengthItem(
                    id=f"strength_{qid}",
                    title=f"Robust {cat}: {question.get('title', '')}",
                    category=cat,
                    description=selected_opt.get("feedback") or "Follows security best practices."
                )
            )
        else:
            remediation_info = REMEDIATION_DATA.get(qid, {})
            severity = remediation_info.get("severity")
            if not severity:
                if weight == 0.0:
                    severity = "Critical"
                elif weight < 0.4:
                    severity = "High"
                else:
                    severity = "Medium"

            vuln_title = remediation_info.get("title") or f"Potential Risk: {question.get('title', '')}"
            vuln_desc = selected_opt.get("feedback") or question.get("description", "Identified insecure configuration.")
            vuln_impact = remediation_info.get("impact") or question.get("why_it_matters", "May expose application to attacks.")
            vuln_guide = remediation_info.get("remediation_guide") or f"Implement secure defaults for {cat}."

            snippets = remediation_info.get("snippets")
            if not snippets:
                snippets = DEFAULT_SNIPPETS_BY_CATEGORY.get(cat, DEFAULT_SNIPPETS_BY_CATEGORY.get("Password Security", []))

            vulnerabilities.append(
                Vulnerability(
                    id=f"vuln_{qid}",
                    title=vuln_title,
                    severity=severity,
                    category=cat,
                    description=vuln_desc,
                    impact=vuln_impact,
                    remediation_guide=vuln_guide,
                    code_examples=snippets
                )
            )

    overall_percentage = round((total_score / total_max * 100) if total_max > 0 else 0, 1)
    letter_grade = compute_grade(overall_percentage)

    category_scores: List[CategoryScore] = []
    for cat_name, (earned, max_s) in category_totals.items():
        cat_pct = round((earned / max_s * 100) if max_s > 0 else 0, 1)
        if cat_pct >= 85:
            status = "Excellent"
        elif cat_pct >= 70:
            status = "Good"
        elif cat_pct >= 50:
            status = "Moderate"
        elif cat_pct >= 30:
            status = "Needs Attention"
        else:
            status = "Critical"

        category_scores.append(
            CategoryScore(
                category=cat_name,
                score=earned,
                max_score=max_s,
                percentage=cat_pct,
                status=status
            )
        )

    # Sort vulnerabilities by severity: Critical -> High -> Medium -> Low
    severity_order = {"Critical": 0, "High": 1, "Medium": 2, "Low": 3}
    vulnerabilities.sort(key=lambda v: severity_order.get(v.severity, 4))

    # Top recommendations
    recommendations: List[str] = []
    for v in vulnerabilities[:5]:
        recommendations.append(f"[{v.severity}] {v.title}: {v.remediation_guide}")
    if not recommendations:
        recommendations.append("All audited areas passed security checks! Keep dependencies updated and enforce regular reviews.")

    # Executive Summary (AI Enhanced if available)
    vuln_titles = [f"[{v.severity}] {v.title}: {v.description}" for v in vulnerabilities]
    ai_enhanced_summary = enhance_audit_with_ai(
        project_name=audit_req.project_name,
        target_stack=audit_req.target_stack or "Full Stack",
        overall_score=overall_percentage,
        letter_grade=letter_grade,
        vulnerabilities_summary=vuln_titles
    )

    if ai_enhanced_summary:
        summary = ai_enhanced_summary.strip()
        is_ai_gen = True
    else:
        if overall_percentage >= 90:
            summary = f"Exceptional security posture! {audit_req.project_name} scores {overall_percentage}% (Grade {letter_grade}). Foundational security defenses such as secure hashing, token handling, and parameterized queries are well implemented."
        elif overall_percentage >= 75:
            summary = f"Good baseline security with a few areas for improvement. {audit_req.project_name} scores {overall_percentage}% (Grade {letter_grade}). Addressing {len(vulnerabilities)} identified items will greatly strengthen the app against common attack vectors."
        elif overall_percentage >= 50:
            summary = f"Moderate security risks detected. {audit_req.project_name} scores {overall_percentage}% (Grade {letter_grade}). Several important defenses (such as rate limiting, cookie flags, or input checks) require attention."
        else:
            summary = f"Critical security vulnerabilities detected. {audit_req.project_name} scores {overall_percentage}% (Grade {letter_grade}). Immediate remediation is recommended for high-priority items like password storage, secrets handling, or query injection."
        is_ai_gen = False

    audit_id = str(uuid.uuid4())
    now_iso = datetime.now(timezone.utc).isoformat()

    return AuditReport(
        id=audit_id,
        project_name=audit_req.project_name,
        auditor_name=audit_req.auditor_name or "Student Developer",
        target_stack=audit_req.target_stack or "Full Stack",
        template_id=audit_req.template_id or "custom",
        user_id=audit_req.user_id,
        user_email=audit_req.user_email,
        overall_score=overall_percentage,
        letter_grade=letter_grade,
        summary=summary,
        created_at=now_iso,
        category_scores=category_scores,
        strengths=strengths,
        vulnerabilities=vulnerabilities,
        recommendations=recommendations,
        answers=answers,
        ai_generated=is_ai_gen
    )

def compare_audit_reports(audit_1: AuditReport, audit_2: AuditReport) -> CompareResult:
    score_delta = round(audit_2.overall_score - audit_1.overall_score, 1)
    
    vulns_1_map = {v.title: v for v in audit_1.vulnerabilities}
    vulns_2_map = {v.title: v for v in audit_2.vulnerabilities}

    resolved: List[IssueDelta] = []
    for title, v in vulns_1_map.items():
        if title not in vulns_2_map:
            resolved.append(IssueDelta(
                title=v.title,
                severity=v.severity,
                category=v.category,
                description=f"Resolved: Previously identified as {v.severity} severity."
            ))

    new_issues: List[IssueDelta] = []
    for title, v in vulns_2_map.items():
        if title not in vulns_1_map:
            new_issues.append(IssueDelta(
                title=v.title,
                severity=v.severity,
                category=v.category,
                description=f"New: {v.description}"
            ))

    persistent: List[IssueDelta] = []
    for title, v in vulns_2_map.items():
        if title in vulns_1_map:
            persistent.append(IssueDelta(
                title=v.title,
                severity=v.severity,
                category=v.category,
                description=f"Still unresolved: {v.description}"
            ))

    if score_delta > 0:
        summary = f"Security score improved by +{score_delta}% (from {audit_1.overall_score}% [{audit_1.letter_grade}] to {audit_2.overall_score}% [{audit_2.letter_grade}]). You resolved {len(resolved)} vulnerabilities!"
    elif score_delta < 0:
        summary = f"Security score decreased by {score_delta}% (from {audit_1.overall_score}% [{audit_1.letter_grade}] to {audit_2.overall_score}% [{audit_2.letter_grade}]). {len(new_issues)} new potential risks were introduced."
    else:
        summary = f"Security score remained constant at {audit_2.overall_score}% ({audit_2.letter_grade})."

    return CompareResult(
        audit_1=audit_1,
        audit_2=audit_2,
        score_delta=score_delta,
        grade_changed_from=audit_1.letter_grade,
        grade_changed_to=audit_2.letter_grade,
        resolved_vulnerabilities=resolved,
        new_vulnerabilities=new_issues,
        persistent_vulnerabilities=persistent,
        summary_message=summary
    )
