import React, { useState } from 'react';
import { 
  ShieldCheck, 
  User, 
  Lock, 
  Mail, 
  X, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Loader2 
} from 'lucide-react';
import { api } from '../services/api';

export default function AuthModal({ show, onClose, onAuthSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      let userData;
      if (isRegister) {
        userData = await api.register({ username, email, password });
      } else {
        userData = await api.login({ email_or_username: email || username, password });
      }

      localStorage.setItem('securecheck_token', userData.token);
      localStorage.setItem('securecheck_user', JSON.stringify(userData));
      onAuthSuccess(userData);
      onClose();
    } catch (err) {
      console.error('Auth error:', err);
      const detail = err.response?.data?.detail || 'Authentication failed. Please try again.';
      setErrorMsg(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="modal fade show d-block" 
      style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 1050 }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content sc-card border-secondary text-white p-2">
          {/* Header */}
          <div className="modal-header border-0 pb-0">
            <div className="d-flex align-items-center gap-2">
              <div className="p-2 rounded bg-info bg-opacity-20 text-info">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h5 className="modal-title fw-bold text-white mb-0">
                  {isRegister ? 'Create Developer Account' : 'Welcome Back'}
                </h5>
                <p className="text-muted small mb-0">
                  {isRegister ? 'Save and track your security audit history' : 'Sign in to manage your audited projects'}
                </p>
              </div>
            </div>
            <button 
              type="button" 
              className="btn btn-sm btn-link text-muted p-1" 
              onClick={onClose}
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="modal-body pt-3">
            {errorMsg && (
              <div className="alert alert-danger py-2 small d-flex align-items-center gap-2 mb-3">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {isRegister && (
                <div className="mb-3">
                  <label className="form-label text-light small fw-semibold">Username *</label>
                  <div className="input-group">
                    <span className="input-group-text bg-dark border-secondary text-muted">
                      <User size={16} />
                    </span>
                    <input 
                      type="text" 
                      className="form-control bg-dark text-white border-secondary"
                      placeholder="e.g. dev_alex"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              <div className="mb-3">
                <label className="form-label text-light small fw-semibold">
                  {isRegister ? 'Email Address *' : 'Email or Username *'}
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-secondary text-muted">
                    <Mail size={16} />
                  </span>
                  <input 
                    type={isRegister ? 'email' : 'text'} 
                    className="form-control bg-dark text-white border-secondary"
                    placeholder={isRegister ? 'alex@university.edu' : 'Email or username'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label text-light small fw-semibold">Password *</label>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-secondary text-muted">
                    <Lock size={16} />
                  </span>
                  <input 
                    type="password" 
                    className="form-control bg-dark text-white border-secondary"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-info text-dark fw-bold w-100 py-2.5 d-flex align-items-center justify-content-center gap-2 mb-3"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="spinner-border spinner-border-sm" />
                    <span>Please wait...</span>
                  </>
                ) : (
                  <>
                    <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2 border-top border-secondary border-opacity-25">
              {isRegister ? (
                <p className="text-muted small mb-0">
                  Already have an account?{' '}
                  <button 
                    type="button" 
                    className="btn btn-link text-info p-0 small fw-semibold"
                    onClick={() => { setIsRegister(false); setErrorMsg(''); }}
                  >
                    Sign In here
                  </button>
                </p>
              ) : (
                <p className="text-muted small mb-0">
                  New developer?{' '}
                  <button 
                    type="button" 
                    className="btn btn-link text-info p-0 small fw-semibold"
                    onClick={() => { setIsRegister(true); setErrorMsg(''); }}
                  >
                    Create a free account
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
