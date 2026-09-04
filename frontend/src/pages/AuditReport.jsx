import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Download, 
  FileText, 
  GitCompare, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  ArrowLeft, 
  Copy, 
  Check, 
  Code2, 
  Wrench, 
  Terminal, 
  ShieldAlert, 
  ListChecks, 
  RotateCcw, 
  CheckSquare, 
  Square, 
  ArrowRight, 
  HelpCircle, 
  Lightbulb 
} from 'lucide-react';
import { api } from '../services/api';
import ScoreGauge from '../components/ScoreGauge';
import CategoryRadar from '../components/CategoryRadar';
import VulnerabilityCard from '../components/VulnerabilityCard';
import StrengthCard from '../components/StrengthCard';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function AuditReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const reportRef = useRef();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSeverityFilter, setActiveSeverityFilter] = useState('ALL');
  const [remediationLangTab, setRemediationLangTab] = useState('Node.js');
  const [copiedMd, setCopiedMd] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  
  // Interactive student action plan checklist state
  const [checkedTasks, setCheckedTasks] = useState({});

  useEffect(() => {
    api.getAudit(id)
      .then(data => {
        setReport(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load audit report:', err);
        setLoading(false);
      });
  }, [id]);

  const handleToggleTask = (taskKey) => {
    setCheckedTasks(prev => ({
      ...prev,
      [taskKey]: !prev[taskKey]
    }));
  };

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    setIsExportingPdf(true);
    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0b0f19'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`SecureCheck-Report-${report.project_name.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate PDF export.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExportJSON = () => {
    if (!report) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(report, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `SecureCheck-${report.project_name.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyMarkdown = () => {
    if (!report) return;
    let md = `# SecureCheck Report: ${report.project_name}\n\n`;
    md += `**Score:** ${report.overall_score}% (Grade ${report.letter_grade})\n`;
    md += `**Stack:** ${report.target_stack}\n**Date:** ${new Date(report.created_at).toLocaleDateString()}\n\n`;
    md += `### Summary\n${report.summary}\n\n`;
    md += `### Identified Vulnerabilities (${report.vulnerabilities?.length || 0})\n`;
    report.vulnerabilities?.forEach(v => {
      md += `- **[${v.severity}] ${v.title}**: ${v.description}\n`;
    });
    navigator.clipboard.writeText(md);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const handleCopyCode = (codeId, code) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(codeId);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-info mb-3" role="status"></div>
        <h4 className="text-white">Loading Security Audit Report...</h4>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="container py-5 text-center">
        <AlertTriangle size={48} className="text-warning mb-3" />
        <h4 className="text-white">Audit Report Not Found</h4>
        <p className="text-muted">The requested audit does not exist or may have been deleted.</p>
        <Link to="/" className="btn btn-info text-dark fw-bold">Return to Dashboard</Link>
      </div>
    );
  }

  const vulns = report.vulnerabilities || [];
  const strengths = report.strengths || [];
  const categoryScores = report.category_scores || [];

  const filteredVulns = activeSeverityFilter === 'ALL'
    ? vulns
    : vulns.filter(v => v.severity?.toUpperCase() === activeSeverityFilter);

  const criticalCount = vulns.filter(v => v.severity === 'Critical').length;
  const highCount = vulns.filter(v => v.severity === 'High').length;
  const mediumCount = vulns.filter(v => v.severity === 'Medium').length;
  const lowCount = vulns.filter(v => v.severity === 'Low').length;

  const totalTasks = vulns.length;
  const completedTasks = Object.values(checkedTasks).filter(Boolean).length;
  const taskProgressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;

  return (
    <div className="container py-4">
      {/* Top Action Bar */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <Link to="/history" className="btn btn-outline-secondary text-light d-flex align-items-center gap-2">
          <ArrowLeft size={16} />
          <span>All Audits</span>
        </Link>

        <div className="d-flex flex-wrap gap-2">
          <button 
            className="btn btn-outline-info d-flex align-items-center gap-1.5"
            onClick={handleCopyMarkdown}
          >
            {copiedMd ? <Check size={16} className="text-success" /> : <Copy size={16} />}
            <span>{copiedMd ? 'Copied MD' : 'Copy Summary'}</span>
          </button>

          <button 
            className="btn btn-outline-secondary text-light d-flex align-items-center gap-1.5"
            onClick={handleExportJSON}
          >
            <FileText size={16} />
            <span>Export JSON</span>
          </button>

          <button 
            className="btn btn-info text-dark fw-semibold d-flex align-items-center gap-1.5 shadow"
            onClick={handleExportPDF}
            disabled={isExportingPdf}
          >
            <Download size={16} />
            <span>{isExportingPdf ? 'Exporting...' : 'Download PDF'}</span>
          </button>

          <Link 
            to={`/compare?audit1=${report.id}`}
            className="btn btn-outline-primary text-info d-flex align-items-center gap-1.5 border-info border-opacity-50"
          >
            <GitCompare size={16} />
            <span>Compare Audits</span>
          </Link>
        </div>
      </div>

      {/* Printable Report Container */}
      <div ref={reportRef}>
        {/* Executive Score Banner */}
        <div className="sc-card p-4 p-md-5 mb-4">
          <div className="row align-items-center g-4">
            <div className="col-md-4 text-center">
              <ScoreGauge score={report.overall_score} grade={report.letter_grade} size={200} />
            </div>

            <div className="col-md-8">
              <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                <span className="badge bg-info bg-opacity-20 text-info border border-info border-opacity-30 px-3 py-1 fw-bold">
                  SECURITY AUDIT REPORT
                </span>
                <span className="badge bg-dark border border-secondary text-secondary">
                  {report.target_stack}
                </span>
                {report.ai_generated && (
                  <span className="badge bg-purple-900 bg-opacity-40 text-purple-300 border border-purple-500 border-opacity-30 d-flex align-items-center gap-1">
                    <Sparkles size={12} /> AI Enhanced
                  </span>
                )}
              </div>

              <h2 className="text-white fw-extrabold mb-1">{report.project_name}</h2>
              <div className="text-muted small mb-3">
                Audited by <strong className="text-light">{report.auditor_name}</strong> on {new Date(report.created_at).toLocaleString()}
              </div>

              <div className="p-3 rounded bg-dark bg-opacity-60 border border-secondary border-opacity-25 mb-3">
                <span className="text-info fw-semibold d-flex align-items-center gap-1 mb-1">
                  <Sparkles size={16} /> Security Assessment Summary:
                </span>
                <p className="text-light opacity-90 small m-0 leading-relaxed">
                  {report.summary}
                </p>
              </div>

              {/* Risk Counts Pill bar */}
              <div className="d-flex flex-wrap gap-2 pt-1">
                <span className="badge badge-secure px-3 py-1.5 fw-semibold d-flex align-items-center gap-1">
                  <CheckCircle2 size={14} /> {strengths.length} Passed Checks
                </span>
                <span className={`badge px-3 py-1.5 fw-semibold d-flex align-items-center gap-1 ${criticalCount > 0 ? 'badge-critical' : 'badge-low'}`}>
                  <ShieldAlert size={14} /> {criticalCount} Critical Risks
                </span>
                <span className={`badge px-3 py-1.5 fw-semibold d-flex align-items-center gap-1 ${highCount > 0 ? 'badge-high' : 'badge-low'}`}>
                  <AlertTriangle size={14} /> {highCount} High Risks
                </span>
                <span className="badge badge-medium px-3 py-1.5 fw-semibold">
                  {mediumCount} Medium
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Plan & Checklist Section */}
        {vulns.length > 0 && (
          <div className="sc-card p-4 p-md-4 mb-4 border-warning border-opacity-30 bg-gradient">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3 pb-3 border-bottom border-secondary border-opacity-25">
              <div>
                <h4 className="text-white fw-bold m-0 d-flex align-items-center gap-2">
                  <ListChecks className="text-warning" size={24} />
                  <span>Action Plan: Step-by-Step Fix Checklist</span>
                </h4>
                <p className="text-muted small m-0">
                  Follow these concrete steps to patch your project. Check off items as you implement the fixes in your codebase.
                </p>
              </div>

              <div className="text-end">
                <div className="text-white small fw-bold">
                  {completedTasks} of {totalTasks} Fixes Applied
                </div>
                <div className="progress bg-dark mt-1" style={{ width: 150, height: 8 }}>
                  <div 
                    className={`progress-bar ${taskProgressPercent === 100 ? 'bg-success' : 'bg-warning'}`}
                    role="progressbar"
                    style={{ width: `${taskProgressPercent}%`, transition: 'width 0.3s' }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Checklist Items */}
            <div className="d-flex flex-column gap-2 mb-4">
              {vulns.map((v, idx) => {
                const isChecked = !!checkedTasks[v.id || idx];

                return (
                  <div 
                    key={v.id || idx}
                    className={`p-3 rounded d-flex align-items-start gap-3 transition-all cursor-pointer ${
                      isChecked 
                        ? 'bg-success bg-opacity-10 border border-success border-opacity-30' 
                        : 'bg-dark bg-opacity-60 border border-secondary border-opacity-30'
                    }`}
                    onClick={() => handleToggleTask(v.id || idx)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="mt-0.5 text-info">
                      {isChecked ? (
                        <CheckSquare size={20} className="text-success" />
                      ) : (
                        <Square size={20} className="text-muted" />
                      )}
                    </div>

                    <div className="flex-grow-1">
                      <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                        <span className={`badge ${v.severity === 'Critical' ? 'badge-critical' : v.severity === 'High' ? 'badge-high' : 'badge-medium'}`} style={{ fontSize: '0.7rem' }}>
                          Step {idx + 1} • {v.severity}
                        </span>
                        <span className={`fw-bold small ${isChecked ? 'text-decoration-line-through text-muted' : 'text-white'}`}>
                          {v.title}
                        </span>
                      </div>
                      <p className={`small m-0 ${isChecked ? 'text-muted' : 'text-light opacity-90'}`}>
                        {v.remediation_guide}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pro Tips Box & Re-Audit Button */}
            <div className="p-3 rounded bg-dark border border-secondary border-opacity-30 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
              <div>
                <span className="text-warning small fw-bold d-flex align-items-center gap-1 mb-1">
                  <HelpCircle size={15} /> How to verify your fixes:
                </span>
                <p className="text-muted small m-0">
                  After updating your code with the snippets below, restart your server, test login with incorrect passwords, inspect cookies in DevTools (F12), and re-audit your project.
                </p>
              </div>

              <Link 
                to={`/new-audit?template=${report.template_id}`}
                className="btn btn-warning text-dark fw-bold text-nowrap d-flex align-items-center gap-2 px-4 py-2 shadow"
              >
                <RotateCcw size={16} />
                <span>Re-Audit Project</span>
              </Link>
            </div>
          </div>
        )}

        {/* Category Breakdown & Recommendations Row */}
        <div className="row g-4 mb-4">
          {/* Radar Chart */}
          <div className="col-lg-6">
            <div className="sc-card p-4 h-100">
              <CategoryRadar categoryScores={categoryScores} />
            </div>
          </div>

          {/* Top Recommendations */}
          <div className="col-lg-6">
            <div className="sc-card p-4 h-100 d-flex flex-column justify-content-between">
              <div>
                <h5 className="text-white fw-bold mb-3 d-flex align-items-center gap-2">
                  <Sparkles size={20} className="text-info" />
                  <span>Actionable Remediation Priority</span>
                </h5>

                <div className="d-flex flex-column gap-2 mb-3">
                  {report.recommendations?.map((rec, idx) => (
                    <div key={idx} className="p-2.5 rounded bg-dark bg-opacity-50 border border-secondary border-opacity-25 text-light small d-flex align-items-start gap-2">
                      <span className="badge bg-secondary bg-opacity-50 text-info mt-0.5">{idx + 1}</span>
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded bg-info bg-opacity-10 border border-info border-opacity-25">
                <span className="text-info small fw-semibold d-flex align-items-center gap-1.5 mb-1">
                  <Lightbulb size={16} />
                  <span>Student Developer Tip:</span>
                </span>
                <p className="text-muted small m-0">
                  Fix Critical and High risk vulnerabilities first. Check the interactive <strong>"Code Remediation Solutions"</strong> section below for copy-paste code snippets in Node.js, Python, and PHP.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Dedicated "How to Fix: Code Remediation Guide" Section */}
        {vulns.length > 0 && (
          <div className="sc-card p-4 p-md-4 mb-4 border-info border-opacity-30">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3 pb-3 border-bottom border-secondary border-opacity-25">
              <div>
                <h4 className="text-white fw-bold m-0 d-flex align-items-center gap-2">
                  <Wrench className="text-info" size={24} />
                  <span>Code Remediation Solutions</span>
                </h4>
                <p className="text-muted small m-0">
                  Select your programming language to view direct, copy-pasteable code fixes for every identified issue.
                </p>
              </div>

              {/* Language Selection Tabs */}
              <div className="btn-group">
                {['Node.js', 'Python', 'PHP', 'All Languages'].map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    className={`btn btn-sm ${remediationLangTab === lang ? 'btn-info text-dark fw-bold' : 'btn-dark text-light border-secondary'}`}
                    onClick={() => setRemediationLangTab(lang)}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {/* List of code fixes for every vulnerability */}
            <div className="d-flex flex-column gap-3">
              {vulns.map((v, vIdx) => {
                const availableSnippets = (v.code_examples || []).filter(snip => 
                  remediationLangTab === 'All Languages' || snip.language?.toLowerCase().includes(remediationLangTab.toLowerCase().split('.')[0])
                );

                const displaySnippets = availableSnippets.length > 0 ? availableSnippets : (v.code_examples || []);

                return (
                  <div key={v.id || vIdx} className="p-3 rounded bg-dark bg-opacity-70 border border-secondary border-opacity-30">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <span className={`badge ${v.severity === 'Critical' ? 'badge-critical' : v.severity === 'High' ? 'badge-high' : 'badge-medium'}`}>
                          {v.severity}
                        </span>
                        <h6 className="text-white fw-bold m-0">{v.title}</h6>
                      </div>
                      <span className="badge bg-secondary bg-opacity-25 text-info">{v.category}</span>
                    </div>

                    <p className="text-muted small mb-2">{v.remediation_guide}</p>

                    {displaySnippets.map((snippet, sIdx) => {
                      const snippetKey = `${v.id}_${sIdx}`;
                      return (
                        <div key={sIdx} className="code-viewer mt-2">
                          <div className="code-viewer-header d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center gap-2">
                              <Terminal size={14} className="text-info" />
                              <span className="fw-semibold text-white small">{snippet.title || snippet.language}</span>
                            </div>
                            <button
                              className="btn btn-sm btn-outline-info py-0 px-2 d-flex align-items-center gap-1"
                              style={{ fontSize: '0.75rem', height: 24 }}
                              onClick={() => handleCopyCode(snippetKey, snippet.code)}
                            >
                              {copiedCodeId === snippetKey ? <Check size={13} className="text-success" /> : <Copy size={13} />}
                              <span>{copiedCodeId === snippetKey ? 'Copied!' : 'Copy Code'}</span>
                            </button>
                          </div>
                          <pre><code>{snippet.code}</code></pre>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Detailed Vulnerability Cards Section */}
        <div className="mb-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">
            <div>
              <h4 className="text-white fw-bold m-0 d-flex align-items-center gap-2">
                <AlertTriangle className="text-danger" size={24} />
                <span>Identified Vulnerabilities & Risks ({vulns.length})</span>
              </h4>
              <p className="text-muted small m-0">Detailed breakdown of potential attack vectors and impact.</p>
            </div>

            {/* Severity Filter Pills */}
            <div className="btn-group btn-group-sm">
              <button 
                type="button" 
                className={`btn btn-sm ${activeSeverityFilter === 'ALL' ? 'btn-info text-dark fw-bold' : 'btn-dark text-light border-secondary'}`}
                onClick={() => setActiveSeverityFilter('ALL')}
              >
                All ({vulns.length})
              </button>
              {criticalCount > 0 && (
                <button 
                  type="button" 
                  className={`btn btn-sm ${activeSeverityFilter === 'CRITICAL' ? 'btn-danger text-white fw-bold' : 'btn-dark text-danger border-secondary'}`}
                  onClick={() => setActiveSeverityFilter('CRITICAL')}
                >
                  Critical ({criticalCount})
                </button>
              )}
              {highCount > 0 && (
                <button 
                  type="button" 
                  className={`btn btn-sm ${activeSeverityFilter === 'HIGH' ? 'btn-warning text-dark fw-bold' : 'btn-dark text-warning border-secondary'}`}
                  onClick={() => setActiveSeverityFilter('HIGH')}
                >
                  High ({highCount})
                </button>
              )}
              {mediumCount > 0 && (
                <button 
                  type="button" 
                  className={`btn btn-sm ${activeSeverityFilter === 'MEDIUM' ? 'btn-warning text-dark fw-bold' : 'btn-dark text-light border-secondary'}`}
                  onClick={() => setActiveSeverityFilter('MEDIUM')}
                >
                  Medium ({mediumCount})
                </button>
              )}
            </div>
          </div>

          {filteredVulns.length === 0 ? (
            <div className="sc-card p-5 text-center">
              <CheckCircle2 size={48} className="text-success mb-2" />
              <h5 className="text-white fw-bold">No Vulnerabilities Detected</h5>
              <p className="text-muted m-0">Your project passed all checks in this category.</p>
            </div>
          ) : (
            filteredVulns.map((vuln, idx) => (
              <VulnerabilityCard key={vuln.id || idx} vuln={vuln} />
            ))
          )}
        </div>

        {/* Security Strengths */}
        {strengths.length > 0 && (
          <div className="mb-4">
            <h4 className="text-white fw-bold mb-3 d-flex align-items-center gap-2">
              <CheckCircle2 className="text-success" size={24} />
              <span>Security Strengths & Passed Defenses ({strengths.length})</span>
            </h4>

            <div className="row g-2">
              {strengths.map((strength, idx) => (
                <div key={strength.id || idx} className="col-md-6">
                  <StrengthCard strength={strength} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
