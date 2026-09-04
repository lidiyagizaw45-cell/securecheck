import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Code2, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Copy, 
  Check, 
  Terminal, 
  ArrowRight, 
  Loader2, 
  FileCode, 
  ListChecks, 
  ShieldAlert, 
  ExternalLink 
} from 'lucide-react';
import { api } from '../services/api';
import ScoreGauge from '../components/ScoreGauge';

const DEMO_SNIPPETS = {
  javascript: `// Insecure Login Handler in Node.js
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  // 1. ❌ SQL Injection vulnerability via string interpolation
  const query = \`SELECT * FROM users WHERE email = '\${email}'\`;
  const user = await db.query(query);
  
  // 2. ❌ Plaintext password comparison
  if (user && user.password === password) {
    // 3. ❌ Hardcoded weak JWT secret
    const token = jwt.sign({ id: user.id }, "mysecret123");
    
    // 4. ❌ Insecure plain cookie (accessible to JS)
    res.cookie('token', token);
    return res.json({ status: 'ok' });
  }
  
  // 5. ❌ Account enumeration error
  return res.status(401).json({ error: 'User does not exist' });
});`,

  python: `# Insecure Auth Endpoint in Python / FastAPI
@app.post("/login")
def login(email: str = Form(...), password: str = Form(...)):
    # 1. ❌ SQL Injection risk
    query = f"SELECT * FROM users WHERE email = '{email}'"
    user = db_cursor.execute(query).fetchone()
    
    # 2. ❌ MD5 Broken hashing
    hashed = hashlib.md5(password.encode()).hexdigest()
    if user and user["password"] == hashed:
        # 3. ❌ Hardcoded secret
        token = jwt.encode({"sub": user["id"]}, "supersecret", algorithm="HS256")
        return {"token": token}
        
    return {"error": "Invalid password for this email"}`
};

