import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  History, 
  Search, 
  Trash2, 
  GitCompare, 
  ExternalLink, 
  PlusCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Filter, 
  User, 
  Code2 
} from 'lucide-react';
import { api } from '../services/api';

export default function AuditHistory() {
  const navigate = useNavigate();
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('ALL');
  const [selectedForCompare, setSelectedForCompare] = useState([]);
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
        fetchAudits(u.id);
      } catch (e) {
        setCurrentUser(null);
        fetchAudits(null);
      }
    } else {
      setCurrentUser(null);
      fetchAudits(null);
    }
  };

  const fetchAudits = (userId) => {
    setLoading(true);
    const params = { sort_by: 'created_at', reverse: true };
    if (userId) {
      params.user_id = userId;
    }

    api.getAudits(params)
      .then(data => {
        setAudits(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load audits:', err);
        setLoading(false);
      });
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this audit report?')) return;

    try {
      await api.deleteAudit(id);
      setAudits(audits.filter(a => a.id !== id));
      setSelectedForCompare(selectedForCompare.filter(selId => selId !== id));
    } catch (err) {
      console.error('Failed to delete audit:', err);
      alert('Could not delete audit.');
    }
  };

  const handleToggleCompareSelect = (id) => {
    if (selectedForCompare.includes(id)) {
      setSelectedForCompare(selectedForCompare.filter(i => i !== id));
    } else {
      if (selectedForCompare.length >= 2) {
        setSelectedForCompare([selectedForCompare[1], id]);
      } else {
        setSelectedForCompare([...selectedForCompare, id]);
      }
    }
  };

  const handleLaunchCompare = () => {
    if (selectedForCompare.length === 2) {
      navigate(`/compare?audit1=${selectedForCompare[0]}&audit2=${selectedForCompare[1]}`);
    }
  };

  const filteredAudits = audits.filter(audit => {
    const matchesSearch = 
      (audit.project_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (audit.auditor_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (audit.target_stack || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGrade = 
      gradeFilter === 'ALL' ? true :
      gradeFilter === 'A' ? audit.letter_grade === 'A' :
      gradeFilter === 'B' ? audit.letter_grade === 'B' :
      gradeFilter === 'C' ? audit.letter_grade === 'C' :
      gradeFilter === 'F' ? (audit.letter_grade === 'F' || audit.letter_grade === 'D') : true;

    return matchesSearch && matchesGrade;
  });

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <span className="badge-tag-info px-2.5 py-1 mb-1 fw-semibold">
            AUDIT RECORDS & DATA MANAGEMENT
          </span>
          <h2 className="text-white fw-extrabold m-0">Audit History & Comparisons</h2>
          <p className="text-muted small m-0">
            {currentUser 
              ? `Logged in as ${currentUser.username} (${currentUser.email})` 
              : 'Managing stored security audits and code evaluations.'}
          </p>
        </div>

        <div className="d-flex flex-wrap gap-2">
          {selectedForCompare.length === 2 && (
            <button 
              className="btn btn-warning text-dark fw-bold d-flex align-items-center gap-2"
              onClick={handleLaunchCompare}
            >
              <GitCompare size={18} />
              <span>Compare Selected (2)</span>
            </button>
          )}

          <Link to="/code-scanner" className="btn btn-outline-info d-flex align-items-center gap-2 text-nowrap">
            <Code2 size={16} />
            <span>Scan Code</span>
          </Link>

          <Link to="/new-audit" className="btn btn-info text-dark fw-bold d-flex align-items-center gap-2 shadow text-nowrap">
            <PlusCircle size={18} />
            <span>New Audit</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="sc-card p-3 mb-4">
        <div className="row g-2 align-items-center">
          <div className="col-md-7">
            <div className="input-group">
              <span className="input-group-text bg-dark border-secondary text-muted">
                <Search size={16} />
              </span>
              <input 
                type="text" 
                className="form-control bg-dark text-white border-secondary"
                placeholder="Search by project name, framework, or auditor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="col-md-5 d-flex justify-content-md-end gap-2 align-items-center">
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted small text-nowrap"><Filter size={14} className="me-1" /> Grade:</span>
              <select 
                className="form-select form-select-sm bg-dark text-white border-secondary"
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                style={{ width: 120 }}
              >
                <option value="ALL">All Grades</option>
                <option value="A">Grade A (≥85%)</option>
                <option value="B">Grade B (70-84%)</option>
                <option value="C">Grade C (50-69%)</option>
                <option value="F">Grade F / D</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Compare Helper Banner */}
      {selectedForCompare.length > 0 && selectedForCompare.length < 2 && (
        <div className="alert alert-info py-2 d-flex justify-content-between align-items-center mb-3">
          <span className="small">
            Select <strong>1 more audit</strong> using the checkboxes below to launch side-by-side comparison!
          </span>
          <button 
            className="btn btn-sm btn-link text-info p-0"
            onClick={() => setSelectedForCompare([])}
          >
            Clear Selection
          </button>
        </div>
      )}

      {/* Audits Table */}
      {loading ? (
        <div className="sc-card p-5 text-center text-muted">
          <div className="spinner-border text-info mb-2" role="status"></div>
          <p className="m-0">Loading audits from database...</p>
        </div>
      ) : filteredAudits.length === 0 ? (
        <div className="sc-card p-5 text-center">
          <History size={48} className="text-muted mb-3 opacity-50" />
          <h5 className="text-white fw-bold">No matching audits found</h5>
          <p className="text-muted mb-4">Run a new audit or scan a code snippet to record your security evaluation.</p>
          <div className="d-flex justify-content-center gap-2">
            <Link to="/new-audit" className="btn btn-info text-dark fw-bold">
              Start Questionnaire Audit
            </Link>
            <Link to="/code-scanner" className="btn btn-outline-info">
              Scan Code Snippet
            </Link>
          </div>
        </div>
      ) : (
        <div className="sc-card overflow-hidden">
          <div className="table-responsive">
            <table className="table table-dark table-hover m-0 align-middle">
              <thead>
                <tr className="border-bottom border-secondary border-opacity-50 text-muted small">
                  <th style={{ width: 40 }} className="ps-3"></th>
                  <th>PROJECT NAME</th>
                  <th>AUDIT TYPE & STACK</th>
                  <th>SCORE & GRADE</th>
                  <th>VULNERABILITIES</th>
                  <th>DATE</th>
                  <th className="text-end pe-3">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredAudits.map((audit) => {
                  const isSelected = selectedForCompare.includes(audit.id);
                  const critCount = audit.vulnerabilities?.filter(v => v.severity === 'Critical').length || 0;
                  const totalVulns = audit.vulnerabilities?.length || 0;
                  const isCodeScan = audit.template_id === 'code_scan';

                  return (
                    <tr 
                      key={audit.id} 
                      className={`border-bottom border-secondary border-opacity-25 ${isSelected ? 'table-active' : ''}`}
                    >
                      <td className="ps-3">
                        <input 
                          type="checkbox"
                          className="form-check-input"
                          checked={isSelected}
                          onChange={() => handleToggleCompareSelect(audit.id)}
                          title="Select to compare"
                        />
                      </td>
                      <td className="py-3">
                        <Link to={`/report/${audit.id}`} className="text-white fw-bold text-decoration-none">
                          {audit.project_name}
                        </Link>
                        <div className="text-muted small">By {audit.auditor_name || 'Student'}</div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-1.5 flex-wrap">
                          {isCodeScan ? (
                            <span 
                              className="d-inline-flex align-items-center gap-1 px-2 py-0.5 rounded fw-semibold"
                              style={{ 
                                fontSize: '0.72rem',
                                backgroundColor: 'rgba(56, 189, 248, 0.1)',
                                color: '#38bdf8',
                                border: '1px solid rgba(56, 189, 248, 0.35)'
                              }}
                            >
                              <Code2 size={12} /> Code Scan
                            </span>
                          ) : (
                            <span 
                              className="d-inline-flex align-items-center gap-1 px-2 py-0.5 rounded fw-medium"
                              style={{ 
                                fontSize: '0.72rem',
                                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                color: '#cbd5e1',
                                border: '1px solid rgba(255, 255, 255, 0.15)'
                              }}
                            >
                              Wizard
                            </span>
                          )}
                          <span className="text-light opacity-90 small">{audit.target_stack}</span>
                        </div>
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
                        {totalVulns === 0 ? (
                          <span className="badge badge-secure d-inline-flex align-items-center gap-1">
                            <CheckCircle2 size={12} /> Clean (0 risks)
                          </span>
                        ) : (
                          <span className={`badge ${critCount > 0 ? 'badge-critical' : 'badge-medium'}`}>
                            {totalVulns} found {critCount > 0 && `(${critCount} critical)`}
                          </span>
                        )}
                      </td>
                      <td className="text-muted small">
                        {new Date(audit.created_at).toLocaleDateString()}
                      </td>
                      <td className="text-end pe-3">
                        <div className="d-flex justify-content-end gap-1">
                          <Link 
                            to={`/report/${audit.id}`} 
                            className="btn btn-sm btn-outline-info d-flex align-items-center gap-1"
                            title="View Report"
                          >
                            <span>View</span>
                            <ExternalLink size={13} />
                          </Link>
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={(e) => handleDelete(audit.id, e)}
                            title="Delete Audit"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
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
  );
}
