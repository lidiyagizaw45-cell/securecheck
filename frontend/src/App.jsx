import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import NewAudit from './pages/NewAudit';
import CodeScanner from './pages/CodeScanner';
import AuditReport from './pages/AuditReport';
import AuditHistory from './pages/AuditHistory';
import AuditComparison from './pages/AuditComparison';
import LearningHub from './pages/LearningHub';
import Settings from './pages/Settings';

export default function App() {
  return (
    <Router>
      <div className="d-flex flex-column min-vh-100 bg-main">
        <Navbar />
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/new-audit" element={<NewAudit />} />
            <Route path="/code-scanner" element={<CodeScanner />} />
            <Route path="/report/:id" element={<AuditReport />} />
            <Route path="/history" element={<AuditHistory />} />
            <Route path="/compare" element={<AuditComparison />} />
            <Route path="/learning" element={<LearningHub />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
        
        {/* Footer */}
        <footer className="py-4 border-top border-secondary border-opacity-25 mt-5">
          <div className="container text-center text-muted small">
            <p className="mb-1 text-light opacity-75">
              SecureCheck – Open-Source AI-Powered Security Auditor for Web Developers
            </p>
            <p className="mb-0 text-secondary" style={{ fontSize: '0.8rem' }}>
              Built with React, Bootstrap, Python FastAPI & MongoDB (Offline-First Architecture).
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}
