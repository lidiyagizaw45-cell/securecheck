# 🛡️ SecureCheck – AI-Powered Security Auditor for Web Developers

<p align="center">
  <strong>An automated, full-stack security evaluation suite designed for student developers and beginner engineers.</strong><br>
  Audit login flows, REST APIs, password hashing, session cookies, rate limits, SQL queries, and CORS misconfigurations in minutes. Get an instant security compliance score, risk severity ranking, and copy-paste remediation code snippets before demo day.
</p>

---

## 🌟 Key Features

1. **Interactive Security Questionnaire & AI Generator**:
   - **Pre-Configured Industry Templates**:
     - 🔑 *Login & Authentication System* (Password hashing, salting, brute-force protection, session cookies, JWT flags)
     - 🌐 *Full-Stack Web App Audit* (360° security review including XSS, SQL/NoSQL injection, CORS, and HTTP security headers)
     - ⚡ *REST API & Backend Security* (Authorization checks, rate limiting, error leakage, database sanitization)
     - ⏱️ *Quick 2-Minute Checkup* (The 5 most critical security checks every student project must pass)
   - **Live AI Questionnaire Generator**: Enter your tech stack (e.g. Next.js, Django, FastAPI, PHP, Spring Boot) to generate tailored security checks powered by OpenRouter LLMs.
   - **Educational Explanations**: Every question includes a beginner-friendly *"Why This Matters"* guide.

2. **AI Code Snippet Scanner (`/code-scanner`)**:
   - Paste raw source code (JavaScript, TypeScript, Python, PHP, Java, Go, SQL).
   - The AI analyzer highlights exact line numbers with flaws, calculates overall code risk, explains the exploit vector, and returns a fully refactored, safe code snippet.

3. **Intelligent Scoring & Visual Analytics**:
   - **Score (0-100%) & Letter Grade (A+ to F)** calculated with weighted category scoring.
   - **Interactive Radial Score Gauge** + Category Radar & Bar charts.
   - **Vulnerability Breakdown**: Categorized by severity (*Critical, High, Medium, Low*) with impact descriptions and remediation guides.
   - **Copy-Paste Secure Code Tabs**: Direct fixes provided in **Node.js**, **Python**, and **PHP**.

4. **Audit History, Comparisons & Data Management**:
   - **Offline-First Hybrid Database Engine**: Automatically connects to local MongoDB on port 27017, and seamlessly falls back to a persistent local JSON database (`backend/data/offline_db.json`) if MongoDB is offline.
   - **Side-by-Side Audit Comparison**: Select any 2 audits to view visual progress diffs showing resolved, persistent, and newly introduced issues.
   - **Multi-Format Export**: Download complete PDF reports, export JSON backups, or copy Markdown summaries.

5. **Student Security Learning Hub**:
   - Clean cheat sheets covering password salting (Bcrypt), HttpOnly cookies vs. LocalStorage, SQL parameterization, Helmet headers, and the OWASP Top 10.

---

## 📦 System Requirements & Prerequisites

Before setting up SecureCheck on your machine, ensure you have the following software installed:

