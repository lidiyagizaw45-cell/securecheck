from typing import List, Dict, Any

QUESTIONS_BANK: List[Dict[str, Any]] = [
    {
        "id": "pwd_storage",
        "category": "Password Security",
        "title": "How are user passwords stored in your database?",
        "description": "Storing passwords safely is the most foundational security requirement of any login system.",
        "why_it_matters": "Plaintext or weakly hashed (MD5/SHA1) passwords can be easily stolen in a data breach or SQL injection, exposing all your users.",
        "type": "single_choice",
        "tags": ["auth", "passwords", "owasp-top-10"],
        "options": [
            {
                "id": "pwd_storage_bcrypt_argon2",
                "label": "Modern slow cryptographic hash (Bcrypt, Argon2, PBKDF2, Scrypt) with unique salt",
                "score_weight": 1.0,
                "is_secure": True,
                "feedback": "Excellent! Bcrypt, Argon2, and PBKDF2 are industry-standard adaptive hashing algorithms that resist GPU brute-forcing."
            },
            {
                "id": "pwd_storage_sha256_salted",
                "label": "Standard SHA-256 or SHA-512 with a salt",
                "score_weight": 0.4,
                "is_secure": False,
                "feedback": "Warning: Fast hashes like raw SHA-256 are designed to be fast, which makes them vulnerable to GPU cracking clusters. Use Bcrypt or Argon2 instead."
            },
            {
                "id": "pwd_storage_md5_sha1",
                "label": "MD5 or SHA-1 hash (legacy)",
                "score_weight": 0.1,
                "is_secure": False,
                "feedback": "Critical Risk: MD5 and SHA-1 have been broken for years and can be reversed in seconds using online rainbow tables."
            },
            {
                "id": "pwd_storage_plaintext",
                "label": "Plain text (unhashed) or reversible encryption",
                "score_weight": 0.0,
                "is_secure": False,
                "feedback": "Critical Vulnerability: Never store passwords in plaintext! Any database leak or accidental logging completely compromises every user."
            }
        ]
    },
    {
        "id": "pwd_policy",
        "category": "Password Security",
        "title": "What password complexity/length policy is enforced on registration?",
        "description": "Rules determining whether users can choose weak passwords like '123456' or 'password'.",
        "why_it_matters": "Short or common passwords can be guessed in milliseconds by automated credential stuffing bots.",
        "type": "single_choice",
        "tags": ["passwords", "validation"],
        "options": [
            {
                "id": "pwd_policy_strong",
                "label": "Minimum 8+ characters (recommended 12+) and checks against common weak passwords",
                "score_weight": 1.0,
                "is_secure": True,
                "feedback": "Great practice! Modern guidelines prioritize password length (12+ characters) and blocking known common passwords."
            },
            {
                "id": "pwd_policy_basic",
                "label": "Minimum 6-8 characters only without checking common dictionary words",
                "score_weight": 0.6,
                "is_secure": False,
                "feedback": "Acceptable for small demos, but users may still pick 'password123'. Consider checking length >= 8 and blocking common passwords."
            },
            {
                "id": "pwd_policy_none",
                "label": "No minimum length or complexity check",
                "score_weight": 0.0,
                "is_secure": False,
                "feedback": "High Risk: Without minimum length rules, users will create 1-4 character passwords vulnerable to immediate guessing."
            }
        ]
    },
    {
        "id": "auth_rate_limiting",
        "category": "Authentication & Access Control",
        "title": "Is there rate limiting or brute-force protection on your login endpoint?",
        "description": "Preventing automated bots from submitting thousands of password attempts per minute.",
        "why_it_matters": "Without rate limits, attackers can use dictionary attacks and credential stuffing tools to crack user accounts within minutes.",
        "type": "single_choice",
        "tags": ["auth", "rate-limiting", "brute-force"],
        "options": [
            {
                "id": "rate_limit_active",
                "label": "Yes, rate limiting (e.g., max 5-10 attempts per minute per IP/account) or progressive delay",
                "score_weight": 1.0,
                "is_secure": True,
                "feedback": "Outstanding! Rate limiting blocks credential stuffing and brute-force bots effectively."
            },
            {
                "id": "rate_limit_captcha_only",
                "label": "CAPTCHA is shown after repeated failed attempts",
                "score_weight": 0.8,
                "is_secure": True,
                "feedback": "Good defense. CAPTCHA stops automated bots, though combining it with IP rate limiting provides even better protection."
            },
            {
                "id": "rate_limit_none",
                "label": "No rate limiting (users/bots can attempt unlimited logins continuously)",
                "score_weight": 0.0,
                "is_secure": False,
                "feedback": "High Risk: Attackers can send 10,000 login requests per minute until they find the right password."
            }
        ]
    },
    {
        "id": "auth_account_enumeration",
        "category": "Authentication & Access Control",
        "title": "What error message is displayed when a user fails to log in?",
        "description": "Checking whether your login responses reveal if an email or username exists in your database.",
        "why_it_matters": "Distinguishing 'Email does not exist' from 'Wrong password' allows attackers to harvest lists of valid usernames/emails.",
        "type": "single_choice",
        "tags": ["auth", "enumeration", "privacy"],
        "options": [
            {
                "id": "enum_generic_message",
                "label": "Generic message: 'Invalid email or password' (identical response for non-existent user and wrong password)",
                "score_weight": 1.0,
                "is_secure": True,
                "feedback": "Perfect! Generic error messages prevent attackers from discovering which email addresses are registered."
            },
            {
                "id": "enum_revealing_message",
                "label": "Specific message: 'User not found' or 'Incorrect password for this email'",
                "score_weight": 0.3,
                "is_secure": False,
                "feedback": "Medium Risk: User enumeration vulnerability. Attackers can automate queries to discover all registered users."
            }
        ]
    },
    {
        "id": "session_storage",
        "category": "Session & Token Security",
        "title": "Where are user auth tokens / session IDs stored in the browser frontend?",
        "description": "How the client stores authentication credentials between page refreshes.",
        "why_it_matters": "Tokens in localStorage can be stolen by any malicious JavaScript script (XSS). HttpOnly cookies prevent script access.",
        "type": "single_choice",
        "tags": ["jwt", "cookies", "session", "xss"],
        "options": [
            {
                "id": "session_httponly_cookie",
                "label": "HttpOnly, Secure, SameSite cookies (inaccessible from JavaScript document.cookie)",
                "score_weight": 1.0,
                "is_secure": True,
                "feedback": "Best Practice! HttpOnly cookies protect auth credentials even if your app has an XSS vulnerability."
            },
            {
                "id": "session_in_memory",
                "label": "In-memory React state with silent refresh token rotation in HttpOnly cookie",
                "score_weight": 1.0,
                "is_secure": True,
                "feedback": "Excellent modern SPA architecture! Keeps access tokens out of persistent browser storage."
            },
            {
                "id": "session_localstorage",
                "label": "Browser localStorage or sessionStorage (e.g. localStorage.setItem('token', jwt))",
                "score_weight": 0.4,
                "is_secure": False,
                "feedback": "Medium Risk: localStorage is vulnerable to XSS. Any third-party library or injected script can read and exfiltrate your tokens."
            },
            {
                "id": "session_plain_cookie",
                "label": "Plain cookie without HttpOnly or Secure flags (document.cookie)",
                "score_weight": 0.2,
                "is_secure": False,
                "feedback": "High Risk: Accessible directly via JavaScript and transmitted over unencrypted connections if Secure flag is missing."
            }
        ]
    },
    {
        "id": "jwt_security",
        "category": "Session & Token Security",
        "title": "If using JWT (JSON Web Tokens), how is the signing secret and expiration configured?",
        "description": "JWT cryptographic integrity and expiration lifetime.",
        "why_it_matters": "Weak secret keys can be cracked offline in seconds, allowing attackers to forge admin tokens.",
        "type": "single_choice",
        "tags": ["jwt", "tokens", "crypto"],
        "options": [
            {
                "id": "jwt_secure_config",
                "label": "High-entropy random secret (32+ bytes) stored in environment variables + short expiration (15m-1h)",
                "score_weight": 1.0,
                "is_secure": True,
                "feedback": "Great job! Short lifetimes limit damage if a token leaks, and strong secret prevents signature forgery."
            },
            {
                "id": "jwt_no_expiration",
                "label": "Strong secret but JWT never expires or has multi-year expiration",
                "score_weight": 0.5,
                "is_secure": False,
                "feedback": "Medium Risk: Non-expiring tokens remain valid forever if intercepted. Implement expiration (e.g., 1 hour) and refresh tokens."
            },
            {
                "id": "jwt_weak_hardcoded_secret",
                "label": "Hardcoded simple secret string (e.g. 'mysecret123', 'supersecret') in code",
                "score_weight": 0.0,
                "is_secure": False,
                "feedback": "Critical Vulnerability: Attackers can crack weak JWT secrets with tools like hashcat/jwt-cracker and forge any user ID or admin claim."
            },
            {
                "id": "jwt_not_applicable",
                "label": "Not using JWTs (using server-side database sessions instead)",
                "score_weight": 1.0,
                "is_secure": True,
                "feedback": "Server-side sessions are a great, battle-tested alternative that allow instant server-side revocation."
            }
        ]
    },
    {
        "id": "sql_nosql_injection",
        "category": "Input Validation & Injection Defense",
        "title": "How are database queries (SQL or MongoDB) constructed in your backend?",
        "description": "How user inputs (like email, username, search terms) are passed into database queries.",
        "why_it_matters": "SQL/NoSQL Injection allows attackers to bypass authentication, dump entire databases, or delete tables.",
        "type": "single_choice",
        "tags": ["sqli", "injection", "database", "owasp-top-10"],
        "options": [
            {
                "id": "query_orm_parameterized",
                "label": "Parameterized queries, Prepared statements, or trusted ORM/ODM (Prisma, Mongoose, SQLAlchemy, PyMongo with sanitized inputs)",
                "score_weight": 1.0,
                "is_secure": True,
                "feedback": "Excellent! Parameterized queries separate code from data, completely immunizing your backend against SQL/NoSQL injection."
            },
            {
                "id": "query_string_concat_custom_escape",
                "label": "String concatenation with custom regex/escape functions (e.g. replace('\'', ''))",
                "score_weight": 0.3,
                "is_secure": False,
                "feedback": "High Risk: Custom escaping functions almost always have edge-case bypasses. Always use native parameterized queries or ORMs."
            },
            {
                "id": "query_raw_string_formatting",
                "label": "Raw string interpolation (e.g. SELECT * FROM users WHERE email = user_input)",
                "score_weight": 0.0,
                "is_secure": False,
                "feedback": "Critical Vulnerability: Classic SQL Injection! Typing ' OR '1'='1 in the login box lets anyone log in as the first user without a password."
            }
        ]
    },
    {
        "id": "xss_defense",
        "category": "Input Validation & Injection Defense",
        "title": "How does your frontend render user-supplied content and profiles?",
        "description": "Displaying comments, usernames, or bio information entered by users.",
        "why_it_matters": "Cross-Site Scripting (XSS) allows attackers to inject malicious JavaScript that runs in other users' browsers.",
        "type": "single_choice",
        "tags": ["xss", "frontend", "react"],
        "options": [
            {
                "id": "xss_auto_escaping",
                "label": "Standard React JSX / Vue templating (auto-escapes HTML) and sanitizes rich text using DOMPurify",
                "score_weight": 1.0,
                "is_secure": True,
                "feedback": "Great! React automatically encodes text in JSX ({userInput}), preventing script tags from executing."
            },
            {
                "id": "xss_dangerously_set_html",
                "label": "Using dangerouslySetInnerHTML / v-html / innerHTML directly with raw user inputs",
                "score_weight": 0.1,
                "is_secure": False,
                "feedback": "Critical Risk: Rendering unsanitized HTML allows stored XSS attacks. If you must render HTML, always sanitize with DOMPurify."
            },
            {
                "id": "xss_vanilla_innerhtml",
                "label": "Direct element.innerHTML in vanilla JavaScript without escaping",
                "score_weight": 0.0,
                "is_secure": False,
                "feedback": "Critical Risk: Setting innerHTML with user input triggers immediate XSS. Use element.textContent instead."
            }
        ]
    },
    {
        "id": "secrets_management",
        "category": "Data Protection & Secrets",
        "title": "Where are sensitive keys (database passwords, API secrets, JWT keys) stored?",
        "description": "Management of credentials and secrets across development and source control.",
        "why_it_matters": "Committing credentials to GitHub or storing them in client-side code leads to immediate automated credential theft.",
        "type": "single_choice",
        "tags": ["secrets", "env", "git"],
        "options": [
            {
                "id": "secrets_env_gitignored",
                "label": "Stored in .env files on the server/backend, excluded from Git via .gitignore",
                "score_weight": 1.0,
                "is_secure": True,
                "feedback": "Perfect! Secrets stay on the backend server and are never pushed to public source control."
            },
            {
                "id": "secrets_committed_git",
                "label": "Hardcoded in backend files that are committed to Git/GitHub repository",
                "score_weight": 0.1,
                "is_secure": False,
                "feedback": "High Risk: GitHub is constantly scanned by bots for API keys and DB credentials. Use environment variables and .gitignore."
            },
            {
                "id": "secrets_in_frontend_bundle",
                "label": "Hardcoded in frontend React code (visible to anyone in browser DevTools)",
                "score_weight": 0.0,
                "is_secure": False,
                "feedback": "Critical Vulnerability: Any secret (database password, admin API key) in React/frontend JavaScript is public to the entire internet."
            }
        ]
    },
    {
        "id": "transport_encryption_https",
        "category": "Data Protection & Secrets",
        "title": "Is network communication secured with HTTPS / TLS encryption?",
        "description": "Encrypting web traffic between the user's browser and the backend server.",
        "why_it_matters": "Over unencrypted HTTP, anyone on the same Wi-Fi network (coffee shops, dorms) can sniff passwords and session tokens in plaintext.",
        "type": "single_choice",
        "tags": ["https", "tls", "network"],
        "options": [
            {
                "id": "https_enforced",
                "label": "HTTPS enforced everywhere with automatic HTTP -> HTTPS redirection (e.g. Let's Encrypt / Cloudflare)",
                "score_weight": 1.0,
                "is_secure": True,
                "feedback": "Essential! TLS encryption prevents Man-in-the-Middle (MitM) eavesdropping and packet sniffing."
            },
            {
                "id": "https_local_dev_only",
                "label": "HTTP only in local development, but planned HTTPS in production",
                "score_weight": 0.7,
                "is_secure": True,
                "feedback": "Standard for localhost development. Make sure your production host (Vercel, Render, Railway, AWS) enforces HTTPS."
            },
            {
                "id": "http_unencrypted_prod",
                "label": "Plain HTTP without TLS in deployed/accessible environment",
                "score_weight": 0.0,
                "is_secure": False,
                "feedback": "Critical Vulnerability: Plaintext passwords, tokens, and data can be intercepted by anyone on the network."
            }
        ]
    },
    {
        "id": "cors_config",
        "category": "CORS & Security Headers",
        "title": "How is Cross-Origin Resource Sharing (CORS) configured on your backend API?",
        "description": "Controlling which domains and websites are allowed to make AJAX/fetch requests to your backend.",
        "why_it_matters": "Permissive CORS with credentials enabled allows malicious third-party websites to make authenticated requests on behalf of your users.",
        "type": "single_choice",
        "tags": ["cors", "api", "browser-security"],
        "options": [
            {
                "id": "cors_explicit_whitelist",
                "label": "Explicit origin whitelist (e.g. ['http://localhost:3000', 'https://myapp.com']) with credentials handled safely",
                "score_weight": 1.0,
                "is_secure": True,
                "feedback": "Excellent! Whitelisting only trusted frontend domains stops cross-site API abuse."
            },
            {
                "id": "cors_wildcard_no_auth",
                "label": "Wildcard '*' origin for a purely public read-only API (no user auth cookies/tokens)",
                "score_weight": 0.8,
                "is_secure": True,
                "feedback": "Acceptable for public read-only data, but ensure endpoints requiring user authentication restrict origins."
            },
            {
                "id": "cors_wildcard_with_credentials",
                "label": "Wildcard '*' origin or reflecting any incoming Origin header for authenticated user endpoints",
                "score_weight": 0.1,
                "is_secure": False,
                "feedback": "High Risk: Malicious websites visited by your users could execute background API calls against your backend."
            }
        ]
    },
    {
        "id": "security_headers",
        "category": "CORS & Security Headers",
        "title": "Are standard HTTP Security Headers (Helmet, CSP, X-Frame-Options) enabled?",
        "description": "Special HTTP response headers that activate built-in browser defenses against clickjacking, MIME sniffing, and framing.",
        "why_it_matters": "Without security headers, your website can be embedded in an invisible iframe (Clickjacking) or trick browsers into executing malicious scripts.",
        "type": "single_choice",
        "tags": ["headers", "helmet", "clickjacking"],
        "options": [
            {
                "id": "headers_helmet_enabled",
                "label": "Yes, using middleware like Helmet (Node.js), Secure headers (Python/Django/FastAPI) setting X-Frame-Options, CSP, etc.",
                "score_weight": 1.0,
                "is_secure": True,
                "feedback": "Great defense-in-depth! Security headers provide vital browser-level protection against clickjacking and MIME attacks."
            },
            {
                "id": "headers_default_minimal",
                "label": "Default framework headers only without custom security configuration",
                "score_weight": 0.5,
                "is_secure": False,
                "feedback": "Moderate: Adding packages like 'helmet' in Express or custom middleware in FastAPI takes only 2 lines of code and provides strong defenses."
            },
            {
                "id": "headers_none",
                "label": "No security headers configured / unsure what they are",
                "score_weight": 0.2,
                "is_secure": False,
                "feedback": "Missed opportunity: Enabling security headers is an easy, high-value upgrade for any web project."
            }
        ]
    },
    {
        "id": "error_handling",
        "category": "Error Handling & Logging",
        "title": "How does your backend handle server errors and unhandled exceptions?",
        "description": "What gets sent back to the user when your backend crashes or throws a database exception.",
        "why_it_matters": "Leaking raw Python/Node stack traces reveals database structure, table names, file paths, and vulnerable library versions.",
        "type": "single_choice",
        "tags": ["errors", "information-disclosure"],
        "options": [
            {
                "id": "error_safe_user_messages",
                "label": "Sanitized error responses to clients ('An unexpected error occurred') while logging details privately on server",
                "score_weight": 1.0,
                "is_secure": True,
                "feedback": "Superb! Prevents information disclosure while preserving full debugging logs for developers."
            },
            {
                "id": "error_raw_stack_traces",
                "label": "Raw exception stack traces and SQL error messages sent directly to client in JSON/HTML responses",
                "score_weight": 0.1,
                "is_secure": False,
                "feedback": "Medium/High Risk: Exposing stack traces gives attackers an exact blueprint of your database schema, file paths, and dependencies."
            }
        ]
    }
]

