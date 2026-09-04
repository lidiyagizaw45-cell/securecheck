import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  PlusCircle, 
  History, 
  BookOpen, 
  Settings, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Code2 
} from 'lucide-react';
import AuthModal from './AuthModal';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isNavOpen, setIsNavOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('securecheck_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('securecheck_user');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('securecheck_token');
    localStorage.removeItem('securecheck_user');
    setCurrentUser(null);
    setIsNavOpen(false);
    navigate('/');
    window.dispatchEvent(new Event('storage'));
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="navbar navbar-expand-xl navbar-custom sticky-top py-2 shadow-sm">
        <div className="container-fluid px-3 px-lg-4">
          {/* Brand Logo matching user circular shield design */}
          <Link 
            to="/" 
            className="navbar-brand d-flex align-items-center text-white fw-bold text-decoration-none me-3"
            onClick={() => setIsNavOpen(false)}
          >
            <div 
              className="d-flex align-items-center justify-content-center me-2.5"
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                border: '1.5px solid #38bdf8',
                background: 'radial-gradient(circle, #0e1e38 0%, #0b0f19 100%)',
                boxShadow: '0 0 12px rgba(56, 189, 248, 0.25)',
                flexShrink: 0
              }}
            >
              <ShieldCheck size={20} className="text-info" strokeWidth={2.3} />
            </div>
            <span className="fs-5 tracking-tight">
              Secure<span className="text-info">Check</span>
            </span>
            <span className="badge bg-dark text-info border border-info border-opacity-30 ms-1 fw-semibold py-1 px-2" style={{ fontSize: '0.65rem' }}>
              AI AUDITOR
            </span>
          </Link>

          {/* Mobile Hamburger Button */}
          <button 
            className="navbar-toggler border-secondary text-light p-1.5 ms-auto" 
            type="button" 
            onClick={() => setIsNavOpen(!isNavOpen)}
            aria-label="Toggle navigation"
          >
            {isNavOpen ? <X size={22} className="text-info" /> : <Menu size={22} className="text-light" />}
          </button>

          {/* Nav Items */}
          <div className={`collapse navbar-collapse ${isNavOpen ? 'show mt-3 mt-xl-0' : ''}`}>
            <ul className="navbar-nav me-auto mb-2 mb-xl-0 gap-1 d-flex flex-column flex-xl-row align-items-xl-center">
              <li className="nav-item">
                <Link 
                  to="/" 
                  className={`nav-link-custom ${isActive('/') ? 'active' : ''}`}
                  onClick={() => setIsNavOpen(false)}
                >
                  <LayoutDashboard size={16} />
                  <span>Dashboard</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  to="/new-audit" 
                  className={`nav-link-custom ${isActive('/new-audit') ? 'active' : ''}`}
                  onClick={() => setIsNavOpen(false)}
                >
                  <PlusCircle size={16} />
                  <span>Audit Wizard</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  to="/code-scanner" 
                  className={`nav-link-custom ${isActive('/code-scanner') ? 'active' : ''}`}
                  onClick={() => setIsNavOpen(false)}
                >
                  <Code2 size={16} />
                  <span>Code Scanner</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  to="/history" 
                  className={`nav-link-custom ${isActive('/history') ? 'active' : ''}`}
                  onClick={() => setIsNavOpen(false)}
                >
                  <History size={16} />
                  <span>Audit History</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  to="/learning" 
                  className={`nav-link-custom ${isActive('/learning') ? 'active' : ''}`}
                  onClick={() => setIsNavOpen(false)}
                >
                  <BookOpen size={16} />
                  <span>Learning Hub</span>
                </Link>
              </li>
            </ul>

            {/* Right Controls: Settings & User Auth */}
            <div className="d-flex align-items-center gap-2 pt-2 pt-xl-0 border-top border-xl-0 border-secondary border-opacity-25 flex-nowrap">
              <Link 
                to="/settings" 
                className={`btn btn-sm btn-outline-secondary d-flex align-items-center gap-1.5 text-light text-nowrap px-2.5 py-1.5 ${isActive('/settings') ? 'active' : ''}`}
                onClick={() => setIsNavOpen(false)}
              >
                <Settings size={15} />
                <span>Settings</span>
              </Link>

              {currentUser ? (
                <div className="d-flex align-items-center gap-2 text-nowrap">
                  <div className="d-flex align-items-center gap-1.5 px-2.5 py-1 rounded bg-info bg-opacity-10 border border-info border-opacity-30">
                    <User size={14} className="text-info" />
                    <span className="text-info small fw-bold">{currentUser.username}</span>
                  </div>
                  <button 
                    className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1 p-1 px-2.5"
                    title="Sign Out"
                    onClick={handleLogout}
                  >
                    <LogOut size={14} />
                    <span className="small fw-semibold">Logout</span>
                  </button>
                </div>
              ) : (
                <button 
                  className="btn btn-sm btn-info text-dark fw-bold d-flex align-items-center gap-1.5 px-3 py-1.5 text-nowrap shadow-sm"
                  onClick={() => { setShowAuthModal(true); setIsNavOpen(false); }}
                >
                  <User size={15} />
                  <span>Sign In / Register</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <AuthModal 
        show={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        onAuthSuccess={(user) => setCurrentUser(user)} 
      />
    </>
  );
}
