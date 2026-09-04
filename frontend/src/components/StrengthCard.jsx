import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function StrengthCard({ strength }) {
  return (
    <div className="sc-card p-3 mb-2 border-start border-success border-3">
      <div className="d-flex align-items-start gap-3">
        <div className="text-success mt-0.5">
          <CheckCircle2 size={20} />
        </div>
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge-tag-success px-2 py-0.5" style={{ fontSize: '0.7rem' }}>
              {strength.category}
            </span>
          </div>
          <h6 className="text-white fw-bold mb-1" style={{ fontSize: '0.95rem' }}>
            {strength.title}
          </h6>
          <p className="text-muted small m-0">
            {strength.description}
          </p>
        </div>
      </div>
    </div>
  );
}
