'use client';

import React from 'react';
import { useMindFlowStore } from '@/lib/store';
import { getCompletionPercent } from '@/lib/utils';

export default function PlannerPanel() {
  const { data, getNodes } = useMindFlowStore();
  const darkMode = data.settings.darkMode;
  const nodes = getNodes();

  const pct = getCompletionPercent(nodes);
  const R = 38;
  const circ = 2 * Math.PI * R;
  const offset = circ - (pct / 100) * circ;

  const completed = nodes.filter((n) => n.completed === true).length;
  const total = nodes.filter((n) => n.completed !== undefined).length;

  const slots = [
    { label: 'Morning', color: '#f59e0b', icon: '🌅' },
    { label: 'Afternoon', color: '#3b82f6', icon: '☀️' },
    { label: 'Evening', color: '#8b5cf6', icon: '🌇' },
    { label: 'Someday', color: '#6b7280', icon: '🌙' },
  ];

  const totalTime = nodes.filter((n) => n.estimatedTime).reduce((s, n) => s + (n.estimatedTime || 0), 0);

  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20" style={{ pointerEvents: 'none' }}>
      <div
        className="flex items-center gap-5 px-6 py-4 rounded-2xl"
        style={{
          background: darkMode ? 'rgba(10,12,20,0.94)' : 'rgba(255,255,255,0.94)',
          border: `1px solid ${darkMode ? 'rgba(245,158,11,0.2)' : 'rgba(245,158,11,0.15)'}`,
          backdropFilter: 'blur(16px)',
          boxShadow: '0 16px 48px rgba(0,0,0,0.25)',
          pointerEvents: 'all',
        }}
      >
        {/* Progress ring */}
        <div className="relative flex-shrink-0">
          <svg width="90" height="90" className="-rotate-90">
            <defs>
              <linearGradient id="planGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
            <circle cx="45" cy="45" r={R} fill="none" strokeWidth="8"
              stroke={darkMode ? 'rgba(75,85,99,0.25)' : 'rgba(229,231,235,0.5)'} />
            <circle cx="45" cy="45" r={R} fill="none" strokeWidth="8"
              stroke="url(#planGrad)" strokeLinecap="round"
              strokeDasharray={circ} strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 0.6s ease', filter: 'drop-shadow(0 0 6px rgba(99,102,241,0.6))' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-lg font-black" style={{ color: '#6366f1' }}>{pct}%</div>
            <div className="text-[9px] font-medium text-gray-500">done</div>
          </div>
        </div>

        {/* Info */}
        <div>
          <div className="font-bold text-sm mb-1" style={{ color: darkMode ? '#f3f4f6' : '#111827' }}>
            {`Today's Plan`}
          </div>
          <div className="text-xs text-gray-400 mb-3">
            {completed}/{total} tasks · {Math.floor(totalTime / 60)}h {totalTime % 60}m
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {slots.map((s) => {
              const count = nodes.filter((n) => {
                const parent = nodes.find((p) => p.id === n.parentId);
                return parent?.label === s.label;
              }).length;
              return (
                <div key={s.label} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
                  <span className="text-[11px]" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                    {s.icon} {s.label} ({count})
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
