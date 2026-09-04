import React from 'react';

export default function ScoreGauge({ score = 0, grade = 'N/A', size = 180 }) {
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let color = '#f43f5e'; // Red (F / D)
  let glowClass = 'badge-grade-f';

  if (score >= 85) {
    color = '#10b981'; // Green (A)
    glowClass = 'badge-grade-a';
  } else if (score >= 70) {
    color = '#38bdf8'; // Cyan (B)
    glowClass = 'badge-grade-b';
  } else if (score >= 50) {
    color = '#f59e0b'; // Amber (C)
    glowClass = 'badge-grade-c';
  }

  return (
    <div className="d-flex flex-column align-items-center justify-content-center position-relative">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1e293b"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Animated colored score arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease-out, stroke 0.5s' }}
        />
      </svg>
      
      {/* Inner Label */}
      <div 
        className="position-absolute d-flex flex-column align-items-center justify-content-center text-center"
        style={{ width: size, height: size }}
      >
        <span className="fw-bolder" style={{ fontSize: size * 0.22, color: '#ffffff', lineHeight: 1 }}>
          {Math.round(score)}%
        </span>
        <span className={`badge mt-2 px-3 py-1 fw-bold ${glowClass}`} style={{ fontSize: size * 0.09 }}>
          Grade {grade}
        </span>
      </div>
    </div>
  );
}
