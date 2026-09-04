import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Info, 
  Layers, 
  Cpu, 
  Zap, 
  Send, 
  Loader2, 
  Lightbulb 
} from 'lucide-react';
import { api } from '../services/api';

export default function NewAudit() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Steps: 1 = Template/Setup selection, 2 = Answering Questionnaire
  const [step, setStep] = useState(1);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState(searchParams.get('template') || 'login_auth');
  const [isAiMode, setIsAiMode] = useState(searchParams.get('mode') === 'ai');
  
  // Project Info
  const [projectName, setProjectName] = useState('');
  const [auditorName, setAuditorName] = useState('');
  const [targetStack, setTargetStack] = useState('React + Node.js / Express');

  // AI Gen Options
  const [aiCustomStack, setAiCustomStack] = useState('Python / FastAPI + MongoDB');
  const [aiFocusAreas, setAiFocusAreas] = useState(['Authentication', 'Database Queries']);

  // Active Questionnaire Data
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentCategoryIdx, setCurrentCategoryIdx] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingTemplate, setLoadingTemplate] = useState(false);

  useEffect(() => {
    // Check logged in user to auto-populate auditor name
    const savedUser = localStorage.getItem('securecheck_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (u.username) setAuditorName(u.username);
      } catch (e) {}
    }

    api.getTemplates()
      .then(data => setTemplates(data))
      .catch(err => console.error('Failed to load templates:', err));
  }, []);

  const handleStartAudit = async () => {
    if (!projectName.trim()) {
      alert('Please enter a Project Name to continue.');
      return;
    }

    setLoadingTemplate(true);
    try {
      let tplData = null;
      if (isAiMode) {
        tplData = await api.generateAIQuestions({
          tech_stack: aiCustomStack,
          project_name: projectName,
          focus_areas: aiFocusAreas
        });
      } else {
        tplData = await api.getTemplateQuestions(selectedTemplateId);
      }

      setActiveTemplate(tplData);
      setStep(2);
      setCurrentCategoryIdx(0);
    } catch (err) {
      console.error('Error starting audit:', err);
      alert('Failed to load questions. Please check if the backend is running.');
    } finally {
      setLoadingTemplate(false);
    }
  };

  const handleSelectOption = (questionId, optionId) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const handleSubmitAudit = async () => {
    if (!activeTemplate) return;

    const totalQuestions = activeTemplate.questions.length;
    const answeredCount = Object.keys(answers).length;

    if (answeredCount < totalQuestions) {
      const confirmSubmit = window.confirm(
        `You have answered ${answeredCount} of ${totalQuestions} questions. Unanswered questions will be scored as non-evaluated. Proceed?`
      );
      if (!confirmSubmit) return;
    }

    setIsSubmitting(true);
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

      const payload = {
        project_name: projectName,
        auditor_name: auditorName || 'Student Developer',
        target_stack: isAiMode ? aiCustomStack : targetStack,
        template_id: activeTemplate.id,
        user_id: userId,
        user_email: userEmail,
        answers: answers,
        questions: activeTemplate.questions // Pass full question models so evaluator has complete context!
      };

      const result = await api.createAudit(payload);
      navigate(`/report/${result.id}`);
    } catch (err) {
      console.error('Failed to submit audit:', err);
      alert('Failed to evaluate audit. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Category navigation helpers
  const categories = activeTemplate?.categories || [];
  const currentCategory = categories[currentCategoryIdx] || '';
  const currentQuestions = activeTemplate?.questions?.filter(q => q.category === currentCategory) || [];

  const totalQuestions = activeTemplate?.questions?.length || 0;
  const totalAnswered = Object.keys(answers).length;
  const progressPercent = totalQuestions > 0 ? Math.round((totalAnswered / totalQuestions) * 100) : 0;

  return (
    <div className="container py-4">
      {step === 1 && (
        <div className="row justify-content-center">
          <div className="col-lg-10">
            {/* Header */}
            <div className="text-center mb-4">
              <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 px-3 py-1.5 mb-2 fw-semibold">
                STEP 1 OF 2
              </span>
              <h2 className="text-white fw-extrabold">Configure Security Audit</h2>
              <p className="text-muted">Fill in your project details and select an audit template or AI generator.</p>
            </div>

            <div className="sc-card p-4 p-md-5 mb-4">
              {/* Project Info Form */}
              <h5 className="text-white fw-bold mb-3 d-flex align-items-center gap-2">
                <span className="p-1.5 rounded bg-info bg-opacity-10 text-info">1</span>
                <span>Project Information</span>
              </h5>

              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label text-light small fw-semibold">Project Name *</label>
                  <input 
                    type="text" 
                    className="form-control bg-dark text-white border-secondary"
                    placeholder="e.g. CS101 Auth Portal, Campus Store API"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-light small fw-semibold">Auditor / Developer Name</label>
                  <input 
                    type="text" 
                    className="form-control bg-dark text-white border-secondary"
                    placeholder="e.g. Alex Smith"
                    value={auditorName}
                    onChange={(e) => setAuditorName(e.target.value)}
                  />
                </div>
              </div>

              {/* Template Mode Selection */}
              <h5 className="text-white fw-bold mb-3 d-flex align-items-center gap-2">
                <span className="p-1.5 rounded bg-info bg-opacity-10 text-info">2</span>
                <span>Choose Audit Scope</span>
              </h5>

              <div className="d-flex gap-2 mb-4">
                <button
                  type="button"
                  className={`btn px-4 py-2 fw-semibold ${!isAiMode ? 'btn-info text-dark shadow' : 'btn-outline-secondary text-light'}`}
                  onClick={() => setIsAiMode(false)}
                >
                  Pre-configured Templates
                </button>
                <button
                  type="button"
                  className={`btn px-4 py-2 fw-semibold d-flex align-items-center gap-1.5 ${isAiMode ? 'btn-info text-dark shadow' : 'btn-outline-secondary text-light'}`}
                  onClick={() => setIsAiMode(true)}
                >
                  <Sparkles size={16} />
                  <span>AI Tailored Generator</span>
                </button>
              </div>

              {!isAiMode ? (
                <div>
                  <div className="row g-3 mb-4">
                    {templates.map((tpl) => (
                      <div key={tpl.id} className="col-md-6">
                        <div 
                          className={`sc-card p-3 h-100 option-card ${selectedTemplateId === tpl.id ? 'selected' : ''}`}
                          onClick={() => setSelectedTemplateId(tpl.id)}
                        >
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h6 className="text-white fw-bold m-0">{tpl.title}</h6>
                            <span className="badge bg-secondary bg-opacity-25 text-info">
                              {tpl.estimated_time}
                            </span>
                          </div>
                          <p className="text-muted small m-0 mb-2">{tpl.description}</p>
                          <div className="d-flex flex-wrap gap-1">
                            {tpl.categories.slice(0, 3).map((cat, idx) => (
                              <span key={idx} className="badge bg-dark border border-secondary text-secondary" style={{ fontSize: '0.65rem' }}>
                                {cat}
                              </span>
                            ))}
                            {tpl.categories.length > 3 && (
                              <span className="badge bg-dark text-muted" style={{ fontSize: '0.65rem' }}>
                                +{tpl.categories.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mb-4">
                    <label className="form-label text-light small fw-semibold">Target Technology Stack</label>
                    <input 
                      type="text" 
                      className="form-control bg-dark text-white border-secondary"
                      placeholder="e.g. Node.js + Express + MongoDB, React + FastAPI, Django"
                      value={targetStack}
                      onChange={(e) => setTargetStack(e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded bg-dark bg-opacity-50 border border-info border-opacity-30 mb-4">
                  <div className="d-flex align-items-center gap-2 mb-3 text-info">
                    <Sparkles size={20} />
                    <span className="fw-bold">OpenRouter AI Dynamic Security Questionnaire</span>
                  </div>
                  <p className="text-muted small mb-3">
                    Our AI engine will analyze your framework and architecture to generate customized security checks (e.g. checking npm audit, Django DEBUG mode, or Pickle deserialization).
                  </p>

                  <div className="mb-3">
                    <label className="form-label text-light small fw-semibold">Your Exact Frameworks & Tech Stack</label>
                    <input 
                      type="text" 
                      className="form-control bg-dark text-white border-secondary"
                      placeholder="e.g. Next.js 14 + Supabase, Python / Flask + SQLite, Spring Boot"
                      value={aiCustomStack}
                      onChange={(e) => setAiCustomStack(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="d-flex justify-content-end">
                <button 
                  className="btn btn-info text-dark fw-bold px-4 py-2.5 d-flex align-items-center gap-2"
                  onClick={handleStartAudit}
                  disabled={loadingTemplate}
                >
                  {loadingTemplate ? (
                    <>
                      <Loader2 className="spinner-border spinner-border-sm" />
                      <span>Generating Questionnaire...</span>
                    </>
                  ) : (
                    <>
                      <span>Start Answering Questions</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 2 && activeTemplate && (
        <div>
          {/* Header & Progress Bar */}
          <div className="sc-card p-4 mb-4">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">
              <div>
                <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 px-2.5 py-1 mb-1 fw-semibold">
                  AUDITING: {projectName}
                </span>
                <h3 className="text-white fw-extrabold m-0">{activeTemplate.title}</h3>
              </div>

              <div className="d-flex align-items-center gap-3">
                <div className="text-end">
                  <div className="text-white fw-bold">{totalAnswered} of {totalQuestions} answered</div>
                  <div className="text-muted small">{progressPercent}% Completed</div>
                </div>
                <button 
                  className="btn btn-success text-white fw-bold px-4 py-2 d-flex align-items-center gap-2 shadow"
                  onClick={handleSubmitAudit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="spinner-border spinner-border-sm" />
                      <span>Evaluating...</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Generate AI Report</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="progress bg-dark" style={{ height: 6 }}>
              <div 
                className="progress-bar bg-info" 
                role="progressbar" 
                style={{ width: `${progressPercent}%`, transition: 'width 0.3s' }}
              ></div>
            </div>
          </div>

          {/* Category Navigation Pills */}
          <div className="d-flex gap-2 overflow-x-auto pb-3 mb-3">
            {categories.map((cat, idx) => {
              const catQuestions = activeTemplate.questions.filter(q => q.category === cat);
              const catAnswered = catQuestions.filter(q => answers[q.id]).length;
              const isAllAnswered = catAnswered === catQuestions.length && catQuestions.length > 0;
              const isCurrent = idx === currentCategoryIdx;

              return (
                <button
                  key={idx}
                  type="button"
                  className={`btn btn-sm text-nowrap d-flex align-items-center gap-2 px-3 py-2 rounded-pill ${
                    isCurrent 
                      ? 'btn-info text-dark fw-bold shadow' 
                      : isAllAnswered 
                      ? 'btn-dark text-success border border-success border-opacity-50' 
                      : 'btn-dark text-light border border-secondary border-opacity-50'
                  }`}
                  onClick={() => setCurrentCategoryIdx(idx)}
                >
                  {isAllAnswered ? <CheckCircle2 size={15} /> : <span className="opacity-75">{idx + 1}.</span>}
                  <span>{cat}</span>
                  <span className={`badge ${isCurrent ? 'bg-dark text-white' : 'bg-secondary bg-opacity-25 text-muted'}`} style={{ fontSize: '0.65rem' }}>
                    {catAnswered}/{catQuestions.length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Question Cards in current category */}
          <div className="mb-4">
            <h4 className="text-white fw-bold mb-3 d-flex align-items-center gap-2">
              <span className="badge bg-secondary bg-opacity-25 text-info">Category {currentCategoryIdx + 1}/{categories.length}</span>
              <span>{currentCategory}</span>
            </h4>

            {currentQuestions.map((q, qIndex) => {
              const selectedOptionId = answers[q.id];
              const isAnswered = !!selectedOptionId;

              return (
                <div key={q.id} className="sc-card p-4 p-md-4 mb-4">
                  <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                    <h5 className="text-white fw-bold m-0">
                      <span className="text-info me-2">{qIndex + 1}.</span>
                      {q.title}
                    </h5>
                    {isAnswered && (
                      <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 d-flex align-items-center gap-1">
                        <CheckCircle2 size={13} /> Answered
                      </span>
                    )}
                  </div>

                  <p className="text-light opacity-90 small mb-2">{q.description}</p>

                  {/* Educational Tooltip / Why it matters */}
                  <div className="p-2.5 rounded bg-dark bg-opacity-60 border border-secondary border-opacity-25 mb-3 d-flex align-items-start gap-2">
                    <Info size={16} className="text-info mt-0.5 flex-shrink-0" />
                    <span className="text-muted small">
                      <strong className="text-light">Why this matters:</strong> {q.why_it_matters}
                    </span>
                  </div>

                  {/* Options */}
                  <div className="d-flex flex-column gap-2">
                    {q.options.map((opt) => {
                      const isSelected = selectedOptionId === opt.id;

                      return (
                        <div 
                          key={opt.id}
                          className={`option-card ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleSelectOption(q.id, opt.id)}
                        >
                          <div className="d-flex align-items-start gap-3">
                            <div className="form-check mt-0.5">
                              <input 
                                className="form-check-input"
                                type="radio" 
                                name={`question_${q.id}`} 
                                id={`opt_${opt.id}`}
                                checked={isSelected}
                                onChange={() => handleSelectOption(q.id, opt.id)}
                              />
                            </div>
                            <div className="flex-grow-1">
                              <label className="form-check-label text-light fw-medium cursor-pointer" htmlFor={`opt_${opt.id}`} style={{ cursor: 'pointer' }}>
                                {opt.label}
                              </label>

                              {isSelected && opt.feedback && (
                                <div className="mt-2 pt-2 border-top border-secondary border-opacity-25">
                                  <span className={`small d-inline-flex align-items-center gap-1.5 ${opt.score_weight >= 0.8 ? 'text-success' : opt.score_weight >= 0.4 ? 'text-warning' : 'text-danger'}`}>
                                    <Lightbulb size={13} className="flex-shrink-0" />
                                    <span>{opt.feedback}</span>
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="d-flex justify-content-between align-items-center pt-2">
            <button 
              className="btn btn-outline-secondary text-light d-flex align-items-center gap-2"
              disabled={currentCategoryIdx === 0}
              onClick={() => setCurrentCategoryIdx(prev => prev - 1)}
            >
              <ArrowLeft size={16} />
              <span>Previous Category</span>
            </button>

            {currentCategoryIdx < categories.length - 1 ? (
              <button 
                className="btn btn-info text-dark fw-bold d-flex align-items-center gap-2 px-4"
                onClick={() => setCurrentCategoryIdx(prev => prev + 1)}
              >
                <span>Next Category</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <button 
                className="btn btn-success text-white fw-bold d-flex align-items-center gap-2 px-4 py-2 shadow"
                onClick={handleSubmitAudit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="spinner-border spinner-border-sm" />
                    <span>Evaluating Audit...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Submit & Generate Report</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
