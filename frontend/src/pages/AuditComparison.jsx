import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  GitCompare, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck 
} from 'lucide-react';
import { api } from '../services/api';

export default function AuditComparison() {
  const [searchParams] = useSearchParams();
  const [allAudits, setAllAudits] = useState([]);
  const [auditId1, setAuditId1] = useState(searchParams.get('audit1') || '');
  const [auditId2, setAuditId2] = useState(searchParams.get('audit2') || '');
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getAudits({ sort_by: 'created_at', reverse: true })
      .then(data => {
        setAllAudits(data);
        if (data.length >= 2) {
          if (!auditId1) setAuditId1(data[1].id);
          if (!auditId2) setAuditId2(data[0].id);
        }
      })
      .catch(err => console.error('Failed to load audits for comparison:', err));
  }, []);

  useEffect(() => {
    if (auditId1 && auditId2 && auditId1 !== auditId2) {
      setLoading(true);
      api.compareAudits(auditId1, auditId2)
        .then(data => {
          setComparison(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to perform comparison:', err);
          setLoading(false);
        });
    }
  }, [auditId1, auditId2]);

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <span className="badge-tag-warning px-2.5 py-1 mb-1 fw-semibold">
            DIFF & PROGRESS AUDITOR
          </span>
          <h2 className="text-white fw-extrabold m-0">Security Audit Comparison</h2>
          <p className="text-muted small m-0">Compare two audits side-by-side to track security fixes and regressions.</p>
        </div>

        <Link to="/history" className="btn btn-outline-secondary text-light d-flex align-items-center gap-2">
          <ArrowLeft size={16} />
          <span>Back to History</span>
        </Link>
      </div>

      {/* Select Audits Controls */}
      <div className="sc-card p-4 mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-md-5">
            <label className="form-label text-light small fw-semibold">Audit #1 (Baseline / Older)</label>
            <select 
              className="form-select bg-dark text-white border-secondary"
              value={auditId1}
              onChange={(e) => setAuditId1(e.target.value)}
            >
              <option value="">Select First Audit...</option>
              {allAudits.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.project_name} ({a.overall_score}% - {a.letter_grade}) [{new Date(a.created_at).toLocaleDateString()}]
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-2 text-center d-flex justify-content-center">
            <div className="p-2 rounded-circle bg-secondary bg-opacity-25 text-info mt-3">
              <GitCompare size={24} />
            </div>
          </div>

          <div className="col-md-5">
            <label className="form-label text-light small fw-semibold">Audit #2 (Target / Newer)</label>
            <select 
              className="form-select bg-dark text-white border-secondary"
              value={auditId2}
              onChange={(e) => setAuditId2(e.target.value)}
            >
              <option value="">Select Second Audit...</option>
              {allAudits.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.project_name} ({a.overall_score}% - {a.letter_grade}) [{new Date(a.created_at).toLocaleDateString()}]
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="sc-card p-5 text-center text-muted">
          <div className="spinner-border text-info mb-2" role="status"></div>
          <p className="m-0">Calculating security diff...</p>
        </div>
      ) : !comparison ? (
        <div className="sc-card p-5 text-center text-muted">
          <GitCompare size={48} className="opacity-50 mb-3" />
          <h5 className="text-white fw-bold">Select two distinct audits above</h5>
          <p className="m-0">Choose a baseline audit and a newer audit to see the comparative delta.</p>
        </div>
      ) : (
        <div>
          {/* Comparison Delta Banner */}
          <div className="sc-card p-4 p-md-5 mb-4 border-info border-opacity-30">
            <div className="row align-items-center g-4">
              <div className="col-md-7">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span className="badge-tag-info px-2.5 py-1">SECURITY PROGRESSION</span>
                </div>
                <h3 className="text-white fw-bold mb-2">
                  {comparison.audit_1.project_name} 
                  <ArrowRight size={20} className="mx-2 text-muted" /> 
                  {comparison.audit_2.project_name}
                </h3>
                <p className="text-light opacity-90 fs-6 m-0">
                  {comparison.summary_message}
                </p>
              </div>

              <div className="col-md-5">
                <div className="p-3 rounded bg-dark border border-secondary border-opacity-40 d-flex justify-content-around align-items-center">
                  {/* Audit 1 Box */}
                  <div className="text-center">
                    <div className="text-muted small">AUDIT 1</div>
                    <div className="fw-bolder fs-4 text-white">{comparison.audit_1.overall_score}%</div>
                    <span className="badge bg-secondary text-white fw-bold">{comparison.grade_changed_from}</span>
                  </div>

                  {/* Delta Arrow */}
                  <div className="text-center">
                    {comparison.score_delta > 0 ? (
                      <div className="text-success fw-bold d-flex flex-column align-items-center">
                        <TrendingUp size={24} />
                        <span>+{comparison.score_delta}%</span>
                      </div>
                    ) : comparison.score_delta < 0 ? (
                      <div className="text-danger fw-bold d-flex flex-column align-items-center">
                        <TrendingDown size={24} />
                        <span>{comparison.score_delta}%</span>
                      </div>
                    ) : (
                      <div className="text-muted fw-bold d-flex flex-column align-items-center">
                        <Minus size={24} />
                        <span>0%</span>
                      </div>
                    )}
                  </div>

                  {/* Audit 2 Box */}
                  <div className="text-center">
                    <div className="text-muted small">AUDIT 2</div>
                    <div className="fw-bolder fs-4 text-info">{comparison.audit_2.overall_score}%</div>
                    <span className="badge bg-info text-dark fw-bold">{comparison.grade_changed_to}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Delta Sections */}
          <div className="row g-4 mb-4">
            {/* Resolved Issues */}
            <div className="col-md-4">
              <div className="sc-card p-4 h-100 border-success border-opacity-40">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <CheckCircle2 size={20} className="text-success" />
                  <h5 className="text-white fw-bold m-0">Resolved ({comparison.resolved_vulnerabilities.length})</h5>
                </div>
                {comparison.resolved_vulnerabilities.length === 0 ? (
                  <p className="text-muted small">No vulnerabilities resolved between these audits.</p>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {comparison.resolved_vulnerabilities.map((item, idx) => (
                      <div 
                        key={idx} 
                        className="p-2.5 rounded"
                        style={{
                          backgroundColor: 'rgba(16, 185, 129, 0.08)',
                          border: '1px solid rgba(16, 185, 129, 0.35)'
                        }}
                      >
                        <div className="fw-bold text-success small">{item.title}</div>
                        <div className="text-muted small">{item.category}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Persistent Issues */}
            <div className="col-md-4">
              <div className="sc-card p-4 h-100 border-warning border-opacity-40">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <AlertTriangle size={20} className="text-warning" />
                  <h5 className="text-white fw-bold m-0">Still Open ({comparison.persistent_vulnerabilities.length})</h5>
                </div>
                {comparison.persistent_vulnerabilities.length === 0 ? (
                  <p className="text-muted small">No persistent open vulnerabilities!</p>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {comparison.persistent_vulnerabilities.map((item, idx) => (
                      <div 
                        key={idx} 
                        className="p-2.5 rounded"
                        style={{
                          backgroundColor: 'rgba(245, 158, 11, 0.08)',
                          border: '1px solid rgba(245, 158, 11, 0.35)'
                        }}
                      >
                        <div className="fw-bold text-warning small">{item.title}</div>
                        <div className="text-muted small">{item.category}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* New Issues */}
            <div className="col-md-4">
              <div className="sc-card p-4 h-100 border-danger border-opacity-40">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <AlertTriangle size={20} className="text-danger" />
                  <h5 className="text-white fw-bold m-0">New Issues ({comparison.new_vulnerabilities.length})</h5>
                </div>
                {comparison.new_vulnerabilities.length === 0 ? (
                  <p className="text-muted small">No new vulnerabilities introduced!</p>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {comparison.new_vulnerabilities.map((item, idx) => (
                      <div 
                        key={idx} 
                        className="p-2.5 rounded"
                        style={{
                          backgroundColor: 'rgba(239, 68, 68, 0.08)',
                          border: '1px solid rgba(239, 68, 68, 0.35)'
                        }}
                      >
                        <div className="fw-bold text-danger small">{item.title}</div>
                        <div className="text-muted small">{item.category}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
