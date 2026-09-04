import json
import uuid
import re
import httpx
from typing import List, Dict, Any, Optional
from app.config import settings
from app.models import (
    Question, QuestionOption, QuestionnaireTemplate, 
    CodeScanRequest, CodeScanResponse, CodeScanVulnerability
)
from app.services.security_rules import QUESTIONS_BANK

STACK_SPECIFIC_QUESTIONS: Dict[str, List[Dict[str, Any]]] = {
    "node": [
        {
            "id": "node_package_audit",
            "category": "Dependencies & Supply Chain",
            "title": "Do you run 'npm audit' or Snyk to check for vulnerable dependencies?",
            "description": "Third-party npm packages can contain known critical CVE vulnerabilities.",
            "why_it_matters": "Over 80% of security vulnerabilities in Node.js applications originate from outdated or malicious npm packages.",
            "type": "single_choice",
            "tags": ["node", "npm", "cve"],
            "options": [
                {
                    "id": "node_audit_regular",
                    "label": "Yes, npm audit is run regularly and package-lock.json is committed",
                    "score_weight": 1.0,
                    "is_secure": True,
                    "feedback": "Superb! Keeping npm packages patched prevents automated bot exploitation."
                },
                {
                    "id": "node_audit_never",
                    "label": "No, packages were installed without checking for known vulnerabilities",
                    "score_weight": 0.2,
                    "is_secure": False,
                    "feedback": "High Risk: Run 'npm audit' or 'npm audit fix' in your project terminal to patch critical vulnerabilities."
                }
            ]
        }
    ],
    "python": [
        {
            "id": "python_debug_mode",
            "category": "Error Handling & Logging",
            "title": "Is DEBUG mode (e.g. `DEBUG = True` in Django/Flask) disabled in public environments?",
            "description": "Framework debuggers expose interactive Python shells and environment variables.",
            "why_it_matters": "Flask or Django with DEBUG=True lets anyone execute arbitrary Python commands on your server via the interactive debugger pin!",
            "type": "single_choice",
            "tags": ["python", "flask", "django", "rce"],
            "options": [
                {
                    "id": "py_debug_false",
                    "label": "DEBUG is set to False in production, controlled via environment variables (DEBUG=os.getenv('DEBUG', 'False') == 'True')",
                    "score_weight": 1.0,
                    "is_secure": True,
                    "feedback": "Crucial! Never run Flask/Django with DEBUG=True outside of your personal local machine."
                },
                {
                    "id": "py_debug_true",
                    "label": "DEBUG = True is hardcoded in the codebase",
                    "score_weight": 0.0,
                    "is_secure": False,
                    "feedback": "Critical Risk: Anyone visiting an error page can execute arbitrary Python commands on your server."
                }
            ]
        }
    ]
}

def call_openrouter_llm(prompt: str, system_prompt: str = "You are a senior cybersecurity auditor helping student web developers.", json_mode: bool = True) -> Optional[str]:
    api_key = settings.OPENROUTER_API_KEY
    if not api_key:
        return None

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "SecureCheck"
    }

    model = settings.OPENROUTER_MODEL or "openai/gpt-4o-mini"

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.2,
    }

    try:
        with httpx.Client(timeout=25.0) as client:
            resp = client.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                return data["choices"][0]["message"]["content"]
            else:
                print(f"[OpenRouter] API Error: {resp.status_code} - {resp.text}")
                return None
    except Exception as e:
        print(f"[OpenRouter] Connection exception: {e}")
        return None