export default function CodeScanner() {
  const navigate = useNavigate();
  const [code, setCode] = useState(DEMO_SNIPPETS.javascript);
  const [language, setLanguage] = useState('javascript');
  const [projectName, setProjectName] = useState('My Auth Service');
  const [fileName, setFileName] = useState('auth.js');
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [copiedRefactor, setCopiedRefactor] = useState(false);
  const [copiedSnippetIdx, setCopiedSnippetIdx] = useState(null);

  const handleScan = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      alert('Please paste code into the scanner.');
      return;
    }

    setLoading(true);
    setScanResult(null);

    try {
      let userId = null;
      let userEmail = null;
      const savedUser = localStorage.getItem('securecheck_user');
      if (savedUser) {
        try {
          const u = JSON.parse(savedUser);
          userId = u.id;
          userEmail = u.email;
        } catch (e) {}
      }

      const res = await api.scanCode({
        code_snippet: code,
        language: language,
        project_name: projectName,
        file_name: fileName,
        user_id: userId,
        user_email: userEmail
      });

      setScanResult(res);
    } catch (err) {
      console.error('Scan error:', err);
      alert('Failed to scan code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadSample = (lang) => {
    setLanguage(lang);
    setCode(DEMO_SNIPPETS[lang] || '');
    setFileName(lang === 'python' ? 'auth.py' : 'auth_controller.js');
  };

  const handleCopy = (text, setter) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="mb-4">
        <span className="badge text-dark bg-info bg-opacity-20 text-info border border-info border-opacity-30 px-3 py-1 mb-2 fw-semibold">
          <Sparkles size={14} className="me-1" /> AI CODE SECURITY SCANNER
        </span>
        <h2 className="text-white fw-extrabold m-0">Paste & Audit Your Code Snippet</h2>
        <p className="text-muted small m-0">
          Paste your login endpoint, database queries, or middleware to detect exact vulnerability lines, risk levels, and get complete secure refactored code.
        </p>
      </div>

      <div className="row g-4 mb-4">
        {/* Code Input Form */}
        <div className="col-lg-6">
          <div className="sc-card p-4 h-100 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                <h5 className="text-white fw-bold m-0 d-flex align-items-center gap-2">
                  <Code2 size={20} className="text-info" />
                  <span>Input Source Code</span>
                </h5>

                <div className="d-flex gap-1">
                  <button 
                    type="button" 
                    className="btn btn-sm btn-outline-secondary text-light py-0.5 px-2"
                    style={{ fontSize: '0.75rem' }}
                    onClick={() => loadSample('javascript')}
                  >
                    Load Node Demo
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-sm btn-outline-secondary text-light py-0.5 px-2"
                    style={{ fontSize: '0.75rem' }}
                    onClick={() => loadSample('python')}
                  >
                    Load Python Demo
                  </button>
                </div>
              </div>

              <div className="row g-2 mb-3">
                <div className="col-md-6">
                  <label className="form-label text-light small fw-semibold">Language</label>
                  <select 
                    className="form-select form-select-sm bg-dark text-white border-secondary"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <option value="javascript">JavaScript / Node.js</option>
                    <option value="python">Python</option>
                    <option value="php">PHP</option>
                    <option value="java">Java</option>
                    <option value="go">Go</option>
                    <option value="sql">SQL</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label text-light small fw-semibold">Project Name</label>
                  <input 
                    type="text" 
                    className="form-control form-control-sm bg-dark text-white border-secondary"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g. Auth Service"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label text-light small fw-semibold">Code Snippet (Paste Below)</label>
                <textarea 
                  className="form-control bg-dark text-light border-secondary font-monospace"
                  rows={14}
                  style={{ fontSize: '0.85rem', lineHeight: 1.45 }}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="// Paste your endpoint, auth controller, or query here..."
                ></textarea>
              </div>
            </div>

            <button 
              className="btn btn-info text-dark fw-bold w-100 py-2.5 d-flex align-items-center justify-content-center gap-2 shadow"
              onClick={handleScan}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="spinner-border spinner-border-sm" />
                  <span>Scanning & Analyzing Vulnerabilities with AI...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Scan Code for Security Flaws</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Scan Results Panel */}
        <div className="col-lg-6">
          {!scanResult && !loading ? (
            <div className="sc-card p-5 h-100 d-flex flex-column align-items-center justify-content-center text-center">
              <FileCode size={56} className="text-muted mb-3 opacity-40" />
              <h5 className="text-white fw-bold">Ready to Scan</h5>
              <p className="text-muted small" style={{ maxWidth: 360 }}>
                Paste your authentication code or query on the left and click <strong>Scan Code</strong> to get line-by-line vulnerability detection.
              </p>
            </div>
          ) : loading ? (
            <div className="sc-card p-5 h-100 d-flex flex-column align-items-center justify-content-center text-center">
              <div className="spinner-border text-info mb-3" style={{ width: '3rem', height: '3rem' }} role="status"></div>
              <h5 className="text-white fw-bold">Scanning Code with AI Auditor...</h5>
              <p className="text-muted small">Checking for SQL Injection, Plaintext Passwords, Hardcoded Secrets, and Cookie Flags.</p>
            </div>
          ) : (
            <div className="sc-card p-4 h-100 overflow-y-auto" style={{ maxHeight: 620 }}>
              {/* Score & Summary Banner */}
              <div className="p-3 rounded bg-dark border border-secondary border-opacity-30 mb-3">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-bolder fs-3 text-white">{scanResult.overall_score}%</span>
                    <span className={`badge ${scanResult.overall_score >= 85 ? 'badge-grade-a' : scanResult.overall_score >= 70 ? 'badge-grade-b' : scanResult.overall_score >= 50 ? 'badge-grade-c' : 'badge-grade-f'}`}>
                      Grade {scanResult.letter_grade}
                    </span>
                  </div>
                  <button 
                    className="btn btn-sm btn-outline-info d-flex align-items-center gap-1"
                    onClick={() => navigate(`/report/${scanResult.audit_id}`)}
                  >
                    <span>View Full Report</span>
                    <ExternalLink size={13} />
                  </button>
                </div>
                <p className="text-light small m-0 leading-relaxed">{scanResult.risk_summary}</p>
              </div>

              {/* Vulnerabilities Count */}
              <h6 className="text-white fw-bold mb-2 d-flex align-items-center gap-2">
                <AlertTriangle size={18} className="text-danger" />
                <span>Found {scanResult.vulnerabilities.length} Vulnerabilities</span>
              </h6>

              <div className="d-flex flex-column gap-3 mb-4">
                {scanResult.vulnerabilities.map((v, idx) => (
                  <div key={idx} className="p-3 rounded bg-dark bg-opacity-70 border border-danger border-opacity-30">
                    <div className="d-flex justify-content-between align-items-start gap-2 mb-1">
                      <div>
                        <span className={`badge ${v.severity === 'Critical' ? 'badge-critical' : v.severity === 'High' ? 'badge-high' : 'badge-medium'} me-2`} style={{ fontSize: '0.7rem' }}>
                          {v.severity}
                        </span>
                        <strong className="text-white small">{v.title}</strong>
                      </div>
                      <span className="badge bg-secondary bg-opacity-30 text-info" style={{ fontSize: '0.7rem' }}>
                        {v.line_number}
                      </span>
                    </div>

                    {v.code_snippet_location && (
                      <div className="code-viewer my-2">
                        <pre className="p-2 m-0" style={{ fontSize: '0.78rem', color: '#fca5a5' }}>
                          <code>{v.code_snippet_location}</code>
                        </pre>
                      </div>
                    )}

                    <p className="text-muted small m-0 mb-1">
                      <strong className="text-danger">Risk:</strong> {v.description}
                    </p>

                    <p className="text-light small m-0 mb-2">
                      <strong className="text-info">Fix:</strong> {v.remediation_guide}
                    </p>

                    {v.fixed_code && (
                      <div className="code-viewer">
                        <div className="code-viewer-header py-1 d-flex justify-content-between align-items-center">
                          <span className="text-success small fw-semibold">✅ Replacement Fix</span>
                          <button 
                            className="btn btn-sm btn-link text-info p-0 small"
                            onClick={() => handleCopy(v.fixed_code, (val) => setCopiedSnippetIdx(val ? idx : null))}
                          >
                            {copiedSnippetIdx === idx ? 'Copied!' : 'Copy Fix'}
                          </button>
                        </div>
                        <pre className="p-2 m-0" style={{ fontSize: '0.78rem' }}>
                          <code>{v.fixed_code}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Complete Secure Refactored Code */}
              {scanResult.secure_refactored_code && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="text-success fw-bold m-0 d-flex align-items-center gap-1.5">
                      <CheckCircle2 size={18} />
                      <span>Complete Secure Refactored Code</span>
                    </h6>
                    <button 
                      className="btn btn-sm btn-outline-success d-flex align-items-center gap-1 py-0.5 px-2"
                      style={{ fontSize: '0.75rem' }}
                      onClick={() => handleCopy(scanResult.secure_refactored_code, setCopiedRefactor)}
                    >
                      {copiedRefactor ? <Check size={13} /> : <Copy size={13} />}
                      <span>{copiedRefactor ? 'Copied All!' : 'Copy Code'}</span>
                    </button>
                  </div>

                  <div className="code-viewer">
                    <pre style={{ fontSize: '0.8rem', maxHeight: 220 }}>
                      <code>{scanResult.secure_refactored_code}</code>
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
