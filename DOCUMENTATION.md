# 📐 SecureCheck – System Architecture & Technical Documentation

This document provides a visual and in-depth technical overview of how SecureCheck evaluates security, processes AI requests, scores vulnerabilities, and persists data across offline and online environments.

---

## 1. High-Level System Architecture

The diagram below illustrates the end-to-end communication flow between the React Single-Page Application (SPA), the FastAPI asynchronous backend, the OpenRouter LLM AI integration, and the dual-layer database engine:

```mermaid
graph TD
    subgraph Client["🖥️ Frontend (React 18 + Vite)"]
        UI[User Interface & Dashboard]
        Wizard[Audit Questionnaire Wizard]
        Scanner[AI Code Scanner]
        Reports[Visual Reports & PDF Export]
        History[Audit History & Diff Comparison]
        ApiClient[Axios / Fetch API Client]
    end

    subgraph Gateway["🌐 Web Server & Reverse Proxy"]
        ViteDev["Vite Dev Server (Port 5173 / Proxy)"]
    end

    subgraph Backend["⚙️ Backend (FastAPI + Python 3.13)"]
        RouterAudits["/api/audits (Evaluation & Reports)"]
        RouterAuth["/api/auth (PBKDF2 Sessions)"]
        RouterQuestions["/api/questions (Templates & AI Engine)"]
        RouterSettings["/api/settings (System & API Keys)"]
        
        AuditEngine["Audit Evaluation Engine"]
        AIService["OpenRouter AI Gateway (HTTPX)"]
        RuleEngine["Remediation & OWASP Rule Base"]
        DBManager["Database Storage Manager"]
    end

    subgraph External["🤖 AI Cloud (OpenRouter.ai)"]
        LLM["OpenAI GPT-4o-Mini / Llama 3.3 70B"]
    end

    subgraph Storage["💾 Persistence Layer (Offline-First)"]
        MongoLive[("🍃 MongoDB Community (Port 27017)")]
        OfflineJSON[("📄 Local File: offline_db.json")]
    end

    UI --> ApiClient
    Wizard --> ApiClient
    Scanner --> ApiClient
    Reports --> ApiClient
    History --> ApiClient

    ApiClient --> ViteDev
    ViteDev -->|/api proxy| RouterAudits
    ViteDev -->|/api proxy| RouterAuth
    ViteDev -->|/api proxy| RouterQuestions
    ViteDev -->|/api proxy| RouterSettings

    RouterAudits --> AuditEngine
    RouterAudits --> AIService
    RouterQuestions --> AIService
    RouterQuestions --> RuleEngine
    
    AIService <-->|HTTPS API Request| LLM
    AuditEngine --> RuleEngine
    AuditEngine --> DBManager
    RouterAuth --> DBManager
    RouterSettings --> DBManager

    DBManager -->|If Online| MongoLive
    DBManager -->|If Offline / Fallback| OfflineJSON
```

---

## 2. Audit Execution & Scoring Lifecycle

When a developer submits an audit questionnaire or asks AI to generate a report, the request follows a strict evaluation pipeline:

```mermaid
sequenceDiagram
    autonumber
    actor User as Developer / Student
    participant UI as React Frontend
    participant API as FastAPI Backend
    participant Engine as Audit Engine
    participant AI as OpenRouter AI
    participant DB as Storage (Mongo/JSON)

    User->>UI: Selects Answers in Questionnaire
    User->>UI: Clicks "Generate Security Report"
    UI->>API: POST /api/audits (Answers, Template, Stack)
    
    API->>Engine: evaluate_audit(request)
    Engine->>Engine: Calculate Category Scores (0-100%)
    Engine->>Engine: Calculate Overall Score & Letter Grade
    Engine->>Engine: Extract Identified Vulnerabilities & Severities
    Engine->>Engine: Attach Code Remediation Snippets (Node, Python, PHP)

    alt OpenRouter Key Configured
        API->>AI: Synthesize Executive Summary
        AI-->>API: AI Executive Summary & Tailored Tips
    else Offline Mode
        API->>Engine: Generate Rule-Based Summary
    end

    API->>DB: Save AuditReport Document
    DB-->>API: Confirmation & Stored ID
    API-->>UI: Complete AuditReport JSON
    UI->>User: Displays Radial Gauge, Radar Chart & Remediation Plan
```

---

## 3. AI Code Snippet Scanner Pipeline

The Code Snippet Scanner (`/code-scanner`) accepts raw source code and conducts static security flaw detection:

