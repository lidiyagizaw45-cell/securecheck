from typing import Dict, List
from app.models import CodeSnippet

DEFAULT_SNIPPETS_BY_CATEGORY: Dict[str, List[CodeSnippet]] = {
    "Password Security": [
        CodeSnippet(
            language="Node.js",
            title="Password Hashing with Bcrypt (Node.js)",
            code="const bcrypt = require('bcryptjs');\n\n// Hash on registration:\nconst hash = await bcrypt.hash(password, 12);\n\n// Verify on login:\nconst isValid = await bcrypt.compare(password, user.hash);"
        ),
        CodeSnippet(
            language="Python",
            title="Password Hashing with Passlib / Bcrypt (Python)",
            code="from passlib.context import CryptContext\n\npwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')\n\n# Hash:\nhash = pwd_context.hash('secret_password')\n# Verify:\nis_valid = pwd_context.verify('secret_password', hash)"
        ),
        CodeSnippet(
            language="PHP",
            title="Native PHP password_hash",
            code="<?php\n// Hash:\n$hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);\n// Verify:\nif (password_verify($password, $user['hash'])) { /* login */ }"
        )
    ],
    "Authentication & Access Control": [
        CodeSnippet(
            language="Node.js",
            title="Login Rate Limiting (Express)",
            code="const rateLimit = require('express-rate-limit');\n\nconst loginLimiter = rateLimit({\n  windowMs: 15 * 60 * 1000, // 15 mins\n  max: 5, // 5 requests\n  message: { error: 'Too many attempts. Try again later.' }\n});\n\napp.post('/api/login', loginLimiter, loginHandler);"
        ),
        CodeSnippet(
            language="Python",
            title="FastAPI SlowAPI Rate Limiting",
            code="from fastapi import FastAPI, Request\nfrom slowapi import Limiter\nfrom slowapi.util import get_remote_address\n\nlimiter = Limiter(key_func=get_remote_address)\napp = FastAPI()\n\n@app.post('/api/login')\n@limiter.limit('5/minute')\nasync def login(request: Request):\n    return {'status': 'ok'}"
        )
    ],
    "Session & Token Security": [
        CodeSnippet(
            language="Node.js",
            title="HttpOnly Cookie Setup (Express)",
            code="res.cookie('token', jwtToken, {\n  httpOnly: true, // XSS safe\n  secure: process.env.NODE_ENV === 'production',\n  sameSite: 'lax',\n  maxAge: 24 * 60 * 60 * 1000\n});"
        ),
        CodeSnippet(
            language="Python",
            title="HttpOnly Cookie (FastAPI)",
            code="response.set_cookie(\n    key='access_token',\n    value=jwt_token,\n    httponly=True,\n    secure=True,\n    samesite='lax'\n)"
        )
    ],
    "Input Validation & Injection Defense": [
        CodeSnippet(
            language="Python",
            title="Parameterized SQL Queries (Python)",
            code="# ✅ SECURE: Use query placeholders\ncursor.execute('SELECT * FROM users WHERE email = %s', (user_email,))\nuser = cursor.fetchone()"
        ),
        CodeSnippet(
            language="Node.js",
            title="Parameterized SQL & MongoDB Sanitization (Node.js)",
            code="// SQL:\nconst user = await db.query('SELECT * FROM users WHERE email = $1', [email]);\n\n// MongoDB:\nconst sanitize = require('mongo-sanitize');\nconst cleanEmail = sanitize(req.body.email);"
        )
    ],
    "Data Protection & Secrets": [
        CodeSnippet(
            language="Node.js",
            title="Environment Variables (Node.js)",
            code="// In .env (added to .gitignore):\n// DATABASE_URL=mongodb://localhost:27017\n// JWT_SECRET=super_secret_key_32_chars\n\nrequire('dotenv').config();\nconst secret = process.env.JWT_SECRET;"
        ),
        CodeSnippet(
            language="Python",
            title="python-dotenv (Python)",
            code="import os\nfrom dotenv import load_dotenv\n\nload_dotenv()\nsecret_key = os.getenv('JWT_SECRET')"
        )
    ],
    "CORS & Security Headers": [
        CodeSnippet(
            language="Node.js",
            title="Helmet & CORS in Express",
            code="const helmet = require('helmet');\nconst cors = require('cors');\n\napp.use(helmet());\napp.use(cors({\n  origin: ['http://localhost:5173'],\n  credentials: true\n}));"
        ),
        CodeSnippet(
            language="Python",
            title="FastAPI CORS Whitelist",
            code="from fastapi.middleware.cors import CORSMiddleware\n\napp.add_middleware(\n    CORSMiddleware,\n    allow_origins=['http://localhost:5173'],\n    allow_credentials=True,\n    allow_methods=['*'],\n    allow_headers=['*'],\n)"
        )
    ]
}

