import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  PlusCircle, 
  ArrowRight, 
  History, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Layers, 
  Cpu, 
  Zap, 
  TrendingUp, 
  ExternalLink, 
  Code2 
} from 'lucide-react';
import { api } from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [audits, setAudits] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    syncUser();
    const handleStorageChange = () => syncUser();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const syncUser = () => {
    const savedUser = localStorage.getItem('securecheck_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        setCurrentUser(u);
        loadDashboard(u.id);
      } catch (e) {
        setCurrentUser(null);
        loadDashboard(null);
      }
    } else {
      setCurrentUser(null);
      loadDashboard(null);
    }
  };

  const loadDashboard = (userId) => {
    setLoading(true);
    const params = { sort_by: 'created_at', reverse: true };
    if (userId) {
      params.user_id = userId;
    }

    Promise.all([
      api.getAudits(params).catch(() => []),
      api.getTemplates().catch(() => []),
      api.getProjects().catch(() => [])
    ])
      .then(([auditsData, templatesData, projectsData]) => {
        setAudits(Array.isArray(auditsData) ? auditsData : []);
        setTemplates(Array.isArray(templatesData) ? templatesData : []);
        setProjects(Array.isArray(projectsData) ? projectsData : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching dashboard data:', err);
        setAudits([]);
        setTemplates([]);
        setProjects([]);
        setLoading(false);
      });
  };

  const safeAudits = Array.isArray(audits) ? audits : [];
  const safeTemplates = Array.isArray(templates) ? templates : [];
  const totalAudits = safeAudits.length;
  const avgScore = totalAudits > 0 
    ? Math.round(safeAudits.reduce((acc, curr) => acc + (curr?.overall_score || 0), 0) / totalAudits) 
    : 0;
  
  const totalRisksCaught = safeAudits.reduce((acc, curr) => acc + (curr?.vulnerabilities?.length || 0), 0);

  const getTemplateIcon = (id) => {
    switch (id) {
      case 'login_auth': return <ShieldCheck className="text-info" size={28} />;
      case 'full_stack': return <Layers className="text-primary" size={28} />;
      case 'rest_api': return <Cpu className="text-warning" size={28} />;
      case 'quick_check': return <Zap className="text-success" size={28} />;
      default: return <Sparkles className="text-purple-400" size={28} />;
    }
  };

  return (
    <div className="container py-4">
      {/* Hero Banner */}
      <div className="sc-card p-4 p-md-5 mb-4 position-relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0d1b2a 0%, #111827 100%)' }}>
        <div className="row align-items-center g-4">
          <div className="col-lg-8">
            <span 
              className="badge badge-tag-info px-3 py-1.5 mb-3 fw-semibold text-wrap text-start d-inline-flex align-items-center gap-1.5"
              style={{ fontSize: '0.8rem', maxWidth: '100%' }}
            >
              <Sparkles size={14} className="flex-shrink-0" />
              <span>AI-Powered Security Auditor for Students & Developers</span>
            </span>

            <h1 className="text-white fw-extrabold display-6 mb-3">
              Does your login & backend follow <span className="text-info">basic security practices</span>?
            </h1>
            <p className="text-light opacity-75 fs-5 mb-4" style={{ maxWidth: 650 }}>
              Audit passwords, session cookies, rate limits, SQL queries, and CORS in minutes. Get an instant security score and copy-paste code fixes before demo day.
            </p>
            <div className="d-flex flex-wrap gap-3">
              <Link to="/new-audit" className="btn btn-info text-dark fw-bold px-4 py-2 d-flex align-items-center gap-2 shadow text-nowrap">
                <PlusCircle size={18} />
                <span>Start Questionnaire Audit</span>
              </Link>
              <Link to="/code-scanner" className="btn btn-outline-info text-light px-4 py-2 d-flex align-items-center gap-2 text-nowrap">
                <Code2 size={18} className="text-info" />
                <span>Paste & Scan Code Snippet</span>
              </Link>
            </div>
          </div>

          <div className="col-lg-4 d-none d-lg-flex justify-content-center">
            <div 
              className="d-flex align-items-center justify-content-center"
              style={{
                width: 170,
                height: 170,
                borderRadius: '50%',
                border: '2px solid #38bdf8',
                background: 'radial-gradient(circle, #0e1e38 0%, #0b0f19 100%)',
                boxShadow: '0 0 25px rgba(56, 189, 248, 0.25)'
              }}
            >
              <ShieldCheck size={85} className="text-info" strokeWidth={2} />
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="sc-card p-3 p-md-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted small fw-semibold">TOTAL AUDITS CONDUCTED</span>
              <History size={18} className="text-info" />
            </div>
            <div className="d-flex align-items-baseline gap-2">
              <h2 className="text-white fw-bold m-0">{totalAudits}</h2>
              <span className="text-muted small">evaluations saved</span>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="sc-card p-3 p-md-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted small fw-semibold">AVERAGE SECURITY SCORE</span>
              <TrendingUp size={18} className="text-success" />
            </div>
            <div className="d-flex align-items-baseline gap-2">
              <h2 className={`fw-bold m-0 ${avgScore >= 80 ? 'text-success' : avgScore >= 60 ? 'text-info' : 'text-warning'}`}>
                {avgScore}%
              </h2>
              <span className="text-muted small">overall compliance</span>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="sc-card p-3 p-md-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted small fw-semibold">VULNERABILITIES PREVENTED</span>
              <AlertTriangle size={18} className="text-warning" />
            </div>
            <div className="d-flex align-items-baseline gap-2">
              <h2 className="text-warning fw-bold m-0">{totalRisksCaught}</h2>
              <span className="text-muted small">risks caught with fixes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Launchers Row */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h4 className="text-white fw-bold m-0">Quick Audit Launchers</h4>
            <span className="text-muted small">Select a pre-built security template or let AI tailor a custom checklist</span>
          </div>
          <Link to="/new-audit" className="btn btn-sm btn-outline-info d-flex align-items-center gap-1">
            <span>Custom Audit</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="row g-3">
          {safeTemplates.map((tpl) => {
            const checkCount = tpl?.question_ids?.length || tpl?.questions?.length || 5;
            return (
              <div key={tpl.id} className="col-md-6 col-lg-3">
                <div 
                  className="sc-card sc-card-interactive p-3.5 h-100 d-flex flex-column justify-content-between"
                  onClick={() => navigate(`/new-audit?template=${tpl.id}`)}
                >
                  <div>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div className="p-2 rounded bg-dark border border-secondary border-opacity-30">
                        {getTemplateIcon(tpl.id)}
                      </div>
                      {tpl.id === 'login_auth' && (
                        <span className="badge bg-info text-dark fw-bold" style={{ fontSize: '0.65rem' }}>
                          POPULAR
                        </span>
                      )}
                    </div>
                    <h6 className="text-white fw-bold mb-1">{tpl.title || tpl.name || 'Security Audit'}</h6>
                    <p className="text-muted small mb-3">{tpl.description}</p>
                  </div>
                  <div className="d-flex justify-content-between align-items-center border-top border-secondary border-opacity-25 pt-2">
                    <span className="text-muted small">{checkCount} checks</span>
                    <span className="badge-tag-info px-2 py-0.5" style={{ fontSize: '0.75rem' }}>
                      Launch →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Audits Table */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h4 className="text-white fw-bold m-0">Recent Security Audits</h4>
            <span className="text-muted small">Latest evaluated projects and reports</span>
          </div>
          <Link to="/history" className="btn btn-sm btn-outline-secondary text-light d-flex align-items-center gap-1">
            <span>View All History</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="sc-card p-5 text-center text-muted">
            <div className="spinner-border text-info mb-2" role="status"></div>
            <p className="m-0">Loading audits...</p>
          </div>
        ) : safeAudits.length === 0 ? (
          <div className="sc-card p-5 text-center">
            <ShieldCheck size={48} className="text-muted mb-3 opacity-50" />
            <h5 className="text-white fw-bold">No audits recorded yet</h5>
            <p className="text-muted mb-4" style={{ maxWidth: 450, margin: '0 auto' }}>
              Run your first security checkup on your login system or web application to see your score and recommendations here.
            </p>
            <Link to="/new-audit" className="btn btn-info text-dark fw-bold px-4">
              Start First Audit
            </Link>
          </div>
        ) : (
          <div className="sc-card overflow-hidden">
            <div className="table-responsive">
              <table className="table table-dark table-hover m-0 align-middle">
                <thead>
                  <tr className="border-bottom border-secondary border-opacity-50 text-muted small">
                    <th className="ps-4">PROJECT NAME</th>
                    <th>TARGET STACK</th>
                    <th>SCORE & GRADE</th>
                    <th>VULNERABILITIES</th>
                    <th>DATE</th>
                    <th className="text-end pe-4">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {safeAudits.slice(0, 5).map((audit) => {
                    const vulnCritical = audit?.vulnerabilities?.filter(v => v.severity === 'Critical').length || 0;
                    const vulnTotal = audit?.vulnerabilities?.length || 0;

                    return (
                      <tr key={audit.id} className="border-bottom border-secondary border-opacity-25">
                        <td className="ps-4 py-3">
                          <div className="fw-bold text-white">{audit.project_name}</div>
                          <div className="text-muted small">By {audit.auditor_name || 'Student'}</div>
                        </td>
                        <td>
                          <span className="badge bg-dark border border-secondary text-secondary">
                            {audit.target_stack || 'Web App'}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <span className="fw-bold text-white fs-6">{audit.overall_score}%</span>
                            <span className={`badge ${audit.overall_score >= 85 ? 'badge-grade-a' : audit.overall_score >= 70 ? 'badge-grade-b' : audit.overall_score >= 50 ? 'badge-grade-c' : 'badge-grade-f'}`}>
                              {audit.letter_grade}
                            </span>
                          </div>
                        </td>
                        <td>
                          {vulnTotal === 0 ? (
                            <span className="badge badge-secure d-inline-flex align-items-center gap-1">
                              <CheckCircle2 size={12} /> Clean (0 risks)
                            </span>
                          ) : (
                            <span className={`badge ${vulnCritical > 0 ? 'badge-critical' : 'badge-medium'}`}>
                              {vulnTotal} found {vulnCritical > 0 && `(${vulnCritical} critical)`}
                            </span>
                          )}
                        </td>
                        <td className="text-muted small">
                          {new Date(audit.created_at).toLocaleDateString()}
                        </td>
                        <td className="text-end pe-4">
                          <Link 
                            to={`/report/${audit.id}`}
                            className="btn btn-sm btn-outline-info d-inline-flex align-items-center gap-1"
                          >
                            <span>View</span>
                            <ExternalLink size={13} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
