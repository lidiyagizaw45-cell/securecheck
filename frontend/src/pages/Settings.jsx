import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Database, 
  Key, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Save, 
  Check, 
  Cpu 
} from 'lucide-react';
import { api } from '../services/api';

export default function Settings() {
  const [systemStatus, setSystemStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openrouterKey, setOpenrouterKey] = useState('');
  const [openrouterModel, setOpenrouterModel] = useState('openai/gpt-4o-mini');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = () => {
    setLoading(true);
    api.getSystemStatus()
      .then(data => {
        setSystemStatus(data);
        if (data.ai_keys_configured?.openrouter_model) {
          setOpenrouterModel(data.ai_keys_configured.openrouter_model);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load system status:', err);
        setLoading(false);
      });
  };

  const handleSaveKeys = async (e) => {
    e.preventDefault();
    try {
      await api.updateSettings({
        openrouter_api_key: openrouterKey || undefined,
        openrouter_model: openrouterModel || undefined
      });
      setSavedSuccess(true);
      fetchStatus();
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update settings:', err);
      alert('Failed to save settings.');
    }
  };

  const handleBackupAll = async () => {
    try {
      const audits = await api.getAudits();
      const backupData = {
        exported_at: new Date().toISOString(),
        total_audits: audits.length,
        audits: audits
      };
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(backupData, null, 2))}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute('download', `SecureCheck-Backup-${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error('Backup failed:', err);
      alert('Failed to backup data.');
    }
  };

  const isOpenRouterActive = systemStatus?.ai_keys_configured?.openrouter;

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="mb-4">
        <span className="badge bg-secondary bg-opacity-25 text-info border border-info border-opacity-25 px-2.5 py-1 mb-1 fw-semibold">
          SYSTEM PREFERENCES
        </span>
        <h2 className="text-white fw-extrabold m-0">Settings & AI Configurations</h2>
        <p className="text-muted small m-0">Manage offline database storage, OpenRouter AI models, and export backups.</p>
      </div>

      <div className="row g-4">
        {/* Database Status Card */}
        <div className="col-lg-6">
          <div className="sc-card p-4 h-100">
            <div className="d-flex align-items-center gap-2 mb-3">
              <Database size={22} className="text-info" />
              <h5 className="text-white fw-bold m-0">Database Storage Mode</h5>
            </div>

            {loading ? (
              <div className="text-muted py-3">Loading status...</div>
            ) : systemStatus ? (
              <div>
                <div className="p-3 rounded bg-dark border border-secondary border-opacity-25 mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-light small fw-semibold">Connection Status:</span>
                    <span className="badge badge-secure d-flex align-items-center gap-1 px-2.5 py-1">
                      <CheckCircle2 size={13} /> Active & Connected
                    </span>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-light small fw-semibold">Current Engine:</span>
                    <span className="text-info small fw-bold">
                      {systemStatus.database?.mode === 'mongodb' 
                        ? 'Live MongoDB (Local Port 27017)' 
                        : 'Offline Persistent JSON Store'}
                    </span>
                  </div>

                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-light small fw-semibold">Total Audits Stored:</span>
                    <span className="badge bg-secondary text-white fw-bold">{systemStatus.total_saved_audits} records</span>
                  </div>
                </div>

                <p className="text-muted small mb-4">
                  SecureCheck operates with an <strong>Offline-First architecture</strong>. If MongoDB is installed locally, it connects automatically. If offline, all data is safely persisted to your local JSON database.
                </p>

                <button 
                  className="btn btn-outline-info d-flex align-items-center gap-2"
                  onClick={handleBackupAll}
                >
                  <Download size={16} />
                  <span>Download Full Data Backup (JSON)</span>
                </button>
              </div>
            ) : (
              <div className="text-danger">Backend unreachable.</div>
            )}
          </div>
        </div>

        {/* OpenRouter AI Configuration Card */}
        <div className="col-lg-6">
          <div className="sc-card p-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="d-flex align-items-center gap-2">
                <Sparkles size={22} className="text-info" />
                <h5 className="text-white fw-bold m-0">OpenRouter AI Integration</h5>
              </div>

              {isOpenRouterActive ? (
                <span className="badge badge-secure d-flex align-items-center gap-1 px-2.5 py-1">
                  <CheckCircle2 size={13} /> Active & Connected
                </span>
              ) : (
                <span className="badge bg-warning text-dark fw-bold border border-warning px-2.5 py-1">
                  Using Offline Rules
                </span>
              )}
            </div>

            <p className="text-muted small mb-3">
              Powered by <a href="https://openrouter.ai" target="_blank" rel="noreferrer" className="text-info">OpenRouter.ai</a> to deliver live dynamic questionnaires and intelligent AI security executive summaries.
            </p>

            <form onSubmit={handleSaveKeys}>
              <div className="mb-3">
                <label className="form-label text-light small fw-semibold">OpenRouter API Key</label>
                <input 
                  type="password" 
                  className="form-control bg-dark text-white border-secondary"
                  placeholder={isOpenRouterActive ? '•••••••••••••••••••••••••••••• (Active)' : 'sk-or-v1-...'}
                  value={openrouterKey}
                  onChange={(e) => setOpenrouterKey(e.target.value)}
                />
                <div className="text-muted mt-1 d-flex align-items-center gap-1" style={{ fontSize: '0.75rem' }}>
                  {isOpenRouterActive ? (
                    <>
                      <CheckCircle2 size={13} className="text-success" />
                      <span className="text-success fw-semibold">OpenRouter API key configured in .env</span>
                    </>
                  ) : (
                    <span>Enter your openrouter.ai key to activate live LLM features.</span>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label text-light small fw-semibold d-flex align-items-center gap-1">
                  <Cpu size={14} className="text-info" /> AI Model Selection
                </label>
                <select 
                  className="form-select bg-dark text-white border-secondary"
                  value={openrouterModel}
                  onChange={(e) => setOpenrouterModel(e.target.value)}
                >
                  <option value="openai/gpt-4o-mini">OpenAI GPT-4o Mini (Fast & Reliable)</option>
                  <option value="meta-llama/llama-3.3-70b-instruct">Llama 3.3 70B Instruct</option>
                  <option value="anthropic/claude-3.5-haiku">Claude 3.5 Haiku</option>
                  <option value="deepseek/deepseek-chat">DeepSeek Chat</option>
                </select>
              </div>

              <div className="d-flex justify-content-between align-items-center">
                {savedSuccess && (
                  <span className="text-success small d-flex align-items-center gap-1">
                    <Check size={16} /> Settings saved!
                  </span>
                )}
                <button 
                  type="submit" 
                  className="btn btn-info text-dark fw-bold d-flex align-items-center gap-1.5 ms-auto shadow-sm"
                >
                  <Save size={16} />
                  <span>Update AI Settings</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