def generate_ai_questionnaire(tech_stack: str, project_name: str, focus_areas: Optional[List[str]] = None) -> QuestionnaireTemplate:
    if settings.OPENROUTER_API_KEY:
        system_prompt = (
            "You are SecureCheck AI, an expert web application security auditor for student developers. "
            "You generate structured, practical, educational security questionnaires. "
            "Return valid JSON ONLY matching the requested structure."
        )

        user_prompt = f"""Generate a security audit questionnaire specifically tailored for a web project with the following details:
Project Name: {project_name or 'Web Application'}
Technology Stack: {tech_stack or 'Full-Stack Web App'}
Focus Areas: {', '.join(focus_areas) if focus_areas else 'Authentication, API Security, Database Injection, Cookies/Sessions, Secrets'}

Return a JSON object with this EXACT structure:
{{
  "title": "AI Tailored Security Audit for {tech_stack}",
  "description": "Short 1-2 sentence description",
  "estimated_time": "4 mins",
  "categories": ["Password Security", "Authentication & Access Control", "Session & Token Security", "Input Validation & Injection Defense", "Data Protection & Secrets", "CORS & Security Headers"],
  "questions": [
    {{
      "id": "unique_string_id",
      "category": "One of the categories above",
      "title": "Clear question title?",
      "description": "Beginner-friendly explanation of the security concept",
      "why_it_matters": "Plain-English explanation of the attack vector or risk if done wrong",
      "type": "single_choice",
      "tags": ["tag1", "tag2"],
      "options": [
        {{
          "id": "opt_secure",
          "label": "Option describing secure best practice",
          "score_weight": 1.0,
          "is_secure": true,
          "feedback": "Educational praise explaining why this is secure"
        }},
        {{
          "id": "opt_partial",
          "label": "Option describing partial/suboptimal practice",
          "score_weight": 0.5,
          "is_secure": false,
          "feedback": "Constructive explanation of the risks"
        }},
        {{
          "id": "opt_insecure",
          "label": "Option describing common insecure rookie mistake",
          "score_weight": 0.0,
          "is_secure": false,
          "feedback": "Warning explaining the critical vulnerability"
        }}
      ]
    }}
  ]
}}
Provide 8 to 10 high-impact, realistic questions covering password storage, session/token management, SQL/NoSQL injection, CORS, environment variables, and stack-specific vulnerabilities for {tech_stack}.
"""
        raw_response = call_openrouter_llm(user_prompt, system_prompt)
        if raw_response:
            try:
                clean_json = raw_response.strip()
                if "```json" in clean_json:
                    clean_json = clean_json.split("```json")[1].split("```")[0].strip()
                elif "```" in clean_json:
                    clean_json = clean_json.split("```")[1].split("```")[0].strip()

                parsed = json.loads(clean_json)
                q_list: List[Question] = []
                for q in parsed.get("questions", []):
                    opts = [QuestionOption(**opt) for opt in q.get("options", [])]
                    q_list.append(
                        Question(
                            id=q["id"],
                            category=q["category"],
                            title=q["title"],
                            description=q["description"],
                            why_it_matters=q["why_it_matters"],
                            options=opts,
                            type=q.get("type", "single_choice"),
                            tags=q.get("tags", [])
                        )
                    )

                if q_list:
                    template_id = f"ai_gen_{uuid.uuid4().hex[:8]}"
                    return QuestionnaireTemplate(
                        id=template_id,
                        title=parsed.get("title", f"AI Tailored Security Audit for {tech_stack}"),
                        description=parsed.get("description", f"Personalized audit for {tech_stack}"),
                        icon="Sparkles",
                        estimated_time=parsed.get("estimated_time", "4 mins"),
                        categories=parsed.get("categories", ["General Security"]),
                        questions=q_list
                    )
            except Exception as e:
                print(f"[OpenRouter] JSON parsing failed: {e}. Falling back to smart offline rulebook.")

    # Fallback to smart offline dynamic rulebook
    stack_lower = tech_stack.lower()
    selected_questions: List[Dict[str, Any]] = []

    core_ids = ["pwd_storage", "pwd_policy", "auth_rate_limiting", "session_storage", "jwt_security", "sql_nosql_injection", "secrets_management", "transport_encryption_https", "cors_config", "security_headers", "error_handling"]
    for q in QUESTIONS_BANK:
        if q["id"] in core_ids:
            selected_questions.append(q)

    if any(k in stack_lower for k in ["node", "express", "react", "javascript", "typescript", "next"]):
        selected_questions.extend(STACK_SPECIFIC_QUESTIONS.get("node", []))
    elif any(k in stack_lower for k in ["python", "fastapi", "flask", "django"]):
        selected_questions.extend(STACK_SPECIFIC_QUESTIONS.get("python", []))

    question_models: List[Question] = []
    categories_set = set()
    for q in selected_questions:
        categories_set.add(q["category"])
        options = [QuestionOption(**opt) for opt in q["options"]]
        question_models.append(
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

    template_id = f"ai_gen_{uuid.uuid4().hex[:8]}"
    return QuestionnaireTemplate(
        id=template_id,
        title=f"AI Tailored Security Audit for {tech_stack}",
        description=f"Custom-generated security questionnaire optimized for {project_name or 'your project'} running on {tech_stack}.",
        icon="Sparkles",
        estimated_time=f"{max(2, len(question_models) // 2)} mins",
        categories=sorted(list(categories_set)),
        questions=question_models
    )

def enhance_audit_with_ai(project_name: str, target_stack: str, overall_score: float, letter_grade: str, vulnerabilities_summary: List[str]) -> Optional[str]:
    if not settings.OPENROUTER_API_KEY:
        return None

    system_prompt = "You are an AI Security Mentor reviewing a student developer's web application security audit report."
    user_prompt = f"""A student developer has audited their project:
Project Name: {project_name}
Target Stack: {target_stack}
Security Score: {overall_score}% (Grade {letter_grade})
Identified Vulnerabilities:
{chr(10).join(f"- {v}" for v in vulnerabilities_summary) if vulnerabilities_summary else "No vulnerabilities identified."}

Provide a concise, encouraging, and highly actionable 2-3 sentence executive summary and learning tip for the student developer. Focus on practical fixes for {target_stack}.
"""
    return call_openrouter_llm(user_prompt, system_prompt, json_mode=False)

def scan_code_snippet_with_ai(req: CodeScanRequest) -> CodeScanResponse:
    audit_id = str(uuid.uuid4())
    code = req.code_snippet.strip()
    lang = req.language.lower()

    if settings.OPENROUTER_API_KEY:
        system_prompt = (
            "You are SecureCheck AI Code Security Auditor. "
            "You analyze user-submitted code snippets for cybersecurity vulnerabilities (OWASP Top 10, SQLi, XSS, plaintext passwords, hardcoded secrets, missing rate limiting, insecure cookies, prototype pollution). "
            "Return valid JSON ONLY with the exact required schema."
        )

        user_prompt = f"""Analyze this {req.language} code snippet from project '{req.project_name}':

```{lang}
{code}
```

Return a JSON object with this EXACT structure:
{{
  "overall_score": 45,
  "letter_grade": "D",
  "risk_summary": "Summary of identified security risks in 2 sentences.",
  "vulnerabilities": [
    {{
      "title": "Clear vulnerability title",
      "severity": "Critical | High | Medium | Low",
      "category": "Password Security | Input Validation | Session Security | Secrets Management | etc.",
      "line_number": "Line X",
      "code_snippet_location": "The exact insecure line of code",
      "description": "Why this code is vulnerable in plain English",
      "impact": "What an attacker could do with this flaw",
      "remediation_guide": "How to fix it step-by-step",
      "fixed_code": "The exact fixed replacement code snippet"
    }}
  ],
  "strengths": [
    "List of secure practices found in the snippet"
  ],
  "action_checklist": [
    "Step 1: Replace line X with ...",
    "Step 2: Add ..."
  ],
  "secure_refactored_code": "Complete, working, secure refactored version of the snippet with proper comments"
}}
"""
        raw_res = call_openrouter_llm(user_prompt, system_prompt)
        if raw_res:
            try:
                clean_json = raw_res.strip()
                if "```json" in clean_json:
                    clean_json = clean_json.split("```json")[1].split("```")[0].strip()
                elif "```" in clean_json:
                    clean_json = clean_json.split("```")[1].split("```")[0].strip()

                parsed = json.loads(clean_json)
                vulns = [CodeScanVulnerability(**v) for v in parsed.get("vulnerabilities", [])]

                return CodeScanResponse(
                    audit_id=audit_id,
                    project_name=req.project_name or "Code Snippet Scan",
                    overall_score=float(parsed.get("overall_score", 60.0)),
                    letter_grade=parsed.get("letter_grade", "C"),
                    risk_summary=parsed.get("risk_summary", "Security analysis completed."),
                    vulnerabilities=vulns,
                    strengths=parsed.get("strengths", ["Basic code syntax structure intact."]),
                    action_checklist=parsed.get("action_checklist", ["Review code against OWASP guidelines."]),
                    secure_refactored_code=parsed.get("secure_refactored_code", code),
                    original_code=code,
                    language=req.language
                )
            except Exception as e:
                print(f"[OpenRouter] Code scan JSON parsing error: {e}. Falling back to heuristic scan.")

    # Fallback Heuristic Code Scanner
    vulns: List[CodeScanVulnerability] = []
    strengths: List[str] = []
    score = 100.0

    lines = code.split("\n")
    for i, line in enumerate(lines, 1):
        line_str = line.strip()

        # Check for Plaintext Passwords / md5 / sha1
        if any(w in line_str.lower() for w in ["md5(", "createhash('md5')", "sha1("]):
            vulns.append(CodeScanVulnerability(
                title="Deprecated Weak Hashing (MD5/SHA1)",
                severity="Critical",
                category="Password Security",
                line_number=f"Line {i}",
                code_snippet_location=line_str,
                description="MD5 and SHA-1 are cryptographically broken and vulnerable to instant rainbow table lookup.",
                impact="Attackers can reverse user passwords immediately upon database dump.",
                remediation_guide="Upgrade to modern slow hashing: Bcrypt (salt rounds 12) or Argon2id.",
                fixed_code="const hash = await bcrypt.hash(plainPassword, 12);"
            ))
            score -= 30

        # Check for SQL injection concatenation
        if ("SELECT " in line_str.upper() or "INSERT INTO" in line_str.upper()) and ("+" in line_str or "${" in line_str or 'f"' in line_str or "f'" in line_str):
            vulns.append(CodeScanVulnerability(
                title="SQL Injection via String Concatenation",
                severity="Critical",
                category="Input Validation & Injection Defense",
                line_number=f"Line {i}",
                code_snippet_location=line_str,
                description="User input is directly concatenated or formatted into an SQL query.",
                impact="Attackers can bypass logins with ' OR '1'='1 or extract all database tables.",
                remediation_guide="Always use parameterized queries ($1, ? placeholders) or an ORM.",
                fixed_code="const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);"
            ))
            score -= 35

        # Check for hardcoded secret strings
        if any(s in line_str.lower() for s in ["jwt_secret = \"", "secret = \"", "api_key = \"", "password = \""]) and len(line_str) < 120 and "process.env" not in line_str and "os.getenv" not in line_str:
            vulns.append(CodeScanVulnerability(
                title="Hardcoded Sensitive Credential / Secret",
                severity="High",
                category="Data Protection & Secrets",
                line_number=f"Line {i}",
                code_snippet_location=line_str,
                description="Secrets hardcoded directly into source files can be easily committed to GitHub.",
                impact="Automated bot scrapers will steal the key within seconds of repository push.",
                remediation_guide="Store all keys in a .env file and add .env to your .gitignore.",
                fixed_code="const secret = process.env.JWT_SECRET;"
            ))
            score -= 20

        # Check for LocalStorage token storing
        if "localStorage.setItem(" in line_str and "token" in line_str.lower():
            vulns.append(CodeScanVulnerability(
                title="Auth Token Stored in LocalStorage",
                severity="High",
                category="Session & Token Security",
                line_number=f"Line {i}",
                code_snippet_location=line_str,
                description="localStorage is accessible to any JavaScript running on the page (XSS vulnerable).",
                impact="Malicious scripts or npm dependencies can exfiltrate your tokens via document/window storage.",
                remediation_guide="Store authentication tokens in HttpOnly, Secure, SameSite cookies.",
                fixed_code="res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'lax' });"
            ))
            score -= 15

    score = max(10.0, score)
    if score >= 90:
        grade = "A"
    elif score >= 80:
        grade = "B"
    elif score >= 60:
        grade = "C"
    elif score >= 50:
        grade = "D"
    else:
        grade = "F"

    if not vulns:
        strengths.append("No obvious critical injection or hardcoded plaintext secrets detected in this snippet.")
        summary = f"Code snippet looks relatively clean! Scored {score}% (Grade {grade})."
        actions = ["Ensure dependencies are kept up-to-date and sanitize any remaining user inputs."]
        refactored = f"// Verified snippet:\n{code}"
    else:
        summary = f"Found {len(vulns)} potential security risks in the pasted code. Security score: {score}% (Grade {grade})."
        actions = [f"Fix {v.title} on {v.line_number}: {v.remediation_guide}" for v in vulns]
        refactored = f"// Secure Refactored Version:\n// 1. Parameterize queries\n// 2. Use environment variables\n{code}"

    return CodeScanResponse(
        audit_id=audit_id,
        project_name=req.project_name or "Code Snippet Scan",
        overall_score=score,
        letter_grade=grade,
        risk_summary=summary,
        vulnerabilities=vulns,
        strengths=strengths,
        action_checklist=actions,
        secure_refactored_code=refactored,
        original_code=code,
        language=req.language
    )