| Prerequisite | Minimum Version | Description & Download Link |
| :--- | :--- | :--- |
| **Python** | `3.10+` (or `3.13`) | Python runtime for FastAPI backend. **Important:** Check *"Add Python to PATH"* during setup. [Download Python](https://www.python.org/downloads/) |
| **Node.js & npm** | `v18.0+` or `v20.0+` (LTS) | JavaScript runtime and package manager for the React/Vite frontend. [Download Node.js](https://nodejs.org/) |
| **MongoDB Compass & Community Server** *(Optional)* | `v7.0+` | Visual GUI to view and manage collections (`audits`, `users`, `projects`, `settings`). [Download MongoDB Compass](https://www.mongodb.com/try/download/compass) |
| **OpenRouter AI Key** *(Optional)* | Any | For live AI questionnaire generation and code scanning. (Already configured in `.env`). [Get OpenRouter API Key](https://openrouter.ai/) |

> [!NOTE]
> **Zero Database Setup Required:** If you do not have MongoDB installed, **SecureCheck will still run 100% smoothly**! It automatically stores all audits, users, and settings in your local file `backend/data/offline_db.json`. If you later start MongoDB, it automatically connects to `mongodb://localhost:27017`.

---

## 🚀 How to Setup & Run the Project

### Option A: 1-Click Automated Setup (Recommended for Windows)

If you downloaded or unzipped this project folder, you can set up and start everything with two double-clicks:

1. **Step 1: Install Dependencies**
   - Double-click **`install_requirements.bat`** in the project root.
   - *What it does:* Checks Python and Node.js versions, installs all backend Python packages (`requirements.txt`), copies `.env`, and installs frontend npm dependencies (`npm install`).

2. **Step 2: Start the Application**
   - Double-click **`run_project.bat`**.
   - *What it does:* Starts the FastAPI backend (port `8000`), starts the Vite frontend (port `5173`), and opens `http://localhost:5173` in your default browser.

---

### Option B: Manual Setup via Terminal (Windows, macOS, Linux)

If you prefer using the command line:

#### 1. Backend Setup:
```bash
# Navigate to backend directory
cd backend

# Install Python requirements
python -m pip install -r requirements.txt

# Start the FastAPI server
python -m uvicorn app.main:app --reload --port 8000
```
- **Backend API**: `http://localhost:8000`
- **Interactive Swagger Documentation**: `http://localhost:8000/docs`

#### 2. Frontend Setup:
Open a **second terminal window**:
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the Vite React development server
npm run dev
```
- **Web UI**: `http://localhost:5173`

---

## 🍃 MongoDB Compass Guide (Visual Database Inspection)

If you have MongoDB Community Server and MongoDB Compass installed:

1. Open **MongoDB Compass**.
2. Paste the default connection string:
   ```text
   mongodb://localhost:27017
   ```
3. Click **Connect**.
4. You will see the database named **`securecheck_db`** containing:
   - **`audits`**: All saved security audit evaluations, vulnerability lists, and code scan logs.
   - **`users`**: Registered student developer accounts with PBKDF2 salted password hashes.
   - **`projects`**: Created project workspaces.
   - **`settings`**: OpenRouter AI model preferences and configurations.

---

## 🌐 How to Share Localhost Online with Remote Friends

Want friends or classmates anywhere in the world to test your local SecureCheck app? Run **one** of these free commands in a new terminal while your app is running:

### Method 1: Pinggy (Instant — No Install or Signup)
```powershell
ssh -p 443 -R0:localhost:5173 a.pinggy.io
```
- Generates an instant public link like `https://abc-123.a.pinggy.link` that your friends can open on any phone or computer worldwide.

### Method 2: Cloudflare Tunnel
```powershell
npx @cloudflare/cloudflared tunnel --url http://localhost:5173
```
- Gives a secure public link like `https://random-words.trycloudflare.com`.

### Method 3: LocalTunnel
```powershell
npx localtunnel --port 5173
```
- Gives a public link like `https://funny-tiger-42.loca.lt`. *(Password: your public IP from [loca.lt/mytunnelpassword](https://loca.lt/mytunnelpassword))*.

---

## 🧪 Running Automated Tests

To verify that the audit engine, vulnerability scoring, code scanner, and user authentication endpoints are healthy:

```bash
# Run 1-click test script (Windows)
run_tests.bat

# Or run pytest manually
python -m pytest backend/test_backend.py -v
```

---

## 📚 Deep Documentation & Code Explanations

For detailed architectural flowcharts, scoring formulas, and exhaustive file-by-file code explanations:

- 📐 **[System Architecture & Visual Documentation](DOCUMENTATION.md)**: Visual diagrams of system workflows, data schemas, and API references.
- 📂 **[Code Explanation Directory](docs/code_explanation/README.md)**: Comprehensive line-by-line / section-by-section breakdown of every single source file in the repository.

---

## 📁 Repository Structure

```text
SecureChecks/
├── install_requirements.bat      # 1-Click Dependency Installer for Windows
├── run_project.bat               # 1-Click Server & Frontend Launcher
├── run_tests.bat                 # 1-Click Backend Test Runner
├── requirements.txt              # Root Python Dependencies Mirror
├── README.md                     # Main Project Documentation & Setup Guide
├── DOCUMENTATION.md              # Visual System Architecture & Schemas
│
├── backend/                      # FastAPI Python Backend
│   ├── app/
│   │   ├── main.py               # Application entrypoint & CORS setup
│   │   ├── config.py             # Environment configuration & settings
│   │   ├── database.py           # MongoDB + Offline JSON Storage Manager
│   │   ├── models.py             # Pydantic data models & schemas
│   │   ├── routes/               # API route controllers (audits, auth, questions, settings)
│   │   └── services/             # Audit engine, AI service, and remediation rules
│   ├── data/
│   │   └── offline_db.json       # Persistent local JSON fallback database
│   ├── .env.example              # Environment variables template
│   ├── requirements.txt          # Backend Python dependencies
│   └── test_backend.py           # Backend Pytest test suite
│
├── frontend/                     # Vite + React 18 SPA Frontend
    ├── src/
    │   ├── App.jsx               # Main React Router router and layout
    │   ├── index.css             # High-contrast UI styles & dark theme
    │   ├── components/           # Reusable UI components (Navbar, ScoreGauge, Cards)
    │   ├── pages/                # Main views (Dashboard, NewAudit, Report, CodeScanner)
    │   └── services/api.js       # Centralized REST API client
    ├── package.json              # Frontend npm package dependencies
    └── vite.config.js            # Vite configuration with proxy and allowedHosts

```

---

## 📄 License
MIT License. Built for student developers and beginners to build safer, more resilient web applications.