REMEDIATION_DATA: Dict[str, Dict] = {
    "pwd_storage": {
        "title": "Insecure Password Storage",
        "severity": "Critical",
        "category": "Password Security",
        "description": "User passwords are stored in plaintext or with weak/deprecated hashing algorithms (e.g., MD5 or un-salted SHA).",
        "impact": "If your database is dumped or leaked, attackers can immediately read every user password or crack them in seconds using rainbow tables.",
        "remediation_guide": "Always use a slow, adaptive cryptographic hashing algorithm designed for passwords like Bcrypt, Argon2id, or PBKDF2 with automatic salt generation.",
        "snippets": DEFAULT_SNIPPETS_BY_CATEGORY["Password Security"]
    },
    "pwd_policy": {
        "title": "Weak Password Policy",
        "severity": "Medium",
        "category": "Password Security",
        "description": "Registration permits short or easily guessable passwords without minimum complexity or length enforcement.",
        "impact": "Users frequently choose trivial passwords like '123456' or 'admin', making accounts vulnerable to automated brute-force attacks.",
        "remediation_guide": "Enforce a minimum length of at least 8 to 12 characters and reject common dictionary passwords on registration.",
        "snippets": DEFAULT_SNIPPETS_BY_CATEGORY["Password Security"]
    },
    "auth_rate_limiting": {
        "title": "Missing Login Rate Limiting",
        "severity": "High",
        "category": "Authentication & Access Control",
        "description": "The login endpoint has no rate limiting or failed attempt tracking.",
        "impact": "Attackers can send tens of thousands of automated password guesses per minute (credential stuffing / dictionary attacks) without restriction.",
        "remediation_guide": "Implement rate limiting middleware (e.g. max 5 failed attempts per 15 minutes per IP or account).",
        "snippets": DEFAULT_SNIPPETS_BY_CATEGORY["Authentication & Access Control"]
    },
    "auth_account_enumeration": {
        "title": "Account Enumeration via Error Messages",
        "severity": "Medium",
        "category": "Authentication & Access Control",
        "description": "Login or forgot password responses reveal whether an email/username is registered.",
        "impact": "Attackers can scrape your user list to identify high-profile targets or craft targeted phishing emails.",
        "remediation_guide": "Always return a uniform generic error message (e.g., 'Invalid email or password') for both non-existent accounts and wrong passwords.",
        "snippets": DEFAULT_SNIPPETS_BY_CATEGORY["Authentication & Access Control"]
    },
    "session_storage": {
        "title": "Insecure Browser Token / Session Storage",
        "severity": "High",
        "category": "Session & Token Security",
        "description": "Session tokens or JWTs are stored in localStorage or accessible JavaScript cookies.",
        "impact": "Any Cross-Site Scripting (XSS) flaw or vulnerable npm package can execute `localStorage.getItem()` and steal the token, hijacking user accounts.",
        "remediation_guide": "Store authentication tokens in HttpOnly, Secure, SameSite cookies or keep access tokens in-memory with HttpOnly refresh cookies.",
        "snippets": DEFAULT_SNIPPETS_BY_CATEGORY["Session & Token Security"]
    },
    "jwt_security": {
        "title": "Weak JWT Signing Key or Missing Expiration",
        "severity": "Critical",
        "category": "Session & Token Security",
        "description": "JWT tokens are signed with a trivial hardcoded string or lack an expiration timestamp.",
        "impact": "Attackers can crack the secret offline using dictionaries and forge valid JWT tokens with admin privileges.",
        "remediation_guide": "Generate a 256-bit cryptographically random secret stored in environment variables and enforce short token expiration.",
        "snippets": DEFAULT_SNIPPETS_BY_CATEGORY["Session & Token Security"]
    },
    "sql_nosql_injection": {
        "title": "Database Injection Risk (SQL / NoSQL)",
        "severity": "Critical",
        "category": "Input Validation & Injection Defense",
        "description": "User input is directly concatenated or formatted into database queries without parameterization.",
        "impact": "Attackers can bypass logins, extract all database records, modify data, or execute administrative commands.",
        "remediation_guide": "Always use parameterized queries, prepared statements, or trusted ORMs/ODMs (SQLAlchemy, Mongoose, Prisma).",
        "snippets": DEFAULT_SNIPPETS_BY_CATEGORY["Input Validation & Injection Defense"]
    },
    "xss_defense": {
        "title": "Cross-Site Scripting (XSS) Vulnerability",
        "severity": "High",
        "category": "Input Validation & Injection Defense",
        "description": "User-provided HTML or scripts are rendered directly in the DOM using innerHTML or dangerouslySetInnerHTML without sanitization.",
        "impact": "Attackers can execute arbitrary JavaScript in victim browsers, stealing session cookies and hijacking actions.",
        "remediation_guide": "Use standard React JSX text bindings (which auto-escape HTML) or sanitize rich text using DOMPurify before rendering.",
        "snippets": DEFAULT_SNIPPETS_BY_CATEGORY["Input Validation & Injection Defense"]
    },
    "secrets_management": {
        "title": "Exposed Secrets & API Keys",
        "severity": "Critical",
        "category": "Data Protection & Secrets",
        "description": "Sensitive credentials (database passwords, private keys, API secrets) are hardcoded or committed to git.",
        "impact": "Secrets committed to git repositories or exposed in frontend code are rapidly harvested by automated bots.",
        "remediation_guide": "Store all secrets exclusively in server-side environment variables (`.env`) and ensure `.env` is listed in `.gitignore`.",
        "snippets": DEFAULT_SNIPPETS_BY_CATEGORY["Data Protection & Secrets"]
    },
    "transport_encryption_https": {
        "title": "Unencrypted Transport (HTTP)",
        "severity": "High",
        "category": "Data Protection & Secrets",
        "description": "Network traffic is transmitted over unencrypted HTTP without TLS encryption in production.",
        "impact": "Attackers on the same local network (Wi-Fi, ISP) can sniff passwords, session cookies, and API data in plaintext.",
        "remediation_guide": "Enforce HTTPS using free certificates from Let's Encrypt or deploy behind reverse proxies like Cloudflare or Caddy.",
        "snippets": DEFAULT_SNIPPETS_BY_CATEGORY["Data Protection & Secrets"]
    },
    "cors_config": {
        "title": "Overly Permissive CORS Policy",
        "severity": "Medium",
        "category": "CORS & Security Headers",
        "description": "CORS allows wildcard '*' origins with credential transmission enabled or blindly reflects incoming origin headers.",
        "impact": "Malicious websites visited by your users can perform unauthorized API actions against your backend.",
        "remediation_guide": "Explicitly whitelist trusted client domains in CORS middleware.",
        "snippets": DEFAULT_SNIPPETS_BY_CATEGORY["CORS & Security Headers"]
    },
    "security_headers": {
        "title": "Missing Security HTTP Headers",
        "severity": "Low",
        "category": "CORS & Security Headers",
        "description": "Browser security defense headers like CSP, X-Frame-Options, and X-Content-Type-Options are absent.",
        "impact": "App is susceptible to clickjacking (framing inside invisible iframe) and MIME-type confusion attacks.",
        "remediation_guide": "Install Helmet in Node.js or add security headers middleware in FastAPI/Django.",
        "snippets": DEFAULT_SNIPPETS_BY_CATEGORY["CORS & Security Headers"]
    }
}