```mermaid
flowchart TD
    A["User Pastes Code Snippet (e.g. JavaScript, Python, PHP)"] --> B["Frontend calls POST /api/audits/scan-code"]
    B --> C["Backend parses Language & Lines of Code"]
    C --> D{"OpenRouter Key Configured?"}
    
    D -->|Yes| E["Construct Strict System & User Prompt"]
    E --> F["Invoke OpenRouter LLM with JSON Response Mode"]
    F --> G["Parse Identified Lines, Severity & Exploit Impact"]
    F --> H["Extract Safe Refactored Code Block"]
    
    D -->|No / Offline| I["Run Regex-Based Static Heuristic Engine"]
    I --> G
    I --> H

    G --> J["Compute Overall Code Safety Score (0-100%)"]
    H --> J
    J --> K["Generate Action Checklist & Fix Steps"]
    K --> L["Store Audit Record in Database"]
    L --> M["Return Interactive Vulnerability Breakdown to UI"]
```

---

## 4. Mathematical Scoring Model

The security score is calculated deterministically using weighted category averages:

$$\text{Overall Score} = \sum_{c=1}^{N} \left( \frac{\text{Category Score}_c}{N} \right)$$

Where each **Category Score** is determined by the selected answer options in that category:

$$\text{Category Score}_c = \left( \frac{\sum_{i=1}^{M_c} w_i}{M_c} \right) \times 100$$

- $w_i \in [0.0, 1.0]$ is the normalized weight of the chosen option for question $i$.
- $M_c$ is the total number of questions answered within category $c$.
- $N$ is the number of active categories in the audit.

### Letter Grade Scale:

| Score Range | Letter Grade | Compliance Level | Color Token |
| :--- | :---: | :--- | :--- |
| **85% – 100%** | **Grade A** | Production Ready / Highly Secure | `#10b981` (Emerald Green) |
| **70% – 84%** | **Grade B** | Good Foundation / Minor Hardening Needed | `#38bdf8` (Cyan Blue) |
| **50% – 69%** | **Grade C** | Moderate Risk / Needs Immediate Fixes | `#f59e0b` (Amber Orange) |
| **0% – 49%** | **Grade F / D** | Critical Vulnerabilities Detected | `#f43f5e` (Rose Red) |

---

## 5. Database Schema & Data Models

SecureCheck utilizes Pydantic v2 schemas that map seamlessly to both MongoDB BSON documents and offline JSON stores:

```mermaid
erDiagram
    AUDIT_REPORT {
        string id PK
        string project_name
        string auditor_name
        string target_stack
        float overall_score
        string letter_grade
        string summary
        string template_id
        boolean ai_generated
        string created_at
        string user_id FK
    }

    USER {
        string id PK
        string username
        string email
        string password_hash
        string created_at
    }

    PROJECT {
        string id PK
        string name
        string description
        string tech_stack
        string created_at
        string user_id FK
    }

    VULNERABILITY {
        string id
        string title
        string severity
        string category
        string description
        string impact
        string remediation_guide
        int line_number
    }

    USER ||--o{ AUDIT_REPORT : owns
    USER ||--o{ PROJECT : manages
    AUDIT_REPORT ||--|{ VULNERABILITY : contains
```

---

## 6. REST API Endpoint Reference

| Method | Endpoint | Description | Request Body / Params |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/settings/status` | System health, database connection mode, and AI key status. | None |
| `POST` | `/api/settings` | Update OpenRouter API key or active AI model. | `UpdateSettingsRequest` |
| `POST` | `/api/auth/register` | Register a student developer user account. | `{ username, email, password }` |
| `POST` | `/api/auth/login` | Authenticate user and receive session token. | `{ email, password }` |
| `GET` | `/api/questions/templates` | Retrieve all pre-configured audit templates. | None |
| `GET` | `/api/questions/template/{id}` | Fetch questions and options for a specific template. | `template_id` path param |
| `POST` | `/api/questions/generate-ai` | Generate dynamic security checklist using AI. | `{ tech_stack, project_name, focus_areas }` |
| `POST` | `/api/audits` | Evaluate questionnaire responses and create an audit. | `AuditRequest` |
| `POST` | `/api/audits/scan-code` | Scan a source code snippet for security flaws. | `CodeScanRequest` |
| `GET` | `/api/audits` | Query saved audits with optional filtering & sorting. | `?user_id=&search=&sort_by=` |
| `GET` | `/api/audits/{id}` | Retrieve full audit report details by ID. | `audit_id` path param |
| `DELETE`| `/api/audits/{id}` | Delete an audit report. | `audit_id` path param |
| `POST` | `/api/audits/compare` | Calculate side-by-side diff between two audits. | `{ audit_id_1, audit_id_2 }` |
| `GET` | `/api/audits/{id}/export/markdown` | Download formatted Markdown report. | `audit_id` path param |
