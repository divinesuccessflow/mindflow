'use client';

import React, { useState, useCallback } from 'react';
import { useMindFlowStore } from '@/lib/store';
import { AppMode, MindNode } from '@/lib/types';
import { isOverdue } from '@/lib/utils';

const MODE_META: Record<AppMode, { icon: string; label: string }> = {
  tasks: { icon: '✓', label: 'Tasks' },
  braindump: { icon: '🧠', label: 'Brain Dump' },
  planner: { icon: '📅', label: 'Planner' },
  goals: { icon: '🎯', label: 'Goals' },
  knowledge: { icon: '📚', label: 'Knowledge' },
};

export default function Sidebar() {
  const {
    activeMode, setActiveMode, sidebarOpen, searchQuery, setSearchQuery,
    addNode, data, setSelectedNode, filterState, setFilter,
  } = useMindFlowStore();

  const [quickAdd, setQuickAdd] = useState('');
  const darkMode = data.settings.darkMode;

  const handleAdd = useCallback(() => {
    if (!quickAdd.trim()) return;
    const id = addNode(null, { label: quickAdd.trim() });
    setQuickAdd('');
    setSelectedNode(id);
  }, [quickAdd, addNode, setSelectedNode]);

  // Task stats
  const taskNodes = data.tasks.nodes.filter((n) => !n.isRoot);
  const stats = {
    total: taskNodes.filter((n) => n.status).length,
    done: taskNodes.filter((n) => n.status === 'done').length,
    overdue: taskNodes.filter((n) => isOverdue(n.deadline) && n.status !== 'done').length,
    urgent: taskNodes.filter((n) => n.priority === 'urgent' && n.status !== 'done').length,
  };

  // Recent nodes
  const recentItems = data.recentNodeIds.slice(0, 8).map((id) => {
    for (const m of ['tasks', 'braindump', 'planner', 'goals', 'knowledge'] as AppMode[]) {
      const n = data[m].nodes.find((x) => x.id === id);
      if (n) return { node: n, mode: m };
    }
    return null;
  }).filter(Boolean) as { node: MindNode; mode: AppMode }[];

  if (!sidebarOpen) return null;

  const sectionHeader = (text: string) => (
    <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: darkMode ? '#4b5563' : '#9ca3af' }}>
      {text}
    </div>
  );

  const divider = (
    <div className="my-2 h-px" style={{ background: darkMode ? 'rgba(75,85,99,0.15)' : 'rgba(229,231,235,0.5)' }} />
  );

  return (
    <aside
      className="flex flex-col h-full shrink-0 border-r overflow-hidden"
      style={{
        width: 248,
        background: darkMode ? 'rgba(9,11,18,0.98)' : 'rgba(248,250,252,0.98)',
        borderColor: darkMode ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.08)',
      }}
    >
      {/* Search */}
      <div className="px-3 pt-3 pb-2">
        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search… (Ctrl+F)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-xl text-sm outline-none"
            style={{
              background: darkMode ? 'rgba(22,25,38,0.9)' : 'rgba(255,255,255,0.9)',
              border: `1px solid ${darkMode ? 'rgba(75,85,99,0.3)' : 'rgba(209,213,219,0.5)'}`,
              color: darkMode ? '#e5e7eb' : '#111827',
            }}
          />
        </div>
      </div>

      {divider}

      {/* Quick add */}
      <div className="px-3 pb-2">
        {sectionHeader('Quick Add')}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={`New ${activeMode} node…`}
            value={quickAdd}
            onChange={(e) => setQuickAdd(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            className="flex-1 min-w-0 px-2.5 py-1.5 rounded-xl text-sm outline-none"
            style={{
              background: darkMode ? 'rgba(22,25,38,0.9)' : 'rgba(255,255,255,0.9)',
              border: `1px solid ${darkMode ? 'rgba(75,85,99,0.3)' : 'rgba(209,213,219,0.5)'}`,
              color: darkMode ? '#e5e7eb' : '#111827',
            }}
          />
          <button
            onClick={handleAdd}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-lg font-bold flex-shrink-0 transition-transform hover:scale-105 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 2px 8px rgba(99,102,241,0.4)' }}
          >
            +
          </button>
        </div>
      </div>

      {divider}

      {/* Modes */}
      <div className="px-3 pb-2">
        {sectionHeader('Modes')}
        <div className="flex flex-col gap-0.5">
          {(Object.entries(MODE_META) as [AppMode, { icon: string; label: string }][]).map(([mode, meta], i) => {
            const active = activeMode === mode;
            return (
              <button
                key={mode}
                onClick={() => setActiveMode(mode)}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm text-left transition-all"
                style={{
                  background: active ? 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))' : 'transparent',
                  border: active ? '1px solid rgba(99,102,241,0.25)' : '1px solid transparent',
                  color: active ? '#818cf8' : darkMode ? '#6b7280' : '#9ca3af',
                  fontWeight: active ? 600 : 400,
                }}
              >
                <span>{meta.icon}</span>
                <span className="flex-1">{meta.label}</span>
                <span className="text-[10px] opacity-40 font-mono">{i + 1}</span>
              </button>
            );
          })}
        </div>
      </div>

      {divider}

      {/* Task filters */}
      {activeMode === 'tasks' && (
        <>
          <div className="px-3 pb-2">
            {sectionHeader('Filters')}

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              {[
                { label: 'Total', value: stats.total, color: '#6366f1' },
                { label: 'Done', value: stats.done, color: '#10b981' },
                { label: 'Overdue', value: stats.overdue, color: '#ef4444' },
                { label: 'Urgent', value: stats.urgent, color: '#f97316' },
              ].map((s) => (
                <div key={s.label} className="rounded-xl p-2 text-center" style={{ background: `${s.color}15` }}>
                  <div className="text-lg font-black" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-[10px] font-medium" style={{ color: darkMode ? '#6b7280' : '#9ca3af' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Toggle filters */}
            {[
              { key: 'showOverdue' as const, label: 'Only Overdue', color: '#ef4444' },
              { key: 'showUrgent' as const, label: 'Only Urgent', color: '#f97316' },
            ].map((f) => (
              <div key={f.key} className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: f.color }} />
                  <span className="text-xs" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>{f.label}</span>
                </div>
                <button
                  onClick={() => setFilter({ [f.key]: !filterState[f.key] })}
                  className="relative w-10 h-5 rounded-full transition-colors"
                  style={{ background: filterState[f.key] ? f.color : darkMode ? '#374151' : '#d1d5db' }}
                >
                  <span
                    className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all"
                    style={{ left: filterState[f.key] ? '1.25rem' : '0.125rem' }}
                  />
                </button>
              </div>
            ))}
          </div>
          {divider}
        </>
      )}

      {/* Recent nodes */}
      <div className="flex-1 overflow-y-auto px-3 pb-2 min-h-0">
        {sectionHeader('Recent')}
        {recentItems.length === 0 ? (
          <p className="text-xs italic" style={{ color: darkMode ? '#4b5563' : '#9ca3af' }}>No recent nodes yet</p>
        ) : (
          <div className="flex flex-col gap-0.5">
            {recentItems.map(({ node, mode }) => (
              <button
                key={node.id}
                onClick={() => { setActiveMode(mode); setSelectedNode(node.id); }}
                className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left transition-colors w-full"
                style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = darkMode ? 'rgba(75,85,99,0.15)' : 'rgba(243,244,246,0.8)')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
              >
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: node.color }} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs truncate" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>{node.label}</div>
                  <div className="text-[10px] capitalize" style={{ color: darkMode ? '#4b5563' : '#9ca3af' }}>{mode}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Shortcuts hint */}
      <div
        className="px-3 py-2 text-center border-t"
        style={{ borderColor: darkMode ? 'rgba(75,85,99,0.15)' : 'rgba(229,231,235,0.5)' }}
      >
        <div className="text-[10px] font-mono" style={{ color: darkMode ? '#374151' : '#d1d5db' }}>
          Tab=child · Enter=sibling · Del=remove
        </div>
        <div className="text-[10px] font-mono mt-0.5" style={{ color: darkMode ? '#374151' : '#d1d5db' }}>
          1-5=mode · Ctrl+F=search · dbl-click=edit
        </div>
      </div>
    </aside>
  );
}
