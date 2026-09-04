import React, { useState } from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
} from 'chart.js';
import { Radar, Bar } from 'react-chartjs-2';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

export default function CategoryRadar({ categoryScores = [] }) {
  const [chartType, setChartType] = useState('radar'); // 'radar' | 'bar'

  const labels = categoryScores.map(c => c.category);
  const dataValues = categoryScores.map(c => c.percentage);

  const radarData = {
    labels: labels,
    datasets: [
      {
        label: 'Security Score (%)',
        data: dataValues,
        backgroundColor: 'rgba(56, 189, 248, 0.25)',
        borderColor: '#38bdf8',
        borderWidth: 2,
        pointBackgroundColor: '#38bdf8',
        pointBorderColor: '#ffffff',
        pointHoverBackgroundColor: '#ffffff',
        pointHoverBorderColor: '#38bdf8',
        pointRadius: 4,
      },
    ],
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        pointLabels: {
          color: '#cbd5e1',
          font: { size: 11, family: 'Inter' }
        },
        ticks: {
          backdropColor: 'transparent',
          color: '#64748b',
          stepSize: 20,
          min: 0,
          max: 100,
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `Score: ${context.raw}%`
        }
      }
    }
  };

  const barData = {
    labels: labels,
    datasets: [
      {
        label: 'Score %',
        data: dataValues,
        backgroundColor: dataValues.map(v => 
          v >= 80 ? 'rgba(16, 185, 129, 0.7)' :
          v >= 60 ? 'rgba(56, 189, 248, 0.7)' :
          v >= 40 ? 'rgba(245, 158, 11, 0.7)' : 'rgba(244, 63, 94, 0.7)'
        ),
        borderColor: dataValues.map(v => 
          v >= 80 ? '#10b981' :
          v >= 60 ? '#38bdf8' :
          v >= 40 ? '#f59e0b' : '#f43f5e'
        ),
        borderWidth: 1,
        borderRadius: 6,
      }
    ]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    scales: {
      x: {
        min: 0,
        max: 100,
        grid: { color: 'rgba(255, 255, 255, 0.08)' },
        ticks: { color: '#94a3b8' }
      },
      y: {
        grid: { display: false },
        ticks: { color: '#cbd5e1', font: { size: 12 } }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `Score: ${context.raw}%`
        }
      }
    }
  };

  return (
    <div className="d-flex flex-column h-100">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="text-light fw-bold m-0">Category Breakdown</h6>
        <div className="btn-group btn-group-sm">
          <button 
            type="button" 
            className={`btn btn-sm ${chartType === 'radar' ? 'btn-info text-dark fw-semibold' : 'btn-outline-secondary'}`}
            onClick={() => setChartType('radar')}
          >
            Radar
          </button>
          <button 
            type="button" 
            className={`btn btn-sm ${chartType === 'bar' ? 'btn-info text-dark fw-semibold' : 'btn-outline-secondary'}`}
            onClick={() => setChartType('bar')}
          >
            Bar List
          </button>
        </div>
      </div>

      <div style={{ height: 280 }} className="position-relative">
        {chartType === 'radar' ? (
          <Radar data={radarData} options={radarOptions} />
        ) : (
          <Bar data={barData} options={barOptions} />
        )}
      </div>
    </div>
  );
}
