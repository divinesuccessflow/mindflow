'use client';

import React from 'react';
import { useMindFlowStore } from '@/lib/store';
import { getProgressPercent } from '@/lib/utils';

export default function GoalPanel() {
  const { selectedNodeId, data, updateNode, getNodeById, activeMode } = useMindFlowStore();
  const darkMode = data.settings.darkMode;
  const node = selectedNodeId ? getNodeById(selectedNodeId) : null;

  if (!node || activeMode !== 'goals' || node.isRoot || !node.targetValue) return null;

  const pct = getProgressPercent(node.currentValue || 0, node.targetValue);
  const R = 34;
  const circ = 2 * Math.PI * R;

  return (
    <div className="absolute right-4 top-4 z-20 w-64" style={{ pointerEvents: 'all' }}>
      <div
        className="rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: darkMode ? 'rgba(10,12,20,0.97)' : 'rgba(255,255,255,0.97)',
          border: `2px solid ${node.color}44`,
          backdropFilter: 'blur(16px)',
        }}
      >
        <div
          className="px-4 py-3 flex items-center gap-2"
          style={{ background: `${node.color}15`, borderBottom: `1px solid ${node.color}22` }}
        >
          <div className="w-3 h-3 rounded-full" style={{ background: node.color, boxShadow: `0 0 8px ${node.color}` }} />
          <span className="font-bold text-sm truncate" style={{ color: node.color }}>{node.label}</span>
        </div>

        <div className="p-4">
          {/* Ring */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <svg width="84" height="84" className="-rotate-90">
                <circle cx="42" cy="42" r={R} fill="none" strokeWidth="8"
                  stroke={darkMode ? 'rgba(75,85,99,0.25)' : 'rgba(229,231,235,0.5)'} />
                <circle cx="42" cy="42" r={R} fill="none" strokeWidth="8"
                  stroke={node.color} strokeLinecap="round"
                  strokeDasharray={circ}
                  strokeDashoffset={circ - (pct / 100) * circ}
                  style={{ transition: 'stroke-dashoffset 0.6s ease', filter: `drop-shadow(0 0 8px ${node.color}99)` }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-2xl font-black" style={{ color: node.color }}>{pct}%</div>
              </div>
            </div>
          </div>

          {/* Values */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="rounded-xl p-2.5 text-center" style={{ background: `${node.color}15` }}>
              <div className="text-xs text-gray-400 mb-0.5">Current</div>
              <div className="font-black text-base" style={{ color: node.color }}>
                {(node.currentValue || 0).toLocaleString()}
              </div>
            </div>
            <div className="rounded-xl p-2.5 text-center" style={{ background: darkMode ? 'rgba(22,25,38,0.5)' : 'rgba(249,250,251,0.5)' }}>
              <div className="text-xs text-gray-400 mb-0.5">Target</div>
              <div className="font-black text-base" style={{ color: darkMode ? '#f3f4f6' : '#111827' }}>
                {node.targetValue.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Update */}
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Update Current</label>
          <input
            type="number"
            defaultValue={node.currentValue || 0}
            className="w-full px-3 py-2 rounded-xl text-sm outline-none"
            style={{
              background: darkMode ? 'rgba(22,25,38,0.8)' : 'rgba(249,250,251,0.8)',
              border: `1px solid ${node.color}44`,
              color: darkMode ? '#f3f4f6' : '#111827',
            }}
            onBlur={(e) => updateNode(node.id, { currentValue: Number(e.target.value) })}
            onKeyDown={(e) => {
              if (e.key === 'Enter') updateNode(node.id, { currentValue: Number((e.target as HTMLInputElement).value) });
            }}
          />
        </div>
      </div>
    </div>
  );
}