PRESET_TEMPLATES = [
    {
        "id": "login_auth",
        "title": "Login & Authentication System",
        "description": "Essential security audit for login forms, registration, password hashing, and session/token management.",
        "icon": "ShieldCheck",
        "estimated_time": "3 mins",
        "categories": ["Password Security", "Authentication & Access Control", "Session & Token Security", "Data Protection & Secrets"],
        "question_ids": ["pwd_storage", "pwd_policy", "auth_rate_limiting", "auth_account_enumeration", "session_storage", "jwt_security", "secrets_management", "transport_encryption_https"]
    },
    {
        "id": "full_stack",
        "title": "Full-Stack Web App Audit",
        "description": "Comprehensive 360-degree security review covering passwords, sessions, database queries, XSS, CORS, and headers.",
        "icon": "Layers",
        "estimated_time": "6 mins",
        "categories": ["Password Security", "Authentication & Access Control", "Session & Token Security", "Input Validation & Injection Defense", "Data Protection & Secrets", "CORS & Security Headers", "Error Handling & Logging"],
        "question_ids": ["pwd_storage", "pwd_policy", "auth_rate_limiting", "auth_account_enumeration", "session_storage", "jwt_security", "sql_nosql_injection", "xss_defense", "secrets_management", "transport_encryption_https", "cors_config", "security_headers", "error_handling"]
    },
    {
        "id": "rest_api",
        "title": "REST API & Backend Security",
        "description": "Focused review for backend APIs, JWT authentication, rate limiting, SQL injection, and CORS policies.",
        "icon": "Cpu",
        "estimated_time": "4 mins",
        "categories": ["Authentication & Access Control", "Session & Token Security", "Input Validation & Injection Defense", "CORS & Security Headers", "Error Handling & Logging"],
        "question_ids": ["auth_rate_limiting", "jwt_security", "sql_nosql_injection", "secrets_management", "cors_config", "security_headers", "error_handling"]
    },
    {
        "id": "quick_check",
        "title": "Quick 2-Minute Checkup",
        "description": "The 5 most critical security questions every student project must get right before demo day.",
        "icon": "Zap",
        "estimated_time": "2 mins",
        "categories": ["Password Security", "Authentication & Access Control", "Input Validation & Injection Defense", "Data Protection & Secrets"],
        "question_ids": ["pwd_storage", "auth_rate_limiting", "session_storage", "sql_nosql_injection", "secrets_management"]
    }
]
